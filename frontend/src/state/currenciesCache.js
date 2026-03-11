const CACHE_KEY = "currencies_cache_v1";

export function readCurrenciesCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (!Array.isArray(parsed.data)) return null;
    if (typeof parsed.ts !== "number") return null;
    return { ts: parsed.ts, data: parsed.data };
  } catch {
    return null;
  }
}

export function writeCurrenciesCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch {
  }
}

export function clearCurrenciesCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
  }
}

