import {hasPropertyOfType, isObject, isString, Validator} from "../JSONValidation";
import {isEqualToAny} from "../Utils";

export type RMIMessageType = "REQUEST" | "RESPONSE_RESULT" | "RESPONSE_ERROR";

const isRMIMessageType: Validator<RMIMessageType> = (data): data is RMIMessageType =>
	isString(data) && isEqualToAny(data, "REQUEST", "RESPONSE_RESULT", "RESPONSE_ERROR");

/**
 * Represents a message that is sent from client to server and vice-versa. This is the base type, and should
 * be used by sub-types to represent a full message.
 */
export type RMIMessage<T extends RMIMessageType, D> = {
    rmi: {
        version: "1",
        id: string,
		type: T,
        data: D
    }
};

/**
 * Creates an object that matches the {@link RMIMessage} schema. This is generally used by sub-types to
 * create full message objects.
 *
 * @param id The ID of the message to be created.
 * @param type The type of message to be created.
 * @param data The data to be inserted into this message.
 */
export const createRMIMessage = <T extends RMIMessageType, D>(id: string, type: T, data: D): RMIMessage<T, D> => ({
	rmi: {
		version: "1",
		id,
		type,
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
export const createRMIMessageValidator = <D>(dataValidator: Validator<D>) => (message: unknown): message is RMIMessage<RMIMessageType, D> => {
	if (!isObject(message)) return false;
	if (!hasPropertyOfType(message, "rmi", isObject)) return false;

	const { rmi } = message;
	if (!hasPropertyOfType(rmi, "version", isString)) return false;
	if (!hasPropertyOfType(rmi, "id", isString)) return false;
	if (!hasPropertyOfType(rmi, "type", isRMIMessageType)) return false;

	return hasPropertyOfType(rmi, "data", dataValidator);
};