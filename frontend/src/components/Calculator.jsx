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
            alert("Podaj poprawna kwote!");
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
                alert("Brak dostepu. Zaloguj sie ponownie.");
                return;
            }
            alert(err?.message || "Wystapil blad podczas konwersji");
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

    return (<div className={styles.root}>
            <div className={styles.field}>
                <label>Waluta: </label>
                <select
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className={styles.select}
                >
                    {currencies.map((c) => (<option key={c.code} value={c.code}>
                            {c.currency} ({c.code})
                        </option>))}
                </select>
            </div>

            <div className={styles.field}>
                <label>Kwota: </label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    step="0.01"
                    min="0"
                    className={styles.input}
                />
            </div>

            <div className={styles.field}>
                <label>Kierunek: </label>
                <div className={styles.radioGroup}>
                    <label className={styles.radioOption}>
                        <input
                            type="radio"
                            name="direction"
                            value="TO_PLN"
                            checked={direction === "TO_PLN"}
                            onChange={(e) => setDirection(e.target.value)}
                        />
                        <span>Waluta -&gt; PLN</span>
                    </label>
                    <label className={styles.radioOption}>
                        <input
                            type="radio"
                            name="direction"
                            value="FROM_PLN"
                            checked={direction === "FROM_PLN"}
                            onChange={(e) => setDirection(e.target.value)}
                        />
                        <span>PLN -&gt; Waluta</span>
                    </label>
                </div>
            </div>

            <div className={styles.actions}>
                <button onClick={handleConvert} className={styles.primaryButton}>
                    Przelicz
                </button>
            </div>

            {formattedResult && <div className={styles.result}>Wynik: {formattedResult}</div>}
        </div>);
}

