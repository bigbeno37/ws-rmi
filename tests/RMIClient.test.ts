import {RMIClient} from "../src";
import {RemoteMethods} from "../src/RemoteMethods";

let server: ServerMethods;
let connection: any;
let sendMessageToClient: (message: string) => void;

class ServerMethods implements RemoteMethods {
	// @ts-ignore
	calculateSum(num1: number, num2: number): number {}

	// @ts-ignore
	createArray(arg1: string, arg2: string): string[] {}
}

describe('RMIClient', () => {
	beforeEach(() => {
		connection = jest.fn();
		connection.send = jest.fn();
		connection.on = jest.fn((type: string, handler: (message: string) => void) => sendMessageToClient = handler);
		connection.removeListener = jest.fn();

		server = RMIClient.addRemoteMethods(new ServerMethods(), connection);
	});

	it('correctly formats message to server when calling calculateSum', () => {
		server.calculateSum(1, 2);

		expect(connection.send).toHaveBeenCalledWith('calculateSum [1,2]');
	});

	it('correctly formats message to server when calling createArray', () => {
		server.createArray("Hello, ", "World!");

		expect(connection.send).toHaveBeenLastCalledWith('createArray [\"Hello, \",\"World!\"]');
	});

	it('returns the correct value after calling calculateSum', async () => {
		let sumPromise = server.calculateSum(1, 2);
		sendMessageToClient('calculateSum 3');

		const sum = await sumPromise;

		expect(sum).toBe(3);
	});

	it('returns the correct value after calling createArray', async () => {
		let createArrayPromise = server.createArray("Hello, ", "World!");
		sendMessageToClient('createArray [\"Hello, \",\"World!\"]');

		const array = await createArrayPromise;

		expect(array).toHaveLength(2);
		expect(array[0]).toBe('Hello, ');
		expect(array[1]).toBe('World!');
	});
});