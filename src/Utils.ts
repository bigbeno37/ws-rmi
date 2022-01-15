import {RMIError} from "./types/RMIError";

export const isError = (msg: { [key: string]: any }): msg is RMIError => {
    return typeof msg.id === "string" && typeof msg.error === "string";
}