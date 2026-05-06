import { useEffect, useState } from "react";
import { AuthError } from "../api/apiFetch";
import { getAvailableCurrencies, getRateHistory } from "../api/currencyApi";
import { INVALID_ISO_CALENDAR_DATE_MESSAGE, isValidIsoCalendarDate } from "../utils/isoCalendarDate";
import HistoryChart from "../components/HistoryChart";
import HistoryModule from "../components/HistoryModule";
import RatesSidebar from "../components/RatesSidebar";
import "./HistoryPage.css";

const HISTORY_MIN_DATE = "2002-01-02"; //dane z NBP są dostępne od 02.01.2002, okres pobranych danych nie może przekraczać 93 dni
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

export default function HistoryPage({ onUnauthorized }) {
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
                    onUnauthorized?.();
                    setError("Brak dostępu. Zaloguj się ponownie.");
                    return;
                }
                setError("Nie udało się pobrać walut. Spróbuj później.");
            })
            .finally(() => {
                if (!mounted) return;
                setLoadingCurrencies(false);
            });

        return () => {
            mounted = false;
        };
    }, [onUnauthorized]);

    const fetchHistory = async (nextCode, nextStartDate, nextEndDate) => {
        if (!nextCode) {
            setError("Wybierz walutę.");
            return;
        }

        if (!nextStartDate || !nextEndDate) {
            const startEl = document.getElementById("history-start-date");
            const endEl = document.getElementById("history-end-date");
            if (startEl?.validity?.badInput || endEl?.validity?.badInput) {
                setError(INVALID_ISO_CALENDAR_DATE_MESSAGE);
                return;
            }
            setError("Wybierz zakres dat.");
            return;
        }

        if (!isValidIsoCalendarDate(nextStartDate) || !isValidIsoCalendarDate(nextEndDate)) {
            setError(INVALID_ISO_CALENDAR_DATE_MESSAGE);
            return;
        }

        if (nextStartDate > nextEndDate) {
            setError("Data początkowa nie może być później niż końcowa.");
            return;
        }

        if (nextStartDate < HISTORY_MIN_DATE || nextEndDate < HISTORY_MIN_DATE) {
            setError("Historia kursów walut jest dostępna od 02.01.2002.");
            return;
        }

        if (countDaysInclusive(nextStartDate, nextEndDate) > HISTORY_MAX_DAYS) {
            setError("Zakres dat dla historii kursów nie może przekraczać 93 dni.");
            return;
        }

        try {
            setLoadingHistory(true);
            setError("");
            const data = await getRateHistory(nextCode, nextStartDate, nextEndDate);
            setHistory(Array.isArray(data) ? data : []);
        } catch (err) {
            if (err instanceof AuthError) {
                onUnauthorized?.();
                setError("Brak dostępu. Zaloguj się ponownie.");
                return;
            }
            setHistory([]);
            setError(err?.message || "Nie udało się pobrać historii kursów.");
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleSubmit = async () => {
        const startEl = document.getElementById("history-start-date");
        const endEl = document.getElementById("history-end-date");
        await fetchHistory(code, startEl?.value ?? startDate, endEl?.value ?? endDate);
    };

    return (
        <div className="history-page">
            <header className="history-header">
                <h1>Historia kursów walut</h1>
                <p>Sprawdź kurs wybranej waluty w zadanym zakresie dat.</p>
            </header>

            <main className="history-layout">
                <aside className="history-sidebar">
                    <RatesSidebar
                        currencies={currencies}
                        selectedCode={code}
                        onCurrencySelect={setCode}
                    />
                </aside>

                <section className="history-main">
                    <HistoryChart
                        history={history}
                        code={code}
                        loading={loadingHistory}
                    />

                    <HistoryModule
                        currencies={currencies}
                        code={code}
                        startDate={startDate}
                        endDate={endDate}
                        history={history}
                        loadingCurrencies={loadingCurrencies}
                        loadingHistory={loadingHistory}
                        error={error}
                        minDate={HISTORY_MIN_DATE}
                        maxDate={defaultEndDate()}
                        onCodeChange={setCode}
                        onStartDateChange={setStartDate}
                        onEndDateChange={setEndDate}
                        onSubmit={handleSubmit}
                        onInvalidDate={() => setError(INVALID_ISO_CALENDAR_DATE_MESSAGE)}
                    />
                </section>
            </main>
        </div>
    );
}
