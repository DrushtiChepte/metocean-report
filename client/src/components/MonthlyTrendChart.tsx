import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";

export type MonthlyStat = {
  month: string;
  P90: number;
  P95: number;
  MAX: number;
};

type MonthlyTrendChartProps = {
  title: string;
  metricLabel?: string;
  data: MonthlyStat[];
};

const monthlyChartMeta: Record<
  string,
  { yAxisName: string; yAxisUnit: string }
> = {
  "WIND (m/s)": { yAxisName: "Wind Speed (m/s)", yAxisUnit: "m/s" },
  "Wind Speed (m/s)": { yAxisName: "Wind Speed (m/s)", yAxisUnit: "m/s" },
  "WAVE_H (m)": { yAxisName: "Wave Height (m)", yAxisUnit: "m" },
  "Wave Height (m)": { yAxisName: "Wave Height (m)", yAxisUnit: "m" },
  "WAVE_T (s)": { yAxisName: "Wave Period (s)", yAxisUnit: "s" },
  "Wave Period (s)": { yAxisName: "Wave Period (s)", yAxisUnit: "s" },
  "SWELL_H (m)": { yAxisName: "Swell Height (m)", yAxisUnit: "m" },
  "Swell Height (m)": { yAxisName: "Swell Height (m)", yAxisUnit: "m" },
  "SWELL_T (s)": { yAxisName: "Swell Period (s)", yAxisUnit: "s" },
  "Swell Period (s)": { yAxisName: "Swell Period (s)", yAxisUnit: "s" },
  "OCEAN_CURR (m/s)": {
    yAxisName: "Ocean Current (m/s)",
    yAxisUnit: "m/s",
  },
  "Ocean Current (m/s)": {
    yAxisName: "Ocean Current (m/s)",
    yAxisUnit: "m/s",
  },
};

const seriesConfig = [
  { key: "P90", color: "#0f766e" },
  { key: "P95", color: "#2563eb" },
  { key: "MAX", color: "#f59e0b" },
] as const;

function formatValue(value: number) {
  if (Number.isInteger(value)) {
    return String(value);
  }

  return value.toFixed(value >= 10 ? 1 : 2).replace(/\.?0+$/, "");
}

function getYAxisBounds(data: MonthlyStat[]) {
  const values = data.flatMap((item) => [item.P90, item.P95, item.MAX]);

  if (!values.length) {
    return { min: 0, max: 1 };
  }

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  if (minValue === maxValue) {
    const padding = minValue === 0 ? 1 : Math.abs(minValue) * 0.1;
    return { min: minValue - padding, max: maxValue + padding };
  }

  const padding = (maxValue - minValue) * 0.12;
  return {
    min: Math.max(0, minValue - padding),
    max: maxValue + padding,
  };
}

export default function MonthlyTrendChart({
  title,
  metricLabel,
  data,
}: MonthlyTrendChartProps) {
  const { min, max } = getYAxisBounds(data);
  const chartMeta =
    (metricLabel ? monthlyChartMeta[metricLabel] : undefined) ??
    Object.entries(monthlyChartMeta).find(([metric]) => title.includes(metric))?.[1] ??
    monthlyChartMeta["WIND (m/s)"];

  const option: EChartsOption = {
    animationDuration: 300,
    color: seriesConfig.map((item) => item.color),
    title: {
      text: title,
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
        type: "line",
      },
      backgroundColor: "rgba(15, 23, 42, 0.96)",
      borderColor: "rgba(255, 255, 255, 0.12)",
      textStyle: {
        color: "#ffffff",
      },
      valueFormatter: (value) =>
        typeof value === "number" ? formatValue(value) : String(value),
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
      top: 86,
      bottom: 44,
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: data.map((item) => item.month),
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
      min,
      max,
      name: chartMeta.yAxisName,
      nameLocation: "middle",
      nameGap: 52,
      nameTextStyle: {
        color: "#334155",
        fontWeight: 600,
      },
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
    series: seriesConfig.map((item) => ({
      name: item.key,
      type: "line",
      smooth: true,
      showSymbol: false,
      symbol: "circle",
      symbolSize: 7,
      lineStyle: {
        width: 3,
      },
      emphasis: {
        focus: "series",
      },
      data: data.map((row) => row[item.key]),
    })),
  };

  return (
    <section className="chart-card monthly-trend-chart">
      <ReactECharts
        option={option}
        style={{ width: "100%", height: 400 }}
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
