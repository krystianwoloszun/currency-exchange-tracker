import {useState} from "react";
import {apiFetch, AuthError} from "../api/apiFetch";
import {setToken} from "../auth/token";
import styles from "./Login.module.css";

export default function Login({onLogin}) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const validateCredentials = () => {
        const normalizedUsername = username.trim();
        const normalizedPassword = password.trim();

        if (!normalizedUsername || !normalizedPassword) {
            setMessage("Uzupelnij nazwe uzytkownika i haslo.");
            setMessageType("error");
            return null;
        }

        return {
            username: normalizedUsername,
            password: normalizedPassword,
        };
    };

    const translateAuthMessage = (rawMessage, fallback) => {
        const normalized = String(rawMessage || "").trim().toLowerCase();

        if (!normalized) return fallback;
        if (normalized.includes("invalid username or password")) return "Nieprawidlowa nazwa uzytkownika lub haslo.";
        if (normalized.includes("user registered successfully")) return "Uzytkownik zostal zarejestrowany pomyslnie.";
        if (normalized.includes("username already exists")) return "Uzytkownik o tej nazwie juz istnieje.";
        if (normalized.includes("unauthorized")) return "Brak autoryzacji.";
        if (normalized.includes("forbidden")) return "Brak dostepu.";
        if (normalized.includes("server error")) return "Blad serwera.";

        return rawMessage;
    };

    const handleLogin = async () => {
        const credentials = validateCredentials();
        if (!credentials) return;

        try {
            const token = await apiFetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                body: JSON.stringify(credentials),
            });

            setToken(token);
            onLogin?.(token);
            setMessage("Logowanie powiodlo sie.");
            setMessageType("success");
        } catch (error) {
            if (error instanceof AuthError) {
                setMessage(translateAuthMessage(error.message, "Brak autoryzacji."));
                setMessageType("error");
                return;
            }
            setMessage(translateAuthMessage(error?.message, "Blad serwera."));
            setMessageType("error");
        }
    };

    const handleRegister = async () => {
        const credentials = validateCredentials();
        if (!credentials) return;

        try {
            const res = await apiFetch("http://localhost:8080/api/auth/register", {
                method: "POST",
                body: JSON.stringify(credentials),
            });

            if (typeof res === "string") setMessage(translateAuthMessage(res, "Rejestracja zakonczona powodzeniem."));
            else setMessage("Rejestracja zakonczona powodzeniem.");
            setMessageType("success");
        } catch (error) {
            setMessage(translateAuthMessage(error?.message, "Blad serwera."));
            setMessageType("error");
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

                <div className={styles.messageSlot}>
                    {message && <p className={`${styles.message} ${messageType === "error" ? styles.messageError : styles.messageSuccess}`}>{message}</p>}
                </div>
            </section>
        </div>
    );
}
