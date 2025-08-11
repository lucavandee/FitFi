const NAMED: Record<string,string> = { 
  navy:'#1F2A44', 
  black:'#000000', 
  grey:'#808080', 
  white:'#FFFFFF', 
  brown:'#8B5E3C', 
  beige:'#D6C1A3', 
  blue:'#3B82F6', 
  green:'#10B981', 
  red:'#EF4444' 
};

export function normalizeColor(input?: string): string {
  if (!input) return 'unknown';
  const k = input.toLowerCase();
  return NAMED[k] ? k : 'unknown';
}

export function colorLabel(input?: string): string {
  const k = normalizeColor(input);
  return k === 'unknown' ? 'Neutrale kleur' : k[0].toUpperCase() + k.slice(1);
}