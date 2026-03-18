import "./HistoryModule.css";

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
                        onChange={(e) => onStartDateChange(e.target.value)}
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
                        onChange={(e) => onEndDateChange(e.target.value)}
                        min={startDate || minDate}
                        max={maxDate}
                    />
                </div>

                <button type="button" className="history-button" onClick={onSubmit} disabled={loadingCurrencies || loadingHistory}>
                    {loadingHistory ? "Ladowanie..." : "Pokaz historie"}
                </button>
            </div>

            <p className="history-hint">
                Historia kursow NBP jest dostepna od 2002-01-02, a jedno zapytanie moze obejmowac maksymalnie 93 dni.
            </p>

            {error && <p className="history-error">{error}</p>}

            {!error && history.length > 0 && (
                <div className="history-results">
                    <table className="history-table">
                        <thead>
                        <tr>
                            <th>Data</th>
                            <th>Kod</th>
                            <th>Kurs</th>
                        </tr>
                        </thead>
                        <tbody>
                        {history.map((entry) => (
                            <tr key={`${entry.code}-${entry.effectiveDate}`}>
                                <td>{entry.effectiveDate}</td>
                                <td>{entry.code}</td>
                                <td>{Number(entry.mid).toFixed(4)} PLN</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!error && !loadingHistory && history.length === 0 && (
                <p className="history-empty">Wybierz parametry i kliknij "Pokaz historie".</p>
            )}
        </section>
    );
}
