import type { SimpleOutfit } from '@/utils/mockOutfits';

export type ScoredOutfit = { outfit: SimpleOutfit; score: number; reasons: string[]; };

type RankCtx = {
  archetypes: string[];
  season: 'spring'|'summer'|'autumn'|'winter';
  recentTypes?: string[];
};

export function rankOutfits(outfits: SimpleOutfit[], ctx: RankCtx): ScoredOutfit[] {
  const w1=0.6, w2=0.3, w3=0.1; // archetype > season > recency
  return outfits.map(o=>{
    const a = ctx.archetypes.includes(o.archetype) ? 1 : 0;
    const s = 1; // mock: geen echte season check → geef baseline 1
    const r = 0; // mock: geen recentTypes in mock
    const score = w1*a + w2*s + w3*r;
    const reasons = [a? 'match_archetype' : 'mismatch_archetype','season_baseline'];
    return { outfit:o, score, reasons };
  }).sort((x,y)=>y.score-x.score);
}

export function ensureDiversity(items: ScoredOutfit[], k=3): ScoredOutfit[] {
  const out: ScoredOutfit[]=[]; const seen=new Map<string,number>();
  for(const it of items){
    const c = seen.get(it.outfit.archetype) ?? 0;
    if(c<k){ out.push(it); seen.set(it.outfit.archetype, c+1); }
    if(out.length>=50) break;
  }
  return out;
}