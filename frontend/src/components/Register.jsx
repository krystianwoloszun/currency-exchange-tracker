import {useState} from "react";
import {apiFetch} from "../api/apiFetch";
import styles from "./Login.module.css";

const PASSWORD_REQUIREMENTS = [
    {id: "length", label: "minimum 8 znaków", test: (value) => value.length >= 8},
    {id: "uppercase", label: "przynajmniej 1 wielka litera", test: (value) => /[A-Z]/.test(value)},
    {id: "lowercase", label: "przynajmniej 1 mała litera", test: (value) => /[a-z]/.test(value)},
    {id: "digit", label: "przynajmniej 1 cyfra", test: (value) => /\d/.test(value)},
    {id: "special", label: "przynajmniej 1 znak specjalny", test: (value) => /[^A-Za-z0-9]/.test(value)},
];

export default function Register({onBackToLogin}) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const getPasswordValidationErrors = (value) =>
        PASSWORD_REQUIREMENTS.filter((requirement) => !requirement.test(value)).map((requirement) => requirement.label);

    const validateCredentials = () => {
        const normalizedUsername = username.trim();

        if (!normalizedUsername || !password || !confirmPassword) {
            setMessage("Uzupełnij nazwę użytkownika, hasło i potwierdzenie hasła.");
            setMessageType("error");
            return null;
        }

        if (password !== confirmPassword) {
            setMessage("Hasła się nie zgadzają.");
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
        if (normalized.includes("user registered successfully")) return "Użytkownik został zarejestrowany pomyślnie.";
        if (normalized.includes("username already exists")) return "Użytkownik o tej nazwie już istnieje.";
        if (normalized.includes("unauthorized")) return "Brak autoryzacji.";
        if (normalized.includes("forbidden")) return "Brak dostępu.";
        if (normalized.includes("server error")) return "Błąd serwera.";

        return rawMessage;
    };

    const handleRegister = async (e) => {
        e?.preventDefault();
        const credentials = validateCredentials();
        if (!credentials) return;

        const passwordErrors = getPasswordValidationErrors(credentials.password);
        if (passwordErrors.length > 0) {
            setMessage(`Hasło musi zawierać: ${passwordErrors.join(", ")}.`);
            setMessageType("error");
            return;
        }

        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
            const res = await apiFetch(`${apiBase}/auth/register`, {
                method: "POST",
                body: JSON.stringify(credentials),
            });

            if (typeof res === "string") setMessage(translateAuthMessage(res, "Rejestracja zakończona powodzeniem."));
            else setMessage("Rejestracja zakończona powodzeniem.");
            setMessageType("success");
        } catch (error) {
            setMessage(translateAuthMessage(error?.message, "Błąd serwera."));
            setMessageType("error");
        }
    };

    const passwordErrors = getPasswordValidationErrors(password);

    return (
        <div className={styles.root}>
            <section className={styles.hero}>
                <span className={styles.eyebrow}>Kursy Walut</span>
                <h1 className={styles.heroTitle}>Załóż konto w aplikacji NBP</h1>
                <p className={styles.heroText}>
                    Utwórz konto, aby korzystać z kalkulatora walut, historii kursów i bieżących notowań.
                </p>
            </section>

            <section className={styles.card}>
                <h2 className={styles.title}>Rejestracja</h2>

                <form onSubmit={handleRegister}>
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

                    <label className={styles.field}>
                        <span>Potwierdź hasło</span>
                        <input
                            placeholder="Wpisz hasło ponownie"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={styles.input}
                        />
                    </label>

                    <ul className={styles.requirements}>
                        {PASSWORD_REQUIREMENTS.map((requirement) => {
                            const isMet = !passwordErrors.includes(requirement.label);
                            return (
                                <li key={requirement.id} className={`${styles.requirementItem} ${isMet ? styles.requirementMet : styles.requirementUnmet}`}>
                                    {requirement.label}
                                </li>
                            );
                        })}
                    </ul>

                    <div className={styles.actions}>
                        <button type="submit" className={styles.primaryButton}>Zarejestruj</button>
                        <button type="button" className={styles.secondaryButton} onClick={onBackToLogin}>Wróć do logowania</button>
                    </div>
                </form>

                <div className={styles.messageSlot}>
                    {message && <p className={`${styles.message} ${messageType === "error" ? styles.messageError : styles.messageSuccess}`}>{message}</p>}
                </div>
            </section>
        </div>
    );
}
