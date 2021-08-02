import { Response } from "express";

export interface Message {
    username: string;
    message: string;
};

export function isMessage(message: any): message is Message {
    if(typeof message !== "object") return false;

    return (
        typeof message.username === "string"
        && typeof message.message === "string"
    );
}

export interface Subscriber {
    username: string;
    response: Response;
};