import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getAvailableCurrencies } from "../api/currencyApi";
import { AuthError } from "../api/apiFetch";
import { readCurrenciesCache, writeCurrenciesCache } from "./currenciesCache";

const CACHE_TTL_MS = 10 * 60 * 1000;
const REFRESH_EVERY_MS = 5 * 60 * 1000;

const CurrenciesContext = createContext(null);

export function CurrenciesProvider({ children, onUnauthorized }) {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const inFlightRef = useRef(null);

  const load = useCallback(async ({ background } = {}) => {
    if (inFlightRef.current) return inFlightRef.current;

    const p = (async () => {
      if (!background) setLoading(true);
      try {
        const data = await getAvailableCurrencies();
        setCurrencies(data);
        setError("");
        setLastUpdated(Date.now());
        writeCurrenciesCache(data);
      } catch (err) {
        if (err instanceof AuthError) {
          onUnauthorized?.();
          setError("Brak dostępu. Zaloguj się ponownie.");
          return;
        }
        setError(err?.message || "Nie udało się pobrać walut.");
      } finally {
        if (!background) setLoading(false);
      }
    })();

    inFlightRef.current = p.finally(() => {
      inFlightRef.current = null;
    });

    return inFlightRef.current;
  }, [onUnauthorized]);

  useEffect(() => {
    const cache = readCurrenciesCache();
    if (cache && Date.now() - cache.ts <= CACHE_TTL_MS) {
      setCurrencies(cache.data);
      setLoading(false);
      setLastUpdated(cache.ts);
      load({ background: true });
    } else {
      load();
    }

    const id = setInterval(() => {
      load({ background: true });
    }, REFRESH_EVERY_MS);

    return () => clearInterval(id);
  }, [load]);

  const value = useMemo(() => {
    return {
      currencies,
      loading,
      error,
      lastUpdated,
      refresh: () => load(),
    };
  }, [currencies, loading, error, lastUpdated, load]);

  return <CurrenciesContext.Provider value={value}>{children}</CurrenciesContext.Provider>;
}

export function useCurrencies() {
  const ctx = useContext(CurrenciesContext);
  if (!ctx) {
    throw new Error("useCurrencies must be used within CurrenciesProvider");
  }
  return ctx;
}

