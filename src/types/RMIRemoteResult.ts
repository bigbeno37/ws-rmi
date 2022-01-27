import {createRMIMessage, createRMIMessageValidator, RMIMessage} from "./RMIMessage";
import {hasProperty, isObject} from "../JSONValidation";

export type RMIRemoteResultData = {
    /**
     * The result of the function invocation.
     */
    result: unknown
}

/**
 * Represents a successful invocation of an RMI request.
 */
export type RMIRemoteResult = RMIMessage<"RESPONSE_RESULT", RMIRemoteResultData>;

/**
 * Creates an object adhering to the RMI Remote Result schema.
 *
 * @param id The ID of the request that was used from the client.
 * @param result The result of the function invocation.
 */
export const createRMIRemoteResult = (id: string, result: unknown): RMIRemoteResult =>
	createRMIMessage(id, "RESPONSE_RESULT", { result });

/**
 * Validates that the given message is an RMI Remote Result.
 */
export const validateRMIRemoteResult = createRMIMessageValidator((data): data is RMIRemoteResultData =>
	isObject(data) && hasProperty(data, "result")
);