import {MethodHandlers, RemoteMethods} from "./src";
import {Application} from "express-ws";
import WsWebSocket from 'ws';

export class RMIClient {
	public connection: WebSocket;
	public handlers: Map<string, Function>;

	constructor(connection?: WebSocket);

	/**
	 * Adds the functions found in the remoteMethods instance and returns an object
	 * containing those same functions that can interact with an RMIServer
	 * @param remoteMethods
	 */
	addRemoteMethods<T extends RemoteMethods>(remoteMethods: T): Promise<T&RMIClient>;

	/**
	 * Prepares for two way RMI via the remote app calling new RMIClient(...).addRemoteMethods(...).(funcName)
	 * @param methodHandlers
	 */
	addMethodHandlers(methodHandlers: MethodHandlers): RMIClient;
}

/**
 * Note: RMIServer is only available on NodeJS environments, as it automatically
 * loads an express server to handle websocket connections
 */
export class RMIServer {
	public handlers: Map<string, Function>;
	public onNewConnection: (connection: WsWebSocket) => void;

	/**
	 * Starts up an express server listening for websockets on localhost:3001
	 * @param server An Express application to use instead of starting a server. Used internally for testing
	 */
	constructor(server?: Application);

	/**
	 * Registers handlers with RMIServer so that clients can successfully call server methods
	 * @param methodHandlers
	 */
	addMethodHandlers<T extends MethodHandlers>(methodHandlers: T): RMIServer&T;
}

export interface RemoteMethods {
	[index: string]: any
}

export interface MethodHandlers extends RemoteMethods {
	[index: string]: any
}