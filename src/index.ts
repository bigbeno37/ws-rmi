import {RMIClient} from "./RMIClient";

export {RMIClient};

// If this is a NodeJS environment without a window, RMIServer is usable
if (typeof window === 'undefined') {
	const {RMIServer} = require('./RMIServer');
	exports.RMIServer = RMIServer;
}

export interface RemoteMethods {
	[index: string]: any
}

export interface MethodHandlers extends RemoteMethods {
	[index: string]: any
}