/**
 * Prompt en tool-schema van de stylist (spec 5.4, punt 2).
 *
 * Puur: geen Deno-globals, zodat vitest de inhoud kan testen. Verander je de
 * prompt of het schema, verhoog dan STYLIST_VERSION; dat maakt de cache in
 * outfit_sets automatisch ongeldig voor de oude versie.
 *
 * Afwijking t.o.v. de plantekst (taak-5-brief.md): de plantekst rendert in
 * kandidaatRegel geen enkel attribuut dat sinds taak 2 is vervallen
 * (is_fashion, gender, price_band, confidence, tagger_version stonden nooit
 * in kandidaatRegel, alleen in de oude testfixture). Er is dus niets weg te
 * laten uit de prompttekst zelf; alleen de testfixture in
 * __tests__/stylist-prompt.test.ts is aangepast naar de twaalf velden van
 * ProductAttrs (zie keten-types.ts).
 *
 * Elke regel in bouwSysteemPrompt komt overeen met een controle in
 * valideer-outfits.ts (taak 4):
 * - regel 1 (alleen bestaande ids, rol = categorie)  -> "onbekend id ..." en
 *   "rol ... klopt niet met categorie ..."
 * - regel 3 (compleetheid top+bottom+footwear of dress+footwear)  -> isCompleet
 * - regel 6 (geen twee outfits met dezelfde items)  -> "zelfde itemset als een
 *   eerdere outfit"
 * - regel 7 (budget per stuk)  -> "buiten budget: ... kost ..."
 * - regel 8 (nooit een afgewezen item)  -> "afgewezen item ..."
 * - regel 9 (samenhang), alleen het toetsbare deel: "geen sandalen bij work
 *   of formal"  -> controleerSamenhang. Het "geen zwemkleding"-deel is niet
 *   apart gecontroleerd: de classifier sluit zwemkleding al uit van de
 *   kandidatenlijst (is_fashion=false), dus dat deel is structureel gedekt
 *   vóór deze validator ooit een item ziet (zie het commentaar bij
 *   controleerSamenhang in valideer-outfits.ts). De rest van regel 9 (algemene
 *   samenhang op formaliteit/silhouet/kleurtemperatuur/patroon) heeft geen
 *   vaste drempel en is dus niet gecontroleerd.
 * - regel 10 (copy), het mechanisch toetsbare deel: em-dashes, de met naam
 *   genoemde buzzwoorden, een superlatievenlijst en de titel-lengte  ->
 *   controleerCopyRegels (fix 2, eindreview plan 3, 27 sept 2026). "Altijd
 *   Nederlands", "spreek de bezoeker aan met je en jij", "twee zinnen" en
 *   "beweringen die niet uit zijn keuzes volgen" zijn niet gecontroleerd: dat
 *   vraagt om tekstbegrip, niet om een patroonmatch.
 * Regel 2 (precies zes outfits), regel 4 (elke gelegenheid minstens een keer)
 * en regel 5 (geen twee outfits met dezelfde top of dezelfde dress, en sinds
 * de herreview van plan 3, 28 sept 2026: elke andere rol maximaal drie keer)
 * worden NIET door valideerOutfits() afgedwongen: die functie beoordeelt elke
 * outfit op zichzelf en kent de rest van de set niet. Dat is geen
 * inconsistentie in deze taak, maar een gat tussen taak 4 en taak 6:
 * valideerSet (taak 6b) dekt die drie set-brede regels, met sinds die
 * herreview ook het plafond van regel 5 (MAX_HERHALINGEN_PER_PRODUCT in
 * valideer-set.ts). Zonder dat plafond in de prompt zou het model niet weten
 * dat het bestaat en zouden herkansingen betaald worden op een regel die
 * nergens stond: dezelfde les als bij regel 9 en 10 (fix 2).
 */
import type { Gelegenheid, Kandidaat, TasteProfileInput } from './keten-types.ts';
import { AS_NAMEN, CATEGORIEEN, STYLIST_VERSION } from './keten-types.ts';

