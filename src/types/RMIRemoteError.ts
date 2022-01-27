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

/**
 * Creates an object adhering to the RMI Remote Error schema.
 *
 * @param id The ID of the message to use.
 * @param error The error that occurred on the remote. NOTE: This should be generic to avoid clients obtaining
 *              potentially sensitive information about the remote, such as stack trace, etc.
 */
export const createRMIRemoteError = (id: string, error: string) => createRMIMessage(id, { error });

/**
 * Validates that the given message is an RMI remote error.
 */
export const validateRMIRemoteError = createRMIMessageValidator((data): data is RMIRemoteErrorData =>
	isObject(data) && hasPropertyOfType(data, "error", isString)
);