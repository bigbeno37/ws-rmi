import {RemoteMethods, RMIClient} from "../src";
import WebSocket from 'ws';
import {MethodHandlers} from "../index";

let remote: ServerMethods&RMIClient;
let connection: any;
let sendMessageToClient: (message: {data: string}) => void;
let mockOpenConnection: () => void;

class ServerMethods implements RemoteMethods {
	// @ts-ignore
	calculateSum(num1: number, num2: number): number {}

	// @ts-ignore
	createArray(arg1: string, arg2: string): string[] {}
}

class ClientMethodHandlers implements MethodHandlers {
	add(num1: number, num2: number): number {
		return num1+num2;
	}

	subtract(num1: number, num2: number): number {
		return num1+num2;
	}
}

describe('RMIClient', () => {
	beforeAll(() => {
		(global as any).WebSocket = WebSocket;
	});

	beforeEach(async () => {
		connection = jest.fn();
		connection.send = jest.fn();
		connection.addEventListener = jest.fn((type: string, handler: (...params: any[]) => void) => {
			if (type === 'message') {
				sendMessageToClient = handler;
			} else {
				mockOpenConnection = handler;
			}
		});
		connection.removeEventListener = jest.fn();

		const remotePromise = new RMIClient({}, connection);
		mockOpenConnection();
		remote = await remotePromise.addRemoteMethods(new ServerMethods());
		remote.addMethodHandlers(new ClientMethodHandlers());
	});

	it('correctly formats message to remote when calling calculateSum', () => {
		remote.calculateSum(1, 2);

		expect(connection.send).toHaveBeenCalledWith('call calculateSum [1,2]');
	});

	it('correctly formats message to remote when calling createArray', () => {
		remote.createArray("Hello, ", "World!");

		expect(connection.send).toHaveBeenLastCalledWith('call createArray [\"Hello, \",\"World!\"]');
	});

	it('returns the correct value after calling calculateSum', async () => {
		let sumPromise = remote.calculateSum(1, 2);
		sendMessageToClient({data: 'return calculateSum 3'});

		const sum = await sumPromise;

		expect(sum).toBe(3);
	});

	it('returns the correct value after calling createArray', async () => {
		let createArrayPromise = remote.createArray("Hello, ", "World!");
		sendMessageToClient({data:'return createArray [\"Hello, \",\"World!\"]'});

		const array = await createArrayPromise;

		expect(array).toHaveLength(2);
		expect(array[0]).toBe('Hello, ');
		expect(array[1]).toBe('World!');
	});

	it('registers handlers', () => {
		expect(remote.handlers.has('add')).toBeTruthy();
		expect(remote.handlers.has('subtract')).toBeTruthy();
	});


});