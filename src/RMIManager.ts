import {createRMIClient} from "./RMIClient";
import {exposeFunctions} from "./RMIRemote";
import {Logger} from "./types/Logger";
import {ConsoleLogger} from "./ConsoleLogger";

/**
 * Represents common configuration that should be shared between an RMI client and exposed remote RMI functions.
 */
type RMIManagerConfig = {
	/**
	 * The logger to be used by both the RMI client and exposed remote RMI functions.
	 */
	logger: Logger
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
	 * The configuration to apply to the RMI connections.
	 *
	 * @private
	 */
	private readonly _config: RMIManagerConfig;

	/**
	 * Constructs a new manager instance.
	 *
	 * @param ws The WebSocket connectio nto use to perform RMI tasks. NOTE: This should be an active connection!
	 * @param config Configuration to be applied.
	 */
	constructor(ws: WebSocket, config: RMIManagerConfig = { logger: ConsoleLogger }) {
		this._ws = ws;
		this._config = config;
	}

	get ws(): WebSocket {
		return this._ws;
	}

	get config(): RMIManagerConfig {
		return this._config;
	}

	/**
	 * Constructs a client interface to use to invoke remote functions.
	 */
	getRemote<T extends object>() {
		return createRMIClient<T>(this);
	}

	/**
	 * Exposes the given functions to be able to be invoked by the client.
	 *
	 * @param functions An object (generally a class) that will be exposed.
	 */
	exposeFunctions(functions: object) {
		exposeFunctions(this, functions);
	}
}