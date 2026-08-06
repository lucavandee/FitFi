import { describe, it, expect } from 'vitest';
import { seizoenVan, seizoenenBotsen } from '/Users/luc/Desktop/FitFi-clone/src/engine/productSafety';
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
