import { isAdultClothingProduct, classifyCategory } from './productFilter';
import { matchesColorSeason } from './colorSeasonFiltering';
import { deriveAthleticIntent as _deriveAthleticIntentFromEnricher } from './productEnricher';

export interface CleanProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  url: string;
  category: string;
  colors: string[];
  style: string;
  gender: string;
  description: string;
  retailer: string;
  tags: string[];
  athleticIntent?: number;
}

export interface ComposedOutfit {
  id: string;
  title: string;
  occasion: string;
  products: CleanProduct[];
  matchScore: number;
  image: string;
  explanation: string;
}

interface OccasionBlueprint {
  label: string;
  emoji: string;
  required: string[];
  optional: string[];
  preferredStyles: string[];
  priceFloor: number;
  formalityHint: 'casual' | 'smart' | 'formal';
  brandDiversity: boolean;
}

const OCCASION_BLUEPRINTS: Record<string, OccasionBlueprint> = {
  werk: {
    label: 'Werk',
    emoji: '💼',
    required: ['top', 'bottom', 'footwear'],
    optional: ['outerwear', 'accessory'],
    preferredStyles: ['smart-casual', 'luxury', 'casual'],
    priceFloor: 25,
    formalityHint: 'smart',
    brandDiversity: true,
  },
  weekend: {
    label: 'Weekend',
    emoji: '☀️',
    required: ['top', 'bottom', 'footwear'],
    optional: ['accessory'],
    preferredStyles: ['casual', 'casual-urban', 'streetwear'],
    priceFloor: 15,
    formalityHint: 'casual',
    brandDiversity: true,
  },
  casual: {
    label: 'Dagelijks',
    emoji: '🌿',
    required: ['top', 'bottom', 'footwear'],
    optional: ['outerwear'],
    preferredStyles: ['casual', 'smart-casual'],
    priceFloor: 15,
    formalityHint: 'casual',
    brandDiversity: true,
  },
  avond: {
    label: 'Avond uit',
    emoji: '🌙',
    required: ['top', 'bottom', 'footwear'],
    optional: ['accessory', 'outerwear'],
    preferredStyles: ['smart-casual', 'luxury'],
    priceFloor: 30,
    formalityHint: 'formal',
    brandDiversity: true,
  },
  date: {
    label: 'Date',
    emoji: '✨',
    required: ['top', 'bottom', 'footwear'],
    optional: ['accessory'],
    preferredStyles: ['smart-casual', 'luxury', 'casual'],
    priceFloor: 25,
    formalityHint: 'smart',
    brandDiversity: true,
  },
  sport: {
    label: 'Actief',
    emoji: '🏃',
    required: ['top', 'bottom', 'footwear'],
    optional: [],
    preferredStyles: ['athletic', 'sport', 'casual'],
    priceFloor: 15,
    formalityHint: 'casual',
    brandDiversity: false,
  },
  smart: {
    label: 'Smart Casual',
    emoji: '👔',
    required: ['top', 'bottom', 'footwear'],
    optional: ['outerwear', 'accessory'],
    preferredStyles: ['smart-casual', 'luxury'],
    priceFloor: 30,
    formalityHint: 'smart',
    brandDiversity: true,
  },
  relaxed: {
    label: 'Relaxed',
    emoji: '🛋️',
    required: ['top', 'bottom', 'footwear'],
    optional: [],
    preferredStyles: ['casual', 'casual-urban'],
    priceFloor: 15,
    formalityHint: 'casual',
    brandDiversity: false,
  },
};

const ARCHETYPE_OCCASIONS: Record<string, string[]> = {
  MINIMALIST:   ['werk', 'casual', 'weekend', 'smart', 'date', 'avond', 'relaxed'],
  CLASSIC:      ['werk', 'smart', 'avond', 'date', 'casual', 'weekend'],
  SMART_CASUAL: ['casual', 'werk', 'weekend', 'date', 'avond', 'smart', 'relaxed'],
  STREETWEAR:   ['weekend', 'casual', 'relaxed', 'avond', 'date'],
  ATHLETIC:     ['sport', 'casual', 'weekend', 'relaxed'],
  AVANT_GARDE:  ['avond', 'date', 'casual', 'weekend', 'smart'],
};

const FORMALITY_KEYWORDS: Record<string, RegExp[]> = {
  casual: [/t-shirt/i, /sneaker/i, /hoodie/i, /jogger/i, /sweater/i, /sweatshirt/i, /cargo/i, /denim/i],
  smart: [/overhemd/i, /blazer/i, /chino/i, /loafer/i, /polo/i, /derby/i, /brogue/i, /pantalon/i, /blouse/i],
  formal: [/kostuum/i, /smoking/i, /colbert/i, /pump/i, /oxford/i, /manchet/i, /stropdas/i],
};

function formalityScore(product: CleanProduct): number {
  const text = product.name.toLowerCase();
  let score = 0.5;
  for (const p of FORMALITY_KEYWORDS.formal) if (p.test(text)) score += 0.3;
  for (const p of FORMALITY_KEYWORDS.smart) if (p.test(text)) score += 0.15;
  for (const p of FORMALITY_KEYWORDS.casual) if (p.test(text)) score -= 0.1;
  return Math.max(0, Math.min(1, score));
}

function colorCompatibility(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0.5;
  const NEUTRAL = ['zwart', 'wit', 'grijs', 'beige', 'donkerblauw', 'navy', 'cream', 'taupe', 'bruin', 'ecru', 'off-white', 'antraciet', 'black', 'white', 'grey', 'blue'];
  const aIsNeutral = a.some(c => NEUTRAL.some(n => c.toLowerCase().includes(n)));
  const bIsNeutral = b.some(c => NEUTRAL.some(n => c.toLowerCase().includes(n)));
  if (aIsNeutral || bIsNeutral) return 0.85;
  const shared = a.filter(c => b.some(bc => bc.toLowerCase() === c.toLowerCase()));
  if (shared.length > 0) return 0.7;
  return 0.4;
}

function shuffleSeeded(arr: any[], seed: number): any[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export interface UserPreferences {
  fit?: string;
  prints?: string;
  goals?: string[];
  materials?: string[];
  occasions?: string[];
  colorProfile?: { season?: string; temperature?: string; value?: string; contrast?: string };
  budget?: { min: number; max: number };
}

const OCCASION_QUIZ_TO_COMPOSER: Record<string, string> = {
  work: 'werk',
  casual: 'casual',
  formal: 'avond',
  date: 'date',
  travel: 'relaxed',
  sport: 'sport',
};

function resolveOccasions(
  userOccasions: string[] | undefined,
  archetype: string,
): string[] {
  if (userOccasions && userOccasions.length > 0) {
    const mapped = userOccasions
      .map(o => OCCASION_QUIZ_TO_COMPOSER[o] || o)
      .filter(o => OCCASION_BLUEPRINTS[o]);
    if (mapped.length > 0) return mapped;
  }
  return ARCHETYPE_OCCASIONS[archetype] || ARCHETYPE_OCCASIONS.SMART_CASUAL;
}

function deriveAthleticIntent(p: CleanProduct): number {
  return _deriveAthleticIntentFromEnricher(p.brand, p.name, p.description, p.category);
}

export function composeOutfits(
  rawRows: Record<string, any>[],
  archetype: string,
  count: number,
  gender?: string,
  prefs?: UserPreferences,
): ComposedOutfit[] {
  const clean = rawRows.filter(isAdultClothingProduct);

  const products: CleanProduct[] = clean.map(r => {
    const base: CleanProduct = {
      id: r.id,
      name: r.name || r.title || '',
      brand: r.brand || '',
      price: typeof r.price === 'number' ? r.price : parseFloat(r.price) || 0,
      imageUrl: r.image_url || r.imageUrl || '',
      url: r.affiliate_url || r.product_url || '',
      category: classifyCategory(r),
      colors: Array.isArray(r.colors) ? r.colors : [],
      style: r.style || 'casual',
      gender: r.gender || 'unisex',
      description: r.description || '',
      retailer: r.retailer || '',
      tags: Array.isArray(r.tags) ? r.tags : [],
    };
    base.athleticIntent = deriveAthleticIntent(base);
    return base;
  }).filter(p => p.category !== 'other' && p.imageUrl && p.url);

  if (gender && gender !== 'unisex') {
    const genFiltered = products.filter(p => p.gender === gender || p.gender === 'unisex');
    if (genFiltered.length > 30) {
      products.length = 0;
      products.push(...genFiltered);
    }
  }

  const byCategory: Record<string, CleanProduct[]> = {};
  for (const p of products) {
    const cat = p.category === 'skirt' ? 'bottom' : p.category;
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(p);
  }

  const requiredCats = ['top', 'bottom', 'footwear'];
  for (const cat of requiredCats) {
    if (!byCategory[cat] || byCategory[cat].length < 2) {
      return [];
    }
  }

  const occasions = resolveOccasions(prefs?.occasions, archetype);
  const outfits: ComposedOutfit[] = [];
  const usedProductIds = new Set<string>();
  const usedTopBottomCombos = new Set<string>();

  for (let i = 0; i < count; i++) {
    const occasionKey = occasions[i % occasions.length];
    const blueprint = OCCASION_BLUEPRINTS[occasionKey] || OCCASION_BLUEPRINTS.casual;
    const prefSeed = (prefs?.fit?.length || 0) * 11
      + (prefs?.prints?.length || 0) * 17
      + (prefs?.goals?.length || 0) * 23
      + (prefs?.materials?.length || 0) * 29;
    const seed = i * 31 + archetype.length * 7 + (gender?.length || 3) * 13 + prefSeed;

    const outfit = buildOutfit(
      byCategory,
      blueprint,
      archetype,
      seed,
      usedProductIds,
      usedTopBottomCombos,
      i,
      prefs,
    );

    if (outfit) {
      outfits.push(outfit);
    }
  }

  return outfits;
}

function perItemCeiling(budget: { min: number; max: number } | undefined): number {
  if (!budget || budget.max <= 0) return Infinity;
  return budget.max * 1.35;
}

function budgetFilterPool(
  pool: CleanProduct[],
  itemCeiling: number,
): CleanProduct[] {
  if (itemCeiling === Infinity) return pool;
  const withinBudget = pool.filter(p => p.price <= itemCeiling);
  return withinBudget.length >= 2 ? withinBudget : pool;
}

function buildOutfit(
  byCategory: Record<string, CleanProduct[]>,
  blueprint: OccasionBlueprint,
  archetype: string,
  seed: number,
  usedIds: Set<string>,
  usedCombos: Set<string>,
  index: number,
  prefs?: UserPreferences,
): ComposedOutfit | null {
  const selected: CleanProduct[] = [];
  const selectedBrands = new Set<string>();
  const itemCeiling = perItemCeiling(prefs?.budget);

  for (const cat of blueprint.required) {
    let pool = (byCategory[cat] || []).filter(p => !usedIds.has(p.id) && p.price >= blueprint.priceFloor);
    pool = budgetFilterPool(pool, itemCeiling);
    if (pool.length === 0) {
      let fallbackPool = (byCategory[cat] || []).filter(p => !usedIds.has(p.id));
      fallbackPool = budgetFilterPool(fallbackPool, itemCeiling);
      if (fallbackPool.length === 0) return null;
      const pick = pickBest(fallbackPool, blueprint, archetype, seed + cat.length, selectedBrands, selected, prefs);
      if (!pick) return null;
      selected.push(pick);
      selectedBrands.add(pick.brand.toLowerCase());
      continue;
    }
    const pick = pickBest(pool, blueprint, archetype, seed + cat.length, selectedBrands, selected, prefs);
    if (!pick) return null;
    selected.push(pick);
    selectedBrands.add(pick.brand.toLowerCase());
  }

  const topId = selected.find(p => p.category === 'top')?.id || '';
  const bottomId = selected.find(p => p.category === 'bottom')?.id || '';
  const comboKey = `${topId}-${bottomId}`;
  if (usedCombos.has(comboKey)) {
    let altPool = (byCategory['bottom'] || [])
      .filter(p => !usedIds.has(p.id) && p.id !== bottomId && p.price >= blueprint.priceFloor);
    altPool = budgetFilterPool(altPool, itemCeiling);
    const altBottom = altPool
      .sort((a, b) => scoreProduct(b, blueprint, archetype, selectedBrands, selected, prefs) - scoreProduct(a, blueprint, archetype, selectedBrands, selected, prefs))[0];
    if (altBottom) {
      const idx = selected.findIndex(p => p.category === 'bottom');
      if (idx >= 0) selected[idx] = altBottom;
    }
  }

  const newComboKey = `${selected.find(p => p.category === 'top')?.id}-${selected.find(p => p.category === 'bottom')?.id}`;
  usedCombos.add(newComboKey);

  for (const cat of blueprint.optional) {
    let pool = (byCategory[cat] || []).filter(p =>
      !usedIds.has(p.id) && p.price >= blueprint.priceFloor
    );
    pool = budgetFilterPool(pool, itemCeiling);
    if (pool.length === 0) continue;
    const pick = pickBest(pool, blueprint, archetype, seed + cat.length * 3, selectedBrands, selected, prefs);
    if (pick) {
      selected.push(pick);
      selectedBrands.add(pick.brand.toLowerCase());
    }
  }

  for (const p of selected) usedIds.add(p.id);

  const totalPrice = selected.reduce((s, p) => s + p.price, 0);
  const coverProduct = selected.find(p => p.category === 'outerwear')
    || selected.find(p => p.category === 'top')
    || selected[0];

  const matchScore = calculateOutfitScore(selected, blueprint, archetype);
  const explanation = buildExplanation(selected, blueprint, archetype, prefs, totalPrice);

  return {
    id: `outfit-${archetype}-${blueprint.label}-${index}`,
    title: `${blueprint.label}`,
    occasion: blueprint.label,
    products: selected,
    matchScore: Math.round(matchScore),
    image: coverProduct?.imageUrl || '',
    explanation,
  };
}

function buildExplanation(
  products: CleanProduct[],
  blueprint: OccasionBlueprint,
  archetype: string,
  prefs?: UserPreferences,
  totalPrice?: number,
): string {
  const parts: string[] = [];
  const styleMatches = products.filter(p => blueprint.preferredStyles.includes(p.style));
  if (styleMatches.length > 0) {
    parts.push(`Past bij jouw ${archetype.replace('_', ' ').toLowerCase()} stijl`);
  }

  if (prefs?.fit) {
    const fitLabel: Record<string, string> = {
      slim: 'nauwsluitende',
      regular: 'reguliere',
      relaxed: 'relaxte',
      oversized: 'oversized',
    };
    parts.push(`afgestemd op een ${fitLabel[prefs.fit] || prefs.fit} pasvorm`);
  }

  if (prefs?.colorProfile) {
    const cp = prefs.colorProfile;
    const colorParts: string[] = [];
    const tempMap: Record<string, string> = { warm: 'warme', koel: 'koele', neutraal: 'neutrale' };
    const valMap: Record<string, string> = { licht: 'lichte', medium: 'middentoon', donker: 'diepe' };
    const conMap: Record<string, string> = { laag: 'laag contrast', medium: 'gemiddeld contrast', hoog: 'hoog contrast' };

    if (cp.temperature && tempMap[cp.temperature]) {
      colorParts.push(tempMap[cp.temperature] + ' tinten');
    }
    if (cp.value && valMap[cp.value]) {
      colorParts.push(valMap[cp.value] + ' kleuren');
    }
    if (cp.contrast && conMap[cp.contrast]) {
      colorParts.push(conMap[cp.contrast]);
    }

    if (colorParts.length > 0) {
      parts.push(`kleurkeuze op basis van jouw voorkeur voor ${colorParts.join(', ')}`);
    }
  }

  if (prefs?.budget && prefs.budget.max > 0 && totalPrice !== undefined) {
    const max = prefs.budget.max;
    if (totalPrice <= max) {
      parts.push(`binnen jouw budget van \u20AC${max} per stuk`);
    } else {
      parts.push(`let op: enkele items liggen boven jouw budget van \u20AC${max} door beperkte beschikbaarheid`);
    }
  }

  const occasionLabelMap: Record<string, string> = {
    'Werk': 'een werkdag', 'Smart Casual': 'smart-casual gelegenheden',
    'Weekend': 'het weekend', 'Dagelijks': 'dagelijks gebruik',
    'Avond uit': 'een avond uit', 'Date': 'een date',
    'Actief': 'een actieve dag', 'Relaxed': 'een relaxte dag',
    'Casual': 'dagelijks gebruik', 'Uitgaan': 'een avond uit',
    'Festival': 'festivals', 'Formeel': 'formele gelegenheden',
  };
  const occasionText = occasionLabelMap[blueprint.label];
  if (occasionText) {
    parts.push(`samengesteld voor ${occasionText}`);
  }

  if (prefs?.materials && prefs.materials.length > 0) {
    const matLabels: Record<string, string> = {
      denim: 'denim', leer: 'leer', katoen: 'katoen', linnen: 'linnen',
      wol: 'wol', kasjmier: 'kasjmier', tech: 'technische stoffen',
      fleece: 'fleece', canvas: 'canvas', zijde: 'zijde',
    };
    const labels = prefs.materials.slice(0, 2).map(m => matLabels[m] || m).filter(Boolean);
    if (labels.length > 0) {
      parts.push(`materiaalvoorkeur: ${labels.join(' en ')}`);
    }
  }

  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];
  if (brands.length >= 2) {
    parts.push(`met ${brands.slice(0, 2).join(' en ')}`);
  }

  if (parts.length === 0) {
    return `Samengesteld op basis van jouw ${archetype.replace('_', ' ').toLowerCase()} profiel.`;
  }

  const sentence = parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
    + (parts.length > 1 ? ', ' + parts.slice(1).join(' en ') : '')
    + '.';
  return sentence;
}

function pickBest(
  pool: CleanProduct[],
  blueprint: OccasionBlueprint,
  archetype: string,
  seed: number,
  selectedBrands: Set<string>,
  existingProducts: CleanProduct[],
  prefs?: UserPreferences,
): CleanProduct | null {
  if (pool.length === 0) return null;

  const scored = pool
    .map(p => ({ p, score: scoreProduct(p, blueprint, archetype, selectedBrands, existingProducts, prefs) }))
    .sort((a, b) => b.score - a.score);

  const topTier = scored.slice(0, Math.max(5, Math.ceil(scored.length * 0.15)));
  const idx = ((seed * 16807) % 2147483647) % topTier.length;
  return topTier[Math.abs(idx)]?.p || scored[0]?.p || null;
}

const FIT_KEYWORDS: Record<string, RegExp[]> = {
  slim: [/slim/i, /skinny/i, /fitted/i, /tailored/i, /nauwsluitend/i],
  regular: [/regular/i, /classic/i, /standaard/i, /normaal/i],
  relaxed: [/relaxed/i, /loose/i, /comfort/i, /ruim/i, /easy/i],
  oversized: [/oversized/i, /oversize/i, /extra\s*ruim/i, /wide/i, /baggy/i],
};

const MATERIAL_KEYWORDS: Record<string, RegExp[]> = {
  katoen: [/katoen/i, /cotton/i],
  wol: [/wol/i, /wool/i, /merino/i, /kasjmier/i, /cashmere/i],
  denim: [/denim/i, /jeans/i, /spijker/i],
  fleece: [/fleece/i],
  tech: [/tech/i, /nylon/i, /polyester/i, /stretch/i, /performance/i],
  linnen: [/linnen/i, /linen/i],
};

function scoreProduct(
  p: CleanProduct,
  blueprint: OccasionBlueprint,
  archetype: string,
  selectedBrands: Set<string>,
  existingProducts: CleanProduct[],
  prefs?: UserPreferences,
): number {
  let score = 0;

  const styleIdx = blueprint.preferredStyles.indexOf(p.style);
  if (styleIdx === 0) score += 30;
  else if (styleIdx === 1) score += 20;
  else if (styleIdx >= 2) score += 10;
  else score += 3;

  const blueprintWantsAthletic = blueprint.preferredStyles.includes('athletic');
  const intent = p.athleticIntent ?? 0;
  if (blueprintWantsAthletic && intent > 0) {
    score += Math.round(intent * 35);
  } else if (!blueprintWantsAthletic && intent >= 0.8) {
    score -= 15;
  }

  const formality = formalityScore(p);
  const targetFormality = blueprint.formalityHint === 'formal' ? 0.8 : blueprint.formalityHint === 'smart' ? 0.6 : 0.3;
  score += (1 - Math.abs(formality - targetFormality)) * 15;

  if (blueprint.brandDiversity && selectedBrands.has(p.brand.toLowerCase())) {
    score -= 20;
  }

  if (existingProducts.length > 0) {
    const avgColorCompat = existingProducts.reduce((s, ep) =>
      s + colorCompatibility(p.colors, ep.colors), 0
    ) / existingProducts.length;
    score += avgColorCompat * 15;
  }

  const ARCHETYPE_BRAND_BOOST: Record<string, RegExp[]> = {
    MINIMALIST: [/COS/i, /ARKET/i, /Uniqlo/i, /\bNN07\b/i, /Drykorn/i, /Filippa K/i],
    CLASSIC: [/Boss/i, /Profuomo/i, /Cavallaro/i, /Genti/i, /Giorgio/i, /Olymp/i, /Xacus/i, /Pierre cardin/i],
    SMART_CASUAL: [/Cast iron/i, /PME/i, /Vanguard/i, /State of art/i, /Blue industry/i],
    STREETWEAR: [/Puma/i, /Replay/i, /Denham/i, /Nubikk/i],
    ATHLETIC: [/Nike/i, /Adidas/i, /Puma/i, /New Balance/i, /Reebok/i, /Under Armour/i, /Asics/i],
    AVANT_GARDE: [/Mart Visser/i, /Drykorn/i],
  };

  const boosts = ARCHETYPE_BRAND_BOOST[archetype] || [];
  if (boosts.some(r => r.test(p.brand))) score += 12;

  if (p.price >= 40 && p.price <= 200) score += 5;
  if (p.price >= 60 && p.price <= 150) score += 3;

  if (prefs) {
    const text = `${p.name} ${p.description}`.toLowerCase();

    if (prefs.fit && FIT_KEYWORDS[prefs.fit]) {
      const fitMatch = FIT_KEYWORDS[prefs.fit].some(r => r.test(text));
      if (fitMatch) score += 18;
    }

    if (prefs.materials && prefs.materials.length > 0) {
      for (const mat of prefs.materials) {
        const matPatterns = MATERIAL_KEYWORDS[mat];
        if (matPatterns && matPatterns.some(r => r.test(text))) {
          score += 10;
          break;
        }
      }
    }

    if (prefs.prints) {
      if (prefs.prints === 'effen' && /effen|uni|solid|plain/i.test(text)) score += 8;
      else if (prefs.prints === 'subtiel' && /stripe|streep|dots|stip|geruit|check/i.test(text)) score += 8;
      else if (prefs.prints === 'statement' && /print|patroon|floral|bloem|graphic/i.test(text)) score += 8;
    }

    if (prefs.goals && prefs.goals.length > 0) {
      if (prefs.goals.includes('timeless') && /classic|tijdloos|timeless|essential/i.test(text)) score += 6;
      if (prefs.goals.includes('trendy') && /trend|nieuw|new|2025|2026|season/i.test(text)) score += 6;
      if (prefs.goals.includes('comfort') && /comfort|soft|zacht|stretch|relax/i.test(text)) score += 6;
      if (prefs.goals.includes('professional') && /business|office|professioneel|kantoor/i.test(text)) score += 6;
    }

    if (prefs.budget && prefs.budget.max > 0) {
      const max = prefs.budget.max;
      if (p.price <= max) {
        score += 20;
        const ratio = p.price / max;
        if (ratio >= 0.3 && ratio <= 0.9) score += 10;
      } else {
        const overshoot = (p.price - max) / max;
        score -= 30 + Math.round(overshoot * 40);
      }
    }

    if (prefs.colorProfile?.season && p.colors.length > 0) {
      const cp = prefs.colorProfile as { season: string; temperature?: string; value?: string; contrast?: string };
      let bestColorScore = 0;
      for (const c of p.colors) {
        const result = matchesColorSeason(c, { season: cp.season } as any);
        if (!result.isAllowed) {
          score -= 25;
          break;
        }
        if (result.score > bestColorScore) bestColorScore = result.score;
      }
      score += bestColorScore * 20;

      if (cp.value === 'donker') {
        const hasDark = p.colors.some(c => /zwart|donker|dark|navy|bruin|chocolate|charcoal|burgundy|wine/i.test(c));
        if (hasDark) score += 8;
      } else if (cp.value === 'licht') {
        const hasLight = p.colors.some(c => /wit|licht|light|cream|ivory|pastel|beige|off-white|sand/i.test(c));
        if (hasLight) score += 8;
      }
    }
  }

  return score;
}

function calculateOutfitScore(
  products: CleanProduct[],
  blueprint: OccasionBlueprint,
  archetype: string,
): number {
  let score = 60;

  let styleMatches = products.filter(p => blueprint.preferredStyles.includes(p.style)).length;
  if (blueprint.preferredStyles.includes('athletic')) {
    styleMatches += products.filter(p =>
      !blueprint.preferredStyles.includes(p.style) && (p.athleticIntent ?? 0) >= 0.5
    ).length;
  }
  score += (Math.min(styleMatches, products.length) / products.length) * 15;

  const brands = new Set(products.map(p => p.brand.toLowerCase()));
  const diversityRatio = brands.size / products.length;
  score += diversityRatio * 10;

  const allColors = products.flatMap(p => p.colors);
  const NEUTRAL = ['zwart', 'wit', 'grijs', 'beige', 'donkerblauw', 'navy', 'cream', 'taupe', 'bruin', 'black', 'white', 'grey'];
  const neutralCount = allColors.filter(c => NEUTRAL.some(n => c.toLowerCase().includes(n))).length;
  const neutralRatio = allColors.length > 0 ? neutralCount / allColors.length : 0.5;
  if (neutralRatio >= 0.5 && neutralRatio <= 0.85) score += 8;
  else if (neutralRatio > 0.85) score += 4;

  const hasAllRequired = blueprint.required.every(cat =>
    products.some(p => p.category === cat || (cat === 'bottom' && p.category === 'skirt'))
  );
  if (hasAllRequired) score += 7;

  return Math.min(98, Math.max(55, Math.round(score)));
}
