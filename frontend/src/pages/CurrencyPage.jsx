import Calculator from "../components/Calculator";
import "./CurrencyPage.css";

export default function CurrencyPage({onUnauthorized}) {
    return (
        <div className="currency-page">
            <header className="currency-header">
                <h1>Kalkulator walut NBP</h1>
            </header>
            <main className="currency-main">
                <Calculator onUnauthorized={onUnauthorized}/>
            </main>
        </div>
    );
}

