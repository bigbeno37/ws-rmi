import {RMIServer} from "../src/RMIServer";
import {MethodHandlers, RMIClient} from "../src";
import WebSocket from 'ws';

class ServerHandlers implements MethodHandlers {
	calculateSum(num1: number, num2: number): number {
		return num1+num2;
	}

	createArray(arg1: string, arg2: string): string[] {
		return [arg1, arg2];
	}

	say(message: string): void {
		console.log(message);
	}
}

let server: RMIServer;
let remote: ServerHandlers&RMIClient;

describe('E2E', () => {
	beforeAll(() => {
		(global as any).WebSocket = WebSocket;
		server = new RMIServer(new ServerHandlers());
	});

	beforeEach(async () => {
		remote = await new RMIClient().addRemoteMethods(new ServerHandlers());
	});

	it('returns the correct sum of 1 and 2', async () => {
		const sum = await remote.calculateSum(1, 2);

		expect(sum).toBe(3);
	});

	it('returns the correct concatenated array', async () => {
		const array = await remote.createArray('Hello, ', 'World!');

		expect(array).toHaveLength(2);
		expect(array[0]).toBe('Hello, ');
		expect(array[1]).toBe('World!');
	});

	it('handles void returns', async () => {
		const response = await remote.say('Hello, world!');

		expect(response).toBeNull();
	});
});