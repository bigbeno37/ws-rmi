import {createRMIClient} from "./RMIClient";
import {exposeFunctions} from "./RMIRemote";

type RMIManagerConfig = {
	serialiser: "JSON"
};

export class RMIManager {
	private readonly _ws: WebSocket;

	constructor(ws: WebSocket, config?: RMIManagerConfig) {
		this._ws = ws;
	}

	getRemote<T extends object>() {
		return createRMIClient<T>(this._ws);
	}

	exposeFunctions(functions: object) {
		exposeFunctions(this._ws, functions);
	}
}