const raw = import.meta.env.VITE_API_BASE_URL;

if (raw == null || String(raw).trim() === "") {
    throw new Error(
        "Brak VITE_API_BASE_URL. Utwórz plik frontend/.env (np. z frontend/.env.example) i ustaw adres backendu, np. http://localhost:8080/api"
    );
}

export const API_BASE_URL = String(raw).replace(/\/$/, "");
