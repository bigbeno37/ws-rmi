import {createRMIMessage, createRMIMessageValidator, RMIMessage} from "./RMIMessage";
import {hasPropertyOfType, isArray, isObject, isString} from "../JSONValidation";

/**
 * Represents a request made to a remote RMI server.
 */
type RMIRequestData = {
    /**
     * The name of the function that will be invoked on the remote RMI server.
     */
    target: string,

    /**
     * Arguments that will be provided to the function invoked on the remote RMI server.
     */
    args: unknown[]
};

/**
 * Represents a request to the remote to invoke a function.
 */
export type RMIRequest = RMIMessage<"REQUEST", RMIRequestData>;

/**
 * Creates an object adhering to the RMI Request schema.
 *
 * @param id The ID to uniquely identify the RMI Result that the remote sends back.
 * @param target The target function to be invoked.
 * @param args The function arguments to be invoked in the remote.
 */
export const createRMIRequest = (id: string, target: string, args: unknown[]): RMIRequest =>
	createRMIMessage(id, "REQUEST", { target, args });

/**
 * Validates that the given message is an RMI Request.
 */
export const validateRMIRequest = createRMIMessageValidator((data): data is RMIRequestData =>
	isObject(data) && hasPropertyOfType(data, "target", isString) && hasPropertyOfType(data, "args", isArray)
);