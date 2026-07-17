import { useEffect, useMemo, useState } from "react";
import RoseChart, { type RoseClass, type RoseRow } from "./RoseChart";

type CsvRow = {
  wave_direction: number;
  wave_height: number;
  wave_period_peak: number;
};

const waveHeightClasses: RoseClass[] = [
  { label: "0-0.2 m", min: 0, max: 0.2, color: "#FDE725" },
  { label: "0.2-0.4 m", min: 0.2, max: 0.4, color: "#7AD151" },
  { label: "0.4-0.6 m", min: 0.4, max: 0.6, color: "#22A884" },
  { label: "0.6-0.8 m", min: 0.6, max: 0.8, color: "#2A788E" },
  { label: "0.8-1 m", min: 0.8, max: 1, color: "#414487" },
  { label: "1+ m", min: 1, max: Infinity, color: "#440154" },
];

const wavePeriodClasses: RoseClass[] = [
  { label: "0-3 s", min: 0, max: 3, color: "#fef3c7" },
  { label: "3-5 s", min: 3, max: 5, color: "#fbbf24" },
  { label: "5-7 s", min: 5, max: 7, color: "#f97316" },
  { label: "7-9 s", min: 7, max: 9, color: "#dc2626" },
  { label: "9+ s", min: 9, max: Infinity, color: "#7f1d1d" },
];

function normalizeAngle(value: number) {
  return ((value % 360) + 360) % 360;
}

function parseCsv(text: string): CsvRow[] {
  const rows = text.trim().split(/\r?\n/);
  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0].split(",").map((header) => header.trim());
  const directionIndex = headers.indexOf("wave_direction");
  const heightIndex = headers.indexOf("wave_height");
  const periodIndex = headers.indexOf("wave_period_peak");

  if (directionIndex < 0) {
    return [];
  }

  return rows
    .slice(1)
    .map((row) => row.split(",").map((item) => item.trim()))
    .filter(
      (cells) =>
        cells.length > Math.max(directionIndex, heightIndex, periodIndex),
    )
    .flatMap((cells) => {
      const wave_direction = Number.parseFloat(cells[directionIndex]);
      const wave_height =
        heightIndex >= 0 ? Number.parseFloat(cells[heightIndex]) : Number.NaN;
      const wave_period_peak =
        periodIndex >= 0 ? Number.parseFloat(cells[periodIndex]) : Number.NaN;

      if (!Number.isFinite(wave_direction)) {
        return [];
      }

      return [
        {
          wave_direction,
          wave_height: Number.isFinite(wave_height) ? wave_height : 0,
          wave_period_peak: Number.isFinite(wave_period_peak)
            ? wave_period_peak
            : 0,
        },
      ];
    });
}

export default function WaveRoseChart({
  csvUrl = "/musaffa_wind_wave.csv",
}: {
  csvUrl?: string;
}) {
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
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load wave rose data",
          );
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

  const { heightRows, periodRows } = useMemo(() => {
    if (!csvText) {
      return { heightRows: [], periodRows: [] };
    }

    const csvRows = parseCsv(csvText);

    const heightRows: RoseRow[] = csvRows
      .filter((row) => Number.isFinite(row.wave_height))
      .map((row) => ({
        direction: normalizeAngle(row.wave_direction),
        value: row.wave_height,
      }));

    const periodRows: RoseRow[] = csvRows
      .filter((row) => Number.isFinite(row.wave_period_peak))
      .map((row) => ({
        direction: normalizeAngle(row.wave_direction),
        value: row.wave_period_peak,
      }));

    return { heightRows, periodRows };
  }, [csvText]);

  if (error) {
    return (
      <div className="status-card status-error">
        Wave rose data could not be loaded: {error}
      </div>
    );
  }

  if (loading || !csvText) {
    return <div className="status-card">Loading wave rose analysis...</div>;
  }

  // Rose-specific recommendations are intentionally hidden.
  return (
    <div className="wave-rose-container">
      <RoseChart
        title="Wave Height Rose"
        rows={heightRows}
        classes={waveHeightClasses}
        cardClassName="wave-height-card"
        dataPeriod="1985-2000"
        note="Wave height distribution by direction. Use this to identify the directions that most often contribute to sea-state limits."
        valueMode="percent"
      />
      <RoseChart
        title="Wave Period Rose"
        rows={periodRows}
        classes={wavePeriodClasses}
        cardClassName="wave-period-card"
        dataPeriod="1985-2000"
        note="Peak wave period distribution by direction. Longer period bands can indicate greater vessel motion sensitivity even when wave height is moderate."
        valueMode="percent"
      />
    </div>
  );
}
