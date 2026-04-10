import "flag-icons/css/flag-icons.min.css";
import {FEATURED_CURRENCIES} from "../api/currencyFlags";
import "./RatesSidebar.css";

function formatRate(value) {
    return new Intl.NumberFormat("pl-PL", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
    }).format(Number(value));
}

function formatEffectiveDate(value) {
    if (!value) return "";
    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return String(value);
    return parsed.toLocaleDateString("pl-PL");
}

export default function RatesSidebar({currencies, selectedCode, onCurrencySelect}) {
    const ratesByCode = new Map(currencies.map((currency) => [currency.code, currency]));
    const items = FEATURED_CURRENCIES
        .map((item) => ({
            ...item,
            rate: ratesByCode.get(item.code),
        }))
        .filter((item) => item.rate);

    const effectiveDate = currencies.find((currency) => currency?.effectiveDate)?.effectiveDate;
    const formattedEffectiveDate = formatEffectiveDate(effectiveDate);

    return (
        <div className="rates-sidebar">
            <div className="rates-sidebar-header">
                <h2>Kursy walut</h2>
                {formattedEffectiveDate ? (
                    <p className="rates-sidebar-date">Dane z dnia {formattedEffectiveDate}</p>
                ) : null}
            </div>

            <div className="rates-sidebar-list">
                {items.map((item) => (
                    <button
                        key={item.code}
                        type="button"
                        className={`rates-card ${selectedCode === item.code ? "rates-card-active" : ""}`}
                        onClick={() => onCurrencySelect?.(item.code)}
                    >
                        <div className="rates-card-main">
                            <div className="rates-flag" aria-hidden="true">
                                <span className={`fi fi-${item.flagCode}`}></span>
                            </div>
                            <strong className="rates-currency-name">{item.rate.currency}</strong>
                        </div>
                        <div className="rates-card-meta">
                            <span className="rates-code">{item.code}</span>
                            <strong className="rates-value">{formatRate(item.rate.mid)} PLN</strong>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
