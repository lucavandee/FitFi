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
