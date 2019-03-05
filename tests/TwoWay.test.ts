import {RMIServer} from "../src/RMIServer";
import {MethodHandlers, RMIClient} from "../src";
import WsWebSocket from 'ws';
import {RemoteMethods} from "../index";

class ServerHandlers implements MethodHandlers {
	private _messages: string[];
	private _connections: WebSocket[];

	constructor() {
		this._messages = [];
		this._connections = [];
	}

	addConnection(connection: WebSocket) {
		this._connections.push(connection);
	}

	async say(message: string) {
		this._messages.push(message);

		for (let connection of this._connections) {
			const client = await new RMIClient({}, connection).addRemoteMethods(new ClientHandlers());
			await client.updateMessageHistory(this._messages);
		}
	}
}

class RemoteServerMethods implements RemoteMethods {
	async say(message: string): Promise<void> {}
}

class ClientHandlers implements MethodHandlers {
	updateMessageHistory(messages: string[]) {
		console.log('messages updated with ' + messages);
	}
}

let server: RMIServer;
let remote: RemoteServerMethods&RMIClient;

describe('Two Way RMI', () => {
	beforeAll(() => {
		(global as any).WebSocket = WsWebSocket;
		(global as any).console = {
			log: jest.fn()
		};

		const handlers = new ServerHandlers();

		server = new RMIServer({port: 3002}).addMethodHandlers(handlers);
		server.onNewConnection = connection => {
			handlers.addConnection((connection as any));
		};
	});

	beforeEach(async () => {
		remote = await new RMIClient({port: 3002}).addRemoteMethods(new RemoteServerMethods());
		remote.addMethodHandlers(new ClientHandlers());
	});

	it('handles two way with instances', async () => {
		await remote.say('Hello, world!');
		expect(console.log).toHaveBeenCalledWith('messages updated with Hello, world!');
	});
});