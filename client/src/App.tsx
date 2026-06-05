import { Suspense, lazy, useEffect, useMemo, useState, type ReactNode } from "react";
import HarborMap from "./components/HarborMap";
import ReportCharts from "./components/ReportCharts";
import { fetchDashboard } from "./api";
import type { DashboardData, MetadataReport, RouteReport, SiteReport } from "./types";

const logoUrl = new URL("../../ideabrix-logo 1.svg", import.meta.url).href;
const WindRoseChart = lazy(() => import("./components/WindRoseChart"));

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const seasonLabels = ["Monsoon", "Post-monsoon", "Pre-monsoon", "Winter"];

function formatNumber(value: number | string) {
  if (typeof value === "string") {
    return value;
  }
  return Number.isInteger(value) ? String(value) : value.toFixed(4).replace(/\.?0+$/, "");
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

function getOperabilityTone(value: number) {
  if (value >= 0.9) return "excellent";
  if (value >= 0.8) return "good";
  if (value >= 0.7) return "moderate";
  return "low";
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
            {highlights.length ? highlights.map((item) => <MetricCard key={item.label} label={item.label} value={item.value} />) : <div className="empty-state">No highlight data available.</div>}
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
  rows: Array<{ key: string; values: Array<string | number> }>;
}) {
  return (
    <section className="panel-block">
      <div className="panel-head">
        <h3>{title}</h3>
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
              <tr key={row.key}>
                <td>{row.key}</td>
                {row.values.map((value, index) => (
                  <td key={`${row.key}-${index}`}>{formatNumber(value)}</td>
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
              <div><span>Workbook sheet</span><strong>{report.workbookSheet}</strong></div>
              <div><span>Coordinate tag</span><strong>{report.coordinates ? `${report.coordinates.latitude.toFixed(2)}, ${report.coordinates.longitude.toFixed(2)}` : "Not available"}</strong></div>
              <div><span>Period</span><strong>{report.period ?? "Not provided"}</strong></div>
              <div><span>Date</span><strong>{formatDate(report.date)}</strong></div>
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
              <div className="empty-state">No additional note sections were extracted.</div>
            )}
          </div>
        </section>
      ) : null}

      {report.extremeValueAnalysis?.length ? (
        <TablePanel
          title="Extreme value analysis"
          columns={["Units", "RP1", "RP10", "RP50", "RP100", "Method"]}
          rows={report.extremeValueAnalysis.map((row) => ({
            key: row.parameter,
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
                            <td key={`${row.stat}-${index}`}>{formatNumber(value)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                        <td key={`${metric.metric}-${row.stat}-${index}`}>{formatNumber(value)}</td>
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
          <div className="operability-grid">
            {report.operationalWindows.months.map((month) => (
              <div key={month.month} className={`operability-card ${getOperabilityTone(month.operability)}`}>
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
              <div key={group.parameter} className="exceedance-card">
                <strong>{group.parameter}</strong>
                <div className="threshold-list">
                  {group.thresholds.map((threshold) => (
                    <div key={`${group.parameter}-${threshold.threshold}`} className="threshold-row">
                      <span>{threshold.threshold}</span>
                      <strong>{(threshold.exceedance * 100).toFixed(2)}%</strong>
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
            <div><span>Workbook sheet</span><strong>{report.workbookSheet}</strong></div>
            <div><span>Route length</span><strong>{report.routeLength ?? "Not provided"}</strong></div>
            <div><span>Waypoints</span><strong>{report.waypointCount ?? report.waypoints?.length ?? 0}</strong></div>
            <div><span>Date</span><strong>{formatDate(report.date)}</strong></div>
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
            key: row.parameter,
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

function MusaffahSummaryCard() {
  return (
    <section className="panel-block summary-card">
      <div className="panel-head">
        <h3>Musaffah Port</h3>
      </div>
      <p className="panel-note summary-lead">
        Site study sheet with extreme value analysis, monthly statistics, seasonal summary, operating window guidance, and exceedance probabilities.
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
          <div><span>Coordinate tag</span><strong>24.38, 54.47</strong></div>
          <div><span>Period</span><strong>1985-2000</strong></div>
          <div><span>Date</span><strong>April 1, 2026</strong></div>
        </div>
      </section>
      <section className="panel-block summary-inner">
        <div className="panel-head">
          <h3>Site details</h3>
        </div>
        <div className="empty-state">No additional note sections were extracted.</div>
      </section>
    </section>
  );
}

export default function App() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [selectedSlug, setSelectedSlug] = useState("musaffah-port");
  const [projectOpen, setProjectOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
          setError(requestError instanceof Error ? requestError.message : "Unable to load workbook data");
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
  }, []);

  const selectedReport = useMemo(
    () => dashboard?.reports.find((report) => report.slug === selectedSlug) ?? null,
    [dashboard, selectedSlug],
  );

  const mapSites = dashboard?.mapSites ?? [];
  const reports = dashboard?.reports ?? [];

  return (
    <main className="app-shell">
      <header className="topbar topbar-sticky">
        <img className="topbar-logo" src={logoUrl} alt="IDEABRIX" />
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <div className="sidebar-card">
            <span className="eyebrow">Locations</span>
            <p className="sidebar-copy">
              Select a location from the project tree to open its map on the right and inspect the digitized data below.
            </p>
          </div>

          <div className="sidebar-card">
            <button
              type="button"
              className="project-row"
              onClick={() => setProjectOpen((open) => !open)}
              aria-expanded={projectOpen}
            >
              <span className={`project-caret ${projectOpen ? "open" : ""}`} aria-hidden="true" />
              <span className="project-name">Project 1</span>
            </button>

            <div className={`project-tree ${projectOpen ? "open" : "closed"}`}>
              <div className="location-list">
                {reports.map((report) => (
                  <button
                    key={report.slug}
                    type="button"
                    className={`location-button ${report.slug === selectedSlug ? "active" : ""}`}
                    onClick={() => setSelectedSlug(report.slug)}
                  >
                    <span className={`location-status ${report.dataState}`} />
                    <span className="location-name">{report.title}</span>
                  </button>
                ))}
                {!reports.length ? <div className="status-card">Loading locations...</div> : null}
              </div>
            </div>
          </div>
        </aside>

        <section className="main-panel">
          {selectedReport?.kind !== "metadata" ? (
            <div className="map-card">
              <div className="section-head">
                <div>
                  <span className="eyebrow">Map</span>
                  <h2>{selectedReport?.title ?? "Location map"}</h2>
                </div>
              </div>
              {!loading && dashboard ? (
                <HarborMap mapSites={mapSites} selectedSlug={selectedSlug} />
              ) : (
                <div className="map-shell empty-map" />
              )}
            </div>
          ) : null}
          {selectedReport?.slug === "musaffah-port" ? <MusaffahSummaryCard /> : null}
          <div className="report-area">
            {loading && !dashboard ? <div className="status-card">Loading workbook data...</div> : null}
            {selectedReport ? <ReportCharts report={selectedReport} /> : null}
            {selectedReport?.slug === "musaffah-port" ? (
              <Suspense fallback={<div className="status-card">Loading wind rose analysis...</div>}>
                <WindRoseChart />
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

      {error ? <div className="status-card status-error global-error">{error}</div> : null}
    </main>
  );
}
