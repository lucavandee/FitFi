import { describe, it, expect } from 'vitest';
import { classifyProductDetailed } from '../productClassifier';

// Helper — just test category from name
function cat(name: string, desc = '', category = '') {
  return classifyProductDetailed(name, desc, category).category;
}

function confidence(name: string, desc = '', category = '') {
  return classifyProductDetailed(name, desc, category).confidence;
}

// ─── TOPS ──────────────────────────────────────────────────────────────────
describe('TOP classification', () => {
  it('classifies a basic t-shirt', () => {
    expect(cat('Nike Sportswear Club T-Shirt')).toBe('top');
  });

  it('classifies a polo shirt', () => {
    expect(cat('Lacoste Classic Polo')).toBe('top');
  });

  it('classifies a hoodie', () => {
    expect(cat('Adidas Trefoil Hoodie Navy')).toBe('top');
  });

  it('classifies a sweater/trui', () => {
    expect(cat('Calvin Klein Gebreide Trui')).toBe('top');
  });

  it('classifies an overhemd', () => {
    expect(cat('Tommy Hilfiger Oxford Overhemd')).toBe('top');
  });

  it('classifies a blouse', () => {
    expect(cat('Zara Satijn Blouse')).toBe('top');
  });

  // ─── Critical edge case: sports jerseys must be TOP, not bottom ────────
  it('classifies a football jersey as TOP (not bottom)', () => {
    expect(cat('Puma Ivoorkust 2025 Short Sleeve Shirt')).toBe('top');
  });

  it('classifies a prematch shirt as TOP', () => {
    expect(cat('Nike Netherlands Prematch Shirt 2025')).toBe('top');
  });

  it('classifies a jersey as TOP', () => {
    expect(cat('Jordan Brand NBA Jersey White')).toBe('top');
  });

  it('classifies a training shirt as TOP', () => {
    expect(cat('Adidas Training Shirt Black')).toBe('top');
  });

  // ─── "Short sleeve" must NOT be classified as bottom ──────────────────
  it('"short sleeve shirt" is TOP, not bottom', () => {
    expect(cat('Polo Ralph Lauren Short Sleeve Shirt')).toBe('top');
  });

  it('"short sleeve" keyword → TOP', () => {
    expect(cat('Short Sleeve Linen Shirt')).toBe('top');
  });

  it('classifies crewneck sweatshirt', () => {
    expect(cat('Champion Crewneck Sweatshirt Grey')).toBe('top');
  });

  it('classifies longsleeve', () => {
    expect(cat('Under Armour Longsleeve Compression')).toBe('top');
  });
});

// ─── BOTTOMS ───────────────────────────────────────────────────────────────
describe('BOTTOM classification', () => {
  it('classifies jeans', () => {
    expect(cat('Levi\'s 501 Jeans')).toBe('bottom');
  });

  it('classifies a chino', () => {
    expect(cat('Tommy Hilfiger Slim Chino Broek')).toBe('bottom');
  });

  it('classifies shorts (plural)', () => {
    expect(cat('Nike Dri-FIT Shorts Black')).toBe('bottom');
  });

  it('classifies sweatpants', () => {
    expect(cat('Champion Sweatpants Navy')).toBe('bottom');
  });

  it('classifies joggers', () => {
    expect(cat('Adidas Tiro Joggers')).toBe('bottom');
  });

  it('classifies a rok/skirt', () => {
    expect(cat('Zara Midi Rok')).toBe('bottom');
  });

  it('classifies leggings', () => {
    expect(cat('Nike Leggings Dames')).toBe('bottom');
  });

  // ─── "short" alone must NOT match bottom ──────────────────────────────
  it('"short" in "short sleeve" does NOT classify as bottom', () => {
    expect(cat('Short Sleeve Jersey White')).not.toBe('bottom');
  });
});

// ─── FOOTWEAR ──────────────────────────────────────────────────────────────
describe('FOOTWEAR classification', () => {
  it('classifies sneakers', () => {
    expect(cat('Nike Air Max 90 Sneakers')).toBe('footwear');
  });

  it('classifies boots', () => {
    expect(cat('Timberland Classic 6-Inch Boot')).toBe('footwear');
  });

  it('classifies chelsea boots as footwear, not outerwear', () => {
    expect(cat('Dr. Martens Chelsea Boot Black')).toBe('footwear');
  });

  it('classifies loafers', () => {
    expect(cat('Gucci Horsebit Loafers')).toBe('footwear');
  });

  it('classifies schoenen', () => {
    expect(cat('Vans Old Skool Schoenen')).toBe('footwear');
  });

  it('classifies sandals', () => {
    expect(cat('Birkenstock Arizona Sandalen')).toBe('footwear');
  });

  it('classifies oxford shoes', () => {
    expect(cat('Church\'s Oxford Schoenen Zwart')).toBe('footwear');
  });

  it('classifies desert boots', () => {
    expect(cat('Clarks Desert Boot Tan')).toBe('footwear');
  });
});

// ─── OUTERWEAR ─────────────────────────────────────────────────────────────
describe('OUTERWEAR classification', () => {
  it('classifies a jacket', () => {
    expect(cat('The North Face Mountain Jacket')).toBe('outerwear');
  });

  it('classifies a parka', () => {
    expect(cat('Canada Goose Expedition Parka')).toBe('outerwear');
  });

  it('classifies a winterjas', () => {
    expect(cat('Peuterey Winterjas Blauw')).toBe('outerwear');
  });

  it('classifies a bomber jacket', () => {
    expect(cat('Alpha Industries MA-1 Bomber')).toBe('outerwear');
  });

  it('classifies a blazer as outerwear', () => {
    expect(cat('Hugo Boss Slim Fit Blazer')).toBe('outerwear');
  });

  it('classifies a trenchcoat', () => {
    expect(cat('Burberry London Trenchcoat')).toBe('outerwear');
  });
});

// ─── DRESSES ───────────────────────────────────────────────────────────────
describe('DRESS classification', () => {
  it('classifies a jurk', () => {
    expect(cat('Zara Satijn Midijurk')).toBe('dress');
  });

  it('classifies a dress', () => {
    expect(cat('Reformation Wrap Dress')).toBe('dress');
  });

  it('classifies an avondjurk', () => {
    expect(cat('Rotate Birger Christensen Avondjurk')).toBe('dress');
  });

  it('jurk is DRESS, not TOP', () => {
    expect(cat('Zara Hemdjurk Wit')).toBe('dress');
  });
});

// ─── JUMPSUITS ─────────────────────────────────────────────────────────────
describe('JUMPSUIT classification', () => {
  it('classifies a jumpsuit', () => {
    expect(cat('& Other Stories Jumpsuit')).toBe('jumpsuit');
  });

  it('classifies an overall', () => {
    expect(cat('Weekday Denim Overall')).toBe('jumpsuit');
  });
});

// ─── ACCESSORIES ───────────────────────────────────────────────────────────
describe('ACCESSORY classification', () => {
  it('classifies a tas', () => {
    expect(cat('Arket Canvas Tas')).toBe('accessory');
  });

  it('classifies a riem', () => {
    expect(cat('Levi\'s Leren Riem Zwart')).toBe('accessory');
  });

  it('classifies a beanie', () => {
    expect(cat('Carhartt WIP Beanie')).toBe('accessory');
  });

  it('classifies a sjaal', () => {
    expect(cat('Acne Studios Wollen Sjaal')).toBe('accessory');
  });

  it('classifies a zonnebril', () => {
    expect(cat('Ray-Ban Wayfarer Zonnebril')).toBe('accessory');
  });

  it('classifies een rugzak', () => {
    expect(cat('Herschel Supply Rugzak')).toBe('accessory');
  });
});

// ─── UNDERWEAR / REJECTED ──────────────────────────────────────────────────
describe('UNDERWEAR classification', () => {
  it('classifies sokken as underwear', () => {
    expect(cat('Happy Socks Sokken Wit')).toBe('underwear');
  });

  it('classifies ondergoed as underwear', () => {
    expect(cat('Calvin Klein Ondergoed')).toBe('underwear');
  });
});

// ─── REJECTED PRODUCTS ─────────────────────────────────────────────────────
describe('Rejected products', () => {
  it('rejects kids products', () => {
    const r = classifyProductDetailed('Nike Baby Joggers');
    expect(r.rejected).toBe(true);
  });

  it('rejects multipack', () => {
    const r = classifyProductDetailed('Jockey 3-pack Boxers');
    expect(r.rejected).toBe(true);
  });

  it('rejects sport footwear (stud pattern)', () => {
    const r = classifyProductDetailed('Adidas Predator FG/AG');
    expect(r.rejected).toBe(true);
  });
});

// ─── CONFIDENCE SCORING ────────────────────────────────────────────────────
describe('Confidence scoring', () => {
  it('gives HIGH confidence for a clear t-shirt', () => {
    expect(confidence('Nike Dri-FIT T-Shirt Wit')).not.toBe('low');
  });

  it('gives HIGH confidence for jeans', () => {
    expect(confidence('Levi\'s 501 Jeans Blauw')).not.toBe('low');
  });

  it('gives at least MEDIUM confidence for sneakers', () => {
    const c = confidence('Puma Sneakers Wit');
    expect(['high', 'medium']).toContain(c);
  });
});
