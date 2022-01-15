import {v4 as uuid} from "uuid";
import {WebSocketServer} from "ws";
import {JSON} from "./types/JSON";
import {RMIRequest} from "./types/RMIRequest";
import {RMIResult} from "./types/RMIResult";

export const getRemote = <T extends object>(ws: WebSocket): T => {
    if (ws.readyState !== 1) throw new Error(`Attempted to create remote RMI instance, but the given WebSocket 
        connection was not open. Ready state is ${ws.readyState}`);

    return new Proxy({}, {
        get: (target, property) => {
            return new Proxy(() => {}, {
                apply: (target, thisArg, args) => new Promise(resolve => {
                    const id = uuid();

                    const listener = ({data}: MessageEvent) => {
                        let response: RMIResult;

                        try {
                            response = JSON.parse(data) as RMIResult;
                        } catch {
                            return;
                        }

                        if (response.id !== id) return;

                        ws.removeEventListener("message", listener);
                        resolve(response.result);
                    };

                    ws.addEventListener("message", listener);
                    ws.send(JSON.stringify({ id, target: property, args }));
                })
            });
        }
    }) as T;
};

export const exposeFunctions = (wss: WebSocketServer, functions: object) => {
    wss.on("connection", ws => {
        ws.on("message", async (data: string) => {
            console.log("Received RMI request", ""+data);
            const request = JSON.parse(data) as RMIRequest;

            const result = await (functions as any)[request.target](...request.args);

            ws.send(JSON.stringify({ id: request.id, target: request.target, result }));
        });
    });
};