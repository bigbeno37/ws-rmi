import express from 'express';
import expressWs, {Application} from 'express-ws';
import {MethodHandlers, ServerOptions} from "./index";
import {RMIContext} from "./RMIContext";

export class RMIServer extends RMIContext {
	private readonly _server: Application;
	private _newConnectionHandlers: ((connection: WebSocket) => void)[];
	private _clientDisconnectHandlers: ((connection: WebSocket) => void)[];

	/**
	 * Starts up an express server with WS support on port 3001
	 */
	constructor(options?: ServerOptions, server?: Application) {
		super();
		this._newConnectionHandlers = [];
		this._clientDisconnectHandlers = [];

		this._server = server || expressWs(express()).app;

		this._server.ws('/', connection => {
			console.log('New connection!');
			this.invokeCallbacks(this._newConnectionHandlers, connection);

			super.addMethodHandlers(connection as any, this.methodHandlers);

			connection.addEventListener('close', (event) => this.invokeCallbacks(this._clientDisconnectHandlers, event.target));
		});

		let port = 3001;

		if (options && options.port) {
			port = options.port;
		}

		this._server.listen(port);
		console.log(`Server listening on port ${port}!`)
	}

	addMethodHandlers(methodHandlers: MethodHandlers): this {
		this.methodHandlers = methodHandlers;

		return this;
	}

	// Event callbacks
	onNewConnection(callback: (connection: WebSocket) => void) {
		this._newConnectionHandlers.push(callback);
	}

	removeNewConnectionCallback(callback: (connection: WebSocket) => void) {
		this._newConnectionHandlers = this.removeCallback(this._newConnectionHandlers, callback);
	}

	onClientDisconnect(callback: (connection: WebSocket) => void) {
		this._clientDisconnectHandlers.push(callback);
	}

	removeClientDisconnectCallback(callback: (connection: WebSocket) => void) {
		this._clientDisconnectHandlers = this.removeCallback(this._clientDisconnectHandlers, callback);
	}
}