import { Logger } from "../src";
import {pino} from "pino";

const log = pino();

export const PinoLogger: Logger = {
	fatal(message: string) {
		log.fatal(message);
	},
	error(message: string) {
		log.error(message);
	},
	warn(message: string) {
		log.warn(message);
	},
	info(message: string) {
		log.info(message);
	},
	debug(message: string) {
		log.debug(message);
	},
	trace(message: string) {
		log.trace(message);
	}
};