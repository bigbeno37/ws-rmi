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
export type RMIRemoteResult = RMIMessage<RMIRemoteResultData>;

export const createRMIRemoteResult = (id: string, result: unknown) => createRMIMessage(id, { result });

export const validateRMIRemoteResult = createRMIMessageValidator((data): data is RMIRemoteResultData =>
	isObject(data) && hasProperty(data, "result")
);