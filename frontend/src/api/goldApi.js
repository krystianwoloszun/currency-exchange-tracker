import {apiFetch} from "./apiFetch";

const API_BASE = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"}/gold`;

export async function getCurrentGoldPrice() {
    return apiFetch(API_BASE);
}

export async function getTodayGoldPrice() {
    return apiFetch(`${API_BASE}/today`);
}

export async function getGoldPriceHistory(startDate, endDate) {
    const params = new URLSearchParams({startDate, endDate});
    return apiFetch(`${API_BASE}/history?${params.toString()}`);
}
