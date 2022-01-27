import {Server} from "./Types";
import WsWebSocket from "ws";
import {RMIManager} from "../src";

const ws = new WsWebSocket("ws://localhost:8080");

ws.addEventListener("open", async () => {
	const rmi = new RMIManager(ws as unknown as WebSocket);
	const remote = rmi.getRemote<Server>();

	try {
		console.log(`1+1 is ${await remote.add(1, 1)}`);
	} catch (e) {
		console.log("Server side error occurred.\n", e);
	}
	ws.close();
});

