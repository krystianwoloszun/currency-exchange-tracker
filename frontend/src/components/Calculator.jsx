import { useState, useEffect } from "react";
import { getAvailableCurrencies, convertCurrency } from "../api/currencyApi";

export default function Calculator() {
    const [currencies, setCurrencies] = useState([]);
    const [code, setCode] = useState("");
    const [amount, setAmount] = useState("");
    const [direction, setDirection] = useState("TO_PLN");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        setLoading(true);
        getAvailableCurrencies()
            .then((data) => {
                setCurrencies(data);
                if (data.length > 0) setCode(data[0].code);
                setError("");
            })
            .catch(() => {
                setError("Nie udało się pobrać walut. Spróbuj później.");
            })
            .finally(() => setLoading(false));
    }, []);

    const handleConvert = async () => {
        if (!amount || amount <= 0) {
            alert("Podaj poprawną kwotę!");
            return;
        }
        try {
            const res = await convertCurrency(amount, code, direction);
            setResult(res);
        } catch (err) {
            alert(err.message || "Wystąpił błąd podczas konwersji");
        }
    };

    if (loading) return <p>Ładowanie walut...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div style={{
            maxWidth: "500px",
            margin: "50px auto",
            padding: "30px",
            backgroundColor: "#fff",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            fontFamily: "Arial, sans-serif"
        }}>
            <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Kalkulator walut (NBP)</h2>

            <div style={{ marginBottom: "15px" }}>
                <label>Waluta: </label>
                <select value={code} onChange={(e) => setCode(e.target.value)} style={{ padding: "5px", width: "100%" }}>
                    {currencies.map((c) => (
                        <option key={c.code} value={c.code}>
                            {c.currency} ({c.code})
                        </option>
                    ))}
                </select>
            </div>

            <div style={{ marginBottom: "15px" }}>
                <label>Kwota: </label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="0.01"
                    style={{ padding: "5px", width: "100%" }}
                />
            </div>

            <div style={{ marginBottom: "15px" }}>
                <label>Kierunek: </label>
                <select value={direction} onChange={(e) => setDirection(e.target.value)} style={{ padding: "5px", width: "100%" }}>
                    <option value="TO_PLN">Waluta → PLN</option>
                    <option value="FROM_PLN">PLN → Waluta</option>
                </select>
            </div>

            <div style={{ textAlign: "center", marginTop: "20px" }}>
                <button
                    onClick={handleConvert}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer"
                    }}
                >
                    Przelicz
                </button>
            </div>

            {result !== null && (
                <div style={{ marginTop: "25px", fontSize: "18px", fontWeight: "bold", textAlign: "center" }}>
                    Wynik: {result}
                </div>
            )}
        </div>
    );
}
