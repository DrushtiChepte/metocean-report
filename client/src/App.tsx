import {
  Suspense,
  lazy,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import HarborMap from "./components/HarborMap";
import MonthlyTrendChart, {
  type MonthlyStat,
} from "./components/MonthlyTrendChart";
import ReportCharts from "./components/ReportCharts";
import { fetchDashboard } from "./api";
import type {
  DashboardData,
  MetricBlock,
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
          <span className="auth-kicker">Metocean Platform</span>
          <h1>Sign in to manage project data</h1>
          <p>
            Use the login form to access the dashboard, route studies, site
            reports, and metadata in one workspace.
          </p>
          <div className="auth-points">
            <div>
              <strong>Single workspace</strong>
              <span>Keep clients, projects, sites, routes, and metadata organized.</span>
            </div>
          </div>
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

function SidebarFolder({
  label,
  open,
  onToggle,
  children,
  level = 0,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  level?: number;
}) {
  return (
    <div className="tree-folder">
      <button
        type="button"
        className="project-row tree-folder-row"
        onClick={onToggle}
        aria-expanded={open}
        style={{ paddingLeft: `${level * 18}px` }}
      >
        <span
          className={`project-caret ${open ? "open" : ""}`}
          aria-hidden="true"
        />
        <span className="project-name">{label}</span>
      </button>

      <div className={`tree-children ${open ? "open" : "closed"}`}>
        <div className="tree-children-inner">{children}</div>
      </div>
    </div>
  );
}

function SidebarLeaf({
  report,
  selectedSlug,
  onSelect,
  label,
  level = 0,
}: {
  report: DashboardReport;
  selectedSlug: string;
  onSelect: (slug: string) => void;
  label?: string;
  level?: number;
}) {
  return (
    <button
      type="button"
      className={`location-button tree-leaf ${report.slug === selectedSlug ? "active" : ""}`}
      onClick={() => onSelect(report.slug)}
      style={{ paddingLeft: `${16 + level * 18}px` }}
    >
      <span className={`location-status ${report.dataState}`} />
      <span className="location-name">{label ?? report.title}</span>
      {report.slug === selectedSlug ? (
        <img
          src="/right-arrow.svg"
          alt="arrow"
          className="location-arrow visible"
        />
      ) : null}
    </button>
  );
}

function formatRouteLabel(report: RouteReport) {
  if (report.slug === "jutal-das") {
    return "Jutal Offshore to Das Island";
  }

  if (report.slug === "musaffah-das") {
    return "Musaffah Port to Das Island";
  }

  return report.title;
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
}: {
  title: string;
  columns: string[];
  rows: Array<{
    rowKey: string;
    key: ReactNode;
    values: Array<string | number>;
  }>;
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
            ) : (
              <div className="empty-state">
                No additional note sections were extracted.
              </div>
            )}
          </div>
        </section>
      ) : null}

      {report.extremeValueAnalysis?.length ? (
        <TablePanel
          title="Extreme value analysis"
          columns={["Units", "RP1", "RP10", "RP50", "RP100", "Method"]}
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
            values: [
              row.units,
              row.rp1,
              row.rp10,
              row.rp50,
              row.rp100,
              row.method,
            ],
          }))}
        />
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
        </section>
      ) : null}

      {report.operationalWindows ? (
        <section className="panel-block">
          <div className="panel-head">
            <h3>Operational windows</h3>
          </div>

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

          <p className="panel-note">{report.operationalWindows.note}</p>
        </section>
      ) : null}

      {report.exceedance?.length ? (
        <section className="panel-block">
          <div className="panel-head">
            <h3>Overall exceedance probability</h3>
          </div>
          <div className="exceedance-grid">
            {report.exceedance.map((group) => (
              <div
                key={group.parameter}
                className={`exceedance-card ${getExceedanceTone(
                  Math.max(
                    ...group.thresholds.map(
                      (threshold) => threshold.exceedance * 100,
                    ),
                  ),
                )}`}
              >
                <strong>{group.parameter}</strong>
                <div className="threshold-list">
                  {group.thresholds.map((threshold) => (
                    <div
                      key={`${group.parameter}-${threshold.threshold}`}
                      className={`threshold-row ${getExceedanceTone(
                        threshold.exceedance * 100,
                      )}`}
                    >
                      <span>{threshold.threshold}</span>
                      <strong>
                        {(threshold.exceedance * 100).toFixed(2)}%
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
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
        <TablePanel
          title="Extreme value analysis"
          columns={["Units", "RP1", "RP10", "RP50", "RP100", "Method"]}
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
            values: [
              row.units,
              row.rp1,
              row.rp10,
              row.rp50,
              row.rp100,
              row.method,
            ],
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
      <p className="panel-note summary-lead">
        Site study sheet with extreme value analysis, monthly statistics,
        seasonal summary, operating window guidance, and exceedance
        probabilities.
      </p>
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
      <section className="panel-block summary-inner">
        <div className="panel-head">
          <h3>Site details</h3>
        </div>
        <div className="empty-state">
          No additional note sections were extracted.
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
    return (
      <AuthScreen onSignIn={setAuthSession} />
    );
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
            <div className="sidebar-card tree-card">
              <div className="sidebar-tree-header">
                <span className="sidebar-tree-chip">Projects</span>
                <p>Browse the project tree for sites, routes, and metadata.</p>
              </div>

              <SidebarFolder
                label="Projects"
                open={clientOpen}
                onToggle={() => setClientOpen((open) => !open)}
              >
                <SidebarFolder
                  label="Project 1"
                  open={projectOpen}
                  onToggle={() => setProjectOpen((open) => !open)}
                  level={1}
                >
                  <SidebarFolder
                    label="Sites"
                    open={sitesOpen}
                    onToggle={() => setSitesOpen((open) => !open)}
                    level={2}
                  >
                    <div className="tree-leaf-list">
                      {siteReports.map((report) => (
                        <SidebarLeaf
                          key={report.slug}
                          report={report}
                          selectedSlug={selectedSlug}
                          onSelect={setSelectedSlug}
                          level={3}
                        />
                      ))}
                    </div>
                  </SidebarFolder>

                  <SidebarFolder
                    label="Routes"
                    open={routesOpen}
                    onToggle={() => setRoutesOpen((open) => !open)}
                    level={2}
                  >
                    <div className="tree-leaf-list">
                      {routeReports.map((report) => (
                        <SidebarLeaf
                          key={report.slug}
                          report={report}
                          selectedSlug={selectedSlug}
                          onSelect={setSelectedSlug}
                          label={formatRouteLabel(report)}
                          level={3}
                        />
                      ))}
                    </div>
                  </SidebarFolder>

                  <SidebarFolder
                    label="Metadata"
                    open={metadataOpen}
                    onToggle={() => setMetadataOpen((open) => !open)}
                    level={2}
                  >
                    <div className="tree-leaf-list">
                      {metadataReports.map((report) => (
                        <SidebarLeaf
                          key={report.slug}
                          report={report}
                          selectedSlug={selectedSlug}
                          onSelect={setSelectedSlug}
                          label="Metadata"
                          level={3}
                        />
                      ))}
                    </div>
                  </SidebarFolder>
                </SidebarFolder>
              </SidebarFolder>

              {!reports.length ? (
                <div className="status-card">Loading locations...</div>
              ) : null}
              </div>
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
