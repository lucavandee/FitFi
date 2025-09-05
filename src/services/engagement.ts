export function nudge(key: string) {
  if (import.meta.env.DEV) console.info("[nudge]", key);
}
export default { nudge };