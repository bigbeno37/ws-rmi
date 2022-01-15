import type {RMIRequest} from "./RMIRequest";

/**
 * Represents an error that occurred during invocation of an exposed RMI function.
 */
export type RMIError = {
    /**
     * The UUID of the {@link RMIRequest} that initiated the invocation of the RMI function.
     */
    id: string,

    /**
     * The cause of the error.
     */
    error: string
};