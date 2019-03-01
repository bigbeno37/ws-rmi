import {MethodHandlers, RemoteMethods} from "./index";

export class RMIClient {
	public connection: WebSocket;

	private readonly _isConnected: Promise<void>;
	handlers: Map<string, Function>;

	constructor(connection?: WebSocket) {
		this.connection = connection || new WebSocket('ws://localhost:3001/');

		// If this connection isn't OPEN, create a new promise that resolves when it becomes open
		if (this.connection.readyState !== 1) {
			this._isConnected = new Promise(resolve => this.connection.addEventListener("open", () => resolve()));
		}
	}

	addMethodHandlers(methodHandlers: MethodHandlers) {
		// methodHandlers was passed in, establish two way RMI
		this.handlers = new Map();

		for (const value of Object.getOwnPropertyNames(Object.getPrototypeOf(methodHandlers))) {
			if (value === 'constructor') continue;

			const uniqueFunction: Function = methodHandlers[value];
			this.handlers.set(uniqueFunction.name, uniqueFunction);
		}

		this.connection.addEventListener('message', (message: {data: string}) => {
			const data = message.data;
			console.log(`Remote said ${data}`);

			// If the data contains spaces and looks like the form 'call (funcName) (args)' try to call the
			// respective handler
			if (data.includes(' ')
				&& data.split(' ').length >= 3
				&& data.split(' ')[0] === 'call') {

				const functionName = data.split(' ')[1];
				const args = JSON.parse(data.split(' ').splice(2).join(' '));

				const handler = this.handlers.get(functionName);
				if (handler) {
					let result = handler(...args);

					if (result === undefined) result = null;

					this.connection.send(`return ${functionName} ${JSON.stringify(result)}`);
				}
			}
		});

		return this;
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
		remoteMethods.handlers = this.handlers;

		for (const value of Object.getOwnPropertyNames(Object.getPrototypeOf(remoteMethods))) {
			if (value === 'constructor') continue;

			// Unique function being iterated on
			let uniqueFunction: Function = remoteMethods[value];
			const args = this.getArgs(uniqueFunction.toString());

			// Incredible amounts of jankery below, I'm sorry if there are bugs
			const newFunctionBody =
				`this.connection.send(\`call ${uniqueFunction.name} \$\{JSON.stringify([${args}])\}\`);
	
				return new Promise(resolve => {				
					const listener = ({data}) => {
						console.log(\`Server said \$\{data\}\`);
						
						// This can't be our message if:
						// It doesn't have any spaces
						if (!data.includes(' ')) return;
						
						// When split it doesn't consist of return (funcName) (returnValue)
						if (data.split(' ').length < 3) return;
						
						// If the first parameter isn't return
						if (data.split(' ')[0] != 'return') return;
					
						// And definitely if the second parameter is for a separate function (maybe our function
						// just takes a while to return
						
						// If the message, however, does follow all these rules, resolve this promise
						if (data.split(' ')[1] === '${uniqueFunction.name}') {						
							this.connection.removeEventListener('message', listener);
	
							resolve( JSON.parse( data.split(' ').splice(2).join(' ') ) );
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