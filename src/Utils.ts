import type {RMIError} from "./types/RMIError";
import type {RMIResult} from "./types/RMIResult";

/**
 * A typeguard to ensure the given response is an {@link RMIError} as opposed to an {@link RMIResult}.
 *
 * @param response The response to verify is an RMIError
 */
export const isRMIError = (response: { [key: string]: any }): response is RMIError => {
    return typeof response.id === "string" && typeof response.error === "string";
}