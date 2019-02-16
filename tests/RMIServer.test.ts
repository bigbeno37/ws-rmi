import {MethodHandlers} from "../src";
import {RMIServer} from "../src/RMIServer";
import WebSocket from 'ws';

let server: any;
let serverRmi: any;
let connectClient: (connection: WebSocket) => void;

let ws: any;
let sendMessageToServer: (message: string) => void;

class ServerHandlers implements MethodHandlers {
	calculateSum(num1: number, num2: number) {
		return num1+num2;
	}
}

describe('RMIServer', () => {
	beforeAll(() => {
		server = jest.fn();
		server.ws = jest.fn((url: string, handler: (connection: WebSocket) => void) => connectClient = handler);
		server.listen = jest.fn();

		serverRmi = new RMIServer();
	});

	beforeEach(() => {
		ws = jest.fn();
		ws.on = jest.fn((type: string, handler: (message: string) => void) => sendMessageToServer = handler);
	});
});