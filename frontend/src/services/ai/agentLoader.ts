export async function loadNovaAgent() {
  try {
    const mod = await import("./agent"); // alleen als aanwezig
    return (mod as any).default ?? (mod as any).agent ?? mod;
  } catch {
    return { stub: true };
  }
}
export default { loadNovaAgent };