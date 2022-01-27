import {createRMIClient} from "../src";
import {Server} from "./Types";
import WebSocket from "ws";

const ws = new WebSocket("ws://localhost:8080");

ws.addEventListener("open", async () => {
	// a ws "WebSocket" is missing a few items from a regular browser WebSocket, but it is not used, hence
	// the ignore statement.
	// @ts-ignore
	const server = createRMIClient<Server>(ws);

	try {
		console.log(`1+1 is ${await server.add(1, 1)}`);
	} catch (e) {
		console.log("Server side error occurred.\n", e);
	}
	ws.close();
});

