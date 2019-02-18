import WebSocket from 'ws';
import {RemoteMethods} from "./index";

export class RMIClient {
	public connection: WebSocket;

	constructor(connection?: WebSocket) {
		this.connection = connection || new WebSocket('ws://localhost:3001/');
	}

	/**
	 * Returns arguments from a function string in the format [arg1, arg2, arg3...]
	 * TODO: Doesn't account for newline and comment shenanigans
	 * @param func
	 */
	private getArgs(func: string) {
		return func.replace(' ', '').split('(')[1].split(')')[0].split(',');
	}

	addRemoteMethods<T extends RemoteMethods>(remoteMethods: T): T&RMIClient {
		// TODO: Add options to configure websocket connection url
		remoteMethods.connection = this.connection;

		for (const value of Object.getOwnPropertyNames(Object.getPrototypeOf(remoteMethods))) {
			if (value === 'constructor') continue;

			// Unique function being iterated on
			let uniqueFunction: Function = remoteMethods[value];
			const args = this.getArgs(uniqueFunction.toString());


			// Incredible amounts of jankery below, I'm sorry if there are bugs
			const newFunctionBody =
				`this.connection.send(\`${uniqueFunction.name} \$\{JSON.stringify([${args}])\}\`);
	
				return new Promise(resolve => {				
					const listener = message => {
						console.log(\`Server said \$\{message\}\`);
					
						if (message.split(' ')[0] === '${uniqueFunction.name}') {						
							this.connection.removeListener('message', listener);
	
							resolve( JSON.parse( message.split(' ').splice(1).join(' ') ) );
						}
					};
						
					this.connection.on('message', listener);
				});`;

			remoteMethods[value] = Function(...args, newFunctionBody);
		}

		for (const value of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) {
			if (value === 'constructor') continue;

			remoteMethods[value] = (this as any)[value];
		}

		return remoteMethods as T&RMIClient;
	}

	async isConnected() {
		return new Promise(resolve => this.connection.on('open', () => resolve()));
	}
}