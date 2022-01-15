import {JSON} from "./JSON";
import type {RMIRequest} from "./RMIRequest";

/**
 * Represents a successful invocation of a {@link RMIRequest}.
 */
export type RMIResult = {
    /**
     * The UUID of the {@link RMIRequest} that was handled.
     */
    id: string,

    /**
     * The result of the function invocation.
     */
    result: JSON
};