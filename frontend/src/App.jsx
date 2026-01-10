import { useState, useEffect } from "react";
import { getAvailableCurrencies, convertCurrency } from "./api/currencyApi";

function App() {
    const [currencies, setCurrencies] = useState([]);
    const [code, setCode] = useState("");
    const [amount, setAmount] = useState("");
    const [direction, setDirection] = useState("TO_PLN");
    const [result, setResult] = useState(null);

    // Załaduj waluty z backendu
    useEffect(() => {
        getAvailableCurrencies().then((data) => {
            setCurrencies(data);
            if (data.length > 0) setCode(data[0].code);
        });
    }, []);

    const handleConvert = async () => {
        if (!amount || amount <= 0) {
            alert("Podaj poprawną kwotę!");
            return;
        }
        const res = await convertCurrency(amount, code, direction);
        setResult(res);
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial" }}>
            <h2>Kalkulator walut (NBP)</h2>

            <div>
                <label>Waluta: </label>
                <select value={code} onChange={(e) => setCode(e.target.value)}>
                    {currencies.map((c) => (
                        <option key={c.code} value={c.code}>
                            {c.currency} ({c.code})
                        </option>
                    ))}
                </select>
            </div>

            <div style={{ marginTop: "10px" }}>
                <label>Kwota: </label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="0.01"
                />
            </div>

            <div style={{ marginTop: "10px" }}>
                <label>Kierunek: </label>
                <select
                    value={direction}
                    onChange={(e) => setDirection(e.target.value)}
                >
                    <option value="TO_PLN">Waluta → PLN</option>
                    <option value="FROM_PLN">PLN → Waluta</option>
                </select>
            </div>

            <div style={{ marginTop: "10px" }}>
                <button onClick={handleConvert}>Przelicz</button>
            </div>

            {result && (
                <div style={{ marginTop: "20px" }}>
                    <h3>Wynik: {result}</h3>
                </div>
            )}
        </div>
    );
}

export default App;
