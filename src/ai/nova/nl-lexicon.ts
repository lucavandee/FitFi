export const COLORS = ['zwart','wit','blauw','donkerblauw','lichtblauw','groen','donkergroen','rood','beige','grijs','bruin','creme','crème','taupe'];
export const OCCASIONS = ['kantoor','werk','business casual','bruiloft','feest','date','festival','weekend','sport','vakantie','outdoor'];
export const CATEGORIES = ['broek','jeans','chino','jurk','rok','blouse','shirt','t-shirt','trui','sweater','jas','jacket','sneaker','laars','sjaal','tas'];
export const SEASONS = ['zomer','herfst','winter','lente'];
export const BUDGET_PATTERNS = [/(?:onder|tot|max)\s*€?\s*(\d{2,4})/];

// Synoniemen mapping voor betere herkenning
export const COLOR_SYNONYMS: Record<string, string[]> = {
  'zwart': ['black', 'donker'],
  'wit': ['white', 'licht', 'ecru'],
  'blauw': ['blue', 'navy', 'marine'],
  'groen': ['green', 'olijf', 'khaki'],
  'rood': ['red', 'bordeaux', 'wijn'],
  'beige': ['nude', 'zand', 'camel'],
  'grijs': ['gray', 'grey', 'antraciet'],
  'bruin': ['brown', 'cognac', 'chocolade']
};

export const OCCASION_SYNONYMS: Record<string, string[]> = {
  'werk': ['kantoor', 'business', 'professioneel', 'zakelijk'],
  'feest': ['party', 'uitgaan', 'avond', 'gala'],
  'casual': ['weekend', 'ontspannen', 'dagelijks', 'informeel'],
  'sport': ['gym', 'fitness', 'actief', 'training'],
  'formeel': ['chic', 'elegant', 'deftig', 'netjes']
};

export const CATEGORY_SYNONYMS: Record<string, string[]> = {
  'broek': ['pants', 'pantalon', 'lange broek'],
  'jurk': ['dress', 'jurkje'],
  'shirt': ['overhemd', 'bloes'],
  'trui': ['sweater', 'pullover', 'vest'],
  'jas': ['jacket', 'coat', 'mantel'],
  'schoenen': ['shoes', 'footwear']
};

// Helper functie voor synoniem matching
export function findColorMatch(input: string): string | undefined {
  const q = input.toLowerCase();
  
  // Direct match
  for (const color of COLORS) {
    if (q.includes(color)) return color;
  }
  
  // Synoniem match
  for (const [color, synonyms] of Object.entries(COLOR_SYNONYMS)) {
    if (synonyms.some(syn => q.includes(syn))) return color;
  }
  
  return undefined;
}

export function findOccasionMatch(input: string): string | undefined {
  const q = input.toLowerCase();
  
  // Direct match
  for (const occasion of OCCASIONS) {
    if (q.includes(occasion)) return occasion;
  }
  
  // Synoniem match
  for (const [occasion, synonyms] of Object.entries(OCCASION_SYNONYMS)) {
    if (synonyms.some(syn => q.includes(syn))) return occasion;
  }
  
  return undefined;
}

export function findCategoryMatch(input: string): string | undefined {
  const q = input.toLowerCase();
  
  // Direct match
  for (const category of CATEGORIES) {
    if (q.includes(category)) return category;
  }
  
  // Synoniem match
  for (const [category, synonyms] of Object.entries(CATEGORY_SYNONYMS)) {
    if (synonyms.some(syn => q.includes(syn))) return category;
  }
  
  return undefined;
}