/** Komunikat przy nieistniejącym dniu (np. 31.02) lub odrzuconym wpisie przez przeglądarkę. */
export const INVALID_ISO_CALENDAR_DATE_MESSAGE =
    "Podaj prawidłowe daty (istniejące dni w kalendarzu).";

/**
 * Obsługa `<input type="date">`: przy błędnym dniu przeglądarka często wysyła pusty `value`
 * z `validity.badInput === true` — wtedy nie czyścimy stanu (żeby nie pokazywać „Wybierz zakres dat”).
 * Część silników ustawia `badInput` dopiero po kolejnej klatce — stąd `requestAnimationFrame`.
 */
export function resolveDateInputChange(event, onChange, onInvalidDate) {
    const target = event.target;
    const {value, validity} = target;

    if (value !== "" && !isValidIsoCalendarDate(value)) {
        onInvalidDate?.();
        return;
    }

    if (value === "") {
        if (validity.badInput) {
            onInvalidDate?.();
            return;
        }
        requestAnimationFrame(() => {
            if (target.value === "" && target.validity.badInput) {
                onInvalidDate?.();
                return;
            }
            if (target.value === "") {
                onChange("");
            }
        });
        return;
    }

    onChange(value);
}

/**
 * Sprawdza, czy łańcuch ma postać YYYY-MM-DD i odpowiada rzeczywistemu dniowi
 * w kalendarzu (długości miesięcy, lata przestępne).
 */
export function isValidIsoCalendarDate(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }
    const year = Number(value.slice(0, 4));
    const month = Number(value.slice(5, 7));
    const day = Number(value.slice(8, 10));
    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
        return false;
    }
    const utc = Date.UTC(year, month - 1, day);
    const d = new Date(utc);
    return d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day;
}
