import "./HistoryModule.css";
import {resolveDateInputChange} from "../utils/isoCalendarDate";

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

                <div className="history-field">
                    <label htmlFor="history-start-date">Od</label>
                    <input
                        id="history-start-date"
                        type="date"
                        value={startDate}
                        onChange={(e) => resolveDateInputChange(e, onStartDateChange, onInvalidDate)}
                        min={minDate}
                        max={endDate || undefined}
                    />
                </div>

                <div className="history-field">
                    <label htmlFor="history-end-date">Do</label>
                    <input
                        id="history-end-date"
                        type="date"
                        value={endDate}
                        onChange={(e) => resolveDateInputChange(e, onEndDateChange, onInvalidDate)}
                        min={startDate || minDate}
                        max={maxDate}
                    />
                </div>

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
