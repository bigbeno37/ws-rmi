import { WebSocketServer } from "ws";
import {exposeFunctions} from "../src";
import {Server} from "./Types";

const wss = new WebSocketServer({ port: 8080 });

class ServerImpl implements Server {
    async add(x: number, y: number): Promise<number> {
        return x + y;
    }
}

wss.on("listening", () => {
    console.log("Server listening on port 8080...");

    exposeFunctions(wss, new ServerImpl());
});