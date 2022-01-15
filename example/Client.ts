import {getRemote} from "../src";
import {Server} from "./Types";
import WebSocket from "ws";

const ws = new WebSocket("ws://localhost:8080");

ws.addEventListener("open", async () => {
    const server = getRemote<Server>(ws as any);

    console.log(`1+1 is ${await server.add(1, 1)}`);
    ws.close();
});

