import {RMIServer} from "../src/RMIServer";
import {MethodHandlers, RMIClient} from "../src";
import WebSocket from 'ws';
import {RemoteMethods} from "../index";

class ServerHandlers implements MethodHandlers {
	private _messages: string[];

	constructor() {
		this._messages = [];
	}

	calculateSum(num1: number, num2: number): number {
		return num1+num2;
	}

	createArray(arg1: string, arg2: string): string[] {
		return [arg1, arg2];
	}

	say(message: string): void {
		this._messages.push(message);
	}

	getAllMessages(): string[] {
		return this._messages;
	}
}

class RemoteServerMethods implements RemoteMethods {
	// @ts-ignore
	calculateSum(num1: number, num2: number): number {}

	// @ts-ignore
	createArray(arg1: string, arg2: string): string[] {}

	say(message: string): void {}

	// @ts-ignore
	getAllMessages(): string[] {}
}

let server: RMIServer;
let remote: RemoteServerMethods&RMIClient;

describe('E2E', () => {
	beforeAll(() => {
		(global as any).WebSocket = WebSocket;
		server = new RMIServer().addMethodHandlers(new ServerHandlers());
	});

	beforeEach(async () => {
		remote = await new RMIClient().addRemoteMethods(new RemoteServerMethods());
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

	it('handles instance fields', async () => {
		expect(await remote.getAllMessages()).toHaveLength(0);

		await remote.say('Hello, world!');

		expect(await remote.getAllMessages()).toHaveLength(1);
		expect((await remote.getAllMessages())[0]).toBe('Hello, world!');
	});
});