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

export function isMessages(messages: any): messages is Message[] {
    if(! (messages instanceof Array)) return false;

    for(const message of messages)
        if(! isMessage(message)) 
            return false;

    return true;
}