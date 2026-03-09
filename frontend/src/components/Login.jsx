import { useState } from "react";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleLogin = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                setMessage("Invalid username or password");
                return;
            }

            const token = await response.text();

            // zapis JWT
            localStorage.setItem("token", token);

            setMessage("Login successful!");
        } catch (error) {
            setMessage("Server error");
        }
    };

    const handleRegister = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const text = await response.text();
            setMessage(text);
        } catch (error) {
            setMessage("Server error");
        }
    };

    return (
        <div>
            <h2>Login / Register</h2>

            <input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />

            <input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <div>
                <button onClick={handleLogin}>Login</button>
                <button onClick={handleRegister}>Register</button>
            </div>

            {message && <p>{message}</p>}
        </div>
    );
}