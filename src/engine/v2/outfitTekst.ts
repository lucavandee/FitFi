/**
 * Titel en uitleg van een outfit, alleen uit wat er echt in zit.
 *
 * De titel beschrijft het hoofdstuk met zijn eigen kleur en de schoen:
 * "Witte trui, grijze broek en sneakers". De gelegenheid staat al als label
 * op de foto. De uitleg opent met de gelegenheid, noemt hooguit één feit dat
 * klopt (sneakers bij streetwear, licht bij licht, een gekozen materiaal) en
 * de totaalprijs. Zie de test voor wat er daarvoor stond.
 */
import { isDonker } from "./stijlPoort";

export interface TekstStuk {
  category: string;
  product: { id?: unknown; name?: string; colors?: string[]; price?: number | string; materials?: string[] };
}

type Lidwoord = "de" | "het";
interface Woord {
  woord: string;
  lidwoord: Lidwoord;
}

/** Zelfstandige naamwoorden per categorie, specifiek voor algemeen. */
const WOORDEN: Record<string, Array<[string, Woord]>> = {
  dress: [
    ["jurk", { woord: "jurk", lidwoord: "de" }],
    ["jumpsuit", { woord: "jumpsuit", lidwoord: "de" }],
    ["overall", { woord: "overall", lidwoord: "de" }],
  ],
  top: [
    ["coltrui", { woord: "coltrui", lidwoord: "de" }],
    ["trui", { woord: "trui", lidwoord: "de" }],
    ["sweatshirt", { woord: "sweater", lidwoord: "de" }],
    ["sweater", { woord: "sweater", lidwoord: "de" }],
    ["hoodie", { woord: "hoodie", lidwoord: "de" }],
    ["cardigan", { woord: "vest", lidwoord: "het" }],
    ["vest", { woord: "vest", lidwoord: "het" }],
    ["blouse", { woord: "blouse", lidwoord: "de" }],
    ["overhemd", { woord: "overhemd", lidwoord: "het" }],
    ["t-shirt", { woord: "T-shirt", lidwoord: "het" }],
    ["shirt", { woord: "shirt", lidwoord: "het" }],
    ["polo", { woord: "polo", lidwoord: "de" }],
    ["tanktop", { woord: "top", lidwoord: "de" }],
    ["topje", { woord: "top", lidwoord: "de" }],
    ["top", { woord: "top", lidwoord: "de" }],
    ["body", { woord: "body", lidwoord: "de" }],
  ],
  bottom: [
    ["jeans", { woord: "jeans", lidwoord: "de" }],
    ["joggers", { woord: "joggingbroek", lidwoord: "de" }],
    ["sweatpant", { woord: "joggingbroek", lidwoord: "de" }],
    ["joggingbroek", { woord: "joggingbroek", lidwoord: "de" }],
    ["cargobroek", { woord: "cargobroek", lidwoord: "de" }],
    ["cargo", { woord: "cargobroek", lidwoord: "de" }],
    ["spijkerbroek", { woord: "jeans", lidwoord: "de" }],
    ["pantalon", { woord: "pantalon", lidwoord: "de" }],
    ["chino", { woord: "chino", lidwoord: "de" }],
    ["legging", { woord: "legging", lidwoord: "de" }],
    ["short", { woord: "short", lidwoord: "de" }],
    ["broek", { woord: "broek", lidwoord: "de" }],
    ["rok", { woord: "rok", lidwoord: "de" }],
  ],
  outerwear: [
    ["blazer", { woord: "blazer", lidwoord: "de" }],
    ["colbert", { woord: "colbert", lidwoord: "het" }],
    ["jasje", { woord: "jasje", lidwoord: "het" }],
    ["jack", { woord: "jack", lidwoord: "het" }],
    ["bomber", { woord: "bomber", lidwoord: "de" }],
    ["parka", { woord: "parka", lidwoord: "de" }],
    ["coat", { woord: "jas", lidwoord: "de" }],
    ["mantel", { woord: "jas", lidwoord: "de" }],
    ["jas", { woord: "jas", lidwoord: "de" }],
  ],
};

/** Schoenen staan in het meervoud en zonder kleur in de titel. */
const SCHOENEN: Array<[string, string]> = [
  ["sneaker", "sneakers"],
  ["trainer", "sneakers"],
  ["laarsjes", "laarsjes"],
  ["laarzen", "laarzen"],
  ["laars", "laarzen"],
  ["boots", "boots"],
  ["loafer", "loafers"],
  ["instapper", "instappers"],
  ["mocassin", "mocassins"],
  ["pumps", "pumps"],
  ["sandal", "sandalen"],
  ["schoen", "schoenen"],
];

/** Kleuren die bij een de-woord een -e krijgen, met hun verbogen vorm. */
const VERBUIGING: Array<[string, string]> = [
  ["wit", "witte"],
  ["zwart", "zwarte"],
  ["grijs", "grijze"],
  ["blauw", "blauwe"],
  ["rood", "rode"],
  ["groen", "groene"],
  ["bruin", "bruine"],
  ["geel", "gele"],
  ["paars", "paarse"],
  ["kleurig", "kleurige"],
];
/** Kleuren die niet verbuigen. */
const ONVERBOGEN = ["beige", "roze", "oranje", "camel", "navy", "crème", "creme", "ecru", "taupe", "khaki", "kaki", "lila", "mint"];

/** De woorden in een naam, kleine letters, zonder leestekens. */
function tokens(naam: string): string[] {
  return naam
    .toLowerCase()
    .replace(/t-shirt/g, "tshirtmarker")
    .split(/[^a-zà-ÿ']+/)
    .map((t) => (t === "tshirtmarker" ? "t-shirt" : t))
    .filter(Boolean);
}

function zoekWoord(naam: string, category: string): Woord | null {
  const ts = tokens(naam);
  const lijsten = [WOORDEN[category] ?? [], ...Object.entries(WOORDEN).filter(([c]) => c !== category).map(([, l]) => l)];
  for (const lijst of lijsten) {
    for (const [stam, woord] of lijst) {
      if (ts.some((t) => t === stam || t.endsWith(stam))) return woord;
    }
  }
  return null;
}

function zoekSchoen(naam: string): string | null {
  const ts = tokens(naam);
  for (const [stam, woord] of SCHOENEN) {
    if (ts.some((t) => t.includes(stam))) return woord;
  }
  return null;
}

/** De kleur als bijvoeglijk naamwoord bij dit woord, of null als dat niet lukt. */
function kleurBij(colors: string[] | undefined, lidwoord: Lidwoord): string | null {
  const ruw = String(colors?.[0] ?? "").toLowerCase().split("/")[0].trim();
  if (!ruw) return null;
  if (ONVERBOGEN.some((k) => ruw === k || ruw.endsWith(k))) return ruw;
  const v = VERBUIGING.find(([basis]) => ruw.endsWith(basis));
  if (!v) return null;
  if (lidwoord === "het") return ruw;
  return ruw.slice(0, ruw.length - v[0].length) + v[1];
}

function benoem(s: TekstStuk): string | null {
  const woord = zoekWoord(s.product.name ?? "", s.category);
  if (!woord) return null;
  const kleur = kleurBij(s.product.colors, woord.lidwoord);
  return kleur ? `${kleur} ${woord.woord}` : woord.woord;
}

function hoofdletter(t: string): string {
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** "Witte trui, grijze broek en sneakers", of null als er niets te benoemen valt. */
export function outfitTitel(stukken: TekstStuk[]): string | null {
  const van = (cat: string) => stukken.find((s) => s.category === cat);
  const jurk = van("dress") ?? van("jumpsuit");
  const delen = (jurk ? [benoem(jurk)] : [van("top") && benoem(van("top")!), van("bottom") && benoem(van("bottom")!)]).filter(
    (d): d is string => Boolean(d)
  );
  const schoenStuk = van("footwear");
  const schoen = schoenStuk ? zoekSchoen(schoenStuk.product.name ?? "") : null;

  if (delen.length === 0) return null;
  if (!schoen) return hoofdletter(delen.join(" en "));
  if (delen.length === 1) return hoofdletter(`${delen[0]} met ${schoen}`);
  return hoofdletter(`${delen.slice(0, -1).join(", ")}, ${delen[delen.length - 1]} en ${schoen}`);
}

const OPENING: Record<string, string> = {
  casual: "Voor je vrije dag.",
  work: "Voor kantoor.",
  formal: "Voor een nette gelegenheid.",
  date: "Voor een avond uit.",
  travel: "Voor onderweg.",
  sport: "Om in te bewegen.",
  party: "Om uit te gaan.",
};

const STIJL_NAAM: Record<string, string> = { streetwear: "streetwear", athletic: "sportief" };

const MATERIAAL_IN_NAAM: Record<string, RegExp> = {
  katoen: /katoen/i,
  wol: /\bwol|wollen|wolmix|merino|kasjmier/i,
  denim: /denim|jeans|spijker/i,
  leer: /\bleer|\bleren\b|leather/i,
  linnen: /linnen/i,
  zijde: /zijde/i,
};

interface Antwoorden {
  stylePreferences?: unknown;
  lightness?: unknown;
  materials?: unknown;
}

function lijst(x: unknown): string[] {
  if (Array.isArray(x)) return x.map((v) => String(v).toLowerCase().trim()).filter(Boolean);
  if (typeof x === "string" && x.trim()) return [x.toLowerCase().trim()];
  return [];
}

function feiten(stukken: TekstStuk[], a: Antwoorden): string[] {
  const uit: string[] = [];
  const stijlen = lijst(a.stylePreferences);
  const sneakerStijl = stijlen.length > 0 && stijlen.every((s) => STIJL_NAAM[s]) ? stijlen[0] : null;
  const schoen = stukken.find((s) => s.category === "footwear");
  if (sneakerStijl && schoen && zoekSchoen(schoen.product.name ?? "") === "sneakers") {
    uit.push(`Met sneakers, passend bij ${STIJL_NAAM[sneakerStijl]}.`);
  }

  const lichtheid = String(a.lightness ?? "").toLowerCase();
  const donker = stukken.filter((s) => isDonker(s.product as any)).length;
  // De stijlpoort staat bij licht een donker stuk toe; de zin "licht van
  // kleur" mag pas als er geen enkel donker stuk in zit.
  if (lichtheid === "licht" && donker === 0) uit.push("Licht van kleur, zoals je koos.");
  if (lichtheid === "donker" && donker * 2 >= stukken.length) uit.push("Donker van kleur, zoals je koos.");

  for (const mat of lijst(a.materials)) {
    const re = MATERIAAL_IN_NAAM[mat];
    const metMateriaal = stukken.some(
      (s) =>
        (re && re.test(s.product.name ?? "")) ||
        (s.product.materials ?? []).some((m) => String(m).toLowerCase() === mat)
    );
    if (metMateriaal) {
      uit.push(`Met ${mat}, een van je materialen.`);
      break;
    }
  }
  return uit;
}

/** "Voor je vrije dag. Met sneakers, passend bij streetwear. Samen €140." */
export function outfitUitleg(stukken: TekstStuk[], occasion: string, a: Antwoorden, index: number): string {
  const delen = [OPENING[occasion] ?? "Voor elke dag."];
  const f = feiten(stukken, a);
  if (f.length > 0) delen.push(f[index % f.length]);
  const totaal = stukken.reduce((som, s) => som + (Number(s.product.price) || 0), 0);
  if (totaal > 0) delen.push(`Samen €${Math.round(totaal)}.`);
  return delen.join(" ");
}
