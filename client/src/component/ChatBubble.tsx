import styles from "../style/ChatBubble.module.scss";

interface ChatBubbleProps {
    username?: string;
    message: string;
};

export default function ChatBubble(
    { username, message }: ChatBubbleProps
) {
    return (
        <div className={styles.chatBubble}>
            {username && <h2>{username}</h2>}
            <p>{message}</p>
        </div>
    );
}