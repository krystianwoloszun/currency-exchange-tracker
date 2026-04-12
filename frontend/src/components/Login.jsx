import {useState} from "react";
import {apiFetch, AuthError} from "../api/apiFetch";
import {API_BASE_URL} from "../config/apiBaseUrl";
import {setToken} from "../auth/token";
import styles from "./Login.module.css";

export default function Login({onLogin, onGoToRegister}) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const validateCredentials = () => {
        const normalizedUsername = username.trim().toLowerCase();

        if (!normalizedUsername || !password) {
            setMessage("Uzupełnij nazwę użytkownika i hasło.");
            setMessageType("error");
            return null;
        }

        return {
            username: normalizedUsername,
            password,
        };
    };

    const translateAuthMessage = (rawMessage, fallback) => {
        const normalized = String(rawMessage || "").trim().toLowerCase();

        if (!normalized) return fallback;
        if (normalized.includes("invalid username or password")) return "Nieprawidłowa nazwa użytkownika lub hasło.";
        if (normalized.includes("unauthorized")) return "Brak autoryzacji.";
        if (normalized.includes("forbidden")) return "Brak dostępu.";
        if (normalized.includes("server error")) return "Błąd serwera.";

        return rawMessage;
    };

    const handleLogin = async (e) => {
        e?.preventDefault();
        const credentials = validateCredentials();
        if (!credentials) return;

        try {
            const token = await apiFetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                body: JSON.stringify(credentials),
            });

            setToken(token);
            onLogin?.(token);
            setMessage("Logowanie powiodło się.");
            setMessageType("success");
        } catch (error) {
            if (error instanceof AuthError) {
                setMessage(translateAuthMessage(error.message, "Brak autoryzacji."));
                setMessageType("error");
                return;
            }
            setMessage(translateAuthMessage(error?.message, "Błąd serwera."));
            setMessageType("error");
        }
    };

    return (
        <div className={styles.root}>
            <section className={styles.hero}>
                <span className={styles.eyebrow}>Kursy Walut</span>
                <h1 className={styles.heroTitle}>Zaloguj się do aplikacji NBP</h1>
                <p className={styles.heroText}>
                    Szybki dostęp do kalkulatora walut, historii kursów i bocznych paneli z aktualnymi notowaniami.
                </p>
            </section>

            <section className={styles.card}>
                <h2 className={styles.title}>Logowanie</h2>

                <form onSubmit={handleLogin}>
                    <label className={styles.field}>
                        <span>Nazwa użytkownika</span>
                        <input
                            placeholder="Wpisz nazwę użytkownika"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={styles.input}
                        />
                    </label>

                    <label className={styles.field}>
                        <span>Hasło</span>
                        <input
                            placeholder="Wpisz hasło"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                        />
                    </label>

                    <div className={styles.actions}>
                        <button type="submit" className={styles.primaryButton}>Zaloguj</button>
                        <button type="button" className={styles.secondaryButton} onClick={onGoToRegister}>Przejdź do rejestracji</button>
                    </div>
                </form>

                <div className={styles.messageSlot}>
                    {message && <p className={`${styles.message} ${messageType === "error" ? styles.messageError : styles.messageSuccess}`}>{message}</p>}
                </div>
            </section>
        </div>
    );
}
