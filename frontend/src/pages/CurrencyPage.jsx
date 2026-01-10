import Calculator from "../components/Calculator";
import "./CurrencyPage.css";

export default function CurrencyPage() {
    return (
        <div className="currency-page">
            <header className="currency-header">
                <h1>Kalkulator walut NBP</h1>
            </header>
            <main className="currency-main">
                <Calculator />
            </main>
        </div>
    );
}
