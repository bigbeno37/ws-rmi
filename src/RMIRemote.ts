import {RMIRequest} from "./types/RMIRequest";
import {RMIResult} from "./types/RMIResult";
import {RMIError} from "./types/RMIError";
import {WebSocketServer} from "ws";
import {JSON} from "./types/JSON";

export const handleRequest = async ({id, target, args}: RMIRequest, functions: any): Promise<RMIResult | RMIError> => {
    const functionToInvoke = functions[target];
    if (!functionToInvoke) return {id: id, error: `Unable to find target "${target}" to invoke!`};
    if (typeof functionToInvoke !== "function") return {id: id, error: `Target "${target}" is not invokable!`}

    try {
        const result = await functionToInvoke(...args);

        return {id, result};
    } catch (e) {
        return {id, error: `An error occurred during invocation of target "${target}". Cause:\n${e}`};
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