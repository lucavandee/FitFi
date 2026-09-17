import { describe, expect, it } from 'vitest';
import { classifyProductDetailed } from '../productClassifier';
import { classifyProductRaw } from '../../../supabase/functions/_shared/productClassifier';

/**
 * Bewaking tegen driften tussen de twee kopieën van de classifier
 * (src/engine/productClassifier.ts voor de client, supabase/functions/_shared/
 * productClassifier.ts voor de Deno-kant, gebruikt door import-daisycon-feed
 * en backfill-categories). Plan 1 bouwde al een stopregel voor client vs.
 * product_attributes.category; dit is dezelfde soort bewaking, maar dan
 * tussen de twee CODE-kopieën onderling, voordat een van beide ooit een rij
 * classificeert.
 *
 * Vorm: geen bestandsgrootte- of hash-vergelijking (die gaat bij elke
 * commentaarwijziging af en wordt dan uitgezet, dus geen echte bewaking).
 * In plaats daarvan: dezelfde batterij van productnamen/merken door BEIDE
 * classifiers halen en de categorie vergelijken. Dat overleeft
 * comment-only wijzigingen en signaleert wél als de regeltabellen, de
 * merk-stripping, of de prioriteitsvolgorde uit elkaar gaan lopen.
 *
 * Bewuste uitsluiting, gevonden tijdens het bouwen van deze test (niet door
 * taak 0 veroorzaakt, hier gedocumenteerd i.p.v. stilzwijgend overgeslagen):
 * de Deno-kopie mist twee regels die de client wel heeft:
 *   1. de "kostuum"-regel in OUTERWEAR_RULES (client:
 *      src/engine/productClassifier.ts, regel ~155; Deno: afwezig).
 *   2. de shirt-context-uitsluiting voor de "oxford shirt"-regel in
 *      TOP_RULES en de bijbehorende footwear-oxford-uitsluiting (client:
 *      `hasShirtContext`; Deno: afwezig, classifyProductRaw kent dat
 *      concept niet).
 * Test cases die specifiek "kostuum" of een oxford+shirt-combinatie
 * bevatten zijn daarom bewust niet in de batterij opgenomen; dat zijn geen
 * blinde vlekken van deze test, maar bekende, niet-taak-0-gerelateerde
 * verschillen die hier expliciet benoemd staan zodat ze niet per ongeluk
 * als "de test dekt alles" worden gelezen.
 */
interface Geval {
  naam: string;
  beschrijving: string;
  categoryPath: string;
  merk: string;
}

const batterij: Geval[] = [
  // De tien merken met het merknaam-defect uit taak 0.
  { naam: 'Sweater TOMMY JEANS Men color Navy', beschrijving: '', categoryPath: '', merk: 'Tommy Jeans' },
  { naam: 'Sweater CALVIN KLEIN JEANS Men color Blue', beschrijving: '', categoryPath: '', merk: 'Calvin Klein Jeans' },
  { naam: 'Sweater MOSCHINO JEANS Woman color Black', beschrijving: '', categoryPath: '', merk: 'Moschino Jeans' },
  { naam: 'Sweater VERSACE JEANS COUTURE Men color Black', beschrijving: '', categoryPath: '', merk: 'Versace Jeans Couture' },
  { naam: 'Shirt JEAN PAUL GAULTIER Woman color White', beschrijving: '', categoryPath: '', merk: 'Jean Paul Gaultier' },
  { naam: 'Pants POLO RALPH LAUREN Woman color Blue', beschrijving: '', categoryPath: '', merk: 'Polo Ralph Lauren' },
  {
    naam: 'Boot MOON BOOT Men color Black',
    beschrijving: 'Boot MOON BOOT Men color Black',
    categoryPath: 'footwear',
    merk: 'Moon Boot',
  },
  {
    naam: 'Ballet Flat MOON BOOT Woman color Black',
    beschrijving: 'Ballet Flat MOON BOOT Woman color Black',
    categoryPath: 'footwear',
    merk: 'Moon Boot',
  },
  { naam: 'Jeans ICON DENIM LOS ANGELES Woman color Blue', beschrijving: '', categoryPath: '', merk: 'Icon Denim Los Angeles' },
  { naam: 'Jeans DENIM X ALEXANDER WANG Woman color Blue', beschrijving: '', categoryPath: '', merk: 'Denim X Alexander Wang' },
  { naam: 'T-Shirt COMME DES GARÇONS SHIRT Men color White', beschrijving: '', categoryPath: '', merk: 'Comme Des Garçons Shirt' },
  // Grensgevallen op leesteken/accent (fixronde 1 en 2).
  { naam: 'Sweater JEANS CO. Men color Black', beschrijving: '', categoryPath: '', merk: 'Jeans Co.' },
  { naam: 'Sweater JEANS CO- Men color Black', beschrijving: '', categoryPath: '', merk: 'Jeans Co-' },
  { naam: "Sweater JEANS CO' Men color Black", beschrijving: '', categoryPath: '', merk: "Jeans Co'" },
  { naam: 'Sweater JEANS CAFÉ Men color Black', beschrijving: '', categoryPath: '', merk: 'Jeans Café' },
  // Algemene producten zonder merk-defect, over de zes hoofdcategorieën en
  // jumpsuit heen, om te toetsen dat de gewone regeltabellen ook zonder
  // merk in de pas lopen.
  { naam: 'Nike Sportswear Club T-Shirt', beschrijving: '', categoryPath: '', merk: 'Nike' },
  { naam: "Levi's 501 Jeans", beschrijving: '', categoryPath: '', merk: "Levi's" },
  { naam: 'PUMA Anzarun Lite sportschoenen, Zwart/Wit, Maat 40', beschrijving: '', categoryPath: '', merk: 'Puma' },
  { naam: 'Acne Studios Jacket Men color Blue', beschrijving: '', categoryPath: '', merk: 'Acne Studios' },
  { naam: 'H & M - Jurk van linnenmix - Zwart', beschrijving: '', categoryPath: '', merk: 'H&M' },
  { naam: 'Denim jumpsuit', beschrijving: '', categoryPath: '', merk: '' },
  { naam: 'Nike Handschoenen Zwart', beschrijving: '', categoryPath: '', merk: 'Nike' },
  { naam: 'Bjorn Borg | Heren | Boxershorts Multicolor', beschrijving: '', categoryPath: '', merk: 'Bjorn Borg' },
];

describe('client- en Deno-classifier blijven het eens (bewaking tegen driften)', () => {
  it.each(batterij)('"$naam" (merk: "$merk") geeft dezelfde categorie in beide kopieën', ({ naam, beschrijving, categoryPath, merk }) => {
    const client = classifyProductDetailed(naam, beschrijving, categoryPath, merk);
    const deno = classifyProductRaw(naam, beschrijving, categoryPath, merk);
    expect(deno.category).toBe(client.category);
  });
});
