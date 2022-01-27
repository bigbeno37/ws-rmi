import {RMIMessage} from "./RMIMessage";
import {isObject} from "../JSONValidation";
import {xor} from "../Utils";
import {RMIRemoteResultData, validateRMIRemoteResult} from "./RMIRemoteResult";
import {RMIRemoteErrorData, validateRMIRemoteError} from "./RMIRemoteError";

export type RMIRemoteResponseData = RMIRemoteResultData | RMIRemoteErrorData;

/**
 * Represents a response from the remote, either the result of a function invocation or an error that occurred
 * during invocation.
 */
export type RMIRemoteResponse = RMIMessage<"RESPONSE_RESULT" | "RESPONSE_ERROR", RMIRemoteResponseData>;

/**
 * Validates that the given response is an RMI Remote Response.
 *
 * @param response The response to validate.
 */
export const validateRMIRemoteResponse = (response: unknown): response is RMIRemoteResponse =>
	isObject(response) && xor(validateRMIRemoteResult(response), validateRMIRemoteError(response));