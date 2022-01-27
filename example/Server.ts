import { WebSocketServer } from "ws";
import {Server} from "./Types";
import {exposeFunctions} from "../src";

class ServerImpl implements Server {
	async add(x: number, y: number): Promise<number> {
		return x + y;
	}
}

const wss = new WebSocketServer({ port: 8080 });

wss.on("listening", () => {
	console.log("Server listening on port 8080...");

	exposeFunctions(wss, new ServerImpl());
});