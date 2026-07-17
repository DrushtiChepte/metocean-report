import { useEffect, useMemo, useState } from "react";
import RoseChart, { type RoseClass, type RoseRow } from "./RoseChart";

const windSpeedClasses: RoseClass[] = [
  { label: "0-2 m/s", min: 0, max: 2, color: "#FDE725" },
  { label: "2-4 m/s", min: 2, max: 4, color: "#7AD151" },
  { label: "4-6 m/s", min: 4, max: 6, color: "#22A884" },
  { label: "6-8 m/s", min: 6, max: 8, color: "#2A788E" },
  { label: "8-10 m/s", min: 8, max: 10, color: "#414487" },
  { label: "10-12 m/s", min: 10, max: 12, color: "#2C2A72" },
  { label: "12+ m/s", min: 12, max: Infinity, color: "#440154" },
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
      const windSpeed =
        windSpeedIndex >= 0
          ? Number.parseFloat(cells[windSpeedIndex])
          : Number.NaN;

      if (!Number.isFinite(u10) || !Number.isFinite(v10)) {
        return [];
      }

      return [
        {
          u10,
          v10,
          windSpeed: Number.isFinite(windSpeed)
            ? windSpeed
            : Math.sqrt(u10 * u10 + v10 * v10),
        },
      ];
    });
}

export default function WindRoseChart({
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
              : "Unable to load wind rose data",
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

  const roseRows = useMemo(() => {
    if (!csvText) {
      return [];
    }

    return parseCsv(csvText).map<RoseRow>((row) => ({
      direction: toMeteorologicalDirection(row.u10, row.v10),
      value: row.windSpeed,
    }));
  }, [csvText]);

  if (error) {
    return (
      <div className="status-card status-error">
        Wind rose data could not be loaded: {error}
      </div>
    );
  }

  if (loading || !roseRows.length) {
    return <div className="status-card">Loading wind rose analysis...</div>;
  }

  // Rose-specific recommendations are intentionally hidden.
  return (
    <RoseChart
      title="Wind Rose Analysis"
      rows={roseRows}
      classes={windSpeedClasses}
      stackName="wind"
      cardClassName="wind-rose-card"
      dataPeriod="1985-2000"
      note="The wind rose summarizes the distribution of wind direction and speed, highlighting the prevailing wind directions and the frequency of stronger wind conditions."
    />
  );
}
