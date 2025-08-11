// Lightweight local store (mock-friendly)
type Store = { saved: Record<string, string[]>; disliked: Record<string, string[]> }; // userId -> ids[]
const KEY = 'fitfi.engagement.v1';

function read(): Store { 
  try { 
    return JSON.parse(localStorage.getItem(KEY) || '{}'); 
  } catch { 
    return { saved:{}, disliked:{} }; 
  } 
}

function write(s: Store) { 
  localStorage.setItem(KEY, JSON.stringify(s)); 
}

function uid() { 
  return localStorage.getItem('fitfi.uid') || 'anon'; 
}

export function isSaved(id: string, userId = uid()) { 
  const s = read(); 
  return (s.saved[userId] || []).includes(id); 
}

export function toggleSave(id: string, userId = uid()) {
  const s = read(); 
  s.saved[userId] = s.saved[userId] || [];
  const idx = s.saved[userId].indexOf(id); 
  idx >= 0 ? s.saved[userId].splice(idx,1) : s.saved[userId].push(id); 
  write(s);
  return isSaved(id, userId);
}

export function dislike(id: string, userId = uid()) {
  const s = read(); 
  s.disliked[userId] = s.disliked[userId] || [];
  if (!s.disliked[userId].includes(id)) s.disliked[userId].push(id); 
  write(s);
}

export function isDisliked(id: string, userId = uid()) { 
  const s = read(); 
  return (s.disliked[userId] || []).includes(id); 
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