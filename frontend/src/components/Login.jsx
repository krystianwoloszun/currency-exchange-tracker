import {useState} from "react";
import {apiFetch, AuthError} from "../api/apiFetch";
import {setToken} from "../auth/token";

export default function Login({onLogin}) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleLogin = async () => {
        try {
            const token = await apiFetch("http://localhost:8080/api/auth/login", {
                method: "POST", body: JSON.stringify({username, password}),
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
                method: "POST", body: JSON.stringify({username, password}),
            });

            if (typeof res === "string") setMessage(res); else setMessage("Registered");
        } catch (error) {
            setMessage(error?.message || "Server error");
        }
    };

    return (<div style={{maxWidth: 420, margin: "60px auto", padding: 20}}>
            <h2>Login / Register</h2>

            <input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{display: "block", width: "100%", padding: 10, marginTop: 10}}
            />

            <input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{display: "block", width: "100%", padding: 10, marginTop: 10}}
            />

            <div style={{display: "flex", gap: 10, marginTop: 12}}>
                <button onClick={handleLogin}>Login</button>
                <button onClick={handleRegister}>Register</button>
            </div>

            {message && <p style={{marginTop: 12}}>{message}</p>}
        </div>);
}

