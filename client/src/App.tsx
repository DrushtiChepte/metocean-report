import {
  Suspense,
  lazy,
  type Dispatch,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type SetStateAction,
  type ReactNode,
} from "react";
import HarborMap from "./components/HarborMap";
import MonthlyTrendChart, {
  type MonthlyStat,
} from "./components/MonthlyTrendChart";
import SidebarTree from "./components/SidebarTree";
import ReportCharts from "./components/ReportCharts";
import { fetchDashboard } from "./api";
import type {
  DashboardData,
  MetricBlock,
  MonthlyExceedanceGroup,
  MonthlyExceedanceRecommendations,
  MonthlyExceedanceRow,
  MetadataReport,
  RouteReport,
  SiteReport,
} from "./types";

const logoUrl = new URL("../../ideabrix-logo 1.svg", import.meta.url).href;
const WindRoseChart = lazy(() => import("./components/WindRoseChart"));
const WaveRoseChart = lazy(() => import("./components/WaveRoseChart"));

const monthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const seasonLabels = ["Monsoon", "Post-monsoon", "Pre-monsoon", "Winter"];

const monthlyExceedanceOptions = [
  { key: "wind", label: "Wind Speed", unit: "m/s" },
  { key: "waveHeight", label: "Wave Height", unit: "m" },
  { key: "wavePeriod", label: "Wave Period", unit: "s" },
  { key: "swellHeight", label: "Swell Height", unit: "m" },
  { key: "swellPeriod", label: "Swell Period", unit: "s" },
] as const;

type MonthlyExceedanceKey = (typeof monthlyExceedanceOptions)[number]["key"];

const seasonalRecommendations = [
  "The simultaneous occurrence of higher wave heights and longer wave periods during Winter and Pre-monsoon is expected to increase vessel motions alongside berths, potentially affecting cargo transfer efficiency, mooring performance, and pilot boarding operations. During Post-monsoon, the comparatively calmer sea state provides a wider operational envelope for routine marine logistics.",
  "Higher upper-percentile wind speeds during Pre-monsoon and Winter increase the likelihood of operational wind limits being approached during crane-assisted cargo handling, heavy lifts, and load-in/load-out campaigns. Seasonal weather downtime assessments should therefore account for increased wind-related interruptions during these periods.",
  "The combined seasonal statistics indicate that Post-monsoon provides the most favourable environmental conditions for routine port operations, with lower wind speeds, reduced wave activity, and weak currents contributing to improved operational availability.",
  "The consistently weak ocean current regime indicates that vessel manoeuvrability and mooring loads are expected to be governed primarily by wind and wave conditions rather than hydrodynamic current forces. Tug assistance and berth allocation strategies should therefore prioritize anticipated wind and sea-state conditions.",
];

const overallExceedanceRecommendations = [
  "Wave heights exceeding operational limits occur rarely, indicating a high likelihood of maintaining stable vessel conditions during cargo transfer operations.",
  "Wave period is the most frequently exceeded environmental parameter and should be assessed alongside wave height when defining operational weather windows.",
  "Swell conditions remain within operational limits for the majority of the observation period, reducing the likelihood of long-period vessel motions affecting operations.",
  "Wind-related operational interruptions are expected to be infrequent, although forecast wind conditions should be reviewed before critical lifting activities.",
  "Operational decisions should be based on the combined assessment of wind, wave height, wave period, and swell rather than a single environmental parameter.",
];

const extremeValueRecommendations = [
  "Gust loading should be considered in structural design and equipment selection, particularly for cranes, lifting equipment, and temporary offshore structures.",
  "The increase from RP10 (12.83 m/s) to RP100 (12.96 m/s) is relatively small, suggesting that the extreme wind climate at the site is stable.",
  "Use RP1-RP10 return levels for operational planning, weather risk assessments, and temporary offshore activities such as vessel operations, heavy lifts, and Load-In/Load-Out (LILO).",
  "Use RP50-RP100 return levels as the design basis for permanent offshore and coastal infrastructure, including platforms, berths, breakwaters, and mooring systems.",
];

const defaultMonthlyExceedanceRecommendations: Record<
  MonthlyExceedanceKey,
  string[]
> = {
  wind: [
    "Prioritise wind-sensitive activities such as Load-In/Load-Out (LILO), heavy lifting, crane operations, and offshore installation during August-October, when the probability of exceeding operational wind limits is lowest and weather downtime is expected to be minimal.",
    "Projects scheduled between February and May should incorporate additional weather contingency and flexible work planning, as this period exhibits the highest wind exceedance frequencies and therefore the greatest potential for operational interruptions.",
    "Monthly exceedance statistics should be used in weather downtime assessments instead of annual averages, allowing project schedules and operational limits to better reflect the observed seasonal variability in the wind climate.",
  ],
  waveHeight: [
    "Marine construction, dredging, vessel mobilisation, and cargo handling activities should preferably be scheduled during August-October, when exceedance of operational wave-height thresholds is at its lowest, resulting in improved vessel operability.",
    "Although exceedance above 1.0 m is relatively uncommon, wave height should still be evaluated alongside wind conditions when planning floating operations, as the combined environmental loading governs overall operational performance.",
    "Site-specific wave-height limits should be incorporated into operability analyses to provide realistic estimates of weather downtime for different vessel classes and offshore construction activities.",
  ],
  wavePeriod: [
    "Wave period should be considered together with significant wave height when assessing vessel motions, particularly for floating cranes, barges, and offshore support vessels where long-period waves may influence operational performance.",
    "Motion-sensitive marine activities should, where practicable, be scheduled during August-October, when exceedance of longer wave periods is lowest and vessel responses are expected to be more favourable.",
    "Engineering operability assessments should include wave-period criteria in addition to wave-height limits, particularly for projects involving floating assets or precision offshore operations.",
  ],
  swellHeight: [
    "Activities sensitive to vessel motions, including crew transfer, offshore installation, and survey operations, should be preferentially planned during August-October, when swell-height exceedance is consistently at its lowest.",
    "Swell height should be assessed together with locally generated wave conditions, as the combined sea state provides a more representative measure of vessel operability than either parameter alone.",
    "While swell height is not expected to be the governing operational constraint, it should remain an integral component of weather downtime assessments for floating marine operations.",
  ],
  swellPeriod: [
    "Operational planning for floating vessels should account for swell period in addition to swell height, as longer-period swells can influence vessel motions even under relatively small wave heights.",
    "Projects requiring high vessel stability should preferably be undertaken during August-October, when exceedance of longer swell periods is minimal and overall sea-state conditions are more favourable.",
    "Swell-period statistics should be integrated with wind and wave assessments to support comprehensive operability evaluations and minimise weather-related operational risks for offshore campaigns.",
  ],
};

function formatNumber(value: number | string) {
  if (typeof value === "string") {
    return value;
  }
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(4).replace(/\.?0+$/, "");
}

function formatDate(value?: string) {
  if (!value) {
    return "Not provided";
  }

  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatCoordinate(
  value: number,
  positiveSuffix: string,
  negativeSuffix: string,
) {
  const suffix = value >= 0 ? positiveSuffix : negativeSuffix;
  return `${Math.abs(value).toFixed(2)}°${suffix}`;
}

function formatReportLocation(
  report: SiteReport | RouteReport | MetadataReport,
) {
  if (!report.coordinates) {
    return report.title;
  }

  const latitude = formatCoordinate(report.coordinates.latitude, "N", "S");
  const longitude = formatCoordinate(report.coordinates.longitude, "E", "W");

  return `${report.title} (${latitude},${longitude})`;
}

function StatusDot({ state }: { state: "actual" | "dummy" }) {
  return <span className={`status-dot ${state}`} aria-hidden="true" />;
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="highlight-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function RecommendationTitle({ children }: { children: ReactNode }) {
  return (
    <strong className="recommendation-title">
      <img src="/recommendation-robot.png" alt="" aria-hidden="true" />
      <span>{children}</span>
    </strong>
  );
}

type DashboardReport = DashboardData["reports"][number];
type AuthSession = {
  username: string;
  displayName: string;
};

const AUTH_STORAGE_KEY = "metocean-auth-session";
const HARDCODED_LOGIN = {
  username: "admin",
  password: "metocean2026",
  displayName: "Admin User",
};

function loadAuthSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!rawSession) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawSession) as Partial<AuthSession> & {
      name?: string;
    };

    if (typeof parsed.displayName === "string" && parsed.displayName) {
      return {
        username: parsed.username || "admin",
        displayName: parsed.displayName,
      };
    }

    if (typeof parsed.name === "string" && parsed.name) {
      return {
        username: parsed.username || "admin",
        displayName: parsed.name,
      };
    }

    return null;
  } catch {
    return null;
  }
}

function saveAuthSession(session: AuthSession) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

function clearAuthSession() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

function AuthScreen({
  onSignIn,
}: {
  onSignIn: (session: AuthSession) => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (
      normalizedUsername === HARDCODED_LOGIN.username &&
      normalizedPassword === HARDCODED_LOGIN.password
    ) {
      setError(null);
      onSignIn({
        username: HARDCODED_LOGIN.username,
        displayName: HARDCODED_LOGIN.displayName,
      });
      return;
    }

    setError("Invalid username or password.");
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <div className="auth-hero">
          <span className="auth-kicker">YOUR METOCEAN REPORT</span>
          <h1>Sign in to look at your metocean report </h1>
         
        </div>

        <div className="auth-card">
          <div className="auth-copy">
            <h2>Login</h2>
            <p>Enter your credentials to continue.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-field">
              <span>Username</span>
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                placeholder="Enter username"
              />
            </label>

            <label className="login-field">
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="Enter password"
              />
            </label>

            {error ? <div className="auth-error">{error}</div> : null}

            <button type="submit" className="login-submit">
              Login
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

function printProjectReport(
  dashboard: DashboardData | null,
  selectedSlug: string,
) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(
      "print-preview-dashboard",
      JSON.stringify(dashboard),
    );
    sessionStorage.setItem("print-preview-slug", selectedSlug);
  }

  const previewUrl = new URL(window.location.href);
  previewUrl.searchParams.set("print", "1");
  previewUrl.searchParams.delete("report");
  window.open(previewUrl.toString(), "_blank", "noopener,noreferrer");
}

function getOperabilityTone(value: number) {
  if (value >= 0.9) return "excellent";
  if (value >= 0.8) return "good";
  if (value >= 0.7) return "moderate";
  return "low";
}

function getExceedanceTone(value: number) {
  if (value <= 10) return "low";
  if (value <= 25) return "moderate";
  return "high";
}

function getThresholdTone(index: number) {
  if (index === 0) return "low";
  if (index === 1) return "moderate";
  return "high";
}

function formatTextList(items: string[]) {
  if (items.length <= 1) {
    return items[0] ?? "";
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}

function getOperationalWindowInsight(
  windows: SiteReport["operationalWindows"],
) {
  if (!windows?.months.length) {
    return "";
  }

  const excellentMonths = windows.months
    .filter((month) => month.operability >= 0.9)
    .map((month) => month.month);

  if (excellentMonths.length) {
    return `Higher operability means fewer weather delays and better schedule certainty. Best execution window: ${formatTextList(excellentMonths)}, with 90%+ operability.`;
  }

  const bestMonth = windows.months.reduce((best, month) =>
    month.operability > best.operability ? month : best,
  );

  return `Higher operability means fewer weather delays and better schedule certainty. Best execution window: ${bestMonth.month}, with ${(bestMonth.operability * 100).toFixed(1)}% operability.`;
}

function getOperationalWindowRiskNote(
  windows: SiteReport["operationalWindows"],
) {
  if (!windows?.months.length) {
    return "";
  }

  const contingencyMonths = windows.months
    .filter((month) => month.operability < 0.8)
    .map((month) => month.month);

  if (!contingencyMonths.length) {
    return "All months are at or above 80% operability, indicating limited seasonal weather contingency requirement.";
  }

  return `${formatTextList(contingencyMonths)} may require more weather contingency.`;
}

function getExceedanceInsight(exceedance: SiteReport["exceedance"]) {
  if (!exceedance?.length) {
    return "";
  }

  const highestThresholds = exceedance
    .map((group) => group.thresholds.at(-1))
    .filter(
      (threshold): threshold is { threshold: number; exceedance: number } =>
        Boolean(threshold),
    );

  if (!highestThresholds.length) {
    return "";
  }

  const maxHighThresholdExceedance = Math.max(
    ...highestThresholds.map((threshold) => threshold.exceedance),
  );

  return `At the highest listed thresholds, exceedance remains below ${(maxHighThresholdExceedance * 100).toFixed(2)}%, indicating low occurrence of limiting conditions.`;
}

function getParameterMeaning(parameter: string) {
  const normalized = parameter.toLowerCase();

  if (normalized.includes("wind")) {
    return "Wind speed limit for lifting, transfer, and vessel handling.";
  }

  if (normalized.includes("wave_hs")) {
    return "Wave Height, a key control for marine workability.";
  }

  if (normalized.includes("wave_tp")) {
    return "Wave Time Period, used to understand vessel motion response.";
  }

  if (normalized.includes("swell_hs")) {
    return "Swell Height from longer-range sea conditions.";
  }

  if (normalized.includes("swell_tp")) {
    return "Swell Time Period, useful for assessing longer-period motion effects.";
  }

  if (normalized.includes("ocean") && normalized.includes("curr")) {
    return "Ocean Currents, used to evaluate flow-driven operational effects.";
  }

  return "Probability of exceeding the selected operating thresholds.";
}

function getParameterDisplayName(parameter: string) {
  const labels: Record<string, string> = {
    "Wind (m/s)": "Wind Speed",
    "Wave_Hs (m)": "Wave_H(m)",
    "Wave_Tp (s)": "Wave_T(s)",
    "Swell_Hs (m)": "Swell_H(m)",
    "Swell_Tp (s)": "Swell_T(s)",
    "Ocean_curr(m/s)": "Ocean_curr(m/s)",
    "Ocean Current": "Ocean_curr(m/s)",
  };

  return labels[parameter] ?? parameter;
}

function formatPercent(value: number) {
  const formatted = Number.isInteger(value)
    ? value.toFixed(1)
    : value.toFixed(2).replace(/0$/, "");

  return `${formatted}%`;
}

function getThresholdGuide(parameter: string) {
  const normalized = parameter.toLowerCase();

  if (normalized.includes("wind")) {
    return "Thresholds screen normal working, caution, and high-wind stoppage levels.";
  }

  if (normalized.includes("wave_hs")) {
    return "Thresholds move from calm-water load-in/load-out limits to downtime checks.";
  }

  if (normalized.includes("wave_tp")) {
    return "Period bands help screen vessel-motion sensitivity, not only wave size.";
  }

  if (normalized.includes("swell_hs")) {
    return "Swell thresholds check access comfort and interruption risk from remote sea states.";
  }

  if (normalized.includes("swell_tp")) {
    return "Swell-period bands flag longer-motion effects on vessels and floating assets.";
  }

  return "Thresholds are reference levels used to screen operational risk.";
}

function getMonthlyExceedanceRows(
  monthlyExceedance: MonthlyExceedanceGroup,
  selectedKey: MonthlyExceedanceKey,
) {
  return monthlyExceedance[selectedKey] ?? [];
}

function formatThresholdHeader(threshold: number, unit: string) {
  return `>${formatNumber(threshold)} ${unit}`;
}

function getMonthlyRecommendations(metric: string) {
  const normalized = metric.toUpperCase();

  if (normalized.includes("WIND")) {
    return [
      "Higher wind conditions during February–June may reduce the available operating windows for precision cargo handling, particularly for oversized or heavy cargo requiring controlled lifting and positioning, implement weather monitoring during this period.",
      "Quay cranes, mobile cranes, and floating cranes are more likely to encounter operational wind constraints during late winter and spring. Increased wind speeds can affect lifting accuracy, suspended load stability, and overall operational efficiency.",
      "Routine Roll-on/Roll-off operations are expected to remain feasible throughout most of the year. However, elevated winds during February–June may require additional attention to vehicle movement, ramp alignment, and vessel positioning, particularly during crosswind conditions.",
    ];
  }

  if (normalized.includes("WAVE_H")) {
    return [
      "The elevated upper-percentile wave heights observed during January to March (P95 up to 0.94 m) indicate an increased likelihood of wave-induced vessel motions during berthing and unberthing operations. While the recorded wave climate remains moderate, these conditions may require greater attention to vessel approach, alignment, and mooring during exposed berth operations.",
      "Higher significant wave heights increase vessel surge, sway, and heave motions alongside the berth, which can reduce the efficiency of crane-assisted cargo handling and precision load transfer operations. The comparatively calmer conditions observed between August and October provide a larger operational envelope for weather-sensitive cargo operations.",
      "The relatively modest annual variation in monthly maximum wave heights (approximately 0.9–1.46 m) suggests that vessel motions are likely to be governed by recurring operational sea states rather than isolated extreme wave events. Consequently, operational planning should focus on the upper-percentile wave climate (P90/P95) instead of absolute maxima.",
    ];
  }

  if (normalized.includes("WAVE_T")) {
    return [
      "Elevated wave periods during the first and last quarters of the year may increase vessel response during final berthing approaches and departure manoeuvres, particularly at exposed berths. Harbour approach and tug assistance planning should therefore consider both wave height and wave period rather than wave height alone.",
      "Longer-period wave conditions can increase vessel motions during cargo transfer operations, particularly for crane-assisted loading and unloading where suspended load control and vessel stability are critical. These effects are expected to be more pronounced during months exhibiting the highest upper-percentile wave periods.",
      "Peak wave periods remain relatively consistent throughout the year, with P95 values ranging from 5.50 s to 7.35 s. Longer wave periods observed during January–March and November–December have a greater potential to induce low-frequency vessel motions alongside berths, particularly surge and sway, even under moderate wave heights.",
    ];
  }

  if (normalized.includes("SWELL_H")) {
    return [
      "Upper-percentile swell heights remain below 0.60 m throughout the historical record, indicating limited swell penetration into the port. Consequently, swell-induced harbour agitation and long-period vessel motions are expected to have a relatively minor influence on routine berth operability.",
      "The low historical swell climate reduces the likelihood of swell-driven vessel surge during berthing, unberthing, and pilot boarding operations. As a result, swell is not expected to represent the primary environmental constraint for routine vessel movements at the port.",
      "The observed swell climate suggests that suspended cargo operations are unlikely to be significantly constrained by swell-induced vessel motions under normal operating conditions. Operational limitations, where encountered, are more likely to be governed by locally generated wind waves and prevailing wind conditions rather than swell alone.",
    ];
  }

  if (normalized.includes("SWELL_T")) {
    return [
      "The historical swell periods remain within a short-to-moderate range throughout the year, indicating a limited potential for long-period swell-induced vessel surge and yaw alongside berths. Consequently, swell period alone is unlikely to be a primary driver of berth operability.",
      "The seasonal increase in upper-percentile swell periods during January–March and November–December may marginally increase vessel response during berthing and while alongside; however, the observed swell periods are not indicative of energetic ocean swell conditions that would typically require additional operational restrictions.",
      "The recorded swell periods suggest that cargo handling interruptions due solely to long-period swell are expected to be infrequent. Operational constraints are more likely to arise when moderate swell periods coincide with elevated wind waves and stronger winds.",
    ];
  }

  if (normalized.includes("OCEAN_CURR")) {
    return [
      "The observed current regime is not expected to impose significant additional environmental loads during berthing or unberthing. Routine vessel movements can therefore be planned primarily with consideration of prevailing wind and wave conditions, with ocean currents acting as a secondary operational factor.",
      "The relatively weak current climate suggests that tug assistance requirements are unlikely to vary significantly throughout the year due to current effects alone. Tug deployment should instead be determined primarily by vessel characteristics, wind conditions, and berth configuration.",
      "Historical current speeds remain consistently low throughout the year, with upper-percentile values below 0.18 m/s. These conditions indicate that tidal and ocean currents are unlikely to significantly influence routine vessel approach, berthing, or departure manoeuvres under normal operating conditions.",
    ];
  }

  return [];
}

function MonthlyExceedanceSection({
  monthlyExceedance,
  recommendations,
}: {
  monthlyExceedance: MonthlyExceedanceGroup;
  recommendations?: MonthlyExceedanceRecommendations;
}) {
  const firstAvailableOption =
    monthlyExceedanceOptions.find(
      (option) =>
        getMonthlyExceedanceRows(monthlyExceedance, option.key).length,
    ) ?? monthlyExceedanceOptions[0];
  const [selectedKey, setSelectedKey] = useState<MonthlyExceedanceKey>(
    firstAvailableOption.key,
  );
  const selectedOption =
    monthlyExceedanceOptions.find((option) => option.key === selectedKey) ??
    firstAvailableOption;
  const rows = getMonthlyExceedanceRows(monthlyExceedance, selectedOption.key);
  const thresholdHeaders = rows[0]?.thresholds ?? [];
  const selectedRecommendations =
    (recommendations?.[selectedOption.key]?.length
      ? recommendations[selectedOption.key]
      : defaultMonthlyExceedanceRecommendations[selectedOption.key]) ?? [];

  return (
    <section className="panel-block monthly-exceedance-section">
      <div className="panel-head">
        <h3>Monthly Exceedance</h3>
      </div>
      <p className="section-clarity">
        Monthly percentage of observations exceeding the selected operational
        thresholds. This helps identify seasonal variations for planning
        load-in/load-out operations.
      </p>
      <div className="monthly-exceedance-toolbar">
        <label htmlFor="monthly-exceedance-parameter">Parameter</label>
        <select
          id="monthly-exceedance-parameter"
          value={selectedOption.key}
          onChange={(event) =>
            setSelectedKey(event.target.value as MonthlyExceedanceKey)
          }
        >
          {monthlyExceedanceOptions.map((option) => (
            <option
              key={option.key}
              value={option.key}
              disabled={
                !getMonthlyExceedanceRows(monthlyExceedance, option.key).length
              }
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="monthly-exceedance-layout">
        {rows.length ? (
          <div className="table-scroll monthly-exceedance-table-wrap">
            <table className="digitized-table compact monthly-exceedance-table">
              <thead>
                <tr>
                  <th>Month</th>
                  {thresholdHeaders.map((threshold) => (
                    <th key={threshold.threshold}>
                      {formatThresholdHeader(
                        threshold.threshold,
                        selectedOption.unit,
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row: MonthlyExceedanceRow) => (
                  <tr key={row.month}>
                    <td>{row.month}</td>
                    {row.thresholds.map((threshold) => (
                      <td key={`${row.month}-${threshold.threshold}`}>
                        {formatPercent(threshold.exceedance)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            No monthly exceedance rows are available for this parameter.
          </div>
        )}
        <div className="recommendation-box monthly-exceedance-recommendation">
          <RecommendationTitle>Recommendations</RecommendationTitle>
          {selectedRecommendations.length ? (
            <ul>
              {selectedRecommendations.map((recommendation) => (
                <li key={recommendation}>{recommendation}</li>
              ))}
            </ul>
          ) : (
            <p>No recommendations are available for this parameter.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function toMonthlyTrendData(metric: MetricBlock): MonthlyStat[] {
  const valuesByStat = new Map(
    metric.rows.map((row) => [row.stat, row.values] as const),
  );

  return monthLabels.map((month, index) => ({
    month,
    P90: valuesByStat.get("P90")?.[index] ?? 0,
    P95: valuesByStat.get("P95")?.[index] ?? 0,
    MAX: valuesByStat.get("MAX")?.[index] ?? 0,
  }));
}

function ReportShell({
  title,
  summary,
  highlights = [],
  children,
  state,
  hideHeader = false,
}: {
  title: string;
  summary: string;
  highlights?: Array<{ label: string; value: string }>;
  children: ReactNode;
  state: "actual" | "dummy";
  hideHeader?: boolean;
}) {
  return (
    <div className="report-shell">
      {!hideHeader ? (
        <div className="report-header">
          <div>
            <span className="eyebrow">
              <StatusDot state={state} />
            </span>
            <h2>{title}</h2>
            <p>{summary}</p>
          </div>
          <div className="report-highlights">
            {highlights.length ? (
              highlights.map((item) => (
                <MetricCard
                  key={item.label}
                  label={item.label}
                  value={item.value}
                />
              ))
            ) : (
              <div className="empty-state">No highlight data available.</div>
            )}
          </div>
        </div>
      ) : null}
      <div className="report-body">{children}</div>
    </div>
  );
}

function TablePanel({
  title,
  columns,
  rows,
  children,
}: {
  title: string;
  columns: string[];
  rows: Array<{
    rowKey: string;
    key: ReactNode;
    values: Array<string | number>;
  }>;
  children?: ReactNode;
}) {
  return (
    <section className="panel-block">
      <div className="panel-head">
        <h3>{title}</h3>
        {/* <h2>{Location}</h2> */}
      </div>
      <div className="table-scroll">
        <table className="digitized-table">
          <thead>
            <tr>
              <th>Label</th>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.rowKey}>
                <td>{row.key}</td>
                {row.values.map((value, index) => (
                  <td key={`${row.rowKey}-${index}`}>{formatNumber(value)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {children}
    </section>
  );
}

function ExtremeValuePanel({
  rows,
}: {
  rows: Array<{
    rowKey: string;
    key: ReactNode;
    units: string | number;
    rp1: string | number;
    rp10: string | number;
    rp50: string | number;
    rp100: string | number;
    method: string | number;
  }>;
}) {
  return (
    <section className="panel-block">
      <div className="panel-head">
        <h3>Extreme value analysis</h3>
      </div>
      <div className="table-scroll">
        <table className="digitized-table">
          <thead>
            <tr>
              <th>Label</th>
              <th>Units</th>
              <th>RP1</th>
              <th>RP10</th>
              <th>RP50</th>
              <th>RP100</th>
              <th>Method</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.rowKey}>
                <td>{row.key}</td>
                <td>{formatNumber(row.units)}</td>
                <td>{formatNumber(row.rp1)}</td>
                <td>{formatNumber(row.rp10)}</td>
                <td>{formatNumber(row.rp50)}</td>
                <td>{formatNumber(row.rp100)}</td>
                <td>{formatNumber(row.method)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="monthly-trend-note">
        <span>
          <strong>RP1</strong> = 1 year return period
        </span>
        <span>
          <strong>RP10</strong> = 10 year return period
        </span>
        <span>
          <strong>RP50</strong> = 50 year return period
        </span>
        <span>
          <strong>RP100</strong> = 100 year return period
        </span>
      </div>
    </section>
  );
}

function renderSite(report: SiteReport) {
  const hideIntroPanels = report.slug === "musaffah-port";

  return (
    <>
      {!hideIntroPanels ? (
        <section className="panel-grid two-up">
          <div className="panel-block">
            <div className="panel-head">
              <h3>Site metadata</h3>
            </div>
            <div className="meta-grid">
              <div>
                <span>Workbook sheet</span>
                <strong>{report.workbookSheet}</strong>
              </div>
              <div>
                <span>Coordinate tag</span>
                <strong>
                  {report.coordinates
                    ? `${report.coordinates.latitude.toFixed(2)}, ${report.coordinates.longitude.toFixed(2)}`
                    : "Not available"}
                </strong>
              </div>
              <div>
                <span>Period</span>
                <strong>{report.period ?? "Not provided"}</strong>
              </div>
              <div>
                <span>Date</span>
                <strong>{formatDate(report.date)}</strong>
              </div>
            </div>
          </div>
          <div className="panel-block">
            <div className="panel-head">
              <h3>Site details</h3>
            </div>
            {report.sections?.length ? (
              <div className="stacked-notes">
                {report.sections.map((section) => (
                  <div key={section.title} className="note-card">
                    <strong>{section.title}</strong>
                    <p>{section.body}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {report.extremeValueAnalysis?.length ? (
        <ExtremeValuePanel
          rows={report.extremeValueAnalysis.map((row) => ({
            rowKey: row.parameter,
            key: (
              <span className="extreme-parameter">
                <span>{row.parameter}</span>
                {row.note ? (
                  <span
                    className="info-tag"
                    title={row.note.replace(/^\s*/, "")}
                    aria-label={`${row.parameter}: ${row.note}`}
                  >
                    i
                  </span>
                ) : null}
              </span>
            ),
            units: row.units,
            rp1: row.rp1,
            rp10: row.rp10,
            rp50: row.rp50,
            rp100: row.rp100,
            method: row.method,
          }))}
        >
          <div className="recommendation-box extreme-value-recommendation">
            <RecommendationTitle>Recommendations</RecommendationTitle>
            <ul>
              {extremeValueRecommendations.map((recommendation) => (
                <li key={recommendation}>{recommendation}</li>
              ))}
            </ul>
          </div>
        </TablePanel>
      ) : null}

      {report.monthlyStats?.length ? (
        <section className="panel-block">
          <div className="panel-head">
            <h3>Monthly report</h3>
          </div>
          <div className="monthly-stack">
            {report.monthlyStats.map((metric) => (
              <div key={metric.metric} className="monthly-card">
                <h4>{metric.metric}</h4>
                <div className="table-scroll">
                  <table className="digitized-table compact">
                    <thead>
                      <tr>
                        <th>Stat</th>
                        {monthLabels.map((month) => (
                          <th key={month}>{month}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {metric.rows.map((row) => (
                        <tr key={row.stat}>
                          <td>{row.stat}</td>
                          {row.values.map((value, index) => (
                            <td key={`${row.stat}-${index}`}>
                              {formatNumber(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="monthly-card-chart">
                  <MonthlyTrendChart
                    title={`Monthly Trend — ${metric.metric}`}
                    data={toMonthlyTrendData(metric)}
                  />
                </div>
                {getMonthlyRecommendations(metric.metric).length ? (
                  <div className="recommendation-box monthly-recommendation">
                    <RecommendationTitle>Recommendations</RecommendationTitle>
                    <ul>
                      {getMonthlyRecommendations(metric.metric).map(
                        (recommendation) => (
                          <li key={recommendation}>{recommendation}</li>
                        ),
                      )}
                    </ul>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {report.seasonalStats?.length ? (
        <section className="panel-block">
          <div className="panel-head">
            <h3>Seasonal report</h3>
          </div>
          <div className="table-scroll">
            <table className="digitized-table compact">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Stat</th>
                  {seasonLabels.map((season) => (
                    <th key={season}>{season}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.seasonalStats.flatMap((metric) =>
                  metric.rows.map((row) => (
                    <tr key={`${metric.metric}-${row.stat}`}>
                      <td>{metric.metric}</td>
                      <td>{row.stat}</td>
                      {row.values.map((value, index) => (
                        <td key={`${metric.metric}-${row.stat}-${index}`}>
                          {formatNumber(value)}
                        </td>
                      ))}
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>
          <div className="recommendation-box seasonal-recommendation">
            <RecommendationTitle>Recommendations</RecommendationTitle>
            <ul>
              {seasonalRecommendations.map((recommendation) => (
                <li key={recommendation}>{recommendation}</li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {report.operationalWindows ? (
        <section className="panel-block">
          <div className="panel-head">
            <h3>Operational windows</h3>
          </div>
          <p className="section-clarity">
            Percentage of time each month when conditions remain within the
            selected operating limits. <br></br>(wind_speed &lt;= 7m/s and
            wave_height &lt;= 0.5m)
          </p>

          <div className="operability-legend">
            {[
              { tone: "low", label: "Low", range: "< 70%" },
              { tone: "moderate", label: "Moderate", range: "70–79%" },
              { tone: "good", label: "Good", range: "80–89%" },
              { tone: "excellent", label: "Excellent", range: "≥ 90%" },
            ].map(({ tone, label, range }) => (
              <div key={tone} className={`operability-legend-item ${tone}`}>
                <span className="operability-legend-swatch" />
                <span className="operability-legend-label">{label}</span>
                <span className="operability-legend-range">{range}</span>
              </div>
            ))}
          </div>

          <div className="operability-grid">
            {report.operationalWindows.months.map((month) => (
              <div
                key={month.month}
                className={`operability-card ${getOperabilityTone(month.operability)}`}
              >
                <span>{month.month}</span>
                <strong>{(month.operability * 100).toFixed(1)}%</strong>
              </div>
            ))}
          </div>

          {/* <p className="panel-note">{report.operationalWindows.note}</p> */}
          <p className="panel-insight">
            {getOperationalWindowInsight(report.operationalWindows)}
          </p>
          <p className="panel-insight">
            {getOperationalWindowRiskNote(report.operationalWindows)}
          </p>
        </section>
      ) : null}

      {report.exceedance?.length ? (
        <section className="panel-block exceedance-section">
          <div className="panel-head">
            <h3>Overall exceedance probability</h3>
          </div>
          <p className="section-clarity">
            Probability that each metocean parameter exceeds the listed
            threshold value.
          </p>
          <div className="exceedance-grid">
            {report.exceedance.map((group) => (
              <div key={group.parameter} className="exceedance-card">
                <div className="exceedance-card-head">
                  <strong>{getParameterDisplayName(group.parameter)}</strong>
                </div>
                {/* <p className="exceedance-card-caption">
                  {getParameterMeaning(group.parameter)}
                </p> */}
                <p className="threshold-guide">
                  {getThresholdGuide(group.parameter)}
                </p>
                <div className="threshold-strip">
                  {group.thresholds.map((threshold, index) => (
                    <div
                      key={`${group.parameter}-${threshold.threshold}`}
                      className={`threshold-pill ${getThresholdTone(index)}`}
                    >
                      <strong>{threshold.threshold}</strong>
                      <span>{(threshold.exceedance * 100).toFixed(2)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="panel-insight">
            {getExceedanceInsight(report.exceedance)}
          </p>
          <div className="recommendation-box exceedance-recommendation">
            <RecommendationTitle>Recommendations</RecommendationTitle>
            <ul>
              {overallExceedanceRecommendations.map((recommendation) => (
                <li key={recommendation}>{recommendation}</li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {report.monthlyExceedance ? (
        <MonthlyExceedanceSection
          monthlyExceedance={report.monthlyExceedance}
          recommendations={report.monthlyExceedanceRecommendations}
        />
      ) : null}
    </>
  );
}

function renderRoute(report: RouteReport) {
  return (
    <>
      <section className="panel-grid two-up">
        <div className="panel-block">
          <div className="panel-head">
            <h3>Route metadata</h3>
          </div>
          <div className="meta-grid">
            <div>
              <span>Workbook sheet</span>
              <strong>{report.workbookSheet}</strong>
            </div>
            <div>
              <span>Route length</span>
              <strong>{report.routeLength ?? "Not provided"}</strong>
            </div>
            <div>
              <span>Waypoints</span>
              <strong>
                {report.waypointCount ?? report.waypoints?.length ?? 0}
              </strong>
            </div>
            <div>
              <span>Date</span>
              <strong>{formatDate(report.date)}</strong>
            </div>
          </div>
        </div>
        <div className="panel-block">
          <div className="panel-head">
            <h3>Route notes</h3>
          </div>
          <div className="stacked-notes">
            {report.routeNotes?.length ? (
              report.routeNotes.map((note) => (
                <div key={note} className="note-card">
                  <p>{note}</p>
                </div>
              ))
            ) : (
              <div className="empty-state">No route notes were extracted.</div>
            )}
          </div>
        </div>
      </section>

      <section className="panel-block">
        <div className="panel-head">
          <h3>Waypoints</h3>
        </div>
        <div className="waypoint-strip">
          {report.waypoints?.map((waypoint, index) => (
            <div key={waypoint} className="waypoint-chip">
              <span>{index + 1}</span>
              <strong>{waypoint}</strong>
            </div>
          ))}
        </div>
      </section>

      {report.extremeValueAnalysis?.length ? (
        <ExtremeValuePanel
          rows={report.extremeValueAnalysis.map((row) => ({
            rowKey: row.parameter,
            key: (
              <span className="extreme-parameter">
                <span>{row.parameter}</span>
                {row.note ? (
                  <span
                    className="info-tag"
                    title={row.note.replace(/^\s*/, "")}
                    aria-label={`${row.parameter}: ${row.note}`}
                  >
                    i
                  </span>
                ) : null}
              </span>
            ),
            units: row.units,
            rp1: row.rp1,
            rp10: row.rp10,
            rp50: row.rp50,
            rp100: row.rp100,
            method: row.method,
          }))}
        />
      ) : null}
    </>
  );
}

function renderMetadata(report: MetadataReport) {
  return (
    <>
      <section className="panel-block">
        <div className="panel-head">
          <h3>Data sourcing</h3>
        </div>
        <div className="table-scroll">
          <table className="digitized-table compact">
            <thead>
              <tr>
                <th>Parameter category</th>
                <th>Source</th>
                <th>Source description</th>
                <th>Data type</th>
                <th>Data type description</th>
                <th>Resolution</th>
                <th>Processing applied</th>
              </tr>
            </thead>
            <tbody>
              {report.sourceRows?.map((row) => (
                <tr key={row.category}>
                  <td>{row.category}</td>
                  <td>{row.source}</td>
                  <td>{row.sourceDescription}</td>
                  <td>{row.dataType}</td>
                  <td>{row.dataTypeDescription}</td>
                  <td>{row.resolution}</td>
                  <td>{row.processingApplied}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {report.statRows?.length ? (
        <section className="panel-block">
          <div className="panel-head">
            <h3>Statistical information</h3>
          </div>
          <div className="table-scroll">
            <table className="digitized-table compact">
              <thead>
                <tr>
                  <th>Method / Model</th>
                  <th>Description</th>
                  <th>Working principle</th>
                  <th>Applied to</th>
                  <th>Purpose</th>
                </tr>
              </thead>
              <tbody>
                {report.statRows.map((row) => (
                  <tr key={row.method}>
                    <td>{row.method}</td>
                    <td>{row.description}</td>
                    <td>{row.workingPrinciple}</td>
                    <td>{row.appliedTo}</td>
                    <td>{row.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </>
  );
}

function renderPrintableReport(
  report: SiteReport | RouteReport | MetadataReport,
) {
  if (report.kind === "site") {
    return (
      <>
        {report.slug === "musaffah-port" ? <MusaffahSummaryCard /> : null}
        <ReportCharts report={report} />
        <ReportShell
          title={report.title}
          summary={report.summary}
          highlights={report.highlights}
          state={report.dataState}
          hideHeader={false}
        >
          {renderSite(report)}
        </ReportShell>
      </>
    );
  }

  if (report.kind === "route") {
    return (
      <>
        <ReportCharts report={report} />
        <ReportShell
          title={report.title}
          summary={report.summary}
          highlights={report.highlights}
          state={report.dataState}
        >
          {renderRoute(report)}
        </ReportShell>
      </>
    );
  }

  return (
    <>
      <ReportCharts report={report} />
      <ReportShell
        title={report.title}
        summary={report.summary}
        highlights={report.highlights}
        state={report.dataState}
      >
        {renderMetadata(report)}
      </ReportShell>
    </>
  );
}

function MusaffahSummaryCard() {
  return (
    <section className="panel-block summary-card">
      <div className="panel-head">
        <h3>Musaffah Port </h3>
        <h3 className="panel-subtitle report-lock-banner">
          Lat - 24.38°N, Lon - 54.47°E
        </h3>
      </div>
      
      <div className="summary-highlights">
        <div className="highlight-card">
          <span>Wind Speed RP100</span>
          <strong>12.96 m/s</strong>
        </div>
        <div className="highlight-card">
          <span>Wave Height RP100</span>
          <strong>1.55 m</strong>
        </div>
        <div className="highlight-card">
          <span>TWL RP100</span>
          <strong>2.01 m</strong>
        </div>
        <div className="highlight-card">
          <span>DSWL RP100</span>
          <strong>2.85 m</strong>
        </div>
      </div>
      <section className="panel-block summary-inner">
        <div className="panel-head">
          <h3>Site metadata</h3>
        </div>
        <div className="meta-grid">
          <div>
            <span>Coordinate tag</span>
            <strong>24.38, 54.47</strong>
          </div>
          <div>
            <span>Period</span>
            <strong>1985-2000</strong>
          </div>
          <div>
            <span>Date</span>
            <strong>April 1, 2026</strong>
          </div>
        </div>
      </section>
    </section>
  );
}

export default function App() {
  const [authSession, setAuthSession] = useState<AuthSession | null>(() =>
    loadAuthSession(),
  );
  const [dashboard, setDashboard] = useState<DashboardData | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    if (!new URLSearchParams(window.location.search).has("print")) {
      return null;
    }

    const cachedDashboard = sessionStorage.getItem("print-preview-dashboard");
    if (!cachedDashboard) {
      return null;
    }

    try {
      return JSON.parse(cachedDashboard) as DashboardData;
    } catch {
      return null;
    }
  });
  const [selectedSlug, setSelectedSlug] = useState(() => {
    if (typeof window === "undefined") {
      return "musaffah-port";
    }

    return sessionStorage.getItem("print-preview-slug") || "musaffah-port";
  });
  const [clientOpen, setClientOpen] = useState(true);
  const [projectOpen, setProjectOpen] = useState(true);
  const [sitesOpen, setSitesOpen] = useState(true);
  const [routesOpen, setRoutesOpen] = useState(true);
  const [metadataOpen, setMetadataOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authSession) {
      clearAuthSession();
      return;
    }

    saveAuthSession(authSession);
  }, [authSession]);

  useEffect(() => {
    if (!authSession) {
      setLoading(false);
      setDashboard(null);
      return;
    }

    let active = true;

    fetchDashboard()
      .then((data) => {
        if (!active) {
          return;
        }
        setDashboard(data);
        const firstReport = data.reports[0];
        if (firstReport) {
          setSelectedSlug(firstReport.slug);
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load workbook data",
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
  }, [authSession]);

  const selectedReport = useMemo(
    () =>
      dashboard?.reports.find((report) => report.slug === selectedSlug) ?? null,
    [dashboard, selectedSlug],
  );

  const mapSites = dashboard?.mapSites ?? [];
  const reports = dashboard?.reports ?? [];
  const siteReports = reports.filter(
    (report): report is SiteReport => report.kind === "site",
  );
  const routeReports = reports.filter(
    (report): report is RouteReport => report.kind === "route",
  );
  const metadataReports = reports.filter(
    (report): report is MetadataReport => report.kind === "metadata",
  );
  const isPrintPreview =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("print");

  if (!isPrintPreview && !authSession) {
    return <AuthScreen onSignIn={setAuthSession} />;
  }

  if (isPrintPreview) {
    return (
      <main className="app-shell print-preview-shell">
        <header className="print-preview-header">
          <img className="topbar-logo" src={logoUrl} alt="IDEABRIX" />
          <div className="print-preview-copy">
            <h1>Project 1 Report</h1>
            <p>
              Full project export with all reports, tables, and charts laid out
              for PDF download.
            </p>
          </div>
          <div className="print-preview-actions">
            <button
              type="button"
              className="map-download-button"
              onClick={() => window.print()}
              disabled={!dashboard}
            >
              Download PDF
            </button>
          </div>
        </header>

        <div className="print-report-stack">
          {reports.map((report) => (
            <section key={report.slug} className="print-report-page">
              {renderPrintableReport(report)}
            </section>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <div className="screen-only">
        <header className="topbar topbar-sticky">
          <img className="topbar-logo" src={logoUrl} alt="IDEABRIX" />
          {authSession ? (
            <div className="topbar-auth">
              <span>{authSession.displayName}</span>
              <button
                type="button"
                className="topbar-logout"
                onClick={() => {
                  clearAuthSession();
                  setAuthSession(null);
                }}
              >
                Logout
              </button>
            </div>
          ) : null}
        </header>

        <div className="workspace">
          <aside className="sidebar">
            <SidebarTree
              selectedSlug={selectedSlug}
              setSelectedSlug={setSelectedSlug}
              clientOpen={clientOpen}
              setClientOpen={setClientOpen}
              projectOpen={projectOpen}
              setProjectOpen={setProjectOpen}
              sitesOpen={sitesOpen}
              setSitesOpen={setSitesOpen}
              routesOpen={routesOpen}
              setRoutesOpen={setRoutesOpen}
              metadataOpen={metadataOpen}
              setMetadataOpen={setMetadataOpen}
              siteReports={siteReports}
              routeReports={routeReports}
              metadataReports={metadataReports}
              reports={reports}
            />
          </aside>

          <section className="main-panel">
            {/* {selectedReport && selectedReport.kind !== "metadata" ? (
              <div
                key={selectedReport.slug}
                className="report-lock-banner"
                aria-live="polite"
              >
                <span className="report-lock-label">
                  {formatReportLocation(selectedReport)}
                </span>
              </div>
            ) : null} */}
            {selectedReport && selectedReport.kind !== "metadata" ? (
              <div className="map-card">
                <div className="section-head map-card-head">
                  <div>
                    <span className="eyebrow">Map</span>
                    <h2>{selectedReport?.title ?? "Location map"}</h2>
                  </div>
                  <button
                    type="button"
                    className="map-download-button"
                    onClick={() => printProjectReport(dashboard, selectedSlug)}
                    disabled={!dashboard}
                  >
                    Download Report
                  </button>
                </div>
                {!loading && dashboard ? (
                  <HarborMap mapSites={mapSites} selectedSlug={selectedSlug} />
                ) : (
                  <div className="map-shell empty-map" />
                )}
              </div>
            ) : null}
            {selectedReport?.slug === "musaffah-port" ? (
              <MusaffahSummaryCard />
            ) : null}
            <div className="report-area">
              {loading && !dashboard ? (
                <div className="status-card">Loading workbook data...</div>
              ) : null}
              {selectedReport ? <ReportCharts report={selectedReport} /> : null}
              {selectedReport?.slug === "musaffah-port" ? (
                <Suspense
                  fallback={
                    <div className="status-card">
                      Loading wind rose analysis...
                    </div>
                  }
                >
                  <WindRoseChart />
                </Suspense>
              ) : null}
              {selectedReport?.slug === "musaffah-port" ? (
                <Suspense
                  fallback={
                    <div className="status-card">
                      Loading wave rose analysis...
                    </div>
                  }
                >
                  <WaveRoseChart />
                </Suspense>
              ) : null}
              {selectedReport && selectedReport.kind === "site" ? (
                <ReportShell
                  title={selectedReport.title}
                  summary={selectedReport.summary}
                  highlights={selectedReport.highlights}
                  state={selectedReport.dataState}
                  hideHeader={selectedReport.slug === "musaffah-port"}
                >
                  {renderSite(selectedReport)}
                </ReportShell>
              ) : null}
              {selectedReport && selectedReport.kind === "route" ? (
                <ReportShell
                  title={selectedReport.title}
                  summary={selectedReport.summary}
                  highlights={selectedReport.highlights}
                  state={selectedReport.dataState}
                >
                  {renderRoute(selectedReport)}
                </ReportShell>
              ) : null}
              {selectedReport && selectedReport.kind === "metadata" ? (
                <ReportShell
                  title={selectedReport.title}
                  summary={selectedReport.summary}
                  highlights={selectedReport.highlights}
                  state={selectedReport.dataState}
                >
                  {renderMetadata(selectedReport)}
                </ReportShell>
              ) : null}
            </div>
          </section>
        </div>

        {error ? (
          <div className="status-card status-error global-error">{error}</div>
        ) : null}
      </div>
    </main>
  );
}
