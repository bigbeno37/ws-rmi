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

		serverRmi = new RMIServer({}, server).addMethodHandlers(new ServerHandlers());
		serverRmi.onNewConnection = jest.fn();
	});

	beforeEach(() => {
		ws = jest.fn();
		ws.addEventListener = jest.fn((type: string, handler: (message: string) => void) => sendMessageToServer = handler);
		ws.send = jest.fn();
	});

	it('returns the correct value when calculateSum is called', () => {
		expect(ws.send).not.toHaveBeenCalled();

		connectClient(ws);
		sendMessageToServer('call calculateSum [1,2]');

		expect(ws.send).toHaveBeenCalledWith('return calculateSum 3');
	});

	it('calls the onNewConnection callback when a new connection is created', () => {
		connectClient(ws);

		expect(serverRmi.onNewConnection).toHaveBeenCalledWith(ws);
	});
});