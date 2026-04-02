import "flag-icons/css/flag-icons.min.css";
import "./RatesSidebar.css";

const FEATURED_COUNTRIES = [
    {code: "USD", country: "Stany Zjednoczone", flagCode: "us"},
    {code: "CAD", country: "Kanada", flagCode: "ca"},
    {code: "GBP", country: "Wielka Brytania", flagCode: "gb"},
    {code: "CHF", country: "Szwajcaria", flagCode: "ch"},
    {code: "CZK", country: "Czechy", flagCode: "cz"},
    {code: "HUF", country: "Wegry", flagCode: "hu"},
    {code: "NOK", country: "Norwegia", flagCode: "no"},
    {code: "SEK", country: "Szwecja", flagCode: "se"},
    {code: "DKK", country: "Dania", flagCode: "dk"},
    {code: "JPY", country: "Japonia", flagCode: "jp"},
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
                        <div className="rates-flag" aria-hidden="true">
                            <span className={`fi fi-${item.flagCode}`}></span>
                        </div>
                        <div className="rates-card-body">
                            <div className="rates-card-top">
                                <strong>{item.country}</strong>
                                <span>{item.code}</span>
                            </div>
                            <div className="rates-card-bottom">
                                <span>{item.rate.currency}</span>
                                <strong>{formatRate(item.rate.mid)}</strong>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}