// Re-export zodat bestaande imports van STYLIST_VERSION uit dit bestand
// (scripts/keten/stylist-vul-cache.ts, de eigen test van dit bestand)
// ongewijzigd blijven werken. De waarde zelf staat sinds taak 7 in
// keten-types.ts (zie het commentaar daar): dat is het enige van de drie
// gedeelde bestanden zonder eigen imports, en dus het enige dat een
// src-bestand zonder allowImportingTsExtensions transitief kan meenemen.
export { STYLIST_VERSION };
export const TOOL_NAAM = 'lever_outfits';

export function bouwToolSchema(occasions: Gelegenheid[]): Record<string, unknown> {
  return {
    type: 'object',
    properties: {
      outfits: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Maximaal zes woorden, Nederlands, geen liggend streepje.' },
            occasion: { type: 'string', enum: [...occasions] },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product_id: { type: 'string', description: 'Een product_id uit de kandidatenlijst.' },
                  role: { type: 'string', enum: [...CATEGORIEEN] },
                },
                required: ['product_id', 'role'],
                additionalProperties: false,
              },
            },
            reason: {
              type: 'string',
              description:
                'Twee zinnen, Nederlands, spreekt de bezoeker aan met je en jij, verwijst naar iets concreets uit de items, geen liggend streepje.',
            },
          },
          required: ['title', 'occasion', 'items', 'reason'],
          additionalProperties: false,
        },
      },
    },
    required: ['outfits'],
    additionalProperties: false,
  };
}

export function bouwSysteemPrompt(): string {
  return [
    'Je bent de stylist van FitFi. Je stelt complete outfits samen uit een vaste kandidatenlijst voor een bezoeker die net zijn smaak heeft laten zien door outfits te kiezen en af te wijzen.',
    '',
    'Regels:',
    '1. Gebruik alleen product_ids uit de kandidatenlijst. Verzin geen ids en gebruik elk id in de rol die bij zijn categorie hoort.',
    '2. Lever precies zes outfits.',
    '3. Elke outfit is compleet: top + bottom + footwear, of dress + footwear. Outerwear en accessory zijn optioneel en komen hooguit een keer per outfit voor. Nooit een dress samen met een top of bottom.',
    '4. Elke gelegenheid uit het profiel komt minstens een keer voor als occasion.',
    '5. Geen twee outfits met dezelfde top of dezelfde dress. Elke andere rol (bottom, footwear, outerwear, accessory) mag wel herhalen, maar hetzelfde product komt in niet meer dan drie van de zes outfits voor.',
    '6. Geen twee outfits met precies dezelfde items.',
    '7. Elk item valt binnen het budget per stuk.',
    '8. Gebruik nooit een afgewezen item.',
    '9. Laat de outfit samenhangen op formaliteit, silhouet, kleurtemperatuur en patroon. Geen sandalen en geen zwemkleding bij work of formal.',
    '10. title en reason zijn copy die een bezoeker leest: altijd Nederlands, spreek de bezoeker aan met je en jij. title: maximaal zes woorden. reason: twee zinnen, noem iets concreets uit de items (merk, materiaal, kleur of pasvorm). Verboden: em-dashes (het liggend streepje), de woorden authentiek, uniek, game-changer en andere AI-buzzwoorden, superlatieven, en beweringen over de bezoeker die niet uit zijn keuzes volgen.',
    '',
    `Antwoord uitsluitend via de tool ${TOOL_NAAM}.`,
  ].join('\n');
}

const GESLACHT_LABEL: Record<TasteProfileInput['gender'], string> = {
  male: 'heren',
  female: 'dames',
  unisex: 'dames en heren (unisex)',
};

function asRegel(naam: string, waarde: string | number | null, confidence: number): string {
  const tekst = waarde === null || waarde === undefined ? 'onbekend' : String(waarde);
  const zeker = Number.isFinite(confidence) ? Math.round(confidence * 100) / 100 : 0;
  return `- ${naam}: ${tekst} (zekerheid ${zeker})`;
}

function kandidaatRegel(k: Kandidaat): string {
  const p = k.product;
  const a = k.attrs;
  const delen = [
    k.product_id,
    p.name,
    p.brand ?? 'merk onbekend',
    `${p.price} euro`,
    `formaliteit ${a.formality ?? '?'}`,
    a.silhouette ?? 'silhouet ?',
    a.color_temp ?? 'temperatuur ?',
    a.lightness ?? 'lichtheid ?',
    a.pattern ?? 'patroon ?',
    `kleuren: ${(a.colors ?? []).join(', ') || 'onbekend'}`,
    `materialen: ${(a.materials ?? []).join(', ') || 'onbekend'}`,
    `gelegenheden: ${(a.occasions ?? []).join(', ') || 'onbekend'}`,
  ];
  if (k.category === 'footwear') delen.push(`schoen: ${a.shoe_type ?? 'onbekend'}`);
  return `- ${delen.join(' | ')}`;
}

function voorbeeldRegels(ids: string[], perId: Map<string, Kandidaat>): string {
  if (ids.length === 0) return '- geen';
  return ids
    .map((id) => {
      const k = perId.get(id);
      return k ? `- ${id}: ${k.product.name}, ${k.product.brand ?? 'merk onbekend'}` : `- ${id}`;
    })
    .join('\n');
}

export function bouwGebruikersPrompt(
  profile: TasteProfileInput,
  kandidaten: Kandidaat[],
  vorigeFouten: string[]
): string {
  const perId = new Map<string, Kandidaat>();
  for (const k of kandidaten) perId.set(k.product_id, k);

  const perCategorie = new Map<string, Kandidaat[]>();
  for (const k of kandidaten) {
    const lijst = perCategorie.get(k.category) ?? [];
    lijst.push(k);
    perCategorie.set(k.category, lijst);
  }

  const delen: string[] = [];
  delen.push('## Harde feiten');
  delen.push(`- Voor wie: ${GESLACHT_LABEL[profile.gender]}`);
  delen.push(`- Gelegenheden: ${profile.occasions.join(', ')}`);
  delen.push(`- Budget per stuk: ${profile.budget_min} tot ${profile.budget_max} euro`);
  delen.push('');
  delen.push('## Smaak-assen (waarde, zekerheid 0 tot 1; onder 0.5 is onzeker)');
  for (const as of AS_NAMEN) {
    const w = profile.axes?.[as] ?? { value: null, confidence: 0 };
    delen.push(asRegel(as, w.value, w.confidence));
  }
  delen.push('');
  delen.push('## Gekozen items (voorbeelden van wat de bezoeker mooi vindt)');
  delen.push(voorbeeldRegels(profile.liked_product_ids ?? [], perId));
  delen.push('');
  delen.push('## Afgewezen items (nooit gebruiken)');
  delen.push(voorbeeldRegels(profile.disliked_product_ids ?? [], perId));
  delen.push('');
  delen.push('## Kandidaten (product_id | naam | merk | prijs | attributen)');
  for (const categorie of CATEGORIEEN) {
    const lijst = perCategorie.get(categorie) ?? [];
    delen.push(`### ${categorie} (${lijst.length})`);
    delen.push(lijst.length === 0 ? '- geen' : lijst.map(kandidaatRegel).join('\n'));
  }

  if (vorigeFouten.length > 0) {
    delen.push('');
    delen.push('## Fouten in de vorige poging');
    delen.push('Je vorige antwoord had deze fouten. Lever zes nieuwe outfits zonder deze fouten:');
    delen.push(vorigeFouten.map((f) => `- ${f}`).join('\n'));
  }

  delen.push('');
  delen.push(`Stel nu zes outfits samen en lever ze via ${TOOL_NAAM}.`);
  return delen.join('\n');
}
