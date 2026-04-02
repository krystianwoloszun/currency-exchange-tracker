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
            <section className={styles.hero}>
                <span className={styles.eyebrow}>Kursy Walut</span>
                <h1 className={styles.heroTitle}>Zaloguj sie do aplikacji NBP</h1>
                <p className={styles.heroText}>
                    Szybki dostep do kalkulatora walut, historii kursow i bocznych paneli z aktualnymi notowaniami.
                </p>
            </section>

            <section className={styles.card}>
                <h2 className={styles.title}>Logowanie i rejestracja</h2>

                <label className={styles.field}>
                    <span>Nazwa uzytkownika</span>
                    <input
                        placeholder="Wpisz nazwe uzytkownika"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={styles.input}
                    />
                </label>

                <label className={styles.field}>
                    <span>Haslo</span>
                    <input
                        placeholder="Wpisz haslo"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.input}
                    />
                </label>

                <div className={styles.actions}>
                    <button type="button" className={styles.primaryButton} onClick={handleLogin}>Zaloguj</button>
                    <button type="button" className={styles.secondaryButton} onClick={handleRegister}>Zarejestruj</button>
                </div>

                {message && <p className={styles.message}>{message}</p>}
            </section>
        </div>
    );
}

