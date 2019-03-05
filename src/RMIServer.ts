import express from 'express';
import expressWs, {Application} from 'express-ws';
import {MethodHandlers, ServerOptions} from "./index";
import WebSocket from 'ws';

export class RMIServer {
	private readonly _server: Application;
	public handlers: Map<string, Function>;
	public onNewConnection: (connection: WebSocket) => void;

	/**
	 * Starts up an express server with WS support on port 3001
	 */
	constructor(options?: ServerOptions, server?: Application) {
		this._server = server || expressWs(express()).app;

		this._server.ws('/', connection => {
			console.log('New connection!');
			if (this.onNewConnection) this.onNewConnection(connection);

			connection.on('message', (message: string) => {
				console.log(`Client said ${message}`);

				// If the message contains spaces and looks like the form 'call (funcName) (args)' try to call the
				// respective handler
				if (message.includes(' ')
					&& message.split(' ').length >= 3
					&& message.split(' ')[0] === 'call') {

					const functionName = message.split(' ')[1];
					const args = JSON.parse(message.split(' ').splice(2).join(' '));

					const handler = this.handlers.get('bound ' + functionName);
					if (handler) {
						let result = handler(...args);

						if (result === undefined) result = null;

						connection.send(`return ${functionName} ${JSON.stringify(result)}`);
					}
				}
			});
		});

		if (options && options.port) {
			this._server.listen(options.port);
		} else {
			this._server.listen(3001);
		}
	}

	addMethodHandlers<T extends MethodHandlers>(methodHandlers: T): RMIServer&T {
		this.handlers = new Map();

		for (const value of Object.getOwnPropertyNames(Object.getPrototypeOf(methodHandlers))) {
			if (value === 'constructor') continue;

			const uniqueFunction: Function = methodHandlers[value].bind(this);
			this.handlers.set(uniqueFunction.name, uniqueFunction);
		}

		Object.keys(methodHandlers)
			.filter(key => typeof key != 'function')
			.forEach(key => (this as any)[key] = methodHandlers[key]);

		// @ts-ignore
		return this as RMIServer&T;
	}
}