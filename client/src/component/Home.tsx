import { useState } from "react";
import { useHistory } from "react-router-dom";
import styles from "../style/Home.module.scss";

export default function Home() {

    const [username, setUsername] = useState("");
    const history = useHistory();

    function inputChangeHandler(event: React.ChangeEvent<HTMLInputElement>) {
        const userEnteredUsername = event.target.value;

        if(!userEnteredUsername.includes("\n")) 
            setUsername(userEnteredUsername);
    }

    function submitHandler(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        fetch("http://localhost:5000/username", {
            method: "POST",
            headers: {
                "Content-Type": "text/plain"
            },
            body: username
        })
        .then(response => 
            response
                .text()
                .then(text => ({ ok: response.ok, text }))
        )
        .then(({ ok, text }) => {
            if(ok) {
                const username = text;
                history.push(`/chat/${username}`);
            }
            else alert("Username Already Taken");
        })
    }

    return (
        <div className={styles.home}>
            <h1>Chat Room</h1>
            <form onSubmit={submitHandler}>
                <label htmlFor="username">Enter Your Username:</label>
                <input
                    onChange={inputChangeHandler} 
                    placeholder="Username"
                    value={username}
                    type="text" id="username"
                />
                <button aria-label="submit" type="submit">&#10148;</button>
            </form>
        </div>
    );
}