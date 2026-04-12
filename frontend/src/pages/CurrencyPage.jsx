import {useEffect, useState} from "react";
import {getAvailableCurrencies} from "../api/currencyApi";
import {AuthError} from "../api/apiFetch";
import {clearToken} from "../auth/token";
import Calculator from "../components/Calculator";
import RatesSidebar from "../components/RatesSidebar";
import "./CurrencyPage.css";

export default function CurrencyPage({onUnauthorized}) {
    const [currencies, setCurrencies] = useState([]);
    const [selectedCode, setSelectedCode] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let mounted = true;

        setLoading(true);
        getAvailableCurrencies()
            .then((data) => {
                if (!mounted) return;
                console.log("API Response:", data);
                setCurrencies(data);
                if (data.length > 0) {
                    setSelectedCode((current) =>
                        data.some((currency) => currency.code === current) ? current : data[0].code
                    );
                }
                setError("");
            })
            .catch((err) => {
                if (!mounted) return;
                if (err instanceof AuthError) {
                    clearToken();
                    onUnauthorized?.();
                    setError("Brak dostępu. Zaloguj się ponownie.");
                    return;
                }
                setError("Nie udało się pobrać walut. Spróbuj później.");
            })
            .finally(() => {
                if (!mounted) return;
                setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, [onUnauthorized]);

    return (
        <div className="currency-page">
            <header className="currency-header">
                <h1>Kalkulator walut</h1>
                <p>Aktualne kursy wybranych walut i szybkie przeliczenie na PLN.</p>
            </header>
            {loading ? (
                <p className="currency-status">Ładowanie walut...</p>
            ) : error ? (
                <p className="currency-status currency-status-error">{error}</p>
            ) : (
                <main className="currency-layout">
                    <aside className="currency-sidebar">
                        <RatesSidebar
                            currencies={currencies}
                            selectedCode={selectedCode}
                            onCurrencySelect={setSelectedCode}
                        />
                    </aside>
                    <section className="currency-main">
                        <Calculator
                            currencies={currencies}
                            selectedCode={selectedCode}
                            onCodeChange={setSelectedCode}
                            onUnauthorized={onUnauthorized}
                        />
                    </section>
                </main>
            )}
        </div>
    );
}

