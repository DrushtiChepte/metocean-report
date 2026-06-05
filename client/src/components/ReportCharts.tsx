import type { MetadataReport, RouteReport, SiteReport } from "../types";

type ChartPointSeries = {
  label: string;
  values: number[];
  color: string;
};

function getMinMax(series: ChartPointSeries[]) {
  const allValues = series.flatMap((item) => item.values);
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const span = max - min || 1;
  return { min, max, span };
}

function formatAxisValue(value: number) {
  return value >= 100 ? value.toFixed(0) : value >= 10 ? value.toFixed(1) : value.toFixed(2).replace(/\.?0+$/, "");
}

function wrapLabel(label: string, maxLength = 12) {
  const words = label.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxLength || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines.slice(0, 3);
}

function LineChartCard({
  title,
  labels,
  series,
  note,
}: {
  title: string;
  labels: string[];
  series: ChartPointSeries[];
  note?: string;
}) {
  const width = 860;
  const height = 260;
  const padding = { top: 18, right: 22, bottom: 44, left: 54 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const { min, max, span } = getMinMax(series);
  const xStep = labels.length > 1 ? chartWidth / (labels.length - 1) : chartWidth;

  return (
    <section className="chart-card">
      <div className="panel-head">
        <h3>{title}</h3>
      </div>
      <div className="chart-legend">
        {series.map((item) => (
          <span key={item.label} className="chart-legend-item">
            <span className="chart-legend-swatch" style={{ backgroundColor: item.color }} />
            {item.label}
          </span>
        ))}
      </div>
      <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title}>
        <line x1={padding.left} y1={padding.top + chartHeight} x2={padding.left + chartWidth} y2={padding.top + chartHeight} className="chart-axis" />
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + chartHeight} className="chart-axis" />

        {[0, 0.5, 1].map((ratio) => {
          const value = max - span * ratio;
          const y = padding.top + chartHeight * ratio;
          return (
            <g key={ratio}>
              <line x1={padding.left} y1={y} x2={padding.left + chartWidth} y2={y} className="chart-grid" />
              <text x={padding.left - 10} y={y + 4} textAnchor="end" className="chart-label chart-y-label">
                {formatAxisValue(value)}
              </text>
            </g>
          );
        })}

        {labels.map((label, index) => {
          const x = padding.left + xStep * index;
          return (
            <g key={label}>
              <line x1={x} y1={padding.top + chartHeight} x2={x} y2={padding.top + chartHeight + 6} className="chart-axis" />
              <text x={x} y={height - 14} textAnchor="middle" className="chart-label">
                {label}
              </text>
            </g>
          );
        })}

        {series.map((item) => {
          const points = item.values.map((value, index) => {
            const x = padding.left + xStep * index;
            const ratio = (value - min) / span;
            const y = padding.top + chartHeight - ratio * chartHeight;
            return `${x},${y}`;
          });

          return (
            <g key={item.label}>
              <polyline points={points.join(" ")} fill="none" stroke={item.color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
              {item.values.map((value, index) => {
                const x = padding.left + xStep * index;
                const ratio = (value - min) / span;
                const y = padding.top + chartHeight - ratio * chartHeight;
                return <circle key={`${item.label}-${index}`} cx={x} cy={y} r="3.8" fill={item.color} />;
              })}
            </g>
          );
        })}
      </svg>
      {note ? <p className="chart-note">{note}</p> : null}
    </section>
  );
}

function BarChartCard({
  title,
  labels,
  values,
  color,
  note,
}: {
  title: string;
  labels: string[];
  values: number[];
  color: string;
  note?: string;
}) {
  const width = 860;
  const height = 260;
  const padding = { top: 18, right: 22, bottom: 44, left: 54 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const max = Math.max(...values) || 1;
  const barWidth = labels.length ? chartWidth / labels.length : chartWidth;

  return (
    <section className="chart-card">
      <div className="panel-head">
        <h3>{title}</h3>
      </div>
      <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title}>
        <line x1={padding.left} y1={padding.top + chartHeight} x2={padding.left + chartWidth} y2={padding.top + chartHeight} className="chart-axis" />
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + chartHeight} className="chart-axis" />
        {[0, 0.5, 1].map((ratio) => {
          const value = max * (1 - ratio);
          const y = padding.top + chartHeight * ratio;
          return (
            <g key={ratio}>
              <line x1={padding.left} y1={y} x2={padding.left + chartWidth} y2={y} className="chart-grid" />
              <text x={padding.left - 10} y={y + 4} textAnchor="end" className="chart-label chart-y-label">
                {formatAxisValue(value)}
              </text>
            </g>
          );
        })}
        {labels.map((label, index) => {
          const x = padding.left + barWidth * index + barWidth * 0.16;
          const barHeight = (values[index] / max) * chartHeight;
          const y = padding.top + chartHeight - barHeight;
          const labelLines = wrapLabel(label, 12);
          return (
            <g key={label}>
              <rect x={x} y={y} width={barWidth * 0.68} height={barHeight} rx="8" fill={color} opacity="0.88" />
              <text x={x + barWidth * 0.34} y={height - 28} textAnchor="middle" className="chart-label chart-label-multiline">
                {labelLines.map((line, lineIndex) => (
                  <tspan key={line} x={x + barWidth * 0.34} dy={lineIndex === 0 ? 0 : 12}>
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          );
        })}
      </svg>
      {note ? <p className="chart-note">{note}</p> : null}
    </section>
  );
}

export default function ReportCharts({ report }: { report: SiteReport | RouteReport | MetadataReport }) {
  if (report.kind === "metadata") {
    return null;
  }

  const charts: JSX.Element[] = [];

  if (report.kind === "site" && report.monthlyStats?.length) {
    const monthlyMetric = report.monthlyStats[0];
    charts.push(
      <LineChartCard
        key="monthly"
        title={`Monthly trend — ${monthlyMetric.metric}`}
        labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]}
        series={monthlyMetric.rows.map((row, index) => ({
          label: row.stat,
          values: row.values,
          color: ["#0f766e", "#2563eb", "#f59e0b"][index] ?? "#7c3aed",
        }))}
        note="Monthly series digitized from the workbook values."
      />,
    );
  }

  if (report.kind === "site" && report.seasonalStats?.length) {
    const seasonalMetric = report.seasonalStats[0];
    const statSeries = seasonalMetric.rows.map((row) => row.values[0]);
    charts.push(
      <BarChartCard
        key="seasonal"
        title={`Seasonal snapshot — ${seasonalMetric.metric}`}
        labels={["Monsoon", "Post-monsoon", "Pre-monsoon", "Winter"]}
        values={statSeries}
        color="#2563eb"
        note="Seasonal summary built from the workbook values."
      />,
    );
  }

  if (report.kind === "route" && report.extremeValueAnalysis?.length) {
    charts.push(
      <BarChartCard
        key="extreme"
        title="Extreme value comparison"
        labels={report.extremeValueAnalysis.slice(0, 6).map((row) => row.parameter)}
        values={report.extremeValueAnalysis.slice(0, 6).map((row) => row.rp100)}
        color="#7c3aed"
        note="RP100 values shown for the first set of route parameters."
      />,
    );
  }

  if (!charts.length) {
    return null;
  }

  return <div className="charts-grid">{charts}</div>;
}
