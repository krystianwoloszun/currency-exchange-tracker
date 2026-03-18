import {useEffect, useState} from "react";
import {AuthError} from "../api/apiFetch";
import {getAvailableCurrencies, getRateHistory} from "../api/currencyApi";
import {clearToken} from "../auth/token";
import HistoryChart from "../components/HistoryChart";
import HistoryModule from "../components/HistoryModule";
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

    const fetchHistory = async (nextCode, nextStartDate, nextEndDate) => {
        if (!nextCode) {
            setError("Wybierz walute.");
            return;
        }

        if (!nextStartDate || !nextEndDate) {
            setError("Wybierz zakres dat.");
            return;
        }

        if (nextStartDate > nextEndDate) {
            setError("Data poczatkowa nie moze byc pozniejsza niz koncowa.");
            return;
        }

        if (nextStartDate < HISTORY_MIN_DATE || nextEndDate < HISTORY_MIN_DATE) {
            setError("Historia kursow walut jest dostepna od 2002-01-02.");
            return;
        }

        if (countDaysInclusive(nextStartDate, nextEndDate) > HISTORY_MAX_DAYS) {
            setError("Zakres dat dla historii kursow nie moze przekraczac 93 dni.");
            return;
        }

        try {
            setLoadingHistory(true);
            setError("");
            const data = await getRateHistory(nextCode, nextStartDate, nextEndDate);
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

    const handleSubmit = async () => {
        await fetchHistory(code, startDate, endDate);
    };

    return (
        <div className="history-page">
            <header className="history-header">
                <h1>Historia kursow walut</h1>
                <p>Sprawdz kurs wybranej waluty w zadanym zakresie dat.</p>
            </header>

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
            />
        </div>
    );
}
