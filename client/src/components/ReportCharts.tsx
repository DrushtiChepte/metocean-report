import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import type { MetadataReport, RouteReport, SiteReport } from "../types";

type SeasonalMetric = NonNullable<SiteReport["seasonalStats"]>[number];
type ExtremeRow = NonNullable<RouteReport["extremeValueAnalysis"]>[number];

const seasonalGroups = [
  { label: "Monsoon", range: "Jun–Sep" },
  { label: "Post-monsoon", range: "Oct–Dec" },
  { label: "Pre-monsoon", range: "Mar–May" },
  { label: "Winter", range: "Dec–Feb" },
] as const;

const seasonalSeriesConfig = [
  { key: "P90", color: "#0f766e" },
  { key: "P95", color: "#2563eb" },
  { key: "MAX", color: "#f59e0b" },
] as const;

const extremeAliases: Record<string, string> = {
  TWL: "Total Water Level",
  DSWL: "Design Still Water Level",
};

const seasonalMetricLabels: Record<string, string> = {
  "WIND (m/s)": "Wind Speed (m/s)",
  "WAVE_H (m)": "Wave Height (m)",
  "WAVE_T (s)": "Wave Period (s)",
  "SWELL_H (m)": "Swell Height (m)",
  "SWELL_T (s)": "Swell Period (s)",
  "OCEAN_CURR (m/s)": "Ocean Current (m/s)",
  "STORM_SURGE (m)": "Storm Surge (m)",
};

function formatValue(value: number) {
  if (Number.isInteger(value)) {
    return String(value);
  }

  return value.toFixed(value >= 10 ? 1 : 2).replace(/\.?0+$/, "");
}

function getSeasonalMetricLabel(metric: string) {
  return seasonalMetricLabels[metric] ?? metric;
}

function getSeasonData(metric: SeasonalMetric) {
  return seasonalGroups.map((season, index) => ({
    label: `${season.label} (${season.range})`,
    P90: metric.rows.find((row) => row.stat === "P90")?.values[index] ?? 0,
    P95: metric.rows.find((row) => row.stat === "P95")?.values[index] ?? 0,
    MAX: metric.rows.find((row) => row.stat === "MAX")?.values[index] ?? 0,
  }));
}

function getSeasonalOption(metric: SeasonalMetric): EChartsOption {
  const seasonalData = getSeasonData(metric);
  const categories = seasonalData.map((item) => item.label);

  return {
    animationDuration: 300,
    color: seasonalSeriesConfig.map((item) => item.color),
    title: {
      text: `Seasonal snapshot - ${getSeasonalMetricLabel(metric.metric)}`,
      left: "center",
      top: 8,
      textStyle: {
        color: "#0f172a",
        fontSize: 16,
        fontWeight: 700,
      },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      backgroundColor: "rgba(15, 23, 42, 0.96)",
      borderColor: "rgba(255, 255, 255, 0.12)",
      textStyle: {
        color: "#ffffff",
      },
      formatter: (params: unknown) => {
        const items = Array.isArray(params) ? params : [];
        const header = String(items[0]?.axisValue ?? "");
        const lines = [`<strong>${header}</strong>`];

        for (const series of seasonalSeriesConfig) {
          const item = items.find((entry) => entry.seriesName === series.key);
          const value = typeof item?.data === "number" ? item.data : 0;
          lines.push(`${series.key}: ${formatValue(value)}`);
        }

        return lines.join("<br/>");
      },
    },
    legend: {
      top: 38,
      left: "center",
      itemWidth: 14,
      itemHeight: 8,
      textStyle: {
        color: "#334155",
      },
    },
    grid: {
      left: 48,
      right: 24,
      top: 100,
      bottom: 44,
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: categories,
      axisLine: {
        lineStyle: {
          color: "rgba(15, 23, 42, 0.2)",
        },
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: "#64748b",
      },
    },
    yAxis: {
      type: "value",
      name: "Value",
      nameLocation: "middle",
      nameGap: 42,
      axisLabel: {
        color: "#64748b",
        formatter: (value: number) => formatValue(value),
      },
      splitLine: {
        lineStyle: {
          color: "rgba(15, 23, 42, 0.08)",
        },
      },
    },
    series: seasonalSeriesConfig.map((series) => ({
      name: series.key,
      type: "bar",
      data: seasonalData.map((item) => item[series.key]),
      barMaxWidth: 18,
      emphasis: {
        focus: "series",
      },
    })),
  };
}

