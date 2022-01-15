import {JSON} from "./JSON";

/**
 * Represents a request made to a remote RMI server.
 */
export type RMIRequest = {
    /**
     * The UUID of the request. This is used to ensure results are matched with the correct invocation, even if
     * messages are received out-of-order.
     */
    id: string,

    /**
     * The name of the function that will be invoked on the remote RMI server.
     */
    target: string,

    /**
     * Arguments that will be provided to the function invoked on the remote RMI server.
     */
    args: JSON[]
};