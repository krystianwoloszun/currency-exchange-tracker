const API_URL = 'http://localhost:8080/api/currency';

export async function getAvailableCurrencies() {
    const res = await fetch(`${API_URL}/available`);
    return res.json();
}

export async function convertCurrency(amount, code, direction) {
    const res = await fetch(
        `${API_URL}/conversion?amount=${amount}&code=${code}&direction=${direction}`
    );
    return res.text();
}
