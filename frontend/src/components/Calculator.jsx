import {useEffect, useState} from "react";
import {getAvailableCurrencies, convertCurrency} from "../api/currencyApi";
import {AuthError} from "../api/apiFetch";
import {clearToken} from "../auth/token";
import styles from "./Calculator.module.css";

export default function Calculator({onUnauthorized}) {
    const [currencies, setCurrencies] = useState([]);
    const [code, setCode] = useState("");
    const [amount, setAmount] = useState("");
    const [direction, setDirection] = useState("TO_PLN");
    const [result, setResult] = useState(null);
    const [resultCurrency, setResultCurrency] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const formattedResult = result !== null ? `${Number(result).toFixed(2)} ${resultCurrency}` : null;

    useEffect(() => {
        let mounted = true;
        setLoading(true);

        getAvailableCurrencies()
            .then((data) => {
                if (!mounted) return;
                setCurrencies(data);
                if (data.length > 0) setCode(data[0].code);
                setError("");
            })
            .catch((err) => {
                if (!mounted) return;
                if (err instanceof AuthError) {
                    clearToken();
                    onUnauthorized?.();
                    setError("Brak dostepu. Zaloguj sie ponownie.");
                    return;
                }
                setError("Nie udalo sie pobrac walut. Sprobuj pozniej.");
            })
            .finally(() => {
                if (!mounted) return;
                setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, [onUnauthorized]);

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

    if (loading) return <p className={styles.loading}>Ladowanie walut...</p>;
    if (error) return <p className={styles.error}>{error}</p>;

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
                    onChange={(e) => setAmount(e.target.value)}
                    step="0.01"
                    className={styles.input}
                />
            </div>

            <div className={styles.field}>
                <label>Kierunek: </label>
                <select
                    value={direction}
                    onChange={(e) => setDirection(e.target.value)}
                    className={styles.select}
                >
                    <option value="TO_PLN">Waluta -&gt; PLN</option>
                    <option value="FROM_PLN">PLN -&gt; Waluta</option>
                </select>
            </div>

            <div className={styles.actions}>
                <button onClick={handleConvert} className={styles.primaryButton}>
                    Przelicz
                </button>
            </div>

            {formattedResult && <div className={styles.result}>Wynik: {formattedResult}</div>}
        </div>);
}

