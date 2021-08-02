import styles from "../style/Chat.module.scss";
import * as types from "../types";
import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import ChatBubble from "./ChatBubble";

interface ChatUrlParams {
    username: string;
};

export default function Chat() {

    const [messages, setMessages] = useState<types.Message[]>([]);
    const [userMessage, setUserMessage] = useState("");

    const { username } = useParams<ChatUrlParams>();

    useEffect(() => {
        const eventSource = new EventSource(
            `http://localhost:5000/chat/${username}`,
            { withCredentials: true }
        );

        eventSource.addEventListener("currentMessages", (event: unknown) => {
            const receivedMessagesString = (event as { data: string }).data; 
            const receivedMessages = JSON.parse(receivedMessagesString); 

            console.log()

            if(types.isMessages(receivedMessages))
                setMessages(receivedMessages);

            else throw new Error("Received messages do not have the desired type");
        }); 

        eventSource.addEventListener("message", (event: unknown) => {
            const receivedMessageString = (event as { data: string }).data; 
            const receivedMessage = JSON.parse(receivedMessageString); 

            if(types.isMessage(receivedMessage)) {
                if(receivedMessage.username !== username)
                    setMessages((messages) => messages.concat(receivedMessage));
            }

            else throw new Error("Received messages do not have the desired type");
        });

        return () => {
            eventSource.close();
        }
    }, []);

    const renderChatWindowMessages = messages.map((message, index) => {
        return message.username === username ?
            (
                <div className={styles.right} key={index}>
                    <ChatBubble message={message.message} />
                </div>
            )
            : (
                <div className={styles.left} key={index}>
                    <ChatBubble username={message.username}
                        message={message.message} />
                </div>
            );
    });

    function submitHandler(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        fetch(`http://localhost:5000/chat/${username}`, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain"
            },
            body: userMessage
        })
        .then(response =>
            response
                .text()
                .then(text => ({ ok: response.ok, text }))
        )
        .then(({ok, text}) => {
            if(ok) setMessages((messages) => 
                messages.concat({ username, message: text })
            );

            else throw new Error(text);
        });

        setUserMessage("");
    }

    return (
        <div className={styles.chat}>
            <div className={styles.menuBar}>
                <button aria-label="settings">&#9881;</button>
                <button aria-label="logout">&#8592;</button>
            </div>
            <div className={styles.chatWindow}>
                {renderChatWindowMessages}
            </div>
            <form onSubmit={submitHandler}>
                <textarea 
                    onChange={event => setUserMessage(event.target.value)}
                    value={userMessage}
                    rows={10}
                    aria-label="message box"
                ></textarea>
                <button aria-label="send message" type="submit">&#8599;</button>
            </form>
        </div>
    );
}