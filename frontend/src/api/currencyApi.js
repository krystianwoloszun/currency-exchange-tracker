import {API_BASE_URL} from "../config/apiBaseUrl";
import {apiFetch} from "./apiFetch";

const API_BASE = `${API_BASE_URL}/currency`;

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

export async function getRateHistory(code, startDate, endDate) {
    const params = new URLSearchParams({startDate, endDate});
    return apiFetch(`${API_BASE}/${code}/history?${params.toString()}`);
}

