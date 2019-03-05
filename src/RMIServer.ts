import express from 'express';
import expressWs, {Application} from 'express-ws';
import {MethodHandlers, ServerOptions} from "./index";
import WebSocket from 'ws';
import {RMIContext} from "./RMIContext";

export class RMIServer extends RMIContext {
	private readonly _server: Application;
	public onNewConnection: (connection: WebSocket) => void;

	/**
	 * Starts up an express server with WS support on port 3001
	 */
	constructor(options?: ServerOptions, server?: Application) {
		super();

		this._server = server || expressWs(express()).app;

		this._server.ws('/', connection => {
			console.log('New connection!');
			if (this.onNewConnection) this.onNewConnection(connection);

			super.addMethodHandlers(connection as any, this.methodHandlers);
		});

		if (options && options.port) {
			this._server.listen(options.port);
		} else {
			this._server.listen(3001);
		}
	}

	addMethodHandlers(methodHandlers: MethodHandlers): this {
		this.methodHandlers = methodHandlers;

		return this;
	}
}