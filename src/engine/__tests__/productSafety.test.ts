import { describe, it, expect } from 'vitest';
import { beoordeelProduct } from '../productSafety';

const p = (name: string, category: string, sizes: string[] = []) =>
  beoordeelProduct({ name, category, sizes });

describe('vangnet: houdt tegen wat niet in een outfit hoort', () => {
  it('weigert woon- en decoratieartikelen die als kleding staan geregistreerd', () => {
    expect(p('H & M - Metalen Bijzettafel - Geel', 'top').ok).toBe(false);
    expect(p('H & M - Kleine keramieken vaas met reactief glazuur', 'top').ok).toBe(false);
    expect(p('H & M - Fleece plaid met dessin - Groen', 'top').ok).toBe(false);
  });

  it('weigert kinderkleding, ook als is_kids in de database false zegt', () => {
    expect(p('PUMA Essentials Minicats Crew set, Maat 2-4M', 'top').ok).toBe(false);
    expect(p('PUMA AC Milan KING Anthem jack, Geel, Maat 5-6Y', 'outerwear').ok).toBe(false);
    expect(p('Hello Kitty sneakers kind', 'footwear', ['25']).ok).toBe(false);
  });

  it('weigert peuterschoenen op maat', () => {
    expect(p('H & M - Warmgevoerde sneakers - Beige', 'footwear', ['24']).ok).toBe(false);
  });

  it('weigert ondergoed, ook in samenstellingen', () => {
    expect(p('PUMA 4KEEPS sportbh voor Dames, Zwart, Maat XS', 'top').ok).toBe(false);
    expect(p('PUMA CLOUDSPUN trainingsbeha voor Dames, Maat S', 'top').ok).toBe(false);
  });
});

describe('vangnet: gooit geen legitieme producten weg', () => {
  it('laat damesschoenen in maat 35 en 36 staan', () => {
    // EU 35 is een gewone damesmaat; een grens bij 35 zou deze wegfilteren.
    expect(p('Ballet Flat ACNE STUDIOS Woman color Silver', 'footwear', ['35']).ok).toBe(true);
    expect(p('Pump A. BOCCA Woman color Black', 'footwear', ['35']).ok).toBe(true);
    expect(p('PUMA Speedcat OG uniseks sneakers', 'footwear', ['36', '42']).ok).toBe(true);
  });

  it('laat Italiaanse herenmaten staan (maat 50 is geen kindermaat bij broeken)', () => {
    expect(p('Pants EMPORIO ARMANI Men color Blue', 'bottom', ['50']).ok).toBe(true);
  });

  it('laat gewone kleding staan', () => {
    expect(p('OLYMP | Heren | Luxor Modern Fit Dress Shirt Blauw', 'top', ['41']).ok).toBe(true);
    expect(p('Barbour Schipperstrui Donkerblauw', 'top', ['L']).ok).toBe(true);
    expect(p('Alberta Ferretti Dress Woman color Black', 'dress', ['38']).ok).toBe(true);
  });
});

/**
 * Toegevoegd 2026-08-07 na een meting tegen de live catalogus. Alle namen en
 * maatreeksen hieronder komen letterlijk uit die catalogus. Elk van deze drie
 * regels gooide legitieme producten weg, en de eerste blokkeerde de deploy.
 */
describe('vangnet: de drie vals-positieven uit de catalogusmeting', () => {
  it('laat schoenen met UK/US-maten staan, dat zijn geen kindermaten', () => {
    // Italist levert UK/US. Zonder ondergrens viel de hele reeks onder 34 en
    // werd dit als peuterschoen geweigerd: ~16% van de herenschoenenpool.
    const tods = ['7', '11', '9½', '10', '6', '6½', '9', '12', '8½', '10½', '8', '5'];
    expect(p("Loafers TOD'S Men color Brown", 'footwear', tods).ok).toBe(true);
    expect(p('Brogue Shoes CHURCHS Men color Tobacco', 'footwear', ['6', '8', '11']).ok).toBe(true);
    expect(p('Sneakers NIKE Woman color Black', 'footwear', ['5½', '7', '8½', '5', '9', '8', '6']).ok).toBe(true);
    expect(p('Boots UGG Woman color Green', 'footwear', ['5', '7', '9', '6', '8']).ok).toBe(true);
  });

  it('weigert nog steeds een reeks die volledig in de EU-kinderband valt', () => {
    expect(p('H & M - Sneakers - Wit', 'footwear', ['24', '25', '26']).ok).toBe(false);
    expect(p('Camper Peu Cami', 'footwear', ['28', '30', '32', '34']).ok).toBe(false);
  });

  it('laat een gemengde reeks staan, dat is een maatreeks en geen peuterschoen', () => {
    expect(p('Boots UGG Woman color Black', 'footwear', ['6', '39', '40', '5', '10', '37']).ok).toBe(true);
    expect(p('Sneaker', 'footwear', ['34', '35', '36']).ok).toBe(true);
  });

  it('laat slip-on, slip-in en slip-over staan', () => {
    // productClassifier kent /\bslip-on(s)?\b/ juist als FOOTWEAR; de oude
    // ondergoedregel sprak dat tegen.
    expect(p('H & M - Slip-in loafers - Geel', 'footwear', ['36', '38']).ok).toBe(true);
    expect(p('H & M - Slip-in sandaletten - Zwart', 'footwear', ['37']).ok).toBe(true);
    expect(p('Vans Classic Slip-On', 'footwear', ['42']).ok).toBe(true);
    expect(p('COS Slip-over van merinowol', 'top', ['M']).ok).toBe(true);
  });

  it('weigert nog steeds echt ondergoed', () => {
    expect(p('Sloggi dames slip', 'bottom', ['M']).ok).toBe(false);
    expect(p('Basic slipje katoen', 'bottom', ['S']).ok).toBe(false);
    expect(p('Heren slips 3-pack', 'bottom', ['L']).ok).toBe(false);
  });

  it('laat het jassenmerk Peuterey staan', () => {
    expect(p('Jacket PEUTEREY Men color Green', 'outerwear', ['48', '50']).ok).toBe(true);
    expect(p('Peuterey Down Jacket Woman', 'outerwear', ['40']).ok).toBe(true);
  });

  it('weigert nog steeds echte peuterartikelen', () => {
    expect(p('Peuterschoen met klittenband', 'footwear', ['22']).ok).toBe(false);
    expect(p('Sokken voor peuters', 'accessory', ['20']).ok).toBe(false);
  });
});
