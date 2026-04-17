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
];

function hasPrint(product: ScoredProduct): boolean {
  const text = [
    product.product.name,
    product.product.description,
    ...(product.product.tags ?? []),
    ...(product.product.styleTags ?? []),
  ]
    .join(' ')
    .toLowerCase();
  return PRINT_MARKERS.some((m) => text.includes(m));
}

export function scorePrints(
  product: ScoredProduct,
  profile: UserStyleProfile
): { score: number; reason: string } {
  if (!profile.prints) return { score: 0.7, reason: 'no_prints_pref' };
  const printed = hasPrint(product);

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
    return printed
      ? { score: 0.7, reason: 'prints_subtiel_busy' }
      : { score: 0.9, reason: 'prints_subtiel_plain' };
  }
  return { score: 0.75, reason: 'prints_gemengd' };
}
