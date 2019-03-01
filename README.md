# ws-rmi
RMI in Javascript through native WebSocket connections

## How to use
Using ws-rmi is extremely simple, and is meant to be paired up with a type system like Typescript for native autocompletion and type checking. To begin, define a class your remote offers and that can be called by the client (note this must extend MethodHandlers):

```typescript
import {MethodHandlers} from 'ws-rmi';

export class ServerMethods extends MethodHandlers {
	calculateSum(num1: number, num2: number): number {
		return num1+num2;
	}
}
```

On the server, call addMethodHandlers and simply pass in an instance:
**(NOTE: RMIServer requires an es6+ environment to work!)**

```typescript
import {RMIServer} from 'ws-rmi';

const server = new RMIServer().addMethodHandlers(new ServerMethods());
```

This will automatically spin up an express server on port 3001 listening for WebSocket connections. If using Typescript, a quick and easy way to launch a `server.ts` file is to use `ts-node` with the command `ts-node -O '{"module": "commonjs", "target": "ES6"}' server.ts`. Note that the -O {...} argument can be removed if a tsconfig file is set up with target ES6 or above and module set to commonjs.

To allow a client to use the methods specified in ServerMethods, either an instance of ServerMethods or an interface-like class must be provided. An example of an interface-like class is as follows:

```typescript
import {RemoteMethods} from 'ws-rmi';

class RemoteServerMethods extends RemoteMethods {
	// @ts-ignore
	calculateSum(num1: number, num2: number): number {}
}
``` 

Connecting the client to the server is quite simple. Create a new instance of RMIClient and simply pass an instance of either ServerMethods of RemoteServerMethods (as seen in the examples above) into *addRemoteMethods*:

```typescript
import {RMIClient} from 'ws-rmi';

// new ServerMethods() is also applicable here
const remote = new RMIClient().addRemoteMethods(new RemoteServerMethods());
```

From here, simply await (or .then()) the functions found in ServerMethods, and it will work like native javascript. If using Typescript, you'll also have native autocompletion and typing support right out of the box.

```typescript
import {RMIClient} from 'ws-rmi';

const remote = new RMIClient().addRemoteMethods(new RemoteServerMethods());

(async () => {
	const sum = await remote.calculateSum(1, 2);
	
	// 3
	console.log(sum);
})();
```

**NOTE: Internally ws-rmi utilises JSON.stringify and JSON.parse, so functions will disappear inside objects (eg. class instances)**

## Two way RMI
ws-rmi has built in support for two way communication between a remote and client connection. Doing this is essentially the same as above, 
but on the remote end you can create a new instance of RMIClient, pass in a connection, and call addRemoteMethods like normal. An example is
shown below:

ServerHandlers.ts
```typescript
import {MethodHandlers} from 'ws-rmi';

export class ServerHandlers implements MethodHandlers {
	add(num1: number, num2: number) {
		return num1+num2;
	}
}
```

ClientHandlers.ts
```typescript
import {MethodHandlers} from 'ws-rmi';

export class ClientHandlers implements MethodHandlers {
	subtract(num1: number, num2: number) {
	    return num1-num2;	
	}
}
```

Server.ts
```typescript
import {RMIServer} from 'ws-rmi';
import WebSocket from 'ws';

const server = new RMIServer().addMethodHandlers(new ServerHandlers());
server.onNewConnection = async (connection: WebSocket) => {
	const client = await new RMIClient(connection as any).addRemoteMethods(new ClientHandlers());
	
	// Client says 3-2 is 1
	console.log(`Client says 3-2 is ${await client.subtract(3,2)}`);
}
```

Client.ts
```typescript
import {RMIClient} from 'ws-rmi';

(async () => {
	const remote = await new RMIClient().addRemoteMethods(new ServerMethods());
	remote.addMethodHandlers(new ClientMethods());
	
	// Server says 1+2 is 3
	console.log(`Server says 1+2 is ${await remote.add(1,2)}`);
})();
```

## How does it work?
Internally, ws-rmi utilises WebSocket messages to convey what needs to get called. Initially, a class instance is sent to RMIClient, whose prototype methods are replaced with a function that will send the original name of the functions as well as any parameters as an array via JSON.stringify to the server.

When the server is first initialised, it looks through the prototype of the instance passed in and adds the name and function into its own Map. When the server receives a WebSocket message, it determines if there's a corresponding function to the one in the message (e.g. the client may send 'call calculate [1,2]', and the Server will then find calculateSum). 

This function is then called, and its response (in addition to its name) is returned to the client so that the client's promise may be resolved.

A typical use case is as follows:

```typescript
const sum = await remote.calculateSum(1, 2);

// Client sends "call calculateSum [1,2]"
// Client waits for a message containing "return calculateSum"
// Server receives "call calculateSum [1,2]"
// Server retrieves a function from its map with key "calculateSum"
// Server executes calculateSum(1,2)
// Server sends back the result in the form "return calculateSum 3"
// Client receives "return calculateSum 3"
// Client resolves promise with value 3
// "sum" now has value of 3
```

## How can I contribute
### How to build / test ws-rmi
To build ws-rmi, run `npm run build`, which will start up Typescript's compilation system and build the Typedoc docs with each edit it detects. 

ws-rmi uses Jest as its testing platform, and to test your changes simply run `npm run test`.

### What can I do to help?
Documentation is always a critical part of any project, as are unit tests. If you feel ws-rmi is missing out in any of these aspects, feel free to make a pull request and we'll take a look.

Alternatively, take a look at the current issues and if you see one you'd like to tackle, go ahead. Just make sure you generally use our code style and have a good amount of tests to back up your changes.