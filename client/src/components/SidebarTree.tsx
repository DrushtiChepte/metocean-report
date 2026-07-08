import type { Dispatch, SetStateAction } from "react";
import type { MetadataReport, RouteReport, SiteReport } from "../types";

type DashboardReport = SiteReport | RouteReport | MetadataReport;

function FolderRow({
  label,
  open,
  onToggle,
  depth = 0,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  depth?: number;
}) {
  return (
    <button
      type="button"
      className="sidebar-tree-row sidebar-tree-folder"
      onClick={onToggle}
      aria-expanded={open}
      style={{ paddingLeft: `${8 + depth * 12}px` }}
    >
      <span className={`project-caret ${open ? "open" : ""}`} aria-hidden="true" />
      <span className="project-name">{label}</span>
    </button>
  );
}

function LeafRow({
  report,
  selectedSlug,
  onSelect,
  label,
  depth = 0,
}: {
  report: DashboardReport;
  selectedSlug: string;
  onSelect: (slug: string) => void;
  label?: string;
  depth?: number;
}) {
  return (
    <button
      type="button"
      className={`sidebar-tree-row sidebar-tree-leaf ${report.slug === selectedSlug ? "active" : ""}`}
      onClick={() => onSelect(report.slug)}
      style={{ paddingLeft: `${8 + depth * 12}px` }}
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
          label="Projects"
          open={clientOpen}
          onToggle={() => setClientOpen((open) => !open)}
          depth={0}
        />
        {clientOpen ? (
          <>
            <FolderRow
              label="Project 1"
              open={projectOpen}
              onToggle={() => setProjectOpen((open) => !open)}
              depth={1}
            />
            {projectOpen ? (
              <>
                <FolderRow
                  label="Sites"
                  open={sitesOpen}
                  onToggle={() => setSitesOpen((open) => !open)}
                  depth={2}
                />
                {sitesOpen
                  ? siteReports.map((report) => (
                      <LeafRow
                        key={report.slug}
                        report={report}
                        selectedSlug={selectedSlug}
                        onSelect={setSelectedSlug}
                        depth={3}
                      />
                    ))
                  : null}

                <FolderRow
                  label="Routes"
                  open={routesOpen}
                  onToggle={() => setRoutesOpen((open) => !open)}
                  depth={2}
                />
                {routesOpen
                  ? routeReports.map((report) => (
                      <LeafRow
                        key={report.slug}
                        report={report}
                        selectedSlug={selectedSlug}
                        onSelect={setSelectedSlug}
                        label={routeLabel(report)}
                        depth={3}
                      />
                    ))
                  : null}

                <FolderRow
                  label="Metadata"
                  open={metadataOpen}
                  onToggle={() => setMetadataOpen((open) => !open)}
                  depth={2}
                />
                {metadataOpen
                  ? metadataReports.map((report) => (
                      <LeafRow
                        key={report.slug}
                        report={report}
                        selectedSlug={selectedSlug}
                        onSelect={setSelectedSlug}
                        label="Metadata"
                        depth={3}
                      />
                    ))
                  : null}
              </>
            ) : null}
          </>
        ) : null}

        {!reports.length ? (
          <div className="status-card">Loading locations...</div>
        ) : null}
      </div>
    </div>
  );
}
