import {useState} from "react";
import {apiFetch, AuthError} from "../api/apiFetch";
import {setToken} from "../auth/token";
import styles from "./Login.module.css";

export default function Login({onLogin}) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleLogin = async () => {
        try {
            const token = await apiFetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                body: JSON.stringify({username, password}),
            });

            setToken(token);
            onLogin?.(token);
            setMessage("Login successful!");
        } catch (error) {
            if (error instanceof AuthError) {
                setMessage(error.message || "Unauthorized");
                return;
            }
            setMessage(error?.message || "Server error");
        }
    };

    const handleRegister = async () => {
        try {
            const res = await apiFetch("http://localhost:8080/api/auth/register", {
                method: "POST",
                body: JSON.stringify({username, password}),
            });

            if (typeof res === "string") setMessage(res);
            else setMessage("Registered");
        } catch (error) {
            setMessage(error?.message || "Server error");
        }
    };

    return (
        <div className={styles.root}>
            <h2 className={styles.title}>Login / Register</h2>

            <input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={styles.input}
            />

            <input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
            />

            <div className={styles.actions}>
                <button onClick={handleLogin}>Login</button>
                <button onClick={handleRegister}>Register</button>
            </div>

            {message && <p className={styles.message}>{message}</p>}
        </div>
    );
}

