import {ClientOptions, MethodHandlers, RemoteMethods} from "./index";
import {RMIContext} from "./RMIContext";

export class RMIClient extends RMIContext {
	public connection: WebSocket;

	private readonly _isConnected: Promise<void>;
	handlers: Map<string, Function>;

	constructor(options?: ClientOptions, connection?: WebSocket) {
		super();
		let port = 3001;

		if (options && options.port) {
			port = options.port;
		}

		this.connection = connection || new WebSocket(`ws://localhost:${port}/`);

		// If this connection isn't OPEN, create a new promise that resolves when it becomes open
		if (this.connection.readyState !== 1) {
			this._isConnected = new Promise(resolve => this.connection.addEventListener("open", () => resolve()));
		}
	}

	/**
	 * Calls [[RMIContext.addMethodHandlers]] to set methodHandlers as the instance to invoke upon receiving
	 * a request to call a method
	 * @param methodHandlers
	 */
	addMethodHandlers(methodHandlers: MethodHandlers) {
		super.addMethodHandlers(this.connection, methodHandlers);

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
				`console.log(\`Sending call ${uniqueFunction.name} \$\{JSON.stringify([${args}])\} to server!\`);
				this.connection.send(\`call ${uniqueFunction.name} \$\{JSON.stringify([${args}])\}\`);
	
				return new Promise(resolve => {				
					const listener = ({data}) => {						
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
							console.log(\`Server sent \${data} to client!\`);
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