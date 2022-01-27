import {RMIMessage} from "./RMIMessage";
import {isObject} from "../JSONValidation";
import {xor} from "../Utils";
import {RMIRemoteResultData, validateRMIRemoteResult} from "./RMIRemoteResult";
import {RMIRemoteErrorData, validateRMIRemoteError} from "./RMIRemoteError";

export type RMIRemoteResponseData = RMIRemoteResultData | RMIRemoteErrorData;
export type RMIRemoteResponse = RMIMessage<RMIRemoteResponseData>;

export const validateRMIRemoteResponse = (response: unknown): response is RMIRemoteResponse =>
	isObject(response) && xor(validateRMIRemoteResult(response), validateRMIRemoteError(response));