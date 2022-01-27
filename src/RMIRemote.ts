import {RMIRequest, validateRMIRequest} from "./types/RMIRequest";
import {createRMIRemoteResult} from "./types/RMIRemoteResult";
import {createRMIRemoteError} from "./types/RMIRemoteError";
import {WebSocketServer} from "ws";
import {RMIRemoteResponse} from "./types/RMIRemoteResponse";
import {pino} from "pino";

const log = pino();

/**
 * Handles an {@link RMIRequest} and produces either an {@link RMIRemoteResult} if the specified target:
 * 1. Exists
 * 2. Is a function
 * 3. Doesn't throw an Error
 *
 * Otherwise, an {@link RMIRemoteError} is produced detailing that an error occurred. For security purposes, a generic
 * error message is generated. If an Error is thrown, it is propagated back to {@link exposeFunctions} where a given
 * error handler can handle it further (e.g. console logs, output to a log file, etc.)
 *
 * @param rmi The request body
 * @param functions A class / object containing functions that can be invoked.
 */
export const handleRequest = async ({ rmi }: RMIRequest, functions: { [key: string]: (...args: unknown[]) => unknown }): Promise<RMIRemoteResponse> => {
	const { data, id } = rmi;
	const { target, args } = data;

	const functionToInvoke = functions[target];
	if (typeof functionToInvoke !== "function") return createRMIRemoteError(id, `Target "${target}" is not invokable!`);

	const result = await functionToInvoke(...args);

	return createRMIRemoteResult(id, result);
};

type RMIRemoteOptions = {
    /**
     * Called with errors that are thrown during function invocation. This can be used e.g. to log errors during
     * development or collated into log files in prod, allowing developers to determine causes of Errors without
     * leaking sensitive information to the client.
     *
     * @param e The error that was thrown.
     */
    onFunctionInvocationError?: (e: Error) => void;
};

/**
 * Exposes the given functions to RMI clients, allowing them to be invoked via WebSocket.
 *
 * @param wss The WebSocket server that will be used to automatically listen for new connections and messages to
 *            handle function invocations.
 * @param functions Functions that should be exposed to RMI clients for invocation.
 * @param options Configuration to apply to exposed functions {@see RMIRemoteOptions}.
 */
export const exposeFunctions = (
	wss: WebSocketServer,
	functions: object,
	options?: RMIRemoteOptions
) => {
	wss.on("connection", ws => {
		log.info("New client connected!");

		ws.on("message", async (data: string) => {
			log.debug(`Client sent "${data}"`);

			let request: RMIRequest;
			try {
				request = JSON.parse(data);
			} catch (e) {
				log.debug(`Error parsing "${data}"; Cause:\n${e}`);
				return;
			}

			log.debug("Data is valid JSON. Validating as RMI Request...");
			if (!validateRMIRequest(request)) {
				log.debug(`Request was invalid! Request was\n${request}`);
				return;
			}

			let response: RMIRemoteResponse;

			try {
				log.info("Client sent a valid RMI Request. Attempting to invoke function...");
				response = await handleRequest(request, functions as { [key: string]: (...args: unknown[]) => unknown });
			} catch (e) {
				options?.onFunctionInvocationError?.(e as Error);
				log.info(`There was an error during invocation of a function. Request was:\n${request}\nError was:\n${e}`);

				response = createRMIRemoteError(request.rmi.id, "An unexpected error occurred during invocation.");
			}

			const responseString = JSON.stringify(response);

			log.info(`Request handled; Sending the following back to client:\n${responseString}`);
			ws.send(responseString);
		});
	});
};