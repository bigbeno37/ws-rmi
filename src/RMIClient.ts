import {v4 as uuid} from "uuid";
import {validateRMIRemoteResponse} from "./types/RMIRemoteResponse";
import {hasPropertyOfType, isObject} from "./JSONValidation";
import {createRMIRequest} from "./types/RMIRequest";
import { pino } from "pino";
import {isEqualToAny} from "./Utils";
import {RMIMessageType} from "./types/RMIMessage";

const log = pino();

/**
 * Creates an RMI client that, when functions are called, will automatically message the server the given WebSocket
 * is a connected to.
 *
 * NOTE: The given WebSocket is assumed to be connected and in a readyState of 1. If this isn't the case, an Error
 * will be thrown!
 *
 * @param ws An open WebSocket connection that will be used to invoke functions on the remote.
 */
export const createRMIClient = <T extends object>(ws: WebSocket): T => {
	if (ws.readyState !== 1) throw new Error(`Attempted to create remote RMI instance, but the given WebSocket 
        connection was not open. Ready state is ${ws.readyState}`);

	return new Proxy({}, {
		get: (target, property: string) => {
			return new Proxy(() => { /**/ }, {
				apply: (target, thisArg, args) => new Promise((resolve, reject) => {
					const id = uuid();

					const listenerLog = pino({ name: id });
					const listener = ({data}: MessageEvent) => {
						listenerLog.debug(`Received message from remote: "${data}"`);

						if (typeof data !== "string") return;

						let response: unknown;
						try {
							response = JSON.parse(data);
						} catch (e) {
							listenerLog.debug(`Message from remote was not valid JSON! Cause: "${e}"`);

							return;
						}

						listenerLog.debug(`Message was valid JSON! Parsed as:\n${response}`);

						if (!validateRMIRemoteResponse(response)) {
							if (isObject(response) && hasPropertyOfType(response, "rmi", isObject)) {
								listenerLog.warn("Received an invalid RMI message! Message was\n", data);
							}

							return;
						}

						const { rmi } = response;

						if (!isEqualToAny<RMIMessageType>(rmi.type, "RESPONSE_RESULT", "RESPONSE_ERROR")) {
							return;
						}

						if (rmi.id !== id) {
							listenerLog.debug(`Current handler with ID ${id} is skipping response with ID ${rmi.id}`);
							return;
						}

						listenerLog.info(`Received valid remote response! Interpreted as: ${response}`);
						listenerLog.debug("Removing current handler as a WebSocket listener...");
						ws.removeEventListener("message", listener);

						if ("error" in rmi.data) {
							listenerLog.info(`There was an error from the remote!\n${rmi.data.error}`);
							reject(rmi.data.error);
						} else {
							listenerLog.info(`Remote function invocation completed successfully! Result was:\n${rmi.data.result}`);
							resolve(rmi.data.result);
						}
					};

					ws.addEventListener("message", listener);

					const request = JSON.stringify(createRMIRequest(id, property, args));

					log.info(`Sending the following request to remote with ID "${id}:\n${request}"`);

					ws.send(request);
				})
			});
		}
	}) as T;
};