import type {RMIRemoteError} from "./types/RMIRemoteError";
import type {RMIRemoteResult} from "./types/RMIRemoteResult";

/**
 * A typeguard to ensure the given response is an {@link RMIRemoteError} as opposed to an {@link RMIRemoteResult}.
 *
 * @param response The response to verify is an RMIError
 */
export const isRMIError = (response: { [key: string]: any }): response is RMIRemoteError => {
	return typeof response.id === "string" && typeof response.error === "string";
};

export const xor = (condition1: boolean, condition2: boolean) => !condition1 !== !condition2;