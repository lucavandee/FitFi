/**
 * Lazy loader voor de Nova agent module.
 * Pakt default export of named `agent` – afhankelijk van bundling.
 */
export async function loadNovaAgent() {
  const mod = await import('./agent'); // bronbestand: frontend/src/services/ai/agent.(ts|tsx)
  return (mod as any).default ?? (mod as any).agent ?? mod;
}
