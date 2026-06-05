import { useMemo } from "react";
import ReactECharts from "echarts-for-react";

export type RoseClass = {
  label: string;
  min: number;
  max: number;
  color: string;
};

export type RoseRow = {
  direction: number;
  value: number;
};

export type RoseChartProps = {
  title: string;
  rows: RoseRow[];
  classes: RoseClass[];
  sectors?: number[];
  stackName?: string;
  cardClassName?: string;
  note?: string;
};

const defaultSectors = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
const displayDirectionSlotSize = 30;
const displayDirectionSlots = Array.from(
  { length: 360 / displayDirectionSlotSize },
  (_, index) => index * displayDirectionSlotSize,
);
const directionLabels: Record<number, string> = {
  0: "N",
  30: "NNE",
  60: "ENE",
  90: "E",
  120: "ESE",
  150: "SSE",
  180: "S",
  210: "SSW",
  240: "WSW",
  270: "W",
  300: "WNW",
  330: "NNW",
};

function normalizeAngle(value: number) {
  return ((value % 360) + 360) % 360;
}

function buildRoseOptions({
  title,
  rows,
  classes,
  sectors,
  stackName,
}: Required<
  Pick<RoseChartProps, "title" | "rows" | "classes" | "sectors" | "stackName">
>) {
  const sectorSize = sectors.length > 1 ? sectors[1] - sectors[0] : 30;
  const bins = sectors.map((direction) => ({
    direction,
    total: 0,
    classCounts: classes.map(() => 0),
  }));

  for (const row of rows) {
    const direction = normalizeAngle(row.direction);
    const binIndex =
      Math.floor((direction + sectorSize / 2) / sectorSize) % sectors.length;
    const classIndex = classes.findIndex(
      (roseClass) => row.value >= roseClass.min && row.value < roseClass.max,
    );
    const resolvedClassIndex =
      classIndex >= 0 ? classIndex : classes.length - 1;

    bins[binIndex].total += 1;
    bins[binIndex].classCounts[resolvedClassIndex] += 1;
  }

  const series = classes.map((roseClass, classIndex) => ({
    name: roseClass.label,
    type: "bar" as const,
    coordinateSystem: "polar" as const,
    stack: stackName,
    roundCap: true,
    data: displayDirectionSlots.map((direction) => {
      const binIndex = sectors.indexOf(direction);
      return binIndex >= 0 ? bins[binIndex].classCounts[classIndex] : null;
    }),
    itemStyle: {
      color: roseClass.color,
      borderColor: "#ffffff",
      borderWidth: 1,
    },
    emphasis: {
      focus: "series" as const,
    },
  }));

  return {
    title: {
      text: title,
      left: "left",
      top: 4,
      textStyle: {
        color: "#0f172a",
        fontSize: 18,
        fontWeight: 700,
      },
    },
    legend: {
      show: true,
      left: 20,
      top: 50,
      orient: "vertical",
      textStyle: {
        color: "#374151",
      },
    },
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(255,255,255,0.98)",
      borderColor: "rgba(15,23,42,0.12)",
      textStyle: {
        color: "#0f172a",
      },
      formatter(params: {
        seriesName: string;
        dataIndex: number;
        value: number | null;
      }) {
        const direction = displayDirectionSlots[params.dataIndex];
        const label = directionLabels[direction] || `${direction}°`;

        if (params.value == null) {
          return "";
        }

        return [
          `<strong>${label}</strong>`,
          `${params.seriesName}: ${params.value}`,
        ].join("<br/>");
      },
    },
    polar: {
      radius: "80%",
    },
    angleAxis: {
      type: "category",
      data: displayDirectionSlots,
      startAngle: 90,
      clockwise: true,
      boundaryGap: false,
      axisLabel: {
        interval: 0,
        formatter: (value: string | number) => {
          const direction = Number(value);
          return directionLabels[direction] || `${direction}°`;
        },
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: "rgba(15,23,42,0.25)",
          width: 1,
        },
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: "rgba(15,23,42,0.12)",
          width: 1,
          type: "solid",
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
}

export default function RoseChart({
  title,
  rows,
  classes,
  sectors = defaultSectors,
  stackName = "rose",
  cardClassName,
  note,
}: RoseChartProps) {
  const option = useMemo(
    () =>
      buildRoseOptions({
        title,
        rows,
        classes,
        sectors,
        stackName,
      }),
    [title, rows, classes, sectors, stackName],
  );

  return (
    <section className={`chart-card ${cardClassName ?? ""}`.trim()}>
      <div className="wind-rose-layout">
        <ReactECharts
          option={option}
          style={{ height: 540, width: "100%" }}
          notMerge
          lazyUpdate
        />
      </div>
      {note ? <p className="chart-note">{note}</p> : null}
    </section>
  );
}
