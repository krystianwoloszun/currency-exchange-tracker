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
