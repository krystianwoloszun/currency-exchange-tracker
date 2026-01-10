const API_BASE = "http://localhost:8080/api/currency";

export async function getAvailableCurrencies() {
    try {
        const response = await fetch(`${API_BASE}/available`);
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Błąd pobierania walut: ${text} (status ${response.status})`);
        }
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error("Brak walut do wyświetlenia");
        }
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}


// Konwertuje walutę
export async function convertCurrency(amount, code, direction) {
    try {
        const params = new URLSearchParams({
            amount,
            code,
            direction
        });

        const response = await fetch(`${API_BASE}/conversion?${params.toString()}`);

        if (!response.ok) {
            // Pobierz komunikat z body jeśli backend go zwraca
            const errorText = await response.text();
            throw new Error(`Błąd konwersji: ${errorText} (status ${response.status})`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// Pobiera kurs jednej waluty (opcjonalnie)
export async function getRate(code) {
    try {
        const response = await fetch(`${API_BASE}/${code}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Błąd pobierania kursu: ${errorText} (status ${response.status})`);
        }
        const rate = await response.json();
        return rate;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
