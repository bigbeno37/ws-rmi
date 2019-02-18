import express from 'express';
import expressWs, {Application} from 'express-ws';
import {MethodHandlers} from "./index";

export class RMIServer {
	private readonly _server: Application;
	private _handlers: Map<string, Function>;

	/**
	 * Starts up an express server with WS support on port 3001
	 */
	constructor(methodHandlers: MethodHandlers, server?: Application) {
		this._server = server || expressWs(express()).app;

		this._server.ws('/', connection => {
			console.log('New connection!');

			connection.on('message', (message: string) => {
				console.log(`Client said ${message}`);

				const functionName = message.split(' ')[0];
				const args = JSON.parse(message.split(' ').splice(1).join(' '));

				const handler = this._handlers.get(functionName);
				if (handler) {
					let result = handler(...args);

					if (result === undefined) result = null;

					connection.send(`${functionName} ${JSON.stringify(result)}`);
				}
			});
		});

		this._server.listen(3001);

		// -----------------------

		this._handlers = new Map();

		for (const value of Object.getOwnPropertyNames(Object.getPrototypeOf(methodHandlers))) {
			if (value === 'constructor') continue;

			const uniqueFunction: Function = methodHandlers[value];
			this._handlers.set(uniqueFunction.name, uniqueFunction);
		}
	}

	get handlers() {
		return this._handlers;
	}
}