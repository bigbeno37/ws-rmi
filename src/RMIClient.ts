import {v4 as uuid} from "uuid";
import {validateRMIRemoteResponse} from "./types/RMIRemoteResponse";
import {createRMIRequest} from "./types/RMIRequest";
import { pino } from "pino";
import {isEqualToAny} from "./Utils";
import {RMIMessageType} from "./types/RMIMessageType";

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

	const activeRequests = new Map<string, { resolve: (value: unknown) => void, reject: (reason: unknown) => void }>();

	ws.addEventListener("message", ({ data }: MessageEvent<string>) => {
		if (typeof data !== "string") return;

		let response: unknown;
		try {
			response = JSON.parse(data);
		} catch (e) {
			return;
		}

		if (!validateRMIRemoteResponse(response)) {
			return;
		}

		const { rmi } = response;

		if (!isEqualToAny<RMIMessageType>(rmi.type, "RESPONSE_RESULT", "RESPONSE_ERROR")) {
			return;
		}

		const activeRequest = activeRequests.get(rmi.id);
		if (activeRequest === undefined) {
			return;
		}

		const { resolve, reject } = activeRequest;

		activeRequests.delete(rmi.id);

		if ("error" in rmi.data) {
			reject(rmi.data.error);
		} else {
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

					log.info(`Sending the following request to remote with ID "${id}:\n${request}"`);

					ws.send(request);
				})
			});
		}
	}) as T;
};