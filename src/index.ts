import {v4 as uuid} from "uuid";
import {WebSocketServer} from "ws";

export const getRemote = <T extends object>(ws: WebSocket): T => {
    if (ws.readyState !== 1) throw new Error(`Attempted to create remote RMI instance, but the given WebSocket 
        connection was not open. Ready state is ${ws.readyState}`);

    return new Proxy({}, {
        get: (target, property) => {
            return new Proxy(() => {}, {
                apply: (target, thisArg, args) => {
                    const id = uuid();

                    const listener = ({data}: MessageEvent) => {
                        console.log(`received ${data}`);
                        ws.removeEventListener("message", listener);
                    };

                    ws.addEventListener("message", listener);
                    ws.send(JSON.stringify({ id, target: property, args }));
                }
            });
        }
    }) as T;
};

export const exposeFunctions = (wss: WebSocketServer, functions: object) => {
    wss.on("connection", ws => {
        ws.on("message", async (data: string) => {
            const request = JSON.parse(data) as { id: string, target: string, args: any };

            const result = await (functions as any)[request.target]();

            ws.send(JSON.stringify({ id: request.id, target: request.target, result }));
        });
    });
};