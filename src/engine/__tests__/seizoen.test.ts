import { describe, it, expect } from 'vitest';
import { seizoenVan, seizoenenBotsen } from '@/engine/productSafety';
describe('seizoen', () => {
  it('herkent winter en zomer', () => {
    expect(seizoenVan('Gevoerde winterlaars met bontvoering')).toBe('winter');
    expect(seizoenVan('Adidas shorts met bloemenprint')).toBe('zomer');
    expect(seizoenVan('OLYMP Modern Fit Dress Shirt Blauw')).toBe('allseason');
  });
  it('signaleert de botsing uit de screenshot', () => {
    expect(seizoenenBotsen(['Gevoerde winterlaars', 'Adidas shorts met bloemenprint'])).toBe(true);
  });
  it('laat normale combinaties met rust', () => {
    expect(seizoenenBotsen(['Barbour Schipperstrui', 'Levis 511 Slim Jeans', 'PUMA sneakers'])).toBe(false);
    expect(seizoenenBotsen(['Wollen trui', 'Nette pantalon', 'Leren schoen'])).toBe(false);
  });
});

import { pastInSeizoen } from '@/engine/productSafety';

/*
 * De stijl-agent keurde op 21 oktober 2026 herfstoutfits af met een
 * bandeaujurk, een jurk met broderie anglaise en een rotan clutch. Die woorden
 * stonden niet in de zomerlijst.
 */
describe('zomerstukken die de stijl-agent in oktober afkeurde', () => {
  for (const naam of [
    'H & M - Katoenen bandeaujurk - Wit',
    'H & M - Katoenen jurk met broderie anglaise - Wit',
    'H & M - Clutch van rotan - Naturel',
    'H & M - Rattan bag - Beige',
  ]) {
    it(`${naam} past niet in de herfst`, () => expect(pastInSeizoen(naam, 'autumn')).toBe(false));
  }

  it('laat herfststukken staan', () => {
    expect(pastInSeizoen('H & M - Wollen jas - Camel', 'autumn')).toBe(true);
    expect(pastInSeizoen('H & M - Satijnen slipjurk - Zwart', 'autumn')).toBe(true);
  });
});
