/**
 * De naam van een product zoals een bezoeker hem leest.
 *
 * De feeds leveren ruwe titels: "Shirt KARL LAGERFELD Men color White",
 * "H & M - Easy iron-overhemd - Slim Fit - Donkergrijs", "PME Legend | Heren |
 * Twin Wasp Chino Groen". De kaarten tonen het merk al apart, dus de nette naam
 * laat het merk, het geslacht en de maat weg en zet een Engels type en een
 * Engelse kleur om naar het Nederlands.
 *
 * Alleen voor weergave. De engine, de classifier en het vangnet lezen de ruwe
 * naam ("Suit", "Top", "Sandal", "MAMA"); die blijft dus ongemoeid.
 */

export interface NaamBron {
  name?: string | null;
  brand?: string | null;
}

/** Giglio: het type in het Engels; bij "Woman" is een shirt een blouse. */
const TYPE: Record<string, string> = {
  't-shirt': 'T-shirt', sneakers: 'Sneakers', sweater: 'Trui', sweatshirt: 'Sweater', pants: 'Broek',
  trousers: 'Broek', jacket: 'Jas', coat: 'Jas', shirt: 'Overhemd', jeans: 'Jeans', dress: 'Jurk',
  'mini dress': 'Minijurk', polo: 'Polo', 'polo shirt': 'Polo', top: 'Top', 'shoulder bag': 'Schoudertas',
  sunglasses: 'Zonnebril', skirt: 'Rok', 'mini skirt': 'Minirok', 'mini bag': 'Mini-tas',
  'heeled sandal': 'Sandalen met hak', 'heeled boots': 'Laarzen met hak', handbag: 'Handtas',
  wallet: 'Portemonnee', shorts: 'Short', boots: 'Laarzen', boot: 'Laarzen', 'ankle boots': 'Enkellaarzen',
  hat: 'Hoed', belt: 'Riem', pump: 'Pumps', jewel: 'Sieraad', loafers: 'Loafers', loafer: 'Loafers',
  scarf: 'Sjaal', 'neck scarf': 'Sjaal', 'ballet flat': "Ballerina's", backpack: 'Rugzak',
  'crossbody bag': 'Crossbodytas', 'tote bag': 'Shopper', shoes: 'Schoenen', 'brogue shoes': 'Brogues',
  'travel bag': 'Reistas', tie: 'Stropdas', 'neck tie': 'Stropdas', 'suit vest': 'Gilet', waistcoat: 'Gilet',
  sandals: 'Sandalen', 'flat shoes': 'Platte schoenen', clutch: 'Clutch', espadrille: 'Espadrilles',
  cardigan: 'Vest', blazer: 'Blazer', 'trench coat': 'Trenchcoat', hoodie: 'Hoodie',
  'flat sandal': 'Platte sandalen', 'fur coat': 'Bontjas', 'oxford shoe': 'Oxfords', gloves: 'Handschoenen',
  'belt bag': 'Heuptas', 'tank top': 'Tanktop', 'flat ankle boot': 'Platte enkellaarzen', 'pocket square': 'Pochet',
};

const KLEUR: Record<string, string> = {
  white: 'wit', black: 'zwart', grey: 'grijs', gray: 'grijs', 'dove grey': 'duifgrijs', beige: 'beige',
  navy: 'marineblauw', blue: 'blauw', 'light blue': 'lichtblauw', brown: 'bruin', 'dark brown': 'donkerbruin',
  tobacco: 'tabak', green: 'groen', red: 'rood', burgundy: 'bordeaux', pink: 'roze', yellow: 'geel',
  'yellow cream': 'crème', cream: 'crème', ecru: 'ecru', kaki: 'kaki', khaki: 'kaki', charcoal: 'antraciet',
  gold: 'goud', silver: 'zilver', nude: 'nude', violet: 'paars', purple: 'paars', orange: 'oranje',
  multicolor: 'meerkleurig', denim: 'denim', camel: 'camel', cognac: 'cognac', taupe: 'taupe', olive: 'olijf',
  dark: 'donker', ivory: 'ivoor', sand: 'zand', leather: 'leerkleur', fuchsia: 'fuchsia', 'sky blue': 'hemelsblauw',
  natural: 'naturel', pearl: 'parelwit', butter: 'botergeel', military: 'legergroen', wine: 'wijnrood', milk: 'melkwit',
  striped: 'gestreept', 'blush pink': 'poederroze', lilac: 'lila', peach: 'perzik', coffee: 'koffiebruin',
  'light grey': 'lichtgrijs', 'dark grey': 'donkergrijs', 'dark blue': 'donkerblauw', 'dark green': 'donkergroen',
  bordeaux: 'bordeaux', turquoise: 'turquoise', mint: 'mint', coral: 'koraal', 'off white': 'gebroken wit',
};

const GIGLIO = /^(.+?)\s+(?:Men|Woman|Women|Unisex)\s+color\s+(.+)$/i;

function eersteHoofdletter(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function giglio(naam: string, merk: string): string | null {
  const m = GIGLIO.exec(naam);
  if (!m || !merk) return null;
  const voorMerk = m[1];
  const plek = voorMerk.toLowerCase().lastIndexOf(merk.toLowerCase());
  if (plek <= 0) return null;
  const type = voorMerk.slice(0, plek).trim();
  const vrouw = /\bWom[ae]n\b/i.test(naam);
  const sleutel = type.toLowerCase();
  const typeNl = sleutel === 'shirt' && vrouw ? 'Blouse' : TYPE[sleutel] ?? eersteHoofdletter(type);
  const kleurRuw = m[2].replace(/\s+\d+$/, '').trim().toLowerCase();
  const kleur = KLEUR[kleurRuw] ?? kleurRuw;
  return `${typeNl}, ${kleur}`;
}

function hm(naam: string): string | null {
  const m = /^H\s*&\s*M\s*-\s*(.+)$/i.exec(naam);
  if (!m) return null;
  const delen = m[1].split(/\s+-\s+/).map((d) => d.trim()).filter(Boolean);
  if (delen.length === 0) return null;
  const [eerste, ...rest] = delen;
  return [eerste, ...rest.map((d) => d.toLowerCase())].join(', ');
}

function metDoelgroep(naam: string): string | null {
  const m = /^.+?\s*\|\s*(?:Heren|Dames|Unisex)\s*\|\s*(.+)$/i.exec(naam);
  return m ? m[1].trim() : null;
}

function puma(naam: string): string | null {
  if (!/^PUMA\s/.test(naam)) return null;
  const delen = naam.split(/\s*,\s*/);
  const kern = delen[0]
    .replace(/^PUMA\s+(?:x\s+)?/i, '')
    .replace(/\s+voor\s+(Heren|Dames|Kinderen)\b/i, '')
    .replace(/\s+uniseks\b/i, '')
    .trim();
  const kleur = delen.slice(1).find((d) => !/^Maat\b/i.test(d));
  return kleur ? `${kern}, ${kleur.toLowerCase()}` : kern;
}

export function toonNaam(p: NaamBron): string {
  const naam = String(p.name ?? '').trim();
  if (!naam) return '';
  const merk = String(p.brand ?? '').trim();
  return giglio(naam, merk) ?? hm(naam) ?? metDoelgroep(naam) ?? puma(naam) ?? naam;
}
