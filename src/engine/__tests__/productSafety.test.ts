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

describe('vangnet: doelgroepkleding', () => {
  // Gevonden op 2026-09-28: het persona-harnas gaf GROEN terwijl "vrouw
  // minimalistisch" een MAMA-overhemdjurk in een werkoutfit kreeg. Categorie,
  // gender, budget en gelegenheid klopten allemaal; het item hoort er alleen
  // niet omdat de gebruiker niet zwanger is.
  it('weigert zwangerschaps- en voedingskleding', () => {
    for (const naam of [
      'H & M - MAMA Overhemdjurk met ceintuur - Zwart',
      'H & M - MAMA Before & After Mousseline overhemdblouse - Bruin',
      'H & M - MAMA Sport-voedingstop - Light support',
      'H & M - MAMA Wide jeans - Blauw',
    ]) {
      const v = beoordeelProduct({ name: naam });
      expect(v.ok, naam).toBe(false);
      expect(v.reden, naam).toBe('doelgroep');
    }
  });

  it('weigert ook de woorden die nu nog nul keer voorkomen', () => {
    // maternity, nursing en positiekleding staan op 0 in de catalogus, maar
    // zijn de juiste woorden zodra een andere aanbieder binnenkomt.
    for (const naam of ['Maternity jeans', 'Nursing top', 'Positiekleding jurk']) {
      expect(beoordeelProduct({ name: naam }).ok, naam).toBe(false);
    }
  });

  it('laat gewone kleding met een woordgrens-bijna-treffer staan', () => {
    // \bmama\b matcht bewust niet binnen een langer woord. Gemeten op de
    // catalogus: alle 2.033 treffers dragen MAMA als losse lijnprefix, nul
    // valse positieven. Een merknaam als Mamalicious komt er niet in voor;
    // de regel blijft daarom eng, conform de ontwerpregel bovenaan het bestand.
    expect(beoordeelProduct({ name: 'Mamalicious gebreide trui' }).ok).toBe(true);
    expect(beoordeelProduct({ name: 'H & M - Wollen polotrui - Regular Fit' }).ok).toBe(true);
    expect(beoordeelProduct({ name: 'H & M - Jurk van linnenmix - Wit' }).ok).toBe(true);
  });
});

describe('vangnet: tassen voor een baby (pool 21 okt 2026)', () => {
  it('weigert een luiertas en een luieretui', () => {
    expect(p('H & M - Luiertas van mousseline - Lichtbeige', 'accessory')).toEqual({ ok: false, reden: 'doelgroep' });
    expect(p('H & M - Luiertas van bouclé - Roomwit', 'accessory').ok).toBe(false);
    expect(p('H & M - Corduroy luieretui - Lichtbeige', 'accessory').ok).toBe(false);
  });

  it('laat gewone tassen van dezelfde stof staan', () => {
    expect(p('H & M - Shopper van bouclé - Roomwit', 'accessory').ok).toBe(true);
    expect(p('H & M - Corduroy schoudertas - Lichtbeige', 'accessory').ok).toBe(true);
  });
});

describe('vangnet: kleding met een sjaal in de accessoire-sleuf (21 okt 2026)', () => {
  it('weigert kledingstukken die om de sjaal als accessoire staan', () => {
    for (const naam of [
      'H & M - Capribroek met sjaal - Zwart',
      'H & M - Caprilegging met sjaaldetail - Zwart',
      'H & M - Overhemdblouse met sjaal - Wit',
      'H & M - Jasje van twill met driehoekige sjaal - Lichtbeige',
      'H & M - Satijnen top met sjaal - Zwart',
    ]) {
      expect(p(naam, 'accessory'), naam).toEqual({ ok: false, reden: 'kleding-als-accessoire' });
    }
  });

  it('laat een tas met sjaal-look, een broekriem en merknamen met JEANS staan', () => {
    expect(p('H & M - Schoudertas met sjaal-look - Lichtbeige', 'accessory').ok).toBe(true);
    expect(p('H & M - Leren broekriem - Zwart', 'accessory').ok).toBe(true);
    expect(p('Neck Scarf VERSACE JEANS COUTURE Woman color Black', 'accessory').ok).toBe(true);
    expect(p('Scarf COMME DES GARÇONS SHIRT Men color Red', 'accessory').ok).toBe(true);
  });
});

