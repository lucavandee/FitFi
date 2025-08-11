// resilient, guest-friendly engagement store
type EngagementStore = {
  saved: Record<string, true>;
  disliked: Record<string, true>;
  similarClicks: Record<string, number>;
};

const KEY = 'fitfi.engagement.v1';

function read(): EngagementStore {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { saved: {}, disliked: {}, similarClicks: {} };
    const parsed = JSON.parse(raw);
    return {
      saved: parsed?.saved ?? {},
      disliked: parsed?.disliked ?? {},
      similarClicks: parsed?.similarClicks ?? {}
    };
  } catch {
    return { saved: {}, disliked: {}, similarClicks: {} };
  }
}

function write(store: EngagementStore) {
  try { localStorage.setItem(KEY, JSON.stringify(store)); } catch {}
}

export function isSaved(id: string): boolean {
  return !!read().saved[id];
}

export function isDisliked(id: string): boolean {
  return !!read().disliked[id];
}

export function toggleSave(id: string): boolean {
  const s = read();
  if (s.saved[id]) delete s.saved[id];
  else s.saved[id] = true;
  write(s);
  return !!s.saved[id];
}

export function dislike(id: string): void {
  const s = read();
  s.disliked[id] = true;
  write(s);
}

export function undoDislike(id: string): void {
  const s = read();
  delete s.disliked[id];
  write(s);
}

// Simple similarity on tags/archetype
export function getSimilarOutfits(all: any[], base: any, count = 3) {
  if (!all?.length || !base) return [];
  const baseTags: string[] = base.tags || [];
  const baseArch = base.archetype || '';
  const score = (o: any) => {
    const t = new Set([...(o.tags||[])]);
    const inter = baseTags.filter(x => t.has(x)).length;
    const arch = o.archetype === baseArch ? 2 : 0;
    return inter + arch;
  };
  return all
    .filter(o => o.id !== base.id)
    .map(o => ({o, s: score(o)}))
    .sort((a,b)=>b.s-a.s)
    .slice(0, count)
    .map(x=>x.o);
}