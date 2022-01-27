import {RMIRequest, validateRMIRequest} from "./types/RMIRequest";
import {createRMIRemoteResult} from "./types/RMIRemoteResult";
import {createRMIRemoteError} from "./types/RMIRemoteError";
import {RMIRemoteResponse} from "./types/RMIRemoteResponse";
import {RMIManager} from "./RMIManager";

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

export const exposeFunctions = (
	{ ws, config: { logger: log } }: RMIManager,
	functions: object
) => {
	ws.addEventListener("message", async ({ data }: MessageEvent<string>) => {
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

		if (request.rmi.type !== "REQUEST") return;

		let response: RMIRemoteResponse;

		try {
			log.info("Client sent a valid RMI Request. Attempting to invoke function...");
			response = await handleRequest(request, functions as { [key: string]: (...args: unknown[]) => unknown });
		} catch (e) {
			log.info(`There was an error during invocation of a function. Request was:\n${request}\nError was:\n${e}`);

			response = createRMIRemoteError(request.rmi.id, "An unexpected error occurred during invocation.");
		}

		const responseString = JSON.stringify(response);

		log.info(`Request handled; Sending the following back to client:\n${responseString}`);
		ws.send(responseString);
	});
};