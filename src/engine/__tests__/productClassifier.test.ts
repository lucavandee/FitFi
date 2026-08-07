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

  it('weert een prematch shirt uit outfits (voetbaltenue)', () => {
    // Deze test verwachtte 'top', maar 'prematch' staat in REJECT_REGEX omdat
    // FitFi voetbaltenues bewust buiten outfits houdt (net als thuisshirt,
    // uitshirt, voetbalbroek). Test en productbeslissing spraken elkaar tegen;
    // de productbeslissing wint. De TOP-regel voor prematch is daarmee
    // onbereikbaar, maar blijft staan voor het geval de rejectlijst verandert.
    expect(cat('Nike Netherlands Prematch Shirt 2025')).toBe('other');
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

// ─── DRESS: valse vriendjes ────────────────────────────────────────────────
// Regressietest voor de bug die 20 herenoverhemden in de jurk-categorie zette
// (OLYMP, Profuomo, Xacus in de live catalogus, augustus 2026). Het generieke
// /\bdress\b/ scoorde gewicht 3 en versloeg het generieke /\bshirt\b/ (2).
describe('DRESS false friends', () => {
  it('classifies a mens dress shirt as top, not dress', () => {
    expect(cat('OLYMP | Heren | Luxor 24/7 Modern Fit Dress Shirt Blauw')).toBe('top');
    expect(cat('Profuomo | Heren | Dress Shirt Blauw')).toBe('top');
    expect(cat('Xacus | Heren | Linnen Dress Shirt Blauw')).toBe('top');
  });

  it('does not classify dress shoes as dress', () => {
    expect(cat('Van Bommel Dress Shoes Zwart')).not.toBe('dress');
  });

  it('does not classify dress pants as dress', () => {
    expect(cat('Hugo Boss Dress Pants Grijs')).not.toBe('dress');
  });

  it('still classifies a real dress as dress', () => {
    expect(cat('Alberta Ferretti Dress Woman color Black')).toBe('dress');
    expect(cat('H & M - Mesh jurk met borduursel - Wit')).toBe('dress');
    expect(cat('Adidas Originals Dress Woman color Black')).toBe('dress');
  });

  it('keeps shirt dress and shirtjurk as dress', () => {
    expect(cat('Zara Shirt Dress Beige')).toBe('dress');
    expect(cat('Only Shirtjurk Zwart')).toBe('dress');
  });

  it('keeps other dress subtypes as dress', () => {
    expect(cat('Maxi Dress Bloemenprint')).toBe('dress');
    expect(cat('Cocktail Dress Zwart')).toBe('dress');
    expect(cat('Wrap Dress Groen')).toBe('dress');
  });
});

// ─── BOTTOM: Nederlandse retailwoorden ─────────────────────────────────────
// Gevonden in de red-team audit van 2026-08-04. Als de NAAM nergens op matcht,
// valt de classifier terug op de beschrijving en bepaalt marketingtekst de
// categorie: "trek je favoriete PUMA-sneakers erbij aan" maakte van een short
// een schoen, en de stofnaam "Single jersey" maakte van een legging een top.
describe('BOTTOM Dutch retail nouns', () => {
  it('classifies singular "short" as bottom', () => {
    expect(cat('PUMA CLRT relaxte uniseks short, Zwart, Maat L')).toBe('bottom');
    expect(cat('PUMA Scuderia Ferrari PM1 short voor Heren, Rood, Maat 4XL')).toBe('bottom');
  });

  it('classifies closed compounds ending in short as bottom', () => {
    expect(cat('PUMA Borussia Dortmund 25/26 keepersshort voor Heren')).toBe('bottom');
    expect(cat('PUMA trainingsshort voor Dames, Zwart')).toBe('bottom');
  });

  it('classifies "tight" as bottom', () => {
    expect(cat('PUMA Essentials Poly tight voor Dames, Zwart, Maat L')).toBe('bottom');
    expect(cat('Nike Pro Tights Dames')).toBe('bottom');
  });

  it('keeps the deliberate guard: short as adjective is not a bottom', () => {
    expect(cat('Nike Short Sleeve Training Shirt')).toBe('top');
    expect(cat('COS Overhemd met korte mouw')).toBe('top');
    expect(cat('Boss Short Trench Coat')).toBe('outerwear');
  });

  it('still classifies plural shorts as bottom', () => {
    expect(cat('Adidas Training Shorts Zwart')).toBe('bottom');
    expect(cat('Nike Korte Broek Heren')).toBe('bottom');
  });
});

// ─── Nederlandse gesloten samenstellingen ──────────────────────────────────
// \b kan niet binnen een samenstelling matchen, dus "bomberjack",
// "schipperstrui" en "sportschoenen" matchten op geen enkele regel. Die
// producten vielen terug op de beschrijving, waar marketingtekst de categorie
// bepaalde. Gevonden 2026-08-04; naam-only zonder match ging van 8,3% naar 5,0%.
describe('Dutch closed compounds', () => {
  it('classifies compound footwear', () => {
    expect(cat('PUMA Anzarun Lite sportschoenen, Zwart/Wit, Maat 40')).toBe('footwear');
    expect(cat('PUMA Speedcat Lovelace balletsneakers voor Dames')).toBe('footwear');
  });

  it('classifies compound outerwear', () => {
    expect(cat('PUMA T7 uniseks bomberjack, Zwart, Maat XL')).toBe('outerwear');
    expect(cat('PUMA Class Relaxed Pinnacle trainingsjack voor Heren')).toBe('outerwear');
  });

  it('classifies compound tops', () => {
    expect(cat('Barbour | Heren | Barbour Schipperstrui Donkerblauw')).toBe('top');
    expect(cat('PUMA Pure 3.0 golfpoloshirt voor Heren, Zwart')).toBe('top');
    expect(cat('Caroline Tensen Cecilia Tuniek Roze / Multi')).toBe('top');
  });

  it('classifies compound underwear', () => {
    expect(cat('Bjorn Borg | Heren | Boxershorts Multicolor')).toBe('underwear');
    expect(cat('PUMA 4KEEPS sportbh voor Dames, Zwart, Maat XS')).toBe('underwear');
    expect(cat('PUMA CLOUDSPUN trainingsbeha voor Dames, Maat S')).toBe('underwear');
  });

  it('keeps handschoenen out of footwear', () => {
    // Zonder de uitsluiting matcht "handschoenen" op \bschoen(en)\b, en
    // footwear staat vóór accessory in ORDERED_RULES en wint elk gelijkspel.
    expect(cat('Nike Handschoenen Zwart')).toBe('accessory');
    expect(cat('The North Face Gloves Black')).toBe('accessory');
  });

  it('keeps jacket and overshirt in outerwear', () => {
    expect(cat('Acne Studios Jacket Men color Blue')).toBe('outerwear');
    expect(cat('Alter Ego | Heren | Overshirt Bruin')).toBe('outerwear');
  });
});
