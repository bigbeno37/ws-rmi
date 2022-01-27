import {v4 as uuid} from "uuid";
import {validateRMIRemoteResponse} from "./types/RMIRemoteResponse";
import {hasPropertyOfType, isObject} from "./JSONValidation";
import {createRMIRequest} from "./types/RMIRequest";

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

					const listener = ({data}: MessageEvent) => {
						if (typeof data !== "string") return;

						let response: unknown;
						try {
							response = JSON.parse(data);
						} catch {
							return;
						}

						if (!validateRMIRemoteResponse(response)) {
							if (isObject(response) && hasPropertyOfType(response, "rmi", isObject)) {
								console.warn("Received an invalid RMI message! Message was\n", data);
							}

							return;
						}

						const { rmi } = response;

						if (rmi.id !== id) return;

						ws.removeEventListener("message", listener);

						if ("error" in rmi.data) {
							reject(rmi.data.error);
						} else {
							resolve(rmi.data.result);
						}
					};

					ws.addEventListener("message", listener);

					ws.send(JSON.stringify(createRMIRequest(id, property, args)));
				})
			});
		}
	}) as T;
};