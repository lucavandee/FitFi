import { describe, expect, it } from 'vitest';
import { toonNaam } from '../productNaam';

// Echte namen uit de pool (15 oktober 2026). De kaart toont het merk apart,
// dus de nette naam laat het merk weg.
describe('toonNaam', () => {
  it('maakt van een Giglio-naam een Nederlandse naam zonder merk en geslacht', () => {
    expect(toonNaam({ name: 'Shirt KARL LAGERFELD Men color White', brand: 'Karl Lagerfeld' })).toBe('Overhemd, wit');
    expect(toonNaam({ name: 'Pants PT TORINO Men color Grey', brand: 'Pt Torino' })).toBe('Broek, grijs');
    expect(toonNaam({ name: 'Brogue Shoes RED WING Men color Black', brand: 'Red Wing' })).toBe('Brogues, zwart');
    expect(toonNaam({ name: 'Top MAX MARA Woman color Green', brand: 'Max Mara' })).toBe('Top, groen');
    expect(toonNaam({ name: 'Shirt MICHAEL KORS Woman color White', brand: 'Michael Kors' })).toBe('Blouse, wit');
    expect(toonNaam({ name: 'Jacket BOSS Men color Dove Grey', brand: 'Boss' })).toBe('Jas, duifgrijs');
    expect(toonNaam({ name: 'Sunglasses MARC JACOBS Men color Black 1', brand: 'Marc Jacobs' })).toBe('Zonnebril, zwart');
  });

  it('laat een onbekend type of een onbekende kleur staan', () => {
    expect(toonNaam({ name: 'Gilet MONCLER Men color Bluette', brand: 'Moncler' })).toBe('Gilet, bluette');
  });

  it('maakt van een H&M-naam een zin zonder merk', () => {
    expect(toonNaam({ name: 'H & M - Easy iron-overhemd - Slim Fit - Donkergrijs', brand: 'H & M' })).toBe(
      'Easy iron-overhemd, slim fit, donkergrijs'
    );
    expect(toonNaam({ name: 'H & M - Leren sandalen - Zwart', brand: 'H&M' })).toBe('Leren sandalen, zwart');
  });

  it('haalt het merk en de doelgroep uit een OFM-naam', () => {
    expect(toonNaam({ name: 'PME Legend | Heren | Twin Wasp Chino Groen', brand: 'Pme legend' })).toBe('Twin Wasp Chino Groen');
  });

  it('haalt merk, doelgroep en maat uit een PUMA-naam', () => {
    expect(toonNaam({ name: 'PUMA Speedcat Ballet leren schoenen voor Dames, Wit, Maat 38,5', brand: 'Puma' })).toBe(
      'Speedcat Ballet leren schoenen, wit'
    );
    expect(toonNaam({ name: 'PUMA Tackle uniseks sneakers, Wit, Maat 38', brand: 'Puma' })).toBe('Tackle sneakers, wit');
    // Een samenwerking: "PUMA x HYROX" wordt niet "x HYROX".
    expect(toonNaam({ name: 'PUMA x HYROX DRYELITE Warm-Up jack voor Heren, Zwart, Maat L', brand: 'Puma' })).toBe(
      'HYROX DRYELITE Warm-Up jack, zwart'
    );
  });

  it('laat een naam die het niet herkent ongemoeid', () => {
    expect(toonNaam({ name: 'Emblem Tech Jacket Light Grey', brand: 'Emblem' })).toBe('Emblem Tech Jacket Light Grey');
    expect(toonNaam({ name: '', brand: 'X' })).toBe('');
    expect(toonNaam({})).toBe('');
  });
});
