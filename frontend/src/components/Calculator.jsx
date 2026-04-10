import {useEffect, useState} from "react";
import {convertCurrency} from "../api/currencyApi";
import {AuthError} from "../api/apiFetch";
import {clearToken} from "../auth/token";
import {CURRENCY_FLAGS} from "../api/currencyFlags";
import "flag-icons/css/flag-icons.min.css";
import styles from "./Calculator.module.css";

const resultFormatter = new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const MAX_AMOUNT = 100_000_000;

function formatEffectiveDate(value) {
    if (!value) return "";
    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return String(value);
    return parsed.toLocaleDateString("pl-PL");
}

export default function Calculator({currencies = [], selectedCode, onCodeChange, onUnauthorized}) {
    const [internalCode, setInternalCode] = useState("");
    const [amount, setAmount] = useState("");
    const [direction, setDirection] = useState("TO_PLN");
    const [result, setResult] = useState(null);
    const [resultCurrency, setResultCurrency] = useState("");
    const code = selectedCode ?? internalCode;

    const formattedResult =
        result !== null ? `${resultFormatter.format(Number(result))} ${resultCurrency}` : null;
    const currentCurrency = currencies.find((c) => c.code === code);
    const formattedEffectiveDate = formatEffectiveDate(currentCurrency?.effectiveDate);

    const updateCode = (nextCode) => {
        if (selectedCode !== undefined) {
            onCodeChange?.(nextCode);
            return;
        }

        setInternalCode(nextCode);
    };

    useEffect(() => {
        if (currencies.length > 0 && !currencies.some((currency) => currency.code === code)) {
            updateCode(currencies[0].code);
        }
    }, [code, currencies]);

    const handleConvert = async () => {
        if (!amount || Number(amount) <= 0) {
            alert("Podaj poprawną kwotę!");
            return;
        }
        if (Number(amount) > MAX_AMOUNT) {
            alert(`Maksymalna kwota to ${resultFormatter.format(MAX_AMOUNT)}.`);
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
        if (Number(value) > MAX_AMOUNT) {
            setAmount(String(MAX_AMOUNT));
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
                {currentCurrency && (
                    <div className={styles.currencyDisplay}>
                        <div className={styles.currencyFlag}>
                            <span className={`fi fi-${CURRENCY_FLAGS.get(code) || ""}`}></span>
                        </div>
                        <div className={styles.currencyInfo}>
                            <span className={styles.currencyCode}>{code}</span>
                            <strong className={styles.currencyRate}>{formattedEffectiveDate || "-"}</strong>
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.formGrid}>
                <div className={styles.field}>
                    <label className={styles.label} htmlFor="currency-code">Waluta</label>
                    <select
                        id="currency-code"
                        value={code}
                        onChange={(e) => updateCode(e.target.value)}
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
                        max={MAX_AMOUNT}
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
