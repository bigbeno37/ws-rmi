/**
 * Returns the XOR of two boolean conditions; that is, if either condition1 OR condition2 is true, but not both.
 *
 * @param condition1 The first condition.
 * @param condition2 The second condition.
 */
export const xor = (condition1: boolean, condition2: boolean) => !condition1 !== !condition2;

/**
 * Returns whether the given value is equal to any of the items in compareTo.
 *
 * @param value The value to compare.
 * @param compareTo The values to be compared against value.
 */
export const isEqualToAny = <T>(value: unknown, ...compareTo: T[]) => compareTo.some(item => value === item);