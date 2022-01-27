import {hasPropertyOfType, isObject, isString, Validator} from "../JSONValidation";

export type RMIMessage<T> = {
    rmi: {
        version: "1",
        id: string,
        data: T
    }
};

export const createRMIMessage = <T>(id: string, data: T): RMIMessage<T> => ({
	rmi: {
		version: "1",
		id,
		data
	}
});

export const serialiseRMIMessage = <T>(id: string, data: T) => JSON.stringify({
	rmi: {
		version: "1",
		id,
		data
	}
});

export const createRMIMessageValidator = <T>(dataValidator: Validator<T>) => (message: unknown): message is RMIMessage<T> => {
	if (!isObject(message)) return false;
	if (!hasPropertyOfType(message, "rmi", isObject)) return false;

	const { rmi } = message;
	if (!hasPropertyOfType(rmi, "version", isString)) return false;
	if (!hasPropertyOfType(rmi, "id", isString)) return false;

	return hasPropertyOfType(rmi, "data", dataValidator);
};