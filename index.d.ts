import {MethodHandlers, RemoteMethods} from "./src";
import {Application} from "express-ws";

export class RMIClient {
	public connection: WebSocket;

	constructor(connection?: WebSocket);

	/**
	 * Adds the functions found in the remoteMethods instance and returns an object
	 * containing those same functions that can interact with an RMIServer
	 * @param remoteMethods
	 */
	addRemoteMethods<T extends RemoteMethods>(remoteMethods: T): Promise<T&RMIClient>;
}

/**
 * Note: RMIServer is only available on NodeJS environments, as it automatically
 * loads an express server to handle websocket connections
 */
export class RMIServer {
	public handlers: Map<string, Function>;

	/**
	 * Starts up an express server listening for websockets on localhost:3001 and
	 * creates handlers for RMIClient requests
	 * @param methodHandlers An instance of a MethodHandlers class
	 * @param server An Express application to use instead of starting a server. Used internally for testing
	 */
	constructor(methodHandlers: MethodHandlers, server?: Application);
}

export interface RemoteMethods {
	[index: string]: any
}

export interface MethodHandlers extends RemoteMethods {
	[index: string]: any
}