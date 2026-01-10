// Załaduj waluty do dropdowna
fetch('/api/currency/available')
    .then(res => res.json())
    .then(data => {
        const select = document.getElementById('currencySelect');
        data.forEach(rate => {
            const option = document.createElement('option');
            option.value = rate.code;
            option.text = `${rate.currency} (${rate.code})`;
            select.appendChild(option);
        });
    });

// Konwersja
function convert() {
    const amount = document.getElementById('amount').value;
    const code = document.getElementById('currencySelect').value;
    const direction = document.getElementById('direction').value;

    fetch(`/api/currency/conversion?amount=${amount}&code=${code}&direction=${direction}`)
        .then(res => res.text())
        .then(result => {
            document.getElementById('result').innerText = result;
        });
}
