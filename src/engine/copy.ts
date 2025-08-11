type Tone = 'minimal'|'editorial'|'playful';

function tone(): Tone { 
  return (localStorage.getItem('fitfi_tone') as Tone) || 'editorial'; 
}

export function titleFor({archetype='', key='key piece', season='dit seizoen'}:{archetype?:string;key?:string;season?:string}) {
  const a = archetype.replace('_',' ');
  if (tone()==='minimal') return `${a} — ${key}`;
  if (tone()==='playful') return `${cap(a)} meets ${key} (${season})`;
  return `${cap(a)} × ${key} — ${season}`;
}

export function descFor({archetype='', products=[] as any[], season, occasion, secondary}:{archetype?:string;products?:any[];season?:string;occasion?:string;secondary?:string}) {
  const list = products.map(p=>p.name||p.category).filter(Boolean).slice(0,3).join(', ') || 'bijpassende items';
  const base = `Geselecteerd op basis van jouw ${archetype.replace('_',' ')} voorkeuren${secondary?` met een ${secondary.replace('_',' ')} twist`:''}.`;
  const s = season ? ` Afgestemd op ${season}.` : '';
  const o = occasion ? ` Ideaal voor ${occasion}.` : '';
  
  if (tone()==='minimal') return `${cap(list)}.${s}${o}`.trim();
  if (tone()==='playful') return `${base} ${cap(list)} maakt dit een no-brainer.${s}${o}`.trim();
  return `${base} ${cap(list)}.${s}${o}`.trim();
}

function cap(s:string){return s? s[0].toUpperCase()+s.slice(1):''}