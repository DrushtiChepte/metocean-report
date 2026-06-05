import { useEffect, useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";

type CsvRow = {
  u10: number;
  v10: number;
  windSpeed: number;
};

type SpeedClass = {
  label: string;
  min: number;
  max: number;
  color: string;
};

const directionBins = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
const speedClasses: SpeedClass[] = [
  { label: "0-5 m/s", min: 0, max: 5, color: "#dbeafe" },
  { label: "5-10 m/s", min: 5, max: 10, color: "#60a5fa" },
  { label: "10-15 m/s", min: 10, max: 15, color: "#2563eb" },
  { label: "15+ m/s", min: 15, max: Number.POSITIVE_INFINITY, color: "#1d4ed8" },
];

function normalizeAngle(value: number) {
  return ((value % 360) + 360) % 360;
}

function toMeteorologicalDirection(u10: number, v10: number) {
  return normalizeAngle(270 - (Math.atan2(v10, u10) * 180) / Math.PI);
}

function parseCsv(text: string) {
  const rows = text.trim().split(/\r?\n/);
  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0].split(",").map((header) => header.trim());
  const uIndex = headers.indexOf("u10");
  const vIndex = headers.indexOf("v10");
  const windSpeedIndex = headers.indexOf("wind_speed");

  if (uIndex < 0 || vIndex < 0) {
    return [];
  }

  return rows
    .slice(1)
    .map((row) => row.split(",").map((item) => item.trim()))
    .filter((cells) => cells.length > Math.max(uIndex, vIndex, windSpeedIndex))
    .flatMap((cells) => {
      const u10 = Number.parseFloat(cells[uIndex]);
      const v10 = Number.parseFloat(cells[vIndex]);
      const windSpeed = windSpeedIndex >= 0 ? Number.parseFloat(cells[windSpeedIndex]) : Number.NaN;

      if (!Number.isFinite(u10) || !Number.isFinite(v10)) {
        return [];
      }

      return [
        {
          u10,
          v10,
          windSpeed: Number.isFinite(windSpeed) ? windSpeed : Math.sqrt(u10 * u10 + v10 * v10),
        },
      ];
    });
}

function buildWindRoseOptions(rows: CsvRow[]) {
  const bins = directionBins.map((direction) => ({
    direction,
    total: 0,
    classCounts: speedClasses.map(() => 0),
    averageSpeed: 0,
  }));

  for (const row of rows) {
    const direction = toMeteorologicalDirection(row.u10, row.v10);
    const binIndex = Math.floor((direction + 15) / 30) % directionBins.length;
    const speedIndex = speedClasses.findIndex((speedClass) => row.windSpeed >= speedClass.min && row.windSpeed < speedClass.max);
    const resolvedSpeedIndex = speedIndex >= 0 ? speedIndex : speedClasses.length - 1;

    bins[binIndex].total += 1;
    bins[binIndex].averageSpeed += row.windSpeed;
    bins[binIndex].classCounts[resolvedSpeedIndex] += 1;
  }

  const totalCount = rows.length || 1;

  const series = speedClasses.map((speedClass, classIndex) => ({
    name: speedClass.label,
    type: "bar" as const,
    coordinateSystem: "polar" as const,
    stack: "wind",
    roundCap: true,
    data: bins.map((bin) => bin.classCounts[classIndex]),
    itemStyle: {
      color: speedClass.color,
      borderColor: "#ffffff",
      borderWidth: 1,
    },
    emphasis: {
      focus: "series" as const,
    },
  }));

  const option = {
    title: {
      text: "Wind Rose Analysis",
      left: "center",
      top: 4,
      textStyle: {
        color: "#0f172a",
        fontSize: 18,
        fontWeight: 700,
      },
    },
    legend: {
      show: false,
    },
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(255,255,255,0.98)",
      borderColor: "rgba(15,23,42,0.12)",
      textStyle: {
        color: "#0f172a",
      },
      formatter(params: { seriesName: string; dataIndex: number; value: number }) {
        const bin = bins[params.dataIndex];
        return [
          `<strong>${bin.direction}?</strong>`,
          `${params.seriesName}: ${params.value}`,
        ].join("<br/>");
      },
    },
    polar: {
      radius: "80%",
    },
    angleAxis: {
      type: "category",
      data: directionBins.map((direction) => `${direction}°`),
      startAngle: 90,
      clockwise: true,
      axisLabel: {
        color: "#475569",
      },
      axisLine: {
        lineStyle: {
          color: "rgba(15,23,42,0.15)",
        },
      },
      axisTick: {
        lineStyle: {
          color: "rgba(15,23,42,0.15)",
        },
      },
    },
    radiusAxis: {
      axisLabel: {
        show: false,
      },
      splitLine: {
        lineStyle: {
          color: "rgba(15,23,42,0.08)",
        },
      },
    },
    series,
  };

  return { option };
}

export default function WindRoseChart({ csvUrl = "/musaffa_wind_wave.csv" }: { csvUrl?: string }) {
  const [csvText, setCsvText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    setLoading(true);
    fetch(csvUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load ${csvUrl}`);
        }
        return response.text();
      })
      .then((text) => {
        if (active) {
          setCsvText(text);
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(requestError instanceof Error ? requestError.message : "Unable to load wind rose data");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [csvUrl]);

  const chart = useMemo(() => {
    if (!csvText) {
      return null;
    }

    const rows = parseCsv(csvText);
    return rows.length ? buildWindRoseOptions(rows) : null;
  }, [csvText]);

  if (error) {
    return <div className="status-card status-error">Wind rose data could not be loaded: {error}</div>;
  }

  if (loading || !chart) {
    return <div className="status-card">Loading wind rose analysis...</div>;
  }

  return (
    <section className="chart-card wind-rose-card">
      <div className="wind-rose-layout">
        <div className="wind-rose-legend">
          {speedClasses.map((speedClass) => (
            <div key={speedClass.label} className="wind-rose-legend-item">
              <span className="wind-rose-swatch" style={{ backgroundColor: speedClass.color }} />
              <span>{speedClass.label}</span>
            </div>
          ))}
        </div>
        <ReactECharts option={chart.option} style={{ height: 540, width: "100%" }} notMerge lazyUpdate />
      </div>
      <p className="chart-note">Direction is binned into 12 sectors of 30 degrees and stacked by wind speed class.</p>
    </section>
  );
}
