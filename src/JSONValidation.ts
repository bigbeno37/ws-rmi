/**
 * Represents a function that narrows down the given data to a particular type. This is mainly used during JSON
 * validation.
 */
export type Validator<T> = (data: unknown) => data is T;

/**
 * Determines if the given data is null.
 *
 * @param data The data to narrow.
 */
export const isNull: Validator<null> = (data): data is null => data === null;

/**
 * Determines if the given data is an object.
 *
 * @param data The data to narrow.
 */
export const isObject: Validator<object> = (data): data is object => data !== null && typeof data === "object";

/**
 * Determines if the given data is a string.
 *
 * @param data The data to narrow.
 */
export const isString: Validator<string> = (data): data is string => typeof data === "string" || data instanceof String;

/**
 * Determines if the given data is a number.
 *
 * @param data The data to narrow.
 */
export const isNumber: Validator<number> = (data): data is number => typeof data === "number";

/**
 * Determines if the given data is an array.
 *
 * @param data The data to narrow.
 */
export const isArray: Validator<unknown[]> = (data): data is unknown[] => Array.isArray(data);

/**
 * Determines if the given object has a particular key.
 *
 * @example
 * declare var obj: object;
 *
 * if (hasProperty(obj, "foo")) {
 *     obj.foo // foo exists on obj, and is of type unknown
 * }
 *
 * @param object The object to examine.
 * @param key The key to use in the given object.
 */
export const hasProperty = <T extends object, K extends string>
	(object: T, key: K): object is T & { [key in K]: unknown } => key in object;

/**
 * Determines if the given object has a particular key that matches a given validator.
 *
 * @example
 * declare var obj: object;
 *
 * if (hasProperty(obj, "foo", isString)) {
 *     obj.foo // foo exists on obj, and is of type string
 * }
 *
 * @param object The object to examine.
 * @param key The key to use in the given object.
 * @param validator The validator that will narrow the type of object[key].
 */
export const hasPropertyOfType = <T extends object, K extends string, V>
	(object: T, key: K, validator: Validator<V>): object is T & { [key in K]: V } =>
		hasProperty(object, key) && validator(object[key]);