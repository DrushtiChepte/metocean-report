import type { DashboardData } from "./types";
import { dashboardData as staticDashboardData } from "../../server/data/dashboardData.js";

export async function fetchDashboard(): Promise<DashboardData> {
  try {
    const response = await fetch("/api/dashboard");
    if (response.ok) {
      return (await response.json()) as DashboardData;
    }
  } catch {
    // Fallback below.
  }

  return staticDashboardData as DashboardData;
}
