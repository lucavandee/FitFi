// frontend/src/services/ai/agentLoader.ts
/**
 * Lazy loader voor de Nova agent module.
 * Pakt default export of named `agent` – afhankelijk van bundling.
 */
export async function loadNovaAgent() {
  const mod = await import('./agent');
  return (mod as any).default ?? (mod as any).agent ?? mod;
}