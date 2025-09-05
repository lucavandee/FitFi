// Dagelijkse Nova-usage met LocalStorage volgens fitfi.nova.usage.* conventie.
type Usage = { date: string; tokens: number };
const KEY = (uid: string) => `fitfi.nova.usage.${uid}`;

function today() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export function getLimitForTier(tier: string): number {
  // conservatieve default-limieten per dag (tokens ≈ 4 chars per token)
  if (tier === "founder") return 100_000;
  if (tier === "plus") return 24_000;
  if (tier === "member") return 8_000;
  return 1_500; // visitor
}

export function readUsage(uid: string): Usage {
  try {
    const raw = localStorage.getItem(KEY(uid));
    if (!raw) return { date: today(), tokens: 0 };
    const parsed = JSON.parse(raw) as Usage;
    if (parsed.date !== today()) return { date: today(), tokens: 0 };
    return parsed;
  } catch {
    return { date: today(), tokens: 0 };
  }
}

export function writeUsage(uid: string, usage: Usage) {
  try {
    localStorage.setItem(KEY(uid), JSON.stringify(usage));
  } catch { /* ignore quota exceeded */ }
}

export function incTokens(uid: string, tokens: number) {
  const u = readUsage(uid);
  const next = { date: today(), tokens: Math.max(0, (u.tokens || 0) + Math.max(0, Math.floor(tokens))) };
  writeUsage(uid, next);
  return next;
}