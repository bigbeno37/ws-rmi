import {RemoteMethods} from "./RemoteMethods";
import WebSocket from 'ws';

export class RMIClient {

	/**
	 * Returns arguments from a function string in the format [arg1, arg2, arg3...]
	 * TODO: Doesn't account for newline and comment shenanigans
	 * @param func
	 */
	static getArgs(func: string) {
		return func.replace(' ', '').split('(')[1].split(')')[0].split(',');
	}

	static addRemoteMethods<T extends RemoteMethods>(remoteMethods: T, connection?: WebSocket): T {
		// TODO: Add options to configure websocket connection url
		remoteMethods.connection = connection || new WebSocket('ws://localhost:3001/');

		for (const value of Object.getOwnPropertyNames(Object.getPrototypeOf(remoteMethods))) {
			if (value === 'constructor') continue;

			// Unique function being iterated on
			let uniqueFunction: Function = remoteMethods[value];
			const args = RMIClient.getArgs(uniqueFunction.toString());


			// Incredible amounts of jankery below, I'm sorry if there are bugs
			const newFunctionBody =
				`this.connection.send(\`${uniqueFunction.name} \$\{JSON.stringify([${args}])\}\`);
	
				return new Promise(resolve => {				
					const listener = message => {
						if (message.split(' ')[0] === '${uniqueFunction.name}') {
							this.connection.removeListener(listener);
	
							resolve( JSON.parse( message.split(' ').splice(1).join(' ') ) );
						}
					};
						
					this.connection.on('message', listener);
				});`;

			remoteMethods[value] = Function(...args, newFunctionBody);
		}

		return remoteMethods;
	}

}