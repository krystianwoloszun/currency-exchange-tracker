import "flag-icons/css/flag-icons.min.css";
import "./RatesSidebar.css";

const FEATURED_COUNTRIES = [
    {code: "USD", flagCode: "us"},
    {code: "EUR", flagCode: "eu"},
    {code: "CAD", flagCode: "ca"},
    {code: "GBP", flagCode: "gb"},
    {code: "CHF", flagCode: "ch"},
    {code: "CZK", flagCode: "cz"},
    {code: "HUF", flagCode: "hu"},
    {code: "NOK", flagCode: "no"},
    {code: "SEK", flagCode: "se"},
    {code: "DKK", flagCode: "dk"},
    {code: "JPY", flagCode: "jp"},
];

function formatRate(value) {
    return new Intl.NumberFormat("pl-PL", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
    }).format(Number(value));
}

export default function RatesSidebar({currencies}) {
    const ratesByCode = new Map(currencies.map((currency) => [currency.code, currency]));
    const items = FEATURED_COUNTRIES
        .map((item) => ({
            ...item,
            rate: ratesByCode.get(item.code),
        }))
        .filter((item) => item.rate);

    return (
        <div className="rates-sidebar">

            <div className="rates-sidebar-list">
                {items.map((item) => (
                    <article key={item.code} className="rates-card">
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
                    </article>
                ))}
            </div>
        </div>
    );
}
