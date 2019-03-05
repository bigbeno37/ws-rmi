import {Application} from "express-ws";
/**
 * Parent class of [[RMIClient]] and [[RMIServer]], containing functions available
 * to both such as addMethodHandlers
 */
export abstract class RMIContext {
	methodHandlers: MethodHandlers;

	/**
	 * Adds a MethodHandlers instance to this instance's inner reference. It will then be called via a function name
	 * call.
	 * @param connection The connection to add this methodHandler to
	 * @param methodHandlers The method handlers to add
	 */
	addMethodHandlers(connection: WebSocket, methodHandlers: MethodHandlers): RMIContext;
}

export class RMIClient extends RMIContext {
	public connection: WebSocket;

	private readonly _isConnected: Promise<void>;
	handlers: Map<string, Function>;

	constructor(options?: ClientOptions, connection?: WebSocket);

	/**
	 * Calls [[RMIContext.addMethodHandlers]] to set methodHandlers as the instance to invoke upon receiving
	 * a request to call a method
	 * @param methodHandlers
	 */
	addMethodHandlers(methodHandlers: MethodHandlers): RMIClient;

	/**
	 * Returns arguments from a function string in the format [arg1, arg2, arg3...]
	 * TODO: Doesn't account for newline and comment shenanigans
	 * @param func
	 */
	private getArgs(func: string);

	addRemoteMethods<T extends RemoteMethods>(remoteMethods: T): Promise<T&RMIClient>;
}

/**
 * Note: RMIServer is only available on NodeJS environments, as it automatically
 * loads an express server to handle websocket connections
 */
export class RMIServer extends RMIContext {
	private readonly _server: Application;
	public onNewConnection: (connection: WebSocket) => void;

	/**
	 * Starts up an express server with WS support on port 3001
	 */
	constructor(options?: ServerOptions, server?: Application);

	addMethodHandlers(methodHandlers: MethodHandlers): this;
}

export interface RemoteMethods {
	[index: string]: any
}

export interface MethodHandlers extends RemoteMethods {
	[index: string]: any
}

export type ClientOptions = {
	port?: number
}

export type ServerOptions = {
	port?: number
}