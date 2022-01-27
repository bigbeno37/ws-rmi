export type Validator<T> = (data: unknown) => data is T;

export const isNull: Validator<null> = (data): data is null => data === null;
export const isObject: Validator<object> = (data): data is object => data !== null && typeof data === "object";
export const isString: Validator<string> = (data): data is string => typeof data === "string" || data instanceof String;
export const isNumber: Validator<number> = (data): data is number => typeof data === "number";
export const isArray: Validator<unknown[]> = (data): data is unknown[] => Array.isArray(data);

export const hasProperty = <T extends object, K extends string>(object: T, key: K): object is T & { [key in K]: unknown } =>
    object.hasOwnProperty(key);

export const hasPropertyOfType = <T extends object, K extends string, V>(object: T, key: K, validator: Validator<V>): object is T & { [key in K]: V } =>
    hasProperty(object, key) && validator(object[key]);