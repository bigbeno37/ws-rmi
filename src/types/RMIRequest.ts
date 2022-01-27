/**
 * Represents a request made to a remote RMI server.
 */
import {createRMIMessageValidator, RMIMessage, serialiseRMIMessage} from "./RMIMessage";
import {hasProperty, hasPropertyOfType, isArray, isObject, isString} from "../JSONValidation";

type RMIRequestData = {
    /**
     * The name of the function that will be invoked on the remote RMI server.
     */
    target: string,

    /**
     * Arguments that will be provided to the function invoked on the remote RMI server.
     */
    args: any[]
};

export type RMIRequest = RMIMessage<RMIRequestData>;

export const serialiseRMIRequest = (id: string, target: string, args: any[]) =>
	serialiseRMIMessage<RMIRequestData>(id, {
		target,
		args
	});

export const validateRMIRequest = createRMIMessageValidator((data): data is RMIRequestData =>
	isObject(data) && hasPropertyOfType(data, "target", isString) && hasPropertyOfType(data, "args", isArray)
);