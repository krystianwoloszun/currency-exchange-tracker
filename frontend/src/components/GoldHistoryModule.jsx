import "./HistoryModule.css";
import DateRangeFields from "./DateRangeFields";

const priceFormatter = new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

function formatPriceValue(value) {
    return priceFormatter.format(Number(value));
}

function formatDateValue(value) {
    if (!value || !value.includes("-")) {
        return value;
    }

    const [year, month, day] = value.split("-");
    return `${day}.${month}.${year}`;
}

export default function GoldHistoryModule({
    startDate,
    endDate,
    history,
    loadingHistory,
    error,
    minDate,
    maxDate,
    onStartDateChange,
    onEndDateChange,
    onSubmit,
    onInvalidDate,
}) {
    return (
        <section className="history-module">
            <div className="history-form history-form--gold">
                <DateRangeFields
                    startId="gold-start-date"
                    endId="gold-end-date"
                    startDate={startDate}
                    endDate={endDate}
                    minDate={minDate}
                    maxDate={maxDate}
                    onStartDateChange={onStartDateChange}
                    onEndDateChange={onEndDateChange}
                    onInvalidDate={onInvalidDate}
                />

                <button type="button" className="history-button" onClick={onSubmit} disabled={loadingHistory}>
                    {loadingHistory ? "Ładowanie..." : "Pokaż historię"}
                </button>
            </div>

            <p className="history-hint">
                Historia cen złota NBP jest dostępna od 2013-01-02, a jedno zapytanie może obejmować maksymalnie 93 dni.
            </p>

            {error && <p className="history-error">{error}</p>}

            {!error && history.length > 0 && (
                <div className="history-results">
                    <table className="history-table">
                        <thead>
                        <tr>
                            <th>Data</th>
                            <th>Cena</th>
                        </tr>
                        </thead>
                        <tbody>
                        {history.map((entry) => (
                            <tr key={`gold-${entry.date}`}>
                                <td>{formatDateValue(entry.date)}</td>
                                <td>{formatPriceValue(entry.price)} PLN</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!error && !loadingHistory && history.length === 0 && (
                <p className="history-empty">Wybierz zakres dat i kliknij "Pokaż historię".</p>
            )}
        </section>
    );
}
