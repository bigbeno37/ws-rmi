/**
 * Represents all possible valid values of a parsed JSON object.
 */
export type JSON = string | number | boolean | null | JSON[] | { [key: string | number]: JSON };