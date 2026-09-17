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

// ─── Taak 0: de merknaam mag de categorie niet bepalen ─────────────────────
// products.name is de letterlijke feed-titel en bevat altijd het merk. Een
// merk met een categoriewoord erin ("Tommy Jeans", "Moon Boot") trok het
// product voorheen naar de verkeerde categorie: "Sweater TOMMY JEANS" werd
// bottom in plaats van top. Gevonden op de productiedatabase 2026-09-17,
// negen merken, 2.551 canonieke producten, 111 truien/hoodies op de
// broekpositie.
describe('Merk bepaalt de categorie niet meer', () => {
  it('sweater met een merk dat "Jeans" bevat wordt top, niet bottom', () => {
    expect(
      classifyProductDetailed('Sweater TOMMY JEANS Men color Navy', '', '', 'Tommy Jeans').category
    ).toBe('top');
  });

  it('hetzelfde kledingstuk met een merk zonder categoriewoord wordt ook top', () => {
    // Bewijst dat het niet "toevallig top" is: met of zonder categoriewoord
    // in het merk komt hetzelfde kledingstuk op dezelfde categorie uit.
    expect(
      classifyProductDetailed('Sweater TOMMY HILFIGER Men color Navy', '', '', 'Tommy Hilfiger').category
    ).toBe('top');
  });

  it('valt bij een merk-only signaal terug op categoryPath, niet stilletjes op de ongestripte naam', () => {
    // Zonder brand-parameter matcht de naam zelf op "jeans" en wordt bottom.
    // Dat is exact het defect: het bewijst dat het signaal echt uit het merk
    // komt en niet uit iets anders in de naam.
    const zonderBrand = classifyProductDetailed('Item DENIM JEANS CO Woman color Black', '', '', '');
    expect(zonderBrand.category).toBe('bottom');

    // Met brand gestript blijft er geen kledingstukwoord over ("Item ...
    // Woman color Black"). Een terugval die stilletjes de ongestripte naam
    // erbij pakt zou hier weer bottom geven: het defect is dan terug. De
    // functie valt in plaats daarvan terug op het onafhankelijke
    // categoryPath-veld (hier gezet op "footwear" om het verschil met zowel
    // "bottom" als "top" ondubbelzinnig te maken).
    const metBrand = classifyProductDetailed(
      'Item DENIM JEANS CO Woman color Black',
      '',
      'footwear',
      'Denim Jeans Co'
    );
    expect(metBrand.category).toBe('footwear');
    expect(metBrand.category).not.toBe('bottom');
  });

  it('Moon Boot-geval: merk beschrijft de juiste categorie en komt alleen daar in het product terug', () => {
    // "Ballet Flat MOON BOOT Woman color Black" heeft geen ander
    // kledingstukwoord dan "boot" uit de merknaam zelf ("ballet flat" matcht
    // op geen enkele regel). Zonder terugval zou dit product onclassificeerbaar
    // worden na het strippen van de naam. De beschrijving dupliceert in de
    // echte feed de naam en blijft ongestript, dus het footwear-signaal komt
    // via die terugval alsnog binnen. Gemeten: 95 van 95 Moon Boot-producten
    // stonden vóór deze fix op footwear; dat mag niet veranderen.
    const r = classifyProductDetailed(
      'Ballet Flat MOON BOOT Woman color Black',
      'Ballet Flat MOON BOOT Woman color Black',
      'footwear',
      'Moon Boot'
    );
    expect(r.category).toBe('footwear');
  });

  it('laat Polo Ralph Lauren-producten die nu al goed staan niet omslaan', () => {
    // Polo Ralph Lauren is het andere gemeten tegenvoorbeeld: 825 top, 90
    // accessory, 71 bottom, 32 outerwear, 23 dress, 12 footwear. Niet alles
    // wordt door "Polo" naar top getrokken, dus de fix mag die spreiding niet
    // plat slaan. Een broek met het merk erin moet bottom blijven.
    expect(
      classifyProductDetailed('Pants POLO RALPH LAUREN Woman color Blue', '', '', 'Polo Ralph Lauren').category
    ).toBe('bottom');
    // Een polo-shirt met het merk erin moet top blijven (het merk bevat zelf
    // ook "Polo", maar dat mag geen dubbel signaal geven of iets omgooien).
    expect(
      classifyProductDetailed('Polo Shirt POLO RALPH LAUREN Men color Black', '', '', 'Polo Ralph Lauren').category
    ).toBe('top');
  });

  it('vangt ook Jean Paul Gaultier: "Jean" matcht dezelfde jeans-regel als "Jeans"', () => {
    // Gevonden tijdens fixronde 1 (bevinding 2), niet in de brief se lijst
    // van negen merken: \bjeans?\b matcht ook het enkelvoud "Jean", dus
    // "Jean Paul Gaultier" heeft precies hetzelfde defect. 25 rijen op de
    // volledige catalogus: 19 bottom -> top, 5 bottom -> outerwear,
    // 1 bottom -> accessory, geen enkele regressie.
    expect(
      classifyProductDetailed('Shirt JEAN PAUL GAULTIER Woman color White', '', '', 'Jean Paul Gaultier').category
    ).toBe('top');
    expect(
      classifyProductDetailed('Blazer JEAN PAUL GAULTIER Woman color Denim', '', '', 'Jean Paul Gaultier').category
    ).toBe('outerwear');
    // Een echte broek met het merk erin moet bottom blijven.
    expect(
      classifyProductDetailed('Jeans JEAN PAUL GAULTIER Woman color Blue', '', '', 'Jean Paul Gaultier').category
    ).toBe('bottom');
  });

  // Fixronde 1, bevinding 1: stripBrand gebruikte \b aan het begin en eind
  // van de merknaam. \b eist een woordteken aan minstens één kant van de
  // grens; een merk dat eindigt op een leesteken of een accent heeft daar
  // geen woordteken (het leesteken/accent zelf niet, en de spatie erna ook
  // niet), dus \b matchte nooit en de merknaam werd stil niet gestript. Twee
  // echte merken hebben deze vorm: "Gallery Dept." en "Herschel Supply Co.".
  // Reproductie op de echte module (vóór de fix):
  //   classifyProductDetailed('Item SHIRT CO. Woman color Black', '', '', 'Shirt Co.')
  //   -> { category: 'top', ... } — het merkwoord "shirt" telde nog mee.
  describe('merken die eindigen op een leesteken of accent', () => {
    it('reproduceert het gemelde geval: "Shirt Co." mag niet meer als top-signaal meetellen', () => {
      // Zonder ander kledingstukwoord in de naam moet dit na de fix
      // onclassificeerbaar worden (geen signaal meer), niet stilletjes top
      // blijven via het ongestripte merkwoord "shirt".
      const r = classifyProductDetailed('Item SHIRT CO. Woman color Black', '', '', 'Shirt Co.');
      expect(r.category).not.toBe('top');
      expect(r.rejected).toBe(true);
    });

    it('punt aan het eind van het merk: "Jeans Co." mag een trui niet naar bottom trekken', () => {
      expect(
        classifyProductDetailed('Sweater JEANS CO. Men color Black', '', '', 'Jeans Co.').category
      ).toBe('top');
    });

    it('koppelteken aan het eind van het merk', () => {
      expect(
        classifyProductDetailed('Sweater JEANS CO- Men color Black', '', '', 'Jeans Co-').category
      ).toBe('top');
    });

    it('ampersand aan het eind van het merk', () => {
      expect(
        classifyProductDetailed('Sweater JEANS & Men color Black', '', '', 'Jeans &').category
      ).toBe('top');
    });

    it('apostrof aan het eind van het merk', () => {
      expect(
        classifyProductDetailed("Sweater JEANS CO' Men color Black", '', '', "Jeans Co'").category
      ).toBe('top');
    });

    it('geaccentueerde letter aan het eind van het merk', () => {
      // JS telt een letter met accent zonder de unicode-vlag niet als
      // woordteken, dus dit faalt op dezelfde manier als het leesteken-geval.
      expect(
        classifyProductDetailed('Sweater JEANS CAFÉ Men color Black', '', '', 'Jeans Café').category
      ).toBe('top');
    });

    it('de twee echte merken uit de melding stripen mechanisch correct', () => {
      expect(
        classifyProductDetailed('Hoodie GALLERY DEPT. Men color Black', '', '', 'Gallery Dept.').category
      ).toBe('top');
      expect(
        classifyProductDetailed('Sneakers HERSCHEL SUPPLY CO. Men color Black', '', '', 'Herschel Supply Co.').category
      ).toBe('footwear');
    });
  });
});
