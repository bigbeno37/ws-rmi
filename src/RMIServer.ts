import express from 'express';
import expressWs, {Application} from 'express-ws';

export class RMIServer {
	private readonly _server: Application;

	/**
	 * Starts up an express server with WS support on port 3001
	 */
	constructor(server?: Application) {
		this._server = server || expressWs(express()).app;

		this._server.ws('/', connection => {
			console.log('New connection!');

			connection.on('message', message => {
				console.log(`Client said ${message}`);
			});
		});

		this._server.listen(3001);
	}
}