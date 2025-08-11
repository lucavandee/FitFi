export type NovaIntent =
  | 'outfit.request'
  | 'outfit.refine'      // bv. "smart casual wit"
  | 'info.capabilities'  // "wat kan je / wat kun je wel"
  | 'smalltalk';

export type ParsedQuery = {
  intent: NovaIntent;
  occasion?: string;          // kantoor, weekend, event
  styleLevel?: 'casual'|'smart casual'|'formeel';
  colors?: string[];          // wit, zwart, beige, navy
  season?: 'lente'|'zomer'|'herfst'|'winter';
  gender?: 'male'|'female'|'unisex';
};

const styleLex = [
  ['smart casual','smart casual'],
  ['formeel','formeel'],
  ['casual','casual'],
  ['business','smart casual'],
  ['smart','smart casual'],
];

const colorLex = ['wit','zwart','beige','navy','blauw','grijs','bruin','groen'];
const seasonLex: ParsedQuery['season'][] = ['lente','zomer','herfst','winter'];
const occasionLex = ['kantoor','werk','weekend','event','bruiloft','date','festival'];

function extractColors(text: string) {
  const lower = text.toLowerCase();
  return colorLex.filter(c => lower.includes(c)) || [];
}

export function parseUserText(text: string): ParsedQuery {
  const lower = text.toLowerCase().trim();

  // capabilities
  if (/(wat\s+kan\s+je|wat\s+kun\s+je|help|mogelijkheden)/.test(lower)) {
    return { intent: 'info.capabilities' };
  }

  // smalltalk
  if (/^(h(oi|ey)|goedemorgen|goedenavond|dag)\b/.test(lower)) {
    return { intent: 'smalltalk' };
  }

  // style level
  let styleLevel: ParsedQuery['styleLevel'];
  for (const [k, mapped] of styleLex) {
    if (lower.includes(k)) { styleLevel = mapped as any; break; }
  }

  // season
  const season = seasonLex.find(s => lower.includes(s));

  // occasion
  const occasion = occasionLex.find(o => lower.includes(o));

  const colors = extractColors(lower);

  // intent decision
  const hasSignal = !!(styleLevel || season || occasion || colors.length);
  if (hasSignal && /andere|meer|nog/.test(lower)) {
    return { intent: 'outfit.refine', styleLevel, season, occasion, colors };
  }

  if (hasSignal || /(outfit|look|kleding|kleren)/.test(lower)) {
    return { intent: 'outfit.request', styleLevel, season, occasion, colors };
  }

  // fallback
  return { intent: 'outfit.request' };
}