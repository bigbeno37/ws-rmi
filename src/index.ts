import {v4 as uuid} from "uuid";
import {WebSocketServer} from "ws";
import {JSON} from "./types/JSON";
import {RMIRequest} from "./types/RMIRequest";
import {RMIResult} from "./types/RMIResult";
import {RMIError} from "./types/RMIError";

const isError = (msg: { [key: string]: any }): msg is RMIError => {
    return typeof msg.id === "string" && typeof msg.error === "string";
}

export const getRemote = <T extends object>(ws: WebSocket): T => {
    if (ws.readyState !== 1) throw new Error(`Attempted to create remote RMI instance, but the given WebSocket 
        connection was not open. Ready state is ${ws.readyState}`);

    return new Proxy({}, {
        get: (target, property) => {
            return new Proxy(() => {}, {
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
                        if (isError(response)) {
                            reject(response.error);
                        } else {
                            resolve(response.result);
                        }
                    };

                    ws.addEventListener("message", listener);
                    ws.send(JSON.stringify({ id, target: property, args }));
                })
            });
        }
    }) as T;
};

const handleRequest = async ({ id, target, args }: RMIRequest, functions: any): Promise<RMIResult | RMIError> => {
    const functionToInvoke = functions[target];
    if (!functionToInvoke) return { id: id, error: `Unable to find target "${target}" to invoke!` };
    if (typeof functionToInvoke !== "function") return { id: id, error: `Target "${target}" is not invokable!` }

    try {
        const result = await functionToInvoke(...args);

        return {id, result};
    } catch (e) {
        return { id, error: `An error occurred during invocation of target "${target}". Cause:\n${e}` };
    }
};

export const exposeFunctions = (wss: WebSocketServer, functions: object) => {
    wss.on("connection", ws => {
        ws.on("message", async (data: string) => {
            let request: RMIRequest;
            try {
                request = JSON.parse(data);
            } catch {
                return;
            }

            const response = await handleRequest(request, functions);

            ws.send(JSON.stringify(response));
        });
    });
};