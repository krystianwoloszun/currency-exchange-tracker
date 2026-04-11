import "./HistoryModule.css";
import {resolveDateInputChange} from "../utils/isoCalendarDate";

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
                    type="date"
                    value={startDate}
                    onChange={(e) => resolveDateInputChange(e, onStartDateChange, onInvalidDate)}
                    min={minDate}
                    max={endDate || undefined}
                />
            </div>

            <div className="history-field">
                <label htmlFor={endId}>Do</label>
                <input
                    id={endId}
                    type="date"
                    value={endDate}
                    onChange={(e) => resolveDateInputChange(e, onEndDateChange, onInvalidDate)}
                    min={startDate || minDate}
                    max={maxDate}
                />
            </div>
        </>
    );
}
