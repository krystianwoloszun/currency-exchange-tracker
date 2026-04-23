import { useEffect, useState } from "react";
import { AuthError } from "../api/apiFetch";
import { getCurrentGoldPrice, getGoldPriceHistory } from "../api/goldApi";
import { INVALID_ISO_CALENDAR_DATE_MESSAGE, isValidIsoCalendarDate } from "../utils/isoCalendarDate";
import GoldHistoryChart from "../components/GoldHistoryChart";
import GoldHistoryModule from "../components/GoldHistoryModule";
import GoldSidebar from "../components/GoldSidebar";
import "./GoldPage.css";

const GOLD_MIN_DATE = "2013-01-02";
const GOLD_MAX_DAYS = 93;

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

export default function GoldPage({ onUnauthorized }) {
    const [startDate, setStartDate] = useState(defaultStartDate);
    const [endDate, setEndDate] = useState(defaultEndDate);
    const [history, setHistory] = useState([]);
    const [currentPrice, setCurrentPrice] = useState(null);
    const [loadingSidebar, setLoadingSidebar] = useState(true);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [error, setError] = useState("");
    const [sidebarError, setSidebarError] = useState("");

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const data = await getCurrentGoldPrice();
                if (!mounted) return;
                setCurrentPrice(Array.isArray(data) ? data[0] ?? null : null);
                setSidebarError("");
            } catch (err) {
                if (!mounted) return;
                if (err instanceof AuthError) {
                    onUnauthorized?.();
                    setSidebarError("Brak dostępu. Zaloguj się ponownie.");
                    return;
                }
                setCurrentPrice(null);
                setSidebarError("Nie udało się pobrać bieżących notowań złota.");
            } finally {
                if (mounted) setLoadingSidebar(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [onUnauthorized]);

    const fetchHistory = async (nextStartDate, nextEndDate) => {
        if (!nextStartDate || !nextEndDate) {
            const startEl = document.getElementById("gold-start-date");
            const endEl = document.getElementById("gold-end-date");
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
            setError("Data początkowa nie może być późniejsza niż data końcowa.");
            return;
        }

        if (nextStartDate < GOLD_MIN_DATE || nextEndDate < GOLD_MIN_DATE) {
            setError("Historia cen złota jest dostępna od 2013-01-02.");
            return;
        }

        if (countDaysInclusive(nextStartDate, nextEndDate) > GOLD_MAX_DAYS) {
            setError("Zakres dat dla cen złota nie może przekraczać 93 dni.");
            return;
        }

        try {
            setLoadingHistory(true);
            setError("");
            const data = await getGoldPriceHistory(nextStartDate, nextEndDate);
            setHistory(Array.isArray(data) ? data : []);
        } catch (err) {
            if (err instanceof AuthError) {
                onUnauthorized?.();
                setError("Brak dostępu. Zaloguj się ponownie.");
                return;
            }
            setHistory([]);
            setError(err?.message || "Nie udało się pobrać historii cen złota.");
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleSubmit = async () => {
        await fetchHistory(startDate, endDate);
    };

    return (
        <div className="gold-page">
            <header className="gold-header">
                <h1>Historia cen złota</h1>
                <p>Sprawdź notowania 1 g złota publikowane przez NBP w wybranym zakresie dat.</p>
            </header>

            <main className="gold-layout">
                <aside className="gold-sidebarWrap">
                    <GoldSidebar
                        currentPrice={currentPrice}
                        loading={loadingSidebar}
                        error={sidebarError}
                    />
                </aside>

                <section className="gold-main">
                    <GoldHistoryChart history={history} loading={loadingHistory} />

                    <GoldHistoryModule
                        startDate={startDate}
                        endDate={endDate}
                        history={history}
                        loadingHistory={loadingHistory}
                        error={error}
                        minDate={GOLD_MIN_DATE}
                        maxDate={defaultEndDate()}
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
