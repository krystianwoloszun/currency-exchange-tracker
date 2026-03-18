import {apiFetch} from "./apiFetch";

const API_BASE = "http://localhost:8080/api/currency";

export async function getAvailableCurrencies() {
    const data = await apiFetch(`${API_BASE}/available`);
    if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Brak walut do wyswietlenia");
    }
    return data;
}

export async function convertCurrency(amount, code, direction) {
    const params = new URLSearchParams({amount, code, direction});
    return apiFetch(`${API_BASE}/conversion?${params.toString()}`);
}

export async function getRate(code) {
    return apiFetch(`${API_BASE}/${code}`);
}

