import type {RMIRequest} from "./RMIRequest";
import {createRMIMessage, createRMIMessageValidator, RMIMessage} from "./RMIMessage";
import {hasProperty, isObject} from "../JSONValidation";

export type RMIRemoteResultData = {
    /**
     * The result of the function invocation.
     */
    result: any
}

/**
 * Represents a successful invocation of a {@link RMIRequest}.
 */
export type RMIRemoteResult = RMIMessage<RMIRemoteResultData>;

export const createRMIRemoteResult = (id: string, result: any) => createRMIMessage(id, { result });

export const validateRMIRemoteResult = createRMIMessageValidator((data): data is RMIRemoteResultData =>
    isObject(data) && hasProperty(data, "result")
);