import {createRMIMessage, createRMIMessageValidator, RMIMessage} from "./RMIMessage";
import {hasPropertyOfType, isObject, isString} from "../JSONValidation";

export type RMIRemoteErrorData = {
    /**
     * The cause of the error.
     */
    error: string
};

/**
 * Represents an error that occurred during invocation of an exposed RMI function.
 */
export type RMIRemoteError = RMIMessage<RMIRemoteErrorData>;

export const createRMIRemoteError = (id: string, error: string) => createRMIMessage(id, { error });

export const validateRMIRemoteError = createRMIMessageValidator((data): data is RMIRemoteErrorData =>
    isObject(data) && hasPropertyOfType(data, "error", isString)
);