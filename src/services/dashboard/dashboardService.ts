export interface DashboardMetric { key: string; value: number; }
export async function fetchMetrics(): Promise<DashboardMetric[]> {
  return [{ key: "outfits_viewed", value: 0 }, { key: "saved", value: 0 }];
}
export default { fetchMetrics };