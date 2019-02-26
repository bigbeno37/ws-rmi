import {RemoteMethods} from "./index";

export class RMIClient {
	public connection: WebSocket;

	private readonly _isConnected: Promise<void>;

	constructor(connection?: WebSocket) {
		this.connection = connection || new WebSocket('ws://localhost:3001/');

		// If this connection isn't OPEN, create a new promise that resolves when it becomes open
		if (this.connection.readyState !== 1) {
			this._isConnected = new Promise(resolve => this.connection.addEventListener("open", () => resolve()));
		}
	}

	/**
	 * Returns arguments from a function string in the format [arg1, arg2, arg3...]
	 * TODO: Doesn't account for newline and comment shenanigans
	 * @param func
	 */
	private getArgs(func: string) {
		return func.replace(' ', '').split('(')[1].split(')')[0].split(',');
	}

	async addRemoteMethods<T extends RemoteMethods>(remoteMethods: T): Promise<T&RMIClient>{
		// If this isn't an open connection, wait for it to be one
		if (this._isConnected) {
			await this._isConnected;
		}

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
					const listener = ({data}) => {
						console.log(\`Server said \$\{data\}\`);
					
						if (data.split(' ')[0] === '${uniqueFunction.name}') {						
							this.connection.removeEventListener('message', listener);
	
							resolve( JSON.parse( data.split(' ').splice(1).join(' ') ) );
						}
					};
						
					this.connection.addEventListener('message', listener);
				});`;

			remoteMethods[value] = Function(...args, newFunctionBody);
		}

		for (const value of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) {
			if (value === 'constructor') continue;

			remoteMethods[value] = (this as any)[value];
		}

		return remoteMethods as T&RMIClient;
	}
}