import {useRef} from "react";
import "./HistoryModule.css";

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

function openNativeDatePicker(input) {
    if (!input) return;
    if (typeof input.showPicker === "function") {
        input.showPicker();
        return;
    }
    input.focus();
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
}) {
    const startDateRef = useRef(null);
    const endDateRef = useRef(null);

    return (
        <section className="history-module">
            <div className="history-form" style={{gridTemplateColumns: "repeat(3, minmax(0, 1fr))"}}>
                <div className="history-field">
                    <label htmlFor="gold-start-date">Od</label>
                    <div className="history-dateField">
                        <input
                            ref={startDateRef}
                            id="gold-start-date"
                            type="date"
                            value={startDate}
                            onChange={(e) => onStartDateChange(e.target.value)}
                            onFocus={(e) => openNativeDatePicker(e.currentTarget)}
                            min={minDate}
                            max={endDate || undefined}
                        />
                        <button
                            type="button"
                            className="history-dateButton"
                            aria-label="Otwórz kalendarz daty początkowej"
                            onClick={() => openNativeDatePicker(startDateRef.current)}
                        >
                            Kalendarz
                        </button>
                    </div>
                </div>

                <div className="history-field">
                    <label htmlFor="gold-end-date">Do</label>
                    <div className="history-dateField">
                        <input
                            ref={endDateRef}
                            id="gold-end-date"
                            type="date"
                            value={endDate}
                            onChange={(e) => onEndDateChange(e.target.value)}
                            onFocus={(e) => openNativeDatePicker(e.currentTarget)}
                            min={startDate || minDate}
                            max={maxDate}
                        />
                        <button
                            type="button"
                            className="history-dateButton"
                            aria-label="Otwórz kalendarz daty końcowej"
                            onClick={() => openNativeDatePicker(endDateRef.current)}
                        >
                            Kalendarz
                        </button>
                    </div>
                </div>

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
