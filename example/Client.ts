import {createRMIClient} from "../src";
import {Server} from "./Types";
import WsWebSocket from "ws";

const ws = new WsWebSocket("ws://localhost:8080");

ws.addEventListener("open", async () => {
	const server = createRMIClient<Server>(ws as unknown as WebSocket);

	try {
		console.log(`1+1 is ${await server.add(1, 1)}`);
	} catch (e) {
		console.log("Server side error occurred.\n", e);
	}
	ws.close();
});

