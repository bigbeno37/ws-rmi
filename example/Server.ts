import { WebSocketServer } from "ws";
import {Server} from "./Types";
import {RMIManager} from "../src";
import {PinoLogger} from "./PinoLogger";

class ServerImpl implements Server {
	async add(x: number, y: number): Promise<number> {
		return x + y;
	}
}

const wss = new WebSocketServer({ port: 8080 });

wss.on("listening", () => {
	console.log("Server listening on port 8080...");

	wss.on("connection", ws => {
		console.log("Client connected! Establishing RMI...");

		const rmi = new RMIManager(ws as unknown as WebSocket, { logger: PinoLogger });
		rmi.exposeFunctions(new ServerImpl());

		console.log("Done!");
	});
});