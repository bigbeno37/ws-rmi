// One way RMI (client to server)
// Client asks server to execute methods, server returns response
// Server needs to provide methods that can be run
// Normally these would be interfaces, but need to map these onto actual objects, so
// classes must be used

import {RMIClient} from "../src";
import {RemoteMethods} from "../src/RemoteMethods";

class ServerMethods implements RemoteMethods {
	calculateSum(num1: number, num2: number) {}
}

const server = RMIClient.addRemoteMethods(new ServerMethods());
/*
 * server now has calculateSum on it, whose function body is replaced to be
 * calculateSum(num1: number, num2: number) {
 *     connection.send(`calculateSum ${num1} ${num2}`);
 *
 *     return new Promise(resolve => {
 *     	   const listener = (message: string) => {
 *     	       if (message.split(' ')[0] === 'calculateSum') {
 *     	           connection.removeListener(listener);
 *
 *     	           resolve(message.split(' ')[1];
 *     	       }
 *     	   };
 *
 *         connection.on('message', listener);
 *     });
 * }
 * Where connection is the WebSocket connection created in RMIClient's constructor
 * The server will then register these methods and invoke the respective one
 * upon receiving a message, and must ALWAYS send a message back regardless of return type
 */

(async () => {
	// Sum will be 3
	const sum = await server.calculateSum(1, 2);
})();