// One way RMI (client to server)
// Server needs to define handlers for each method invocation desired
// No need to directly call WS connections, library handles lower level implementation

class ServerHandlers {
	calculateSum(num1: number, num2: number) {
		return num1+num2;
	}
}

const server = new RMIServer(ServerHandlers);
/*
 * A new express server is started on port 3001 that handles WebSocket connections
 * Whenever a new connection sends a message, RMIServer looks against each method in ServerHandlers
 * and determines if one can be used to handle this message (looks at function name e.g. for this
 * example a corresponding message would be `calculateSum 1 2` from client
 * RMIServer calls the respective handler and sends back to the client whatever was returned from
 * the invoked method (if void, undefined is sent)
 */