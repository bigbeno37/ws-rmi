import {MethodHandlers} from "./index";

/**
 * Parent class of [[RMIClient]] and [[RMIServer]], containing functions available
 * to both such as addMethodHandlers
 */
export abstract class RMIContext {
	methodHandlers: MethodHandlers;

	/**
	 * Adds a MethodHandlers instance to this instance's inner reference. It will then be called via a function name
	 * call.
	 * @param connection The connection to add this methodHandler to
	 * @param methodHandlers The method handlers to add
	 */
	addMethodHandlers(connection: WebSocket, methodHandlers: MethodHandlers) {
		this.methodHandlers = methodHandlers;

		connection.addEventListener('message', (message: any) => {
			const data: string = typeof message === 'string' ? message : message.data;
			console.log(`Client said ${data}`);

			// If the message contains spaces and looks like the form 'call (funcName) (args)' try to call the
			// respective handler
			if (data.includes(' ')
				&& data.split(' ').length >= 3
				&& data.split(' ')[0] === 'call') {

				const functionName = data.split(' ')[1];
				const args = JSON.parse(data.split(' ').splice(2).join(' '));

				const handler = this.methodHandlers[functionName];
				if (handler) {
					let result = this.methodHandlers[functionName](...args);

					if (result === undefined) result = null;

					connection.send(`return ${functionName} ${JSON.stringify(result)}`);
				}
			}
		});

		return this;
	}
}