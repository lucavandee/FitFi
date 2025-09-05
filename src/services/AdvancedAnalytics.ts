export function funnel(step: string, meta?: Record<string, unknown>) {
  if (import.meta.env.DEV) console.info("[funnel]", step, meta || {});
}
export function abAssign(key: string) {
  return (key.length % 2 === 0) ? "A" : "B";
}
const AdvancedAnalytics = { funnel, abAssign };
export default AdvancedAnalytics;