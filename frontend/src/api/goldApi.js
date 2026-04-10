import {apiFetch} from "./apiFetch";

const API_BASE = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"}/gold`;

function normalizeGoldPrice(entry) {
    if (!entry || typeof entry !== "object") {
        return null;
    }

    return {
        date: entry.date ?? entry.data ?? null,
        price: entry.price ?? entry.cena ?? null,
    };
}

function normalizeGoldPriceList(payload) {
    if (!Array.isArray(payload)) {
        return [];
    }

    return payload.map(normalizeGoldPrice).filter(Boolean);
}

export async function getCurrentGoldPrice() {
    const data = await apiFetch(API_BASE);
    return normalizeGoldPriceList(data);
}

export async function getTodayGoldPrice() {
    const data = await apiFetch(`${API_BASE}/today`);
    return normalizeGoldPriceList(data);
}

export async function getGoldPriceHistory(startDate, endDate) {
    const params = new URLSearchParams({startDate, endDate});
    const data = await apiFetch(`${API_BASE}/history?${params.toString()}`);
    return normalizeGoldPriceList(data);
}
