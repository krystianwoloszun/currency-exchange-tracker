import "./HistoryModule.css";
import { resolveDateInputChange } from "../utils/isoCalendarDate";

export default function DateRangeFields({
    startId,
    endId,
    startDate,
    endDate,
    minDate,
    maxDate,
    onStartDateChange,
    onEndDateChange,
    onInvalidDate,
}) {
    return (
        <>
            <div className="history-field">
                <label htmlFor={startId}>Od</label>
                <input
                    id={startId}
                    className="history-date-input"
                    type="date"
                    defaultValue={startDate}
                    onChange={(e) => resolveDateInputChange(e, onStartDateChange, onInvalidDate)}
                    min={minDate}
                    max={endDate || undefined}
                />
            </div>

            <div className="history-field">
                <label htmlFor={endId}>Do</label>
                <input
                    id={endId}
                    className="history-date-input"
                    type="date"
                    defaultValue={endDate}
                    onChange={(e) => resolveDateInputChange(e, onEndDateChange, onInvalidDate)}
                    min={startDate || minDate}
                    max={maxDate}
                />
            </div>
        </>
    );
}