describe('vangnet: kleding in de accessoire-sleuf', () => {
  it('weigert een broek die als accessoire getagd staat', () => {
    for (const naam of [
      'H & M - Pantalon met riem - Zwart',
      'H & M - Broek met riem - Relaxed Fit - Blauw',
    ]) {
      const v = beoordeelProduct({ name: naam, category: 'accessory' });
      expect(v.ok, naam).toBe(false);
      expect(v.reden, naam).toBe('kleding-als-accessoire');
    }
  });

  it('laat dezelfde broek staan als hij gewoon als bottom getagd is', () => {
    expect(beoordeelProduct({ name: 'H & M - Pantalon met riem - Zwart', category: 'bottom' }).ok).toBe(true);
  });

  it('laat accessoires met een merknaam staan die op kleding lijkt', () => {
    // Deze drie zijn de reden dat de regel eng is. Op een bredere variant met
    // jeans, jurk, rok en schoen waren 142 van de 170 treffers vals.
    for (const naam of [
      'Hat MOSCHINO JEANS Woman color Pink',
      'Sunglasses CALVIN KLEIN JEANS Men color Blue',
      'Neck Scarf VERSACE JEANS COUTURE Woman color Multicolor',
    ]) {
      expect(beoordeelProduct({ name: naam, category: 'accessory' }).ok, naam).toBe(true);
    }
  });

  it('laat een broekriem staan, want dat is wel een accessoire', () => {
    // \bbroek\b raakt "broekriem" niet: er zit geen woordgrens tussen.
    expect(beoordeelProduct({ name: 'Leren broekriem - Zwart', category: 'accessory' }).ok).toBe(true);
    expect(beoordeelProduct({ name: 'H & M - Leren riem met studs - Zwart', category: 'accessory' }).ok).toBe(true);
  });
});

describe('vangnet: kindermaten in de maatlijst (catalogusmeting 13 okt 2026)', () => {
  // Deze producten stonden in de pool van de site met gender male of female
  // en is_kids false. De naam zegt niets; alleen de maat verraadt het kind.
  it('weigert kleding met een leeftijd tussen haakjes', () => {
    expect(p('H & M - Katoenen T-shirt met print - Beige', 'top', ['122/128 (6-8Y)']).reden).toBe('kindermaat');
    expect(p('H & M - Romperjurk van mesh met borduursel - Wit', 'dress', ['50 (0-1M)']).reden).toBe('kindermaat');
    expect(p('H & M - Casual overhemd van katoenmix - Oranje', 'top', ['92 (1½-2Y)']).reden).toBe('kindermaat');
    expect(p('H & M - Waterafstotende gewatteerde parka - Groen', 'outerwear', ['170 (14Y+)']).reden).toBe('kindermaat');
  });

  it('weigert een kale leeftijdsmaat', () => {
    expect(p('PUMA FC St. Pauli derde shirt', 'top', ['2-3Y']).reden).toBe('kindermaat');
  });

  it('weigert een lengtepaar uit de kinderband', () => {
    expect(p('H & M - Twill pet met print - Blauw', 'accessory', ['122/140']).reden).toBe('kindermaat');
    expect(p('H & M - Vleermuiscape - Zwart/Vleermuis', 'outerwear', ['68/80']).reden).toBe('kindermaat');
  });

  it('weigert kinderschoenen in een dubbele maat', () => {
    expect(p('H & M - Hoge waterdichte sneakers - Donkerbeige', 'footwear', ['20/21']).reden).toBe('kinderschoenmaat');
  });

  it('laat volwassen maten staan', () => {
    expect(p('Jeans LEVI\'S Men color Blue', 'bottom', ['32/34']).ok).toBe(true);
    expect(p('H & M - Pantalon - Loose Fit - Zwart', 'bottom', ['52']).ok).toBe(true);
    expect(p('H & M - Blouse - Wit', 'top', ['M']).ok).toBe(true);
    expect(p('Boot SANTONI Men color Grey', 'footwear', ['9½']).ok).toBe(true);
    expect(p('H & M - Sokken - Zwart', 'accessory', ['39/42']).ok).toBe(true);
    expect(p('H & M - Sneakers - Wit', 'footwear', ['42/43']).ok).toBe(true);
    // Een dubbele volwassen maat ligt 2 uit elkaar; een kinderreeks minstens 6.
    expect(p('Jacket BOSS Men color Blue', 'outerwear', ['52/54']).ok).toBe(true);
  });
});
