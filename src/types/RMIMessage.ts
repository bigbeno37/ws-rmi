import {hasPropertyOfType, isObject, isString, Validator} from "../JSONValidation";

/**
 * Represents a message that is sent from client to server and vice-versa. This is the base type, and should
 * be used by sub-types to represent a full message.
 */
export type RMIMessage<T> = {
    rmi: {
        version: "1",
        id: string,
        data: T
    }
};

/**
 * Creates an object that matches the {@link RMIMessage} schema. This is generally used by sub-types to
 * create full message objects.
 *
 * @param id The ID of the message to be created.
 * @param data The data to be inserted into this message.
 */
export const createRMIMessage = <T>(id: string, data: T): RMIMessage<T> => ({
	rmi: {
		version: "1",
		id,
		data
	}
});

/**
 * Returns a function that can be used to validate a message that should be validated as an RMI message. Assuming
 * the message conforms to the schema of an RMI message, the given dataValidator will be used to validate the inner
 * `data` property.
 *
 * @param dataValidator A function to validate the `data` property of the message.
 */
export const createRMIMessageValidator = <T>(dataValidator: Validator<T>) => (message: unknown): message is RMIMessage<T> => {
	if (!isObject(message)) return false;
	if (!hasPropertyOfType(message, "rmi", isObject)) return false;

	const { rmi } = message;
	if (!hasPropertyOfType(rmi, "version", isString)) return false;
	if (!hasPropertyOfType(rmi, "id", isString)) return false;

	return hasPropertyOfType(rmi, "data", dataValidator);
};