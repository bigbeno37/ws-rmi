import {v4 as uuid} from "uuid";
import {validateRMIRemoteResponse} from "./types/RMIRemoteResponse";
import {createRMIRequest} from "./types/RMIRequest";
import { pino } from "pino";
import {isEqualToAny} from "./Utils";
import {RMIMessageType} from "./types/RMIMessageType";
import {RMIManager} from "./RMIManager";

/**
 * Creates an RMI client that, when functions are called, will automatically message the server the given WebSocket
 * is a connected to.
 *
 * NOTE: The given WebSocket is assumed to be connected and in a readyState of 1. If this isn't the case, an Error
 * will be thrown!
 *
 * @param ws An open WebSocket connection that will be used to invoke functions on the remote.
 */
export const createRMIClient = <T extends object>({ ws, config: { logger: log } }: RMIManager): T => {
	if (ws.readyState !== 1) throw new Error(`Attempted to create remote RMI instance, but the given WebSocket 
        connection was not open. Ready state is ${ws.readyState}`);

	const activeRequests = new Map<string, { resolve: (value: unknown) => void, reject: (reason: unknown) => void }>();

	ws.addEventListener("message", ({ data }: MessageEvent<string>) => {
		log.debug(`Received message from remote: ${data}`);
		if (typeof data !== "string") return;

		let response: unknown;
		try {
			response = JSON.parse(data);
		} catch (e) {
			log.debug(`Remote message was not valid JSON! Cause: ${e}`);
			return;
		}

		log.debug(`Remote message parsed as ${response}`);

		if (!validateRMIRemoteResponse(response)) {
			log.debug("Remote message was not a valid remote response!");

			return;
		}

		const { rmi } = response;

		if (!isEqualToAny<RMIMessageType>(rmi.type, "RESPONSE_RESULT", "RESPONSE_ERROR")) {
			log.debug(`Remote message had an invalid RMI type. Found "${rmi.type}"`);

			return;
		}

		const activeRequest = activeRequests.get(rmi.id);
		if (activeRequest === undefined) {
			log.debug(`No active requests were found matching ID "${rmi.id}"`);

			return;
		}

		const { resolve, reject } = activeRequest;

		log.debug(`Removing active request listener for ID ${rmi.id}`);
		activeRequests.delete(rmi.id);

		if ("error" in rmi.data) {
			log.info(`Received function invocation error from remote for request with ID "${rmi.id}". Error was: "${rmi.data.error}"`);
			reject(rmi.data.error);
		} else {
			log.info(`Received function invocation result from remote for request with ID "${rmi.id}". Result was: "${rmi.data.result}"`);
			resolve(rmi.data.result);
		}
	});

	return new Proxy({}, {
		get: (target, property: string) => {
			return new Proxy(() => { /**/ }, {
				apply: (target, thisArg, args) => new Promise((resolve, reject) => {
					const id = uuid();
					activeRequests.set(id, { resolve, reject });

					const request = JSON.stringify(createRMIRequest(id, property, args));

					log.info(`Attempting to invoke remote function "${property}" with ID "${id}"...`);
					log.debug(`Sending ${request}`);

					ws.send(request);
				})
			});
		}
	}) as T;
};