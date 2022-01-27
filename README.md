# ws-rmi
A Remote Method Invocation implementation written in TypeScript utilising the WebSocket protocol.

## Installation
```
npm i ws-rmi
```

## Basic Usage
Types
```ts
export interface Server {
    add(x: number, y: number): Promise<number>;
}
```

Client
```ts
import {Server} from "./Types";
import {RMIManager} from "ws-rmi";

const ws = new WebSocket("ws://localhost:8080");

ws.addEventListener("open", async () => {
	const rmi = new RMIManager(ws);
	const remote = rmi.getRemote<Server>();

	try {
		console.log(`1+1 is ${await remote.add(1, 1)}`);
	} catch (e) {
		console.log("Server side error occurred.\n", e);
	}
	
	ws.close();
});
```

Server
```ts
import { WebSocketServer } from "ws";
import {Server} from "./Types";
import {RMIManager} from "ws-rmi";

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

		const rmi = new RMIManager(ws as unknown as WebSocket);
		rmi.exposeFunctions(new ServerImpl());

		console.log("Done!");
	});
});
```