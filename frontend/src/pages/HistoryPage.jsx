import {useEffect, useState} from "react";
import {AuthError} from "../api/apiFetch";
import {getAvailableCurrencies, getRateHistory} from "../api/currencyApi";
import {clearToken} from "../auth/token";
import "./HistoryPage.css";

const HISTORY_MIN_DATE = "2002-01-02"; //dane z nbp sa dostepne od 02.01.2002, okres pobranych danych nie moze przekraczac 93 dni
const HISTORY_MAX_DAYS = 93;

function defaultStartDate() {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().slice(0, 10);
}

function defaultEndDate() {
    return new Date().toISOString().slice(0, 10);
}

function parseDate(value) {
    const [year, month, day] = value.split("-").map(Number);
    return Date.UTC(year, month - 1, day);
}

function countDaysInclusive(startDate, endDate) {
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    return Math.floor((parseDate(endDate) - parseDate(startDate)) / millisecondsPerDay) + 1;
}

export default function HistoryPage({onUnauthorized}) {
    const [currencies, setCurrencies] = useState([]);
    const [code, setCode] = useState("");
    const [startDate, setStartDate] = useState(defaultStartDate);
    const [endDate, setEndDate] = useState(defaultEndDate);
    const [history, setHistory] = useState([]);
    const [loadingCurrencies, setLoadingCurrencies] = useState(true);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let mounted = true;

        getAvailableCurrencies()
            .then((data) => {
                if (!mounted) return;
                setCurrencies(data);
                if (data.length > 0) {
                    setCode(data[0].code);
                }
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
                setLoadingCurrencies(false);
            });

        return () => {
            mounted = false;
        };
    }, [onUnauthorized]);

    const handleSubmit = async () => {
        if (!code) {
            setError("Wybierz walute.");
            return;
        }

        if (!startDate || !endDate) {
            setError("Wybierz zakres dat.");
            return;
        }

        if (startDate > endDate) {
            setError("Data poczatkowa nie moze byc pozniejsza niz koncowa.");
            return;
        }

        if (startDate < HISTORY_MIN_DATE || endDate < HISTORY_MIN_DATE) {
            setError("Historia kursow walut jest dostepna od 2002-01-02.");
            return;
        }

        if (countDaysInclusive(startDate, endDate) > HISTORY_MAX_DAYS) {
            setError("Zakres dat dla historii kursow nie moze przekraczac 93 dni.");
            return;
        }

        try {
            setLoadingHistory(true);
            setError("");
            const data = await getRateHistory(code, startDate, endDate);
            setHistory(Array.isArray(data) ? data : []);
        } catch (err) {
            if (err instanceof AuthError) {
                clearToken();
                onUnauthorized?.();
                setError("Brak dostepu. Zaloguj sie ponownie.");
                return;
            }
            setHistory([]);
            setError(err?.message || "Nie udalo sie pobrac historii kursow.");
        } finally {
            setLoadingHistory(false);
        }
    };

    return (
        <div className="history-page">
            <header className="history-header">
                <h1>Historia kursow walut</h1>
                <p>Sprawdz kurs wybranej waluty w zadanym zakresie dat.</p>
            </header>

            <main className="history-main">
                <div className="history-form">
                    <div className="history-field">
                        <label htmlFor="history-currency">Waluta</label>
                        <select
                            id="history-currency"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            disabled={loadingCurrencies}
                        >
                            {currencies.map((currency) => (
                                <option key={currency.code} value={currency.code}>
                                    {currency.currency} ({currency.code})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="history-field">
                        <label htmlFor="history-start-date">Od</label>
                        <input
                            id="history-start-date"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            min={HISTORY_MIN_DATE}
                            max={endDate || undefined}
                        />
                    </div>

                    <div className="history-field">
                        <label htmlFor="history-end-date">Do</label>
                        <input
                            id="history-end-date"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={startDate || HISTORY_MIN_DATE}
                            max={defaultEndDate()}
                        />
                    </div>

                    <button type="button" className="history-button" onClick={handleSubmit} disabled={loadingCurrencies || loadingHistory}>
                        {loadingHistory ? "Ladowanie..." : "Pokaz historie"}
                    </button>
                </div>

                <p className="history-hint">
                    Historia kursow NBP jest dostepna od 2002-01-02, a jedno zapytanie moze obejmowac maksymalnie 93 dni.
                </p>

                {error && <p className="history-error">{error}</p>}

                {!error && history.length > 0 && (
                    <div className="history-results">
                        <table className="history-table">
                            <thead>
                            <tr>
                                <th>Data</th>
                                <th>Kod</th>
                                <th>Kurs</th>
                            </tr>
                            </thead>
                            <tbody>
                            {history.map((entry) => (
                                <tr key={`${entry.code}-${entry.effectiveDate}`}>
                                    <td>{entry.effectiveDate}</td>
                                    <td>{entry.code}</td>
                                    <td>{Number(entry.mid).toFixed(4)} PLN</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!error && !loadingHistory && history.length === 0 && (
                    <p className="history-empty">Wybierz parametry i kliknij "Pokaz historie".</p>
                )}
            </main>
        </div>
    );
}
