import {MethodHandlers} from "../src";
import {RMIServer} from "../src/RMIServer";
import WebSocket from 'ws';

let server: any;
let serverRmi: RMIServer;
let connectClient: (connection: WebSocket) => void;

let ws: any;
let sendMessageToServer: (message: string) => void;

class ServerHandlers implements MethodHandlers {
	calculateSum(num1: number, num2: number) {
		return num1+num2;
	}

	createArray(arg1: string, arg2: string): string[] {
		return [arg1, arg2];
	}
}

describe('RMIServer', () => {
	beforeAll(() => {
		server = jest.fn();
		server.ws = jest.fn((url: string, handler: (connection: WebSocket) => void) => connectClient = handler);
		server.listen = jest.fn();

		serverRmi = new RMIServer(new ServerHandlers(), server);
	});

	beforeEach(() => {
		ws = jest.fn();
		ws.on = jest.fn((type: string, handler: (message: string) => void) => sendMessageToServer = handler);
		ws.send = jest.fn();
	});

	it('sets the handlers correctly', () => {
		expect(serverRmi.handlers.has('calculateSum')).toBeTruthy();
		expect(serverRmi.handlers.has('createArray')).toBeTruthy();
	});

	it('returns the correct value when calculateSum is called', () => {
		expect(ws.send).not.toHaveBeenCalled();

		connectClient(ws);
		sendMessageToServer('calculateSum [1,2]');

		expect(ws.send).toHaveBeenCalledWith('calculateSum 3');
	});
});