export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type MapSite = {
  slug: string;
  label: string;
  coordinates: Coordinate | null;
  note: string;
  status: "located" | "pending";
};

export type Highlight = {
  label: string;
  value: string;
};

export type ExtremeValueRow = {
  parameter: string;
  units: string;
  rp1: number;
  rp10: number;
  rp50: number;
  rp100: number;
  method: string;
  note?: string;
};

export type MetricStatRow = {
  stat: string;
  values: number[];
};

export type MetricBlock = {
  metric: string;
  rows: MetricStatRow[];
};

export type OperationalMonth = {
  month: string;
  operability: number;
};

export type ExceedanceGroup = {
  parameter: string;
  thresholds: Array<{ threshold: number; exceedance: number }>;
};

export type ReportBase = {
  slug: string;
  title: string;
  workbookSheet: string;
  kind: "site" | "route" | "metadata";
  coordinates: Coordinate | null;
  summary: string;
  highlights: Highlight[];
  dataState: "actual" | "dummy";
};

export type SiteReport = ReportBase & {
  kind: "site";
  reportType?: string;
  period?: string;
  date?: string;
  extremeValueAnalysis?: ExtremeValueRow[];
  monthlyStats?: MetricBlock[];
  seasonalStats?: MetricBlock[];
  operationalWindows?: {
    note: string;
    months: OperationalMonth[];
  };
  exceedance?: ExceedanceGroup[];
  sections?: Array<{ title: string; body: string }>;
};

export type RouteReport = ReportBase & {
  kind: "route";
  reportType?: string;
  period?: string;
  date?: string;
  routeLength?: string;
  waypointCount?: number;
  waypoints?: string[];
  routeNotes?: string[];
  extremeValueAnalysis?: ExtremeValueRow[];
  sections?: Array<{ title: string; body: string }>;
};

export type MetadataReport = ReportBase & {
  kind: "metadata";
  sourceRows?: Array<{
    category: string;
    source: string;
    sourceDescription: string;
    dataType: string;
    dataTypeDescription: string;
    resolution: string;
    processingApplied: string;
  }>;
  statRows?: Array<{
    method: string;
    description: string;
    workingPrinciple: string;
    appliedTo: string;
    purpose: string;
  }>;
};

export type DashboardData = {
  mapSites: MapSite[];
  reports: Array<SiteReport | RouteReport | MetadataReport>;
};
