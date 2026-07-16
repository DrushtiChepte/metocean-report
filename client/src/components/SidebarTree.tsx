import type { Dispatch, SetStateAction } from "react";
import type { MetadataReport, RouteReport, SiteReport } from "../types";

type DashboardReport = SiteReport | RouteReport | MetadataReport;

function FolderRow({
  label,
  open,
  onToggle,
  icon,
  section = false,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  icon?: string;
  section?: boolean;
}) {
  return (
    <button
      type="button"
      className={`sidebar-tree-row sidebar-tree-folder ${section ? "section" : "project"}`}
      onClick={onToggle}
      aria-expanded={open}
    >
      <span
        className={`project-caret ${open ? "open" : ""}`}
        aria-hidden="true"
      />
      {icon ? (
        icon.endsWith(".svg") ? (
          <img
            src={icon}
            alt=""
            aria-hidden="true"
            className="sidebar-section-icon image"
          />
        ) : (
          <span className="sidebar-section-icon" aria-hidden="true">
            {icon}
          </span>
        )
      ) : null}
      <span className="project-name">{label}</span>
    </button>
  );
}

function LeafRow({
  report,
  selectedSlug,
  onSelect,
  label,
}: {
  report: DashboardReport;
  selectedSlug: string;
  onSelect: (slug: string) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      className={`sidebar-tree-row sidebar-tree-leaf ${report.slug === selectedSlug ? "active" : ""}`}
      onClick={() => onSelect(report.slug)}
    >
      <span className={`location-status ${report.dataState}`} />
      <span className="location-name">{label ?? report.title}</span>
      <img
        src="/right-arrow.svg"
        alt=""
        aria-hidden="true"
        className={`location-arrow ${report.slug === selectedSlug ? "visible" : ""}`}
      />
    </button>
  );
}

function routeLabel(report: RouteReport) {
  if (report.slug === "jutal-das") return "Jutal Offshore to Das Island";
  if (report.slug === "musaffah-das") return "Musaffah Port to Das Island";
  return report.title;
}

export default function SidebarTree({
  selectedSlug,
  setSelectedSlug,
  clientOpen,
  setClientOpen,
  projectOpen,
  setProjectOpen,
  sitesOpen,
  setSitesOpen,
  routesOpen,
  setRoutesOpen,
  metadataOpen,
  setMetadataOpen,
  siteReports,
  routeReports,
  metadataReports,
  reports,
}: {
  selectedSlug: string;
  setSelectedSlug: (slug: string) => void;
  clientOpen: boolean;
  setClientOpen: Dispatch<SetStateAction<boolean>>;
  projectOpen: boolean;
  setProjectOpen: Dispatch<SetStateAction<boolean>>;
  sitesOpen: boolean;
  setSitesOpen: Dispatch<SetStateAction<boolean>>;
  routesOpen: boolean;
  setRoutesOpen: Dispatch<SetStateAction<boolean>>;
  metadataOpen: boolean;
  setMetadataOpen: Dispatch<SetStateAction<boolean>>;
  siteReports: SiteReport[];
  routeReports: RouteReport[];
  metadataReports: MetadataReport[];
  reports: DashboardReport[];
}) {
  return (
    <div className="sidebar-tree-shell">
      <div className="sidebar-tree-header">
        <span className="sidebar-tree-chip">Projects</span>
        <p>Browse the project tree for sites, routes, and metadata.</p>
      </div>

      <div className="sidebar-tree">
        <FolderRow
          label="Project 1"
          open={projectOpen}
          onToggle={() => {
            setClientOpen(true);
            setProjectOpen((open) => !open);
          }}
        />
        {projectOpen ? (
          <>
            <FolderRow
              label="Sites"
              open={sitesOpen}
              onToggle={() => setSitesOpen((open) => !open)}
              icon="📍"
              section
            />
            {sitesOpen
              ? siteReports.map((report) => (
                  <LeafRow
                    key={report.slug}
                    report={report}
                    selectedSlug={selectedSlug}
                    onSelect={setSelectedSlug}
                  />
                ))
              : null}

            <FolderRow
              label="Routes"
              open={routesOpen}
              onToggle={() => setRoutesOpen((open) => !open)}
              icon="/route.svg"
              section
            />
            {routesOpen
              ? routeReports.map((report) => (
                  <LeafRow
                    key={report.slug}
                    report={report}
                    selectedSlug={selectedSlug}
                    onSelect={setSelectedSlug}
                    label={routeLabel(report)}
                  />
                ))
              : null}

            <FolderRow
              label="Metadata"
              open={metadataOpen}
              onToggle={() => setMetadataOpen((open) => !open)}
              icon="📄"
              section
            />
            {metadataOpen
              ? metadataReports.map((report) => (
                  <LeafRow
                    key={report.slug}
                    report={report}
                    selectedSlug={selectedSlug}
                    onSelect={setSelectedSlug}
                    label="Metadata"
                  />
                ))
              : null}
          </>
        ) : null}

        {!reports.length ? (
          <div className="status-card">Loading locations...</div>
        ) : null}
      </div>
    </div>
  );
}
