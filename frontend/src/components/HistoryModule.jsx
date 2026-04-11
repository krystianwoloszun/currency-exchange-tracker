import "./HistoryModule.css";
import DateRangeFields from "./DateRangeFields";

const rateFormatter = new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
});

function formatRateValue(value) {
    return rateFormatter.format(Number(value));
}

function formatDateValue(value) {
    if (!value || !value.includes("-")) {
        return value;
    }

    const [year, month, day] = value.split("-");
    return `${day}.${month}.${year}`;
}

export default function HistoryModule({
    currencies,
    code,
    startDate,
    endDate,
    history,
    loadingCurrencies,
    loadingHistory,
    error,
    minDate,
    maxDate,
    onCodeChange,
    onStartDateChange,
    onEndDateChange,
    onSubmit,
    onInvalidDate,
}) {
    return (
        <section className="history-module">
            <div className="history-form">
                <div className="history-field">
                    <label htmlFor="history-currency">Waluta</label>
                    <select
                        id="history-currency"
                        value={code}
                        onChange={(e) => onCodeChange(e.target.value)}
                        disabled={loadingCurrencies}
                    >
                        {currencies.map((currency) => (
                            <option key={currency.code} value={currency.code}>
                                {currency.currency} ({currency.code})
                            </option>
                        ))}
                    </select>
                </div>

                <DateRangeFields
                    startId="history-start-date"
                    endId="history-end-date"
                    startDate={startDate}
                    endDate={endDate}
                    minDate={minDate}
                    maxDate={maxDate}
                    onStartDateChange={onStartDateChange}
                    onEndDateChange={onEndDateChange}
                    onInvalidDate={onInvalidDate}
                />

                <button type="button" className="history-button" onClick={onSubmit} disabled={loadingCurrencies || loadingHistory}>
                    {loadingHistory ? "Ładowanie..." : "Pokaż historię"}
                </button>
            </div>

            <p className="history-hint">
                Historia kursów NBP jest dostępna od 2002-01-02, a jedno zapytanie może obejmować maksymalnie 93 dni.
            </p>

            {error && <p className="history-error">{error}</p>}

            {!error && history.length > 0 && (
                <div className="history-results">
                    <table className="history-table">
                        <thead>
                        <tr>
                            <th>Data</th>
                            <th>Kurs</th>
                        </tr>
                        </thead>
                        <tbody>
                        {history.map((entry) => (
                            <tr key={`${entry.code}-${entry.effectiveDate}`}>
                                <td>{formatDateValue(entry.effectiveDate)}</td>
                                <td>{formatRateValue(entry.mid)} PLN</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!error && !loadingHistory && history.length === 0 && (
                <p className="history-empty">Wybierz parametry i kliknij "Pokaż historię".</p>
            )}
        </section>
    );
}
