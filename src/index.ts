import {RMIClient} from "./RMIClient";

export {RMIClient};

export interface RemoteMethods {
	[index: string]: any
}

export interface MethodHandlers extends RemoteMethods {
	[index: string]: any
}