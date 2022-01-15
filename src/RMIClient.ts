import {v4 as uuid} from "uuid";
import {RMIResult} from "./types/RMIResult";
import {RMIError} from "./types/RMIError";
import {JSON} from "./types/JSON";
import {isRMIError} from "./Utils";

/**
 * Creates an RMI client that, when functions are called, will automatically message the server the given WebSocket
 * is a connected to.
 *
 * NOTE: The given WebSocket is assumed to be connected and in a readyState of 1. If this isn't the case, an Error
 * will be thrown!
 *
 * @param ws An open WebSocket connection that will be used to invoke functions on the remote.
 */
export const createRMIClient = <T extends object>(ws: WebSocket): T => {
    if (ws.readyState !== 1) throw new Error(`Attempted to create remote RMI instance, but the given WebSocket 
        connection was not open. Ready state is ${ws.readyState}`);

    return new Proxy({}, {
        get: (target, property) => {
            return new Proxy(() => {
            }, {
                apply: (target, thisArg, args) => new Promise((resolve, reject) => {
                    const id = uuid();

                    const listener = ({data}: MessageEvent) => {
                        let response: RMIResult | RMIError;

                        try {
                            response = JSON.parse(data);
                        } catch {
                            return;
                        }

                        if (response.id !== id) return;

                        ws.removeEventListener("message", listener);

                        // Bit of a hack to make TypeScript check if response.error exists
                        if (isRMIError(response)) {
                            reject(response.error);
                        } else {
                            resolve(response.result);
                        }
                    };

                    ws.addEventListener("message", listener);
                    ws.send(JSON.stringify({id, target: property, args}));
                })
            });
        }
    }) as T;
};