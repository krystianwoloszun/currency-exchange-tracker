import "./GoldSidebar.css";

const priceFormatter = new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

function formatPrice(value) {
    if (value == null) return "--";
    return `${priceFormatter.format(Number(value))} PLN`;
}

function formatDateValue(value) {
    if (!value || !value.includes("-")) {
        return value || "--";
    }

    const [year, month, day] = value.split("-");
    return `${day}.${month}.${year}`;
}

export default function GoldSidebar({currentPrice, todayPrice, loading, error}) {
    return (
        <aside className="gold-sidebar">
            <div className="gold-sidebar-header">
                <span className="gold-sidebar-eyebrow">NBP</span>
                <h2>Złoto</h2>
                <p>Podgląd bieżących notowań i najważniejszych informacji o cenie 1 g złota.</p>
            </div>

            {loading ? (
                <div className="gold-sidebar-card">Ładowanie danych o złocie...</div>
            ) : error ? (
                <div className="gold-sidebar-card gold-sidebar-card-error">{error}</div>
            ) : (
                <div className="gold-sidebar-list">
                    <article className="gold-sidebar-card">
                        <span className="gold-sidebar-label">Ostatnie dostępne notowanie</span>
                        <strong className="gold-sidebar-value">{formatPrice(currentPrice?.price)}</strong>
                        <span className="gold-sidebar-date">{formatDateValue(currentPrice?.date)}</span>
                    </article>

                    <article className="gold-sidebar-card">
                        <span className="gold-sidebar-label">Dzisiejsze notowanie</span>
                        <strong className="gold-sidebar-value">{formatPrice(todayPrice?.price)}</strong>
                        <span className="gold-sidebar-date">{formatDateValue(todayPrice?.date)}</span>
                    </article>

                    {/*<article className="gold-sidebar-card gold-sidebar-card-muted">*/}
                    {/*    <span className="gold-sidebar-label">Zakres historii</span>*/}
                    {/*    <strong className="gold-sidebar-value">2013-01-02</strong>*/}
                    {/*    <span className="gold-sidebar-date">maksymalnie 93 dni w jednym zapytaniu</span>*/}
                    {/*</article>*/}
                </div>
            )}
        </aside>
    );
}
