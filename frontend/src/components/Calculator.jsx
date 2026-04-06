import {useEffect, useState} from "react";
import {convertCurrency} from "../api/currencyApi";
import {AuthError} from "../api/apiFetch";
import {clearToken} from "../auth/token";
import styles from "./Calculator.module.css";

export default function Calculator({currencies = [], onUnauthorized}) {
    const [code, setCode] = useState("");
    const [amount, setAmount] = useState("");
    const [direction, setDirection] = useState("TO_PLN");
    const [result, setResult] = useState(null);
    const [resultCurrency, setResultCurrency] = useState("");

    const formattedResult = result !== null ? `${Number(result).toFixed(2)} ${resultCurrency}` : null;

    useEffect(() => {
        if (currencies.length > 0 && !currencies.some((currency) => currency.code === code)) {
            setCode(currencies[0].code);
        }
    }, [code, currencies]);

    const handleConvert = async () => {
        if (!amount || Number(amount) <= 0) {
            alert("Podaj poprawną kwotę!");
            return;
        }
        try {
            const res = await convertCurrency(amount, code, direction);
            setResult(res);
            setResultCurrency(direction === "TO_PLN" ? "PLN" : code);
        } catch (err) {
            if (err instanceof AuthError) {
                clearToken();
                onUnauthorized?.();
                 alert("Brak dostępu. Zaloguj się ponownie.");
                return;
            }
            alert(err?.message || "Wystąpił błąd podczas konwersji");
        }
    };

    const handleAmountChange = (value) => {
        if (value === "") {
            setAmount("");
            return;
        }

        if (Number(value) < 0) {
            setAmount("0");
            return;
        }

        setAmount(value);
    };

    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <div>
                    <p className={styles.eyebrow}>Kalkulator</p>
                    <h2 className={styles.title}>Przelicz kurs waluty</h2>
                </div>
            </div>

            <div className={styles.formGrid}>
                <div className={styles.field}>
                    <label className={styles.label} htmlFor="currency-code">Waluta</label>
                    <select
                        id="currency-code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className={styles.select}
                    >
                        {currencies.map((c) => (
                            <option key={c.code} value={c.code}>
                                {c.currency} ({c.code})
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.field}>
                    <label className={styles.label} htmlFor="amount">Kwota</label>
                    <input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => handleAmountChange(e.target.value)}
                        step="0.01"
                        min="0"
                        className={styles.input}
                        placeholder="Np. 100"
                    />
                </div>
            </div>

            <div className={styles.directionBlock}>
                <span className={styles.label}>Kierunek przeliczenia</span>
                <div className={styles.radioGroup}>
                    <label className={`${styles.radioCard} ${direction === "TO_PLN" ? styles.radioCardActive : ""}`}>
                        <input
                            type="radio"
                            name="direction"
                            value="TO_PLN"
                            checked={direction === "TO_PLN"}
                            onChange={(e) => setDirection(e.target.value)}
                        />
                        <span className={styles.radioTitle}>Waluta do PLN</span>
                        <span className={styles.radioText}>Przelicz wybraną walutę na złotówki.</span>
                    </label>
                    <label className={`${styles.radioCard} ${direction === "FROM_PLN" ? styles.radioCardActive : ""}`}>
                        <input
                            type="radio"
                            name="direction"
                            value="FROM_PLN"
                            checked={direction === "FROM_PLN"}
                            onChange={(e) => setDirection(e.target.value)}
                        />
                        <span className={styles.radioTitle}>PLN do waluty</span>
                        <span className={styles.radioText}>Sprawdź ile waluty kupisz za daną kwotę PLN.</span>
                    </label>
                </div>
            </div>

            <div className={styles.footer}>
                <button onClick={handleConvert} className={styles.primaryButton}>
                    Przelicz
                </button>

                <div className={styles.resultPanel}>
                    <span className={styles.resultLabel}>Wynik</span>
                    <strong className={styles.resultValue}>{formattedResult || "--"}</strong>
                </div>
            </div>
        </div>
    );
}