function getExtremeOption(rows: ExtremeRow[]): EChartsOption {
  const params = rows.slice(0, 6).map((row) => ({
    label: row.parameter,
    alias: extremeAliases[row.parameter] ?? row.parameter,
    value: row.rp100,
    unit: row.units,
  }));

  return {
    animationDuration: 300,
    color: ["#7c3aed"],
    title: {
      text: "Extreme value comparison",
      left: "center",
      top: 8,
      textStyle: {
        color: "#0f172a",
        fontSize: 16,
        fontWeight: 700,
      },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      backgroundColor: "rgba(15, 23, 42, 0.96)",
      borderColor: "rgba(255, 255, 255, 0.12)",
      textStyle: {
        color: "#ffffff",
      },
      formatter: (items: unknown) => {
        const points = Array.isArray(items) ? items : [];
        const point = points[0];
        const current = params[Number(point?.dataIndex ?? 0)];
        const aliasLabel =
          current?.label === current?.alias
            ? current?.label
            : `${current?.label} (${current?.alias})`;

        return [
          `<strong>${aliasLabel ?? ""}</strong>`,
          `RP100: ${formatValue(current?.value ?? 0)} ${current?.unit ?? ""}`,
        ].join("<br/>");
      },
    },
    legend: {
      show: false,
    },
    grid: {
      left: 48,
      right: 24,
      top: 92,
      bottom: 44,
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: params.map((item) => item.label),
      axisLine: {
        lineStyle: {
          color: "rgba(15, 23, 42, 0.2)",
        },
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: "#64748b",
      },
    },
    yAxis: {
      type: "value",
      name: "RP100",
      nameLocation: "middle",
      nameGap: 42,
      axisLabel: {
        color: "#64748b",
        formatter: (value: number) => formatValue(value),
      },
      splitLine: {
        lineStyle: {
          color: "rgba(15, 23, 42, 0.08)",
        },
      },
    },
    series: [
      {
        name: "RP100",
        type: "bar",
        data: params.map((item) => item.value),
        barMaxWidth: 18,
        emphasis: {
          focus: "series",
        },
      },
    ],
  };
}

export function SeasonalChartCard({ metric }: { metric: SeasonalMetric }) {
  return (
    <section className="chart-card">
      <ReactECharts
        option={getSeasonalOption(metric)}
        style={{ width: "100%", height: 380 }}
        notMerge
        lazyUpdate
      />
      <div className="monthly-trend-note">
        <span>
          <strong>P90</strong> = 90% of the values are less than the P90
          value
        </span>
        <span>
          <strong>P95</strong> = 95% of the values are less than the P95
          value
        </span>
      </div>
    </section>
  );
}

function ExtremeValueChartCard({ rows }: { rows: ExtremeRow[] }) {
  return (
    <section className="chart-card">
      <div className="panel-head">
        <h3>Extreme value comparison</h3>
      </div>
      <ReactECharts
        option={getExtremeOption(rows)}
        style={{ width: "100%", height: 320 }}
        notMerge
        lazyUpdate
      />
    </section>
  );
}

export default function ReportCharts({
  report,
}: {
  report: SiteReport | RouteReport | MetadataReport;
}) {
  if (report.kind === "metadata") {
    return null;
  }

  const charts: JSX.Element[] = [];

  if (report.kind === "route" && report.extremeValueAnalysis?.length) {
    charts.push(
      <ExtremeValueChartCard
        key="extreme"
        rows={report.extremeValueAnalysis}
      />,
    );
  }

  if (!charts.length) {
    return null;
  }

  return <div className="charts-grid">{charts}</div>;
}
