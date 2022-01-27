import {createRMIClient} from "./RMIClient";
import {exposeFunctions} from "./RMIRemote";

type RMIManagerConfig = {
	serialiser: "JSON"
};

/**
 * The core class for handling RMI connections. This can be used to invoke remote functions or expose functions to
 * the remote.
 *
 * NOTE: As WebSockets are bidirectional, "client" and "remote" are arbitrary. A browser can be both client and remote
 * if it both calls functions on a server while also exposing functions to the server.
 */
export class RMIManager {
	/**
	 * The WebSocket connection to use to perform RMI tasks.
	 *
	 * @private
	 */
	private readonly _ws: WebSocket;

	/**
	 * Constructs a new manager instance.
	 *
	 * @param ws The WebSocket connectio nto use to perform RMI tasks. NOTE: This should be an active connection!
	 * @param config Configuration to be applied.
	 */
	constructor(ws: WebSocket, config?: RMIManagerConfig) {
		this._ws = ws;
	}

	/**
	 * Constructs a client interface to use to invoke remote functions.
	 */
	getRemote<T extends object>() {
		return createRMIClient<T>(this._ws);
	}

	/**
	 * Exposes the given functions to be able to be invoked by the client.
	 *
	 * @param functions An object (generally a class) that will be exposed.
	 */
	exposeFunctions(functions: object) {
		exposeFunctions(this._ws, functions);
	}
}