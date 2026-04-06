import "./HistoryChart.css";

const rateFormatter = new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
});

function formatRateValue(value) {
    return rateFormatter.format(Number(value));
}

function formatDateValue(value) {
    if (!value || !value.includes("-")) {
        return value;
    }

    const [year, month, day] = value.split("-");
    return `${day}.${month}.${year}`;
}

function formatRateLabel(value) {
    return `${formatRateValue(value)} PLN`;
}

function buildYAxisTicks(min, max, top, innerHeight, count = 5) {
    const ticks = [];
    const spread = max - min || 0.0001;

    for (let index = 0; index < count; index += 1) {
        const ratio = index / (count - 1);
        const value = max - spread * ratio;
        const y = top + innerHeight * ratio;
        ticks.push({value, y});
    }

    return ticks;
}

function buildXAxisTicks(history, left, innerWidth) {
    if (history.length === 0) {
        return [];
    }

    const indexes = Array.from(new Set([0, Math.floor((history.length - 1) / 2), history.length - 1]));
    return indexes.map((index) => ({
        label: formatDateValue(history[index].effectiveDate),
        x: left + (history.length === 1 ? innerWidth / 2 : (index * innerWidth) / (history.length - 1)),
    }));
}

function buildChartPoints(history) {
    if (history.length === 0) {
        return {polylinePoints: "", dots: [], min: 0, max: 0, yAxisTicks: [], xAxisTicks: []};
    }

    const width = 760;
    const height = 240;
    const left = 72;
    const right = 16;
    const top = 16;
    const bottom = 40;
    const innerWidth = width - left - right;
    const innerHeight = height - top - bottom;
    const values = history.map((entry) => Number(entry.mid));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const spread = max - min || 0.0001;

    const dots = history.map((entry, index) => {
        const x = left + (history.length === 1 ? innerWidth / 2 : (index * innerWidth) / (history.length - 1));
        const y = top + innerHeight - ((Number(entry.mid) - min) / spread) * innerHeight;
        return {x, y, label: formatDateValue(entry.effectiveDate), value: formatRateValue(entry.mid)};
    });

    return {
        width,
        height,
        left,
        right,
        top,
        bottom,
        polylinePoints: dots.map((dot) => `${dot.x},${dot.y}`).join(" "),
        dots,
        min,
        max,
        yAxisTicks: buildYAxisTicks(min, max, top, innerHeight),
        xAxisTicks: buildXAxisTicks(history, left, innerWidth),
    };
}

export default function HistoryChart({history, code, loading}) {
    const {polylinePoints, dots, min, max, yAxisTicks, xAxisTicks, width, height, left, top, bottom} = buildChartPoints(history);

    return (
        <section className="history-chart">
            <div className="history-chart-topbar">
                <div>
                    <h2>Wykres czasowy</h2>
                    <p>Kurs średni NBP dla {code || "wybranej waluty"}.</p>
                </div>
            </div>

            {loading ? (
                <div className="history-chart-empty">Ładowanie wykresu...</div>
            ) : history.length === 0 ? (
                <div className="history-chart-empty">Wybierz zakres i pobierz historię, aby zobaczyć wykres.</div>
            ) : (
                <div className="history-chart-body">
                    <div className="history-chart-stats">
                        <span>Min: {formatRateLabel(min)}</span>
                        <span>Max: {formatRateLabel(max)}</span>
                        <span>Punktow: {history.length}</span>
                    </div>

                    <svg className="history-chart-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Wykres kursu ${code}`}>
                        {yAxisTicks.map((tick) => (
                            <g key={`y-${tick.y}`}>
                                <line x1={left} y1={tick.y} x2={width - 16} y2={tick.y} className="history-chart-grid"/>
                                <text x={left - 10} y={tick.y + 4} textAnchor="end" className="history-chart-axis-label">
                                    {formatRateValue(tick.value)}
                                </text>
                            </g>
                        ))}

                        {xAxisTicks.map((tick) => (
                            <g key={`x-${tick.label}`}>
                                <line x1={tick.x} y1={top} x2={tick.x} y2={height - bottom} className="history-chart-grid-vertical"/>
                                <text x={tick.x} y={height - 12} textAnchor="middle" className="history-chart-axis-label">
                                    {tick.label}
                                </text>
                            </g>
                        ))}

                        <line x1={left} y1={height - bottom} x2={width - 16} y2={height - bottom} className="history-chart-axis"/>
                        <line x1={left} y1={top} x2={left} y2={height - bottom} className="history-chart-axis"/>
                        <polyline fill="none" points={polylinePoints} className="history-chart-line"/>
                        {dots.map((dot) => (
                            <g key={`${dot.label}-${dot.value}`}>
                                <circle cx={dot.x} cy={dot.y} r="4" className="history-chart-dot">
                                    <title>{`${dot.label}: ${dot.value} PLN`}</title>
                                </circle>
                            </g>
                        ))}
                    </svg>
                </div>
            )}
        </section>
    );
}
