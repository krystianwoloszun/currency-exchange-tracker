import {API_BASE_URL} from "../config/apiBaseUrl";
import {apiFetch} from "./apiFetch";

const API_BASE = `${API_BASE_URL}/gold`;

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
