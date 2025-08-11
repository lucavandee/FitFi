export function outfitTitle(archetype: string, key?: string, season?: string) {
  const a = (archetype || 'casual_chic').replace('_',' ');
  const k = key || 'key piece';
  const s = season ? season : 'dit seizoen';
  return `${cap(a)} × ${k} — ${s}`;
}

export function outfitDesc({products=[], archetype='', season, occasion, secondary}:{products:{name?:string;category?:string}[],archetype:string,season?:string,occasion?:string,secondary?:string}) {
  const items = products.map(p=>p.name||p.category).filter(Boolean).slice(0,3).join(', ') || 'bijpassende items';
  const base = `Geselecteerd op basis van jouw ${archetype.replace('_',' ')} voorkeuren${secondary?` met een ${secondary.replace('_',' ')} twist`:''}.`;
  const s = season ? ` Afgestemd op ${season}.` : '';
  const o = occasion ? ` Ideaal voor ${occasion}.` : '';
  return `${base} ${cap(items)}.${s}${o}`.trim();
}

function cap(s:string){return s? s[0].toUpperCase()+s.slice(1):''}