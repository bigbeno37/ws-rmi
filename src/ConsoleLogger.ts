import {Logger} from "./types/Logger";

export const ConsoleLogger: Logger = {
	fatal(message: string) {
		console.error(message);
	},
	error(message: string) {
		console.error(message);
	},
	warn(message: string) {
		console.warn(message);
	},
	info(message: string) {
		console.log(message);
	},
	debug(message: string) {
		console.log(message);
	},
	trace(message: string) {
		console.log(message);
	}
};