import { useEffect, useMemo, useRef, useState } from "react";
import Plot from "react-plotly.js";
import type { Config, Data, Layout } from "plotly.js";

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
  dataPeriod?: string;
  recommendations?: string[];
  valueMode?: "count" | "percent";
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
const plotHeight = 480;
const plotMargin = {
  l: 36,
  r: 36,
  t: 48,
  b: 88,
};
const polarDomain = {
  x: [0, 1] as [number, number],
  y: [0.06, 1] as [number, number],
};

function normalizeAngle(value: number) {
  return ((value % 360) + 360) % 360;
}

function toDisplayPrecision(value: number) {
  return Number(value.toFixed(1));
}

function formatRadialTick(value: number, suffix: string) {
  const rounded = toDisplayPrecision(value);
  const label = Number.isInteger(rounded)
    ? rounded.toFixed(0)
    : rounded.toFixed(1);

  return `${label}${suffix}`;
}

function getRadialTickStep(maxValue: number) {
  if (maxValue <= 25) return 5;
  if (maxValue <= 50) return 10;

  const roughStep = maxValue / 4;
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const normalized = roughStep / magnitude;

  if (normalized <= 1) return magnitude;
  if (normalized <= 2) return 2 * magnitude;
  if (normalized <= 5) return 5 * magnitude;
  return 10 * magnitude;
}

function buildRadialTicks(maxValue: number, suffix: string) {
  const axisMax = maxValue > 0 ? maxValue : 1;
  const displayedMax = toDisplayPrecision(axisMax);
  const step = getRadialTickStep(displayedMax);
  const tickvals: number[] = [];

  for (let tick = 0; tick < displayedMax; tick += step) {
    tickvals.push(Number(tick.toFixed(6)));
  }

  if (!tickvals.some((tick) => Math.abs(tick - axisMax) < 0.000001)) {
    tickvals.push(axisMax);
  }

  return {
    max: axisMax,
    tickvals,
    ticktext: tickvals.map((tick) => formatRadialTick(tick, suffix)),
  };
}

function getReadableAxisRotation(direction: number) {
  const axisAngle = direction - 90;

  if (axisAngle > 90 || axisAngle < -90) {
    return axisAngle + 180;
  }

  return axisAngle;
}

function getOverlayGeometry(width: number, height: number) {
  const plotWidth = Math.max(width - plotMargin.l - plotMargin.r, 0);
  const plotInnerHeight = Math.max(height - plotMargin.t - plotMargin.b, 0);
  const domainWidth = plotWidth * (polarDomain.x[1] - polarDomain.x[0]);
  const domainHeight = plotInnerHeight * (polarDomain.y[1] - polarDomain.y[0]);
  const left = plotMargin.l + plotWidth * polarDomain.x[0];
  const top = plotMargin.t + plotInnerHeight * (1 - polarDomain.y[1]);
  const radius = Math.min(domainWidth, domainHeight) / 2;

  return {
    centerX: left + domainWidth / 2,
    centerY: top + domainHeight / 2,
    radius,
  };
}

function buildRoseBins({
  rows,
  classes,
  sectors,
}: Required<Pick<RoseChartProps, "rows" | "classes" | "sectors">>) {
  const sectorSize = sectors.length > 1 ? sectors[1] - sectors[0] : 30;
  const bins = sectors.map((direction) => ({
    direction,
    total: 0,
    classCounts: classes.map(() => 0),
  }));

  for (const row of rows) {
    const direction = normalizeAngle(row.direction);
    const sectorIndex =
      Math.floor((direction + sectorSize / 2) / sectorSize) % sectors.length;
    const classIndex = classes.findIndex(
      (roseClass) => row.value >= roseClass.min && row.value < roseClass.max,
    );
    const resolvedClassIndex =
      classIndex >= 0 ? classIndex : classes.length - 1;

    bins[sectorIndex].total += 1;
    bins[sectorIndex].classCounts[resolvedClassIndex] += 1;
  }

  return { bins, sectorSize };
}

function buildRoseInsight({
  rows,
  classes,
  sectors,
}: Required<Pick<RoseChartProps, "rows" | "classes" | "sectors">>) {
  if (!rows.length || !classes.length) {
    return "";
  }

  const { bins } = buildRoseBins({ rows, classes, sectors });
  const totalCount = rows.length;
  const sectorCounts = bins.map((bin) => bin.total);
  const classCounts = classes.map((_, classIndex) =>
    bins.reduce((sum, bin) => sum + bin.classCounts[classIndex], 0),
  );

  const dominantSectorIndex = sectorCounts.reduce(
    (bestIndex, count, index) =>
      count > sectorCounts[bestIndex] ? index : bestIndex,
    0,
  );
  const dominantClassIndex = classCounts.reduce(
    (bestIndex, count, index) =>
      count > classCounts[bestIndex] ? index : bestIndex,
    0,
  );
  const dominantDirection = sectors[dominantSectorIndex];
  const directionLabel =
    directionLabels[dominantDirection] || `${dominantDirection} deg`;
  const directionShare = (sectorCounts[dominantSectorIndex] / totalCount) * 100;
  const classShare = (classCounts[dominantClassIndex] / totalCount) * 100;

  return `Most frequent direction: ${directionLabel} (${directionShare.toFixed(1)}% of records). Most common band: ${classes[dominantClassIndex].label} (${classShare.toFixed(1)}% of records).`;
}

function buildRoseFigure({
  title,
  rows,
  classes,
  sectors,
  stackName,
  valueMode,
}: Required<
  Pick<
    RoseChartProps,
    "title" | "rows" | "classes" | "sectors" | "stackName" | "valueMode"
  >
>) {
  const totalCount = rows.length || 1;
  const { bins, sectorSize } = buildRoseBins({ rows, classes, sectors });
  const radialTotals = bins.map((bin) =>
    valueMode === "percent" ? (bin.total / totalCount) * 100 : bin.total,
  );
  const emptiestBinIndex = radialTotals.reduce(
    (bestIndex, total, index) =>
      total < radialTotals[bestIndex] ? index : bestIndex,
    0,
  );
  const labelDirection = sectors[emptiestBinIndex] ?? 0;
  const radialScale = buildRadialTicks(
    Math.max(...radialTotals, 0),
    valueMode === "percent" ? "%" : "",
  );

  const data: Data[] = classes.map((roseClass, classIndex) => ({
    name: roseClass.label,
    type: "barpolar",
    theta: displayDirectionSlots,
    width: displayDirectionSlots.map(() => sectorSize),
    r: displayDirectionSlots.map((direction) => {
      const binIndex = sectors.indexOf(direction);
      if (binIndex < 0) return 0;

      const count = bins[binIndex].classCounts[classIndex];
      return valueMode === "percent" ? (count / totalCount) * 100 : count;
    }),
    marker: {
      color: roseClass.color,
      line: {
        color: "#ffffff",
        width: 1,
      },
    },
    customdata: displayDirectionSlots.map((direction) => {
      const binIndex = sectors.indexOf(direction);
      const count = binIndex >= 0 ? bins[binIndex].classCounts[classIndex] : 0;
      const percentage = (count / totalCount) * 100;

      return [
        directionLabels[direction] || `${direction} deg`,
        direction,
        roseClass.label,
        percentage,
        count,
      ];
    }),
    hovertemplate:
      "<b>%{customdata[0]} (%{customdata[1]}&deg;)</b><br>" +
      "Band: <b>%{customdata[2]}</b><br>" +
      "Percentage: <b>%{customdata[3]:.2f}%</b><br>" +
      "Count: <b>%{customdata[4]:,}</b>" +
      "<extra></extra>",
  }));

  const layout: Partial<Layout> = {
    title: {
      text: title,
      x: 0,
      xanchor: "left",
      y: 0.98,
      yanchor: "top",
      font: {
        color: "#0f172a",
        size: 16,
      },
    },
    barmode: "stack",
    autosize: true,
    margin: {
      ...plotMargin,
    },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: {
      family: "Inter, ui-sans-serif, system-ui, sans-serif",
      color: "#0f172a",
    },
    showlegend: true,
    legend: {
      orientation: "h",
      x: 0.5,
      xanchor: "center",
      y: -0.12,
      yanchor: "top",
      font: {
        color: "#374151",
        size: 12,
      },
    },
    hoverlabel: {
      bgcolor: "rgba(255,255,255,0.98)",
      bordercolor: "rgba(15,23,42,0.12)",
      font: {
        color: "#0f172a",
      },
    },
    polar: {
      domain: {
        ...polarDomain,
      },
      bgcolor: "rgba(0,0,0,0)",
      angularaxis: {
        direction: "clockwise",
        rotation: 90,
        tickmode: "array",
        tickvals: displayDirectionSlots,
        ticktext: displayDirectionSlots.map(
          (direction) => directionLabels[direction] || `${direction} deg`,
        ),
        tickfont: {
          color: "#334155",
          size: 12,
        },
        linecolor: "rgba(15,23,42,0.25)",
        linewidth: 1,
        gridcolor: "rgba(15,23,42,0.12)",
        gridwidth: 0.8,
      },
      radialaxis: {
        range: [0, radialScale.max],
        angle: 0,
        tickmode: "array",
        tickvals: radialScale.tickvals,
        showticklabels: false,
        ticks: "",
        tickfont: {
          color: "#334155",
          size: 12,
        },
        showline: false,
        gridcolor: "rgba(15,23,42,0.08)",
        gridwidth: 1,
        zeroline: false,
      },
    },
  };

  const config: Partial<Config> = {
    displaylogo: false,
    responsive: true,
    displayModeBar: true,
    toImageButtonOptions: {
      format: "png",
      scale: 2,
    },
  };

  return {
    data,
    layout,
    config,
    radialLabels: {
      axisMax: radialScale.max,
      direction: labelDirection,
      tickvals: radialScale.tickvals,
      ticktext: radialScale.ticktext,
    },
  };
}

function CustomRadialLabels({
  axisMax,
  direction,
  tickvals,
  ticktext,
  width,
  height,
}: {
  axisMax: number;
  direction: number;
  tickvals: number[];
  ticktext: string[];
  width: number;
  height: number;
}) {
  if (width <= 0 || height <= 0 || axisMax <= 0) {
    return null;
  }

  const { centerX, centerY, radius } = getOverlayGeometry(width, height);
  const directionRadians = (direction * Math.PI) / 180;
  const axisX = Math.sin(directionRadians);
  const axisY = -Math.cos(directionRadians);
  const rotation = getReadableAxisRotation(direction);

  return (
    <svg
      aria-hidden="true"
      className="rose-radial-label-overlay"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
    >
      {tickvals.map((tickValue, index) => {
        const distance = (tickValue / axisMax) * (radius - 12);
        const x = centerX + axisX * distance;
        const y = centerY + axisY * distance;

        return (
          <g
            key={`${tickValue}-${ticktext[index]}`}
            transform={`translate(${x} ${y})`}
          >
            <line
              x1={-6}
              x2={6}
              y1={0}
              y2={0}
              transform={`rotate(${rotation + 90})`}
            />
            <text
              className="rose-radial-label-text"
              dominantBaseline="middle"
              textAnchor="end"
              x={-10}
              y={0}
              transform={`rotate(${rotation + 90})`}
            >
              {ticktext[index]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function RoseChart({
  title,
  rows,
  classes,
  sectors = defaultSectors,
  stackName = "rose",
  cardClassName,
  note,
  dataPeriod,
  recommendations,
  valueMode = "percent",
}: RoseChartProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [chartSize, setChartSize] = useState({ width: 0, height: plotHeight });
  const figure = useMemo(
    () =>
      buildRoseFigure({
        title,
        rows,
        classes,
        sectors,
        stackName,
        valueMode,
      }),
    [title, rows, classes, sectors, stackName, valueMode],
  );
  const insight = useMemo(
    () =>
      buildRoseInsight({
        rows,
        classes,
        sectors,
      }),
    [rows, classes, sectors],
  );

  useEffect(() => {
    const element = chartRef.current;

    if (!element) {
      return;
    }

    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      setChartSize({
        width: rect.width,
        height: rect.height || plotHeight,
      });
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <section className={`chart-card ${cardClassName ?? ""}`.trim()}>
      <div className="wind-rose-layout" ref={chartRef}>
        <Plot
          data={figure.data}
          layout={figure.layout}
          config={figure.config}
          style={{ height: plotHeight, width: "100%" }}
          useResizeHandler
        />
        <CustomRadialLabels
          axisMax={figure.radialLabels.axisMax}
          direction={figure.radialLabels.direction}
          height={chartSize.height}
          ticktext={figure.radialLabels.ticktext}
          tickvals={figure.radialLabels.tickvals}
          width={chartSize.width}
        />
      </div>
      {dataPeriod ? (
        <p className="chart-period">
          Data period: <strong>{dataPeriod}</strong>.
        </p>
      ) : null}
      {note ? <p className="chart-note">{note}</p> : null}
      {insight ? <p className="chart-insight">{insight}</p> : null}
      {recommendations?.length ? (
        <div className="recommendation-box chart-recommendation">
          <strong className="recommendation-title">
            <img src="/recommendation-robot.png" alt="" aria-hidden="true" />
            <span>Recommendations</span>
          </strong>
          <ul>
            {recommendations.map((recommendation) => (
              <li key={recommendation}>{recommendation}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
