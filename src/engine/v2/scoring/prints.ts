import type { ScoredProduct, UserStyleProfile } from '../types';

const PRINT_MARKERS = [
  'print',
  'printed',
  'pattern',
  'patroon',
  'graphic',
  'floral',
  'bloemen',
  'stripe',
  'gestreept',
  'streep',
  'check',
  'ruit',
  'tartan',
  'camo',
  'animal',
  'leopard',
  'zebra',
  'logo',
  'allover',
  'stip',
  'dot',
  'polka',
];

const SUBTLE_PRINT_MARKERS = [
  'bloemen',
  'floral',
  'stip',
  'dot',
  'polka',
  'streep',
  'stripe',
  'gestreept',
  'ruit',
  'check',
  'tartan',
];

const LOUD_PRINT_MARKERS = [
  'graphic',
  'camo',
  'animal',
  'leopard',
  'zebra',
  'allover logo',
  'allover-logo',
  'all-over logo',
  'allover print',
];

function productText(product: ScoredProduct): string {
  return [
    product.product.name,
    product.product.description,
    ...(product.product.tags ?? []),
    ...(product.product.styleTags ?? []),
  ]
    .join(' ')
    .toLowerCase();
}

function matchesAny(text: string, markers: string[]): boolean {
  return markers.some((m) => text.includes(m));
}

export function scorePrints(
  product: ScoredProduct,
  profile: UserStyleProfile
): { score: number; reason: string } {
  if (!profile.prints) return { score: 0.7, reason: 'no_prints_pref' };
  const text = productText(product);
  const printed = matchesAny(text, PRINT_MARKERS);

  if (profile.prints === 'effen') {
    return printed
      ? { score: 0.25, reason: 'prints_effen_conflict' }
      : { score: 1.0, reason: 'prints_effen_match' };
  }
  if (profile.prints === 'statement') {
    return printed
      ? { score: 1.0, reason: 'prints_statement_match' }
      : { score: 0.55, reason: 'prints_statement_plain' };
  }
  if (profile.prints === 'subtiel') {
    if (!printed) {
      return { score: 0.65, reason: 'prints_subtiel_plain' };
    }
    if (matchesAny(text, LOUD_PRINT_MARKERS)) {
      return { score: 0.45, reason: 'prints_subtiel_too_loud' };
    }
    if (matchesAny(text, SUBTLE_PRINT_MARKERS)) {
      return { score: 1.0, reason: 'prints_subtiel_whitelist_match' };
    }
    return { score: 0.95, reason: 'prints_subtiel_match' };
  }
  return { score: 0.75, reason: 'prints_gemengd' };
}
