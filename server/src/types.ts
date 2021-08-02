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