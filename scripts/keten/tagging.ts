/**
 * Pure kern van het tag-script: schema, prompts, verzoeken, validatie, kosten
 * en resultaatverwerking. Geen netwerk, zodat alles hier testbaar is.
 * Het tagschema is spec 5.1 van docs/superpowers/specs/2026-09-14-keten-herbouw-design.md.
 */
import type Anthropic from "@anthropic-ai/sdk";

export const TAGGER_MODEL = process.env.TAGGER_MODEL ?? "claude-haiku-4-5-20251001";
export const TAGGER_VERSION = "haiku-4.5-v1";
export const TAGGER_VERSION_FOTO = "haiku-4.5-v1-foto";
export const CONFIDENCE_DREMPEL_FOTO = 0.6;
export const MAX_TOKENS = 600;

// Batchprijs: 50 procent van 1 dollar (input) en 5 dollar (output) per miljoen tokens.
export const BATCH_INPUT_USD_PER_MTOK = 0.5;
export const BATCH_OUTPUT_USD_PER_MTOK = 2.5;

export type Modus = "tekst" | "foto";

export const CATEGORIES = ["top", "bottom", "footwear", "outerwear", "dress", "accessory", "geen"] as const;
export const GENDERS = ["male", "female", "unisex"] as const;
export const OCCASIONS = ["work", "casual", "formal", "date", "travel", "sport", "party"] as const;
export const SILHOUETTES = ["slim", "regular", "relaxed", "oversized"] as const;
export const COLOR_TEMPS = ["warm", "koel", "neutraal"] as const;
export const LIGHTNESS = ["licht", "medium", "donker"] as const;
export const PATTERNS = ["effen", "subtiel", "statement"] as const;
export const SHOE_TYPES = ["sneaker", "net", "laars", "sandaal"] as const;
export const COLORS = [
  "zwart", "wit", "grijs", "navy", "beige", "camel", "bruin", "groen", "rood",
  "roze", "blauw", "geel", "paars", "oranje", "goud", "zilver", "multicolor",
] as const;
// MATERIALS uitgebreid 24 sept 2026 (spec 5.1, commit 10b41712) met suede,
// viscose, canvas, dons en rubber, na de eerste echte H&M-tagronde: 9.914
// producten werden ooit afgekeurd, 7.621 daarvan in twee of meer ronden, en
// dat was precies het aantal dat na zes ronden nog ongetagd was. Dat is geen
// convergentieprobleem maar een plafond: een product waarvan het materiaal
// werkelijk viscose is, geeft elke ronde opnieuw viscose en wordt elke ronde
// opnieuw afgekeurd. Deze vijf waren geen vertaalprobleem (het model gaf ze
// al letterlijk zo terug) maar ontbraken gewoon in onze eigen lijst. Volgorde
// gelijk aan de spec-tabel. Zie ook FIXRONDE 7 verderop in dit bestand voor
// de normalisatielaag-gevolgen (lyocell/rayon -> viscose, suède -> suede).
export const MATERIALS = [
  "katoen", "wol", "denim", "linnen", "leer", "suede", "synthetisch", "zijde",
  "tricot", "viscose", "canvas", "dons", "rubber", "onbekend",
] as const;
export const SEASONS = ["lente", "zomer", "herfst", "winter"] as const;

export interface TagProduct {
  product_id: string;
  name: string;
  brand: string | null;
  description: string | null;
  price: number;
  retailer: string | null;
  raw_category: string | null;
  gender: string | null;
  image_url: string | null;
  confidence: number | null;
}

export interface TagUitvoer {
  is_fashion: boolean;
  // category komt van de tagger terug maar wordt door keten_schrijf_tags (taak 2)
  // nooit weggeschreven: category blijft van de classifier uit plan 1. De tagger
  // levert hem alleen zodat (a) shoe_type hieronder gevalideerd kan worden tegen
  // "hoort dit bij footwear", en (b) is_fashion verlaagd kan worden wanneer de
  // tagger de categorie niet kan plaatsen (category 'geen', zie valideerTags).
  category: (typeof CATEGORIES)[number];
  gender: (typeof GENDERS)[number];
  formality: 1 | 2 | 3 | 4 | 5;
  occasions: (typeof OCCASIONS)[number][];
  silhouette: (typeof SILHOUETTES)[number];
  color_temp: (typeof COLOR_TEMPS)[number];
  lightness: (typeof LIGHTNESS)[number];
  pattern: (typeof PATTERNS)[number];
  shoe_type: (typeof SHOE_TYPES)[number] | null;
  colors: (typeof COLORS)[number][];
  materials: (typeof MATERIALS)[number][];
  seasons: (typeof SEASONS)[number][];
  confidence: number;
}

export interface TagRij extends TagUitvoer {
  product_id: string;
  tagger_version: string;
}

// JSON Schema voor structured output. Numerieke grenzen (confidence 0..1)
// ondersteunt de API niet; die controleert valideerTags.
export const TAG_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "is_fashion", "category", "gender", "formality", "occasions", "silhouette",
    "color_temp", "lightness", "pattern", "shoe_type", "colors", "materials",
    "seasons", "confidence",
  ],
  properties: {
    is_fashion: { type: "boolean" },
    category: { type: "string", enum: [...CATEGORIES] },
    gender: { type: "string", enum: [...GENDERS] },
    formality: { type: "integer", enum: [1, 2, 3, 4, 5] },
    occasions: { type: "array", items: { type: "string", enum: [...OCCASIONS] } },
    silhouette: { type: "string", enum: [...SILHOUETTES] },
    color_temp: { type: "string", enum: [...COLOR_TEMPS] },
    lightness: { type: "string", enum: [...LIGHTNESS] },
    pattern: { type: "string", enum: [...PATTERNS] },
    shoe_type: { anyOf: [{ type: "string", enum: [...SHOE_TYPES] }, { type: "null" }] },
    colors: { type: "array", items: { type: "string", enum: [...COLORS] } },
    materials: { type: "array", items: { type: "string", enum: [...MATERIALS] } },
    seasons: { type: "array", items: { type: "string", enum: [...SEASONS] } },
    confidence: { type: "number" },
  },
} as const;

export function bouwSysteemPrompt(): string {
  return [
    "Je tagt kledingproducten van Nederlandse webwinkels voor een stijladvies-app.",
    "Je krijgt naam, merk, beschrijving, prijs, winkel en de ruwe categorie uit de feed, soms ook een foto.",
    "Geef uitsluitend het gevraagde JSON-object terug. Regels per veld:",
    "- is_fashion: false voor alles wat geen kleding, schoenen of kledingaccessoire voor volwassenen is (vazen, lampen, servies, fan-merchandise, kinderkleding, ondergoed, zwemkleding). Dan category 'geen'.",
    "- category: top (shirts, blouses, truien, hoodies), bottom (broeken, rokken, shorts), footwear, outerwear (jassen, blazers als buitenlaag), dress (jurken, jumpsuits), accessory (tassen, riemen, sjaals, sieraden, hoeden). Zwemkleding (badpakken, bikini's, zwembroeken) is geen accessory: die is is_fashion false met category 'geen'.",
    "- gender: male, female of unisex, op basis van de doelgroep van het product.",
    // FIXRONDE 5 (controller, 24 sept 2026): een echte ronde verloor bijna 90% van
    // zijn opbrengst doordat het model "smart casual" (de naam van formaliteits-
    // niveau 3, hieronder) terugleverde als WAARDE in occasions, waar het niet
    // toegestaan is. Diagnose op een bewaarde uitvoer van 83 objecten/18 afkeuringen:
    // occasions:"smart casual" 16 keer, materials:"elastaan" 2 keer, verder niets.
    // Twee losse, tegenover elkaar geplaatste blokken hieronder (in plaats van twee
    // losse bullets vlak achter elkaar zoals voorheen) zodat de scheiding niet meer
    // op een enkele regel drijft: formaliteit is een cijferschaal met namen, occasions
    // is een eigen vaste woordenlijst, en occasions herhaalt zijn eigen toegestane
    // waarden vlak bij het veld zelf plus een expliciete, negatieve zin over
    // "smart casual" (het model leest de prompt kennelijk associatief; herhalen vlak
    // bij het veld werkt beter dan een regel verderop).
    "- formality is een CIJFERSCHAAL van 1 tot 5, GEEN gelegenheid: 1 = sport of loungewear, 2 = casual, 3 = smart casual, 4 = net, 5 = formeel. Vul dit veld met uitsluitend het cijfer. Deze vijf namen (sport, casual, smart casual, net, formeel) beschrijven ALLEEN formality en mogen nooit in occasions terechtkomen.",
    "- occasions is een APARTE, vaste lijst met precies deze zeven Engelse woorden, niets anders: work, casual, formal, date, travel, sport, party. 'smart casual' staat hier NIET tussen: dat is uitsluitend de naam van formaliteitsniveau 3 hierboven, geen gelegenheid, gebruik die tekst dus nooit in occasions. Vul dit veld met een of meer van de zeven woorden hierboven (exact zo gespeld, in het Engels) die bij dit item passen. Minimaal een.",
    "- silhouette: slim, regular, relaxed of oversized; bij schoenen en accessoires regular.",
    // FIXRONDE 7 (controller, 25 sept 2026): goud en zilver zijn nieuw in
    // COLORS (zie hierboven). Dit is de enige plek in de systeemprompt waar
    // colors/materials-waarden letterlijk worden opgesomd (colors/materials
    // zelf verwijzen alleen naar "de vaste lijst", zonder de waarden uit te
    // schrijven); daarom hier toegevoegd, verder niets in deze regel of de
    // regels eromheen aangeraakt.
    "- color_temp: warm (beige, camel, bruin, rood, oranje, geel, olijf, goud), koel (navy, blauw, grijs, zwart, wit, roze, paars, zilver) of neutraal (gemengd of onduidelijk).",
    "- lightness: licht, medium of donker, van de hoofdkleur.",
    "- pattern: effen, subtiel (fijne streep, ruit, structuur) of statement (print, logo, opvallend dessin).",
    "- shoe_type: alleen bij footwear: sneaker, net, laars of sandaal. Anders null.",
    "- colors: hoofdkleuren uit de vaste lijst, genormaliseerd naar het Nederlands; multicolor bij drie of meer gelijkwaardige kleuren.",
    "- materials: uit de vaste lijst; onbekend als de tekst niets zegt.",
    "- seasons: seizoenen waarin je dit draagt, uit lente, zomer, herfst, winter.",
    "- confidence: 0 tot 1, hoe zeker je bent van het geheel. Onder 0.6 als de tekst te weinig zegt over kleur, pasvorm of formaliteit.",
  ].join("\n");
}

export function bouwGebruikersTekst(p: TagProduct): string {
  return [
    `Naam: ${p.name}`,
    `Merk: ${p.brand ?? "onbekend"}`,
    `Winkel: ${p.retailer ?? "onbekend"}`,
    `Prijs: ${Number(p.price).toFixed(2)} EUR`,
    `Ruwe categorie uit de feed: ${p.raw_category ?? "onbekend"}`,
    `Geslacht volgens de feed: ${p.gender ?? "onbekend"}`,
    `Beschrijving: ${p.description?.trim() || "geen"}`,
  ].join("\n");
}

export function bouwVerzoek(
  p: TagProduct,
  modus: Modus
): { custom_id: string; params: Anthropic.MessageCreateParamsNonStreaming } {
  const tekst = bouwGebruikersTekst(p);
  const content: Anthropic.MessageCreateParamsNonStreaming["messages"][number]["content"] =
    modus === "foto" && p.image_url
      ? [
          { type: "image", source: { type: "url", url: p.image_url } },
          { type: "text", text: tekst },
        ]
      : tekst;

  return {
    custom_id: p.product_id,
    params: {
      model: TAGGER_MODEL,
      max_tokens: MAX_TOKENS,
      system: bouwSysteemPrompt(),
      messages: [{ role: "user", content }],
      output_config: { format: { type: "json_schema", schema: TAG_SCHEMA } },
    },
  };
}

function inLijst<T extends readonly string[]>(lijst: T, w: unknown): w is T[number] {
  return typeof w === "string" && (lijst as readonly string[]).includes(w);
}

// TAG_SCHEMA staat op additionalProperties: false; deze validator handhaaft dat zelf ook,
// in plaats van erop te vertrouwen dat de structured-output-API het al afdwingt.
const TOEGESTANE_VELDEN = new Set(Object.keys(TAG_SCHEMA.properties));

// ---------------------------------------------------------------------------
// Normalisatielaag, vóór validatie (FIXRONDE 5, controller, 24 sept 2026;
// uitgebreid FIXRONDE 6, controller, 24 sept 2026, zie hieronder).
//
// Spec 5.1 schrijft voor dat colors/materials "genormaliseerd" zijn; dat stond
// nooit als code. FIXRONDE 5 deed daarom alleen colors/materials.
//
// FIXRONDE 6: de lopende H&M-ronde (8.985 van 16.606 getagd op het moment van
// deze fix) liet zien dat hetzelfde probleem ook de vijf overige velden met
// een vaste Nederlandse waardenlijst raakt: silhouette, color_temp, lightness,
// pattern en shoe_type. Oorzaak is dezelfde als bij FIXRONDE 5, niet een
// nieuw defect: de prompt hamert sinds FIXRONDE 5 hard in dat "occasions"
// Engels moet zijn met precies zeven woorden, en het model trekt dat kennelijk
// door naar velden die juist Nederlands horen te zijn. Geteld over 248
// foutbestanden van de lopende ronde (17.893 afgekeurde veld+waarde-paren,
// ruimer dan de 25-bestanden-steekproef uit de opdracht): color_temp:'cool'
// 6.475x, lightness:'light' 674x, pattern:'solid' 108x, pattern:'subtle' 59x,
// pattern:'plain' 36x, color_temp:'neutral' 37x, lightness:'dark' 99x,
// silhouette:'loose' 2x. Dezelfde vaststelling geldt hier: andere velden met
// een vaste lijst die geen Nederlands/Engels-verwarring laten zien in de
// data (occasions is met opzet Engels en blijft onaangeraakt; seasons en
// gender/formality zijn geen normalisatiekwestie, zie verderop) blijven
// buiten deze laag, om niet meer scope te pakken dan de diagnose rechtvaardigt.
//
// Twee harde grenzen, letterlijk uit de opdracht, gelden voor ALLE
// synoniemenlijsten hieronder, niet alleen kleur/materiaal:
// 1. Alleen normaliseren waar de betekenis vaststaat: hoofdletters/spaties,
//    de simpele meervoudsvorm (trailing "s"), en een met de hand vastgelegde
//    synoniemenlijst (Engelse varianten, en voor materialen: vezelnamen die
//    per definitie synthetisch zijn). Geen fuzzy matching, geen taalkundige
//    gok. "modal" (halfsynthetisch, net als viscose, maar een eigen vezel-
//    proces met eigen eigenschappen) en "cashmere" (specifieker dan wol)
//    staan er daarom bewust NIET in: geen zekere 1-op-1 relatie met een van
//    de veertien schemawaarden. FIXRONDE 7 (controller, 25 sept 2026):
//    "viscose" zelf is sinds de uitbreiding van MATERIALS (zie hierboven)
//    een canonieke waarde, geen synoniem meer nodig; "rayon" (in de praktijk
//    hetzelfde vezelproces, in de VS de gangbare naam voor wat hier viscose
//    heet) en "lyocell" (regenerated cellulose, net als viscose, en expliciet
//    zo benoemd in de opdracht) wijzen er nu naar, zie MATERIAAL_SYNONIEMEN
//    hieronder. "suède" (met accent) normaliseert naar het nieuwe "suede".
//    Zie ook de uitgebreide toelichting bij MATERIAAL_SYNONIEMEN hieronder
//    voor "geweven"/"twill"/"joggingstof" (FIXRONDE 6): fabrieks-/weeftype,
//    geen vezelnaam, dus dezelfde redenering, ook na FIXRONDE 7 nog steeds
//    bewust niet gemapt (canvas is zelf ook een weefsel, geen vezel, en lost
//    die onzekerheid niet op: een geweven of keperstof kan katoen, wol,
//    synthetisch of canvas zijn, er is nog steeds geen 1-op-1).
// 2. Nooit stilzwijgend informatie weggooien: een waarde die na dit alles nog
//    steeds niet in de lijst staat, gaat ONGEWIJZIGD terug. valideerTags
//    keurt hem dan af zoals voorheen ("waarde buiten schema"), niets wordt
//    geraden of verwijderd.
//
// "smart casual" als occasion krijgt BEWUST geen synoniem hier (geen drop,
// geen map naar "casual"/"work"): dat zou een gok zijn over wat het model
// bedoelde, precies wat de opdracht uitsluit. De prompt-fix hierboven is de
// eerste verdedigingslinie (voorkomen dat het model de waarde ooit teruggeeft);
// als hij toch verschijnt, blijft het hele object een afkeuring, zichtbaar
// gemaakt met veld+waarde (zie valideerTagsGedetailleerd/verwerkResultaten),
// in plaats van dat de rij stilletjes met een onvolledige of geraden
// occasions-lijst wordt weggeschreven.
export const KLEUR_SYNONIEMEN: Partial<Record<string, (typeof COLORS)[number]>> = {
  black: "zwart",
  white: "wit",
  grey: "grijs",
  gray: "grijs",
  brown: "bruin",
  green: "groen",
  red: "rood",
  pink: "roze",
  blue: "blauw",
  yellow: "geel",
  purple: "paars",
  violet: "paars",
  orange: "oranje",
  multi: "multicolor",
  multicolour: "multicolor",
  multicolored: "multicolor",
  colorful: "multicolor",
  colourful: "multicolor",
  // FIXRONDE 7 (controller, 25 sept 2026): goud/zilver zijn nieuw in COLORS
  // (zie hierboven bij de MATERIALS-toelichting). Zelfde defensieve reden als
  // de twaalf Engelse woorden hierboven (FIXRONDE 5/6: het model geeft soms
  // Engels terug waar Nederlands hoort): "gold"/"silver" zijn de directe
  // Engelse woorden, geen gok.
  gold: "goud",
  silver: "zilver",
  // FIXRONDE 9 (1 okt 2026): tintnamen uit de proefronde over vier nieuwe
  // winkels waarvan de basiskleur vaststaat. Marine en marineblauw zijn de
  // Nederlandse naam voor navy; bordeaux is wijnrood; zand is in mode de naam
  // voor beige; kobalt is een blauw; antraciet is donkergrijs; olijf is groen. Bewust NIET:
  // berry, koraal, brons, ecru, taupe, khaki, turquoise, creme: daar ligt de
  // kleur tussen twee waarden in en zou mappen een gok zijn.
  marineblauw: "navy",
  marine: "navy",
  navyblue: "navy",
  bordeaux: "rood",
  zand: "beige",
  kobalt: "blauw",
  antraciet: "grijs",
  olijf: "groen",
  olive: "groen",
};

// FIXRONDE 9: basiswoorden voor samengestelde kleurnamen. In het Nederlands is
// het laatste deel van een samenstelling de kleur zelf (olijfgroen is groen,
// bordeauxrood is rood, lichtblauw is blauw); het Engels aan elkaar geschreven
// werkt hetzelfde (lightblue, offwhite). Alleen echte basiskleuren, geen
// tintnamen: anders zou "aquamarine" via "marine" navy worden. Het Engelse
// "red" staat er bewust niet in: dat zit ook in "colored".
const KLEUR_BASISWOORDEN: Array<[string, (typeof COLORS)[number]]> = (
  [
    ...COLORS.filter((c) => c !== "multicolor").map((c) => [c, c]),
    ["black", "zwart"], ["white", "wit"], ["grey", "grijs"], ["gray", "grijs"],
    ["brown", "bruin"], ["green", "groen"], ["pink", "roze"], ["blue", "blauw"],
    ["yellow", "geel"], ["purple", "paars"], ["violet", "paars"], ["orange", "oranje"],
    ["gold", "goud"], ["silver", "zilver"],
  ] as Array<[string, (typeof COLORS)[number]]>
).sort((a, b) => b[0].length - a[0].length);

export const MATERIAAL_SYNONIEMEN: Partial<Record<string, (typeof MATERIALS)[number]>> = {
  cotton: "katoen",
  wool: "wol",
  leather: "leer",
  silk: "zijde",
  linen: "linnen",
  jean: "denim",
  jeans: "denim",
  jersey: "tricot",
  knit: "tricot",
  knitwear: "tricot",
  // Vezelnamen die per definitie synthetisch zijn (geen inschatting, geen
  // twijfelgeval): elastaan is het concrete geval uit de diagnose (2 van de
  // 18 afkeuringen in de bewaarde steekproef).
  elastaan: "synthetisch",
  elastane: "synthetisch",
  spandex: "synthetisch",
  lycra: "synthetisch",
  polyester: "synthetisch",
  polyamide: "synthetisch",
  nylon: "synthetisch",
  acryl: "synthetisch",
  acrylic: "synthetisch",
  // Generieke Engelse woorden voor "synthetisch" zelf (niet alleen specifieke
  // vezelnamen hierboven): even ondubbelzinnig, dezelfde categorie.
  synthetic: "synthetisch",
  plastic: "synthetisch",
  // Nederlandse woorden die zelf al ondubbelzinnig "synthetisch materiaal"
  // betekenen (geen Engelse variant, maar wel dezelfde "betekenis staat vast"-
  // toets als de rest van deze lijst, zie de opdracht bij MATERIALS-oordelen
  // hieronder). Toegevoegd ná de meting van FIXRONDE 6 (controller, 24 sept
  // 2026): 4 losse claude -p aanroepen van 100 producten op de gefixte
  // normalisatielaag lieten "kunststof" 15x en "kunstleer"/"imitatieleer"
  // samen 7x zien als ENIGE reden van afkeuring (0x in de eerder gemeten
  // color_temp/lightness/pattern-velden, die dus volledig zijn opgelost) -
  // in de eerdere 248-bestanden-mining uit productie ook al 158x resp. 19x.
  // Anders dan "geweven"/"twill"/"joggingstof" hierboven is dit geen
  // weeftype of stofsoort met een onzekere vezelsamenstelling: "kunststof"
  // IS het Nederlandse woord voor "synthetisch materiaal" (Van Dale: "stof
  // door een chemisch proces vervaardigd"), en "kunstleer"/"imitatieleer"
  // zijn per definitie GEEN leer, dus per uitsluiting synthetisch. Geen gok,
  // een vertaling.
  kunststof: "synthetisch",
  kunstleer: "synthetisch",
  imitatieleer: "synthetisch",
  unknown: "onbekend",
  // FIXRONDE 7 (controller, 25 sept 2026): MATERIALS uitgebreid met suede,
  // viscose, canvas, dons, rubber (zie hierboven). Drie synoniemen naar de
  // nieuwe waarden, elk met een eigen, vaststaande reden (geen gok):
  // - "suède": de Nederlandse spelling met accent van exact hetzelfde woord
  //   als het nieuwe "suede" (spec 5.1 schrijft "suede" zonder accent in de
  //   lijst). Zonder deze regel zou de accentvariant een letterlijk andere
  //   string zijn en alsnog afgekeurd worden, precies het lek dat deze hele
  //   ronde repareert.
  // - "lyocell": expliciet genoemd in de opdracht. Vóór deze ronde bewust
  //   NIET gemapt (zie het commentaarblok hierboven bij KLEUR_SYNONIEMEN/
  //   MATERIAAL_SYNONIEMEN) omdat er geen canonieke bestemming was; nu
  //   viscose bestaat, is dat er wel. Lyocell is een ander productieproces
  //   dan viscose (NMMO-oplosmiddel i.p.v. het viscoseproces), maar beide
  //   zijn regenerated-cellulosevezels met vergelijkbare val en uitstraling;
  //   voor deze styling-classificatie is dat verschil niet relevant.
  // - "rayon": in de eerdere toelichting hierboven letterlijk in hetzelfde
  //   rijtje als "viscose" genoemd ("viscose"/"rayon"/"modal", allemaal
  //   halfsynthetisch, geen doel). Rayon is de in de VS gangbare naam voor
  //   wat in Europa vrijwel altijd "viscose" heet (hetzelfde fabricageproces,
  //   geen apart procedé zoals lyocell of modal dat wel heeft); vandaar hier
  //   wel gemapt, in tegenstelling tot "modal" hierboven, dat een eigen,
  //   onderscheidend proces met eigen eigenschappen is en dus onopgelost
  //   blijft (geen gok naar de dichtstbijzijnde waarde).
  suède: "suede",
  lyocell: "viscose",
  rayon: "viscose",
  // "down": toegevoegd NA de meting hieronder (taak-5-report.md), niet ervoor.
  // De vier post-fix aanroepen lieten "down" (Engels) 2x zien als enige reden
  // van afkeuring in een materials-array (call 1: "synthetisch","down"), het-
  // zelfde Engels-i.p.v.-Nederlands-patroon als de rest van deze lijst, nu met
  // "dons" als het nieuwe canonieke doel. Net als "kunststof" in FIXRONDE 6:
  // ná de metingen toegevoegd, dus niet in de gerapporteerde opbrengstcijfers
  // verwerkt.
  down: "dons",
};

// FIXRONDE 6 (controller, 24 sept 2026): materialen die in de lopende ronde
// veelvuldig afkeuren maar BEWUST buiten deze lijst blijven, met reden:
// - "geweven"/"woven" (740x resp. 38x in 248 foutbestanden) en "twill"
//   (285x, plus samenstellingen als "katoenen twill"/"katoen twill") zijn een
//   WEEFTYPE (de manier waarop garens verstrengeld zijn), geen vezelnaam. Een
//   geweven of keperstof kan katoen, wol, synthetisch of een mix zijn: er is
//   geen 1-op-1 met een van de negen schemawaarden, dus mappen zou gokken
//   zijn naar precies het soort "verkeerde tag" dat de opdracht uitsluit.
// - "joggingstof" (293x) is een stofSOORT (sweatshirt-/french-terry-achtige
//   gebreide stof), typisch een katoen/polyester-mix maar niet vast: zelfde
//   redenering, geen vezelnaam, geen zekere 1-op-1.
// - "viscose" (746x, de grootste losse materialen-afkeuring in de ronde) was
//   op dat moment halfsynthetisch (regenerated cellulose) zonder canonieke
//   bestemming: noch "katoen"/"linnen" (natuurlijk) noch "synthetisch"
//   (petrochemisch) dekte de lading zuiver. "lyocell" (106x, ook halfsynthe-
//   tisch/regenerated cellulose) viel onder dezelfde redenering en werd om
//   dezelfde reden niet toegevoegd.
//   FIXRONDE 7 (controller, 25 sept 2026): dit is inmiddels OPGELOST. Spec
//   5.1 voegde "viscose" zelf toe aan MATERIALS (zie de constante hierboven);
//   "viscose" is dus geen afkeuring meer, en "lyocell"/"rayon" normaliseren
//   er nu naartoe (zie de synoniemenlijst hierboven). Deze twee bullets
//   blijven staan als historisch record van de meting die tot de spec-
//   uitbreiding leidde, niet als actuele uitzondering.
// Geweven/woven/twill/joggingstof blijven wel ongetagd en komen vanzelf terug
// als kandidaat bij de volgende ronde (zie de opdracht); dat is de bewust
// gekozen, eerlijkere uitkomst boven een geraden materiaal.
//
// Geëxporteerd (was intern): FIXRONDE 6 normaliseert nu ook vijf scalaire
// velden (silhouette, color_temp, lightness, pattern, shoe_type) die geen
// array zijn en dus niet via normaliseerLijst lopen; valideerTagsGedetailleerd
// roept deze functie voor die velden rechtstreeks aan, en de tests hieronder
// toetsen dat pad ook rechtstreeks, net als normaliseerLijst al deed.
export function normaliseerWaarde<T extends readonly string[]>(
  ruw: unknown,
  lijst: T,
  synoniemen: Partial<Record<string, T[number]>>
): unknown {
  if (typeof ruw !== "string") return ruw;
  const key = ruw.trim().toLowerCase();
  if (!key) return ruw;
  const exact = lijst.find((v) => v.toLowerCase() === key);
  if (exact) return exact;
  if (synoniemen[key]) return synoniemen[key];
  // Simpele meervoudsvorm: alleen de trailing-"s"-vorm, geen taalkundige
  // heuristiek. Van de canonieke waarden over alle lijsten die deze functie
  // gebruikt (FIXRONDE 6 breidde dat uit van COLORS/MATERIALS naar ook
  // SILHOUETTES/COLOR_TEMPS/LIGHTNESS/PATTERNS/SHOE_TYPES) eindigt alleen
  // "laars" zelf op "s". Onschadelijk: de exacte-match-check hierboven vangt
  // een letterlijk "laars"-invoer al af vóórdat deze tak ooit bereikt wordt,
  // dus die kan hier niet per ongeluk verminkt worden.
  if (key.length > 1 && key.endsWith("s")) {
    const enkelvoud = key.slice(0, -1);
    const exactEnkelvoud = lijst.find((v) => v.toLowerCase() === enkelvoud);
    if (exactEnkelvoud) return exactEnkelvoud;
    if (synoniemen[enkelvoud]) return synoniemen[enkelvoud];
  }
  return ruw; // onbekend: ongewijzigd terug, blijft een afkeuring, geen gok
}

/** Normaliseert elk element van een array-veld (colors/materials). Niet-arrays
 * gaan ongemoeid terug; valideerTagsGedetailleerd keurt die op de normale
 * manier af (verkeerd type, geen normalisatiekwestie). */
export function normaliseerLijst<T extends readonly string[]>(
  ruw: unknown,
  lijst: T,
  synoniemen: Partial<Record<string, T[number]>>
): unknown {
  if (!Array.isArray(ruw)) return ruw;
  return ruw.map((x) => normaliseerWaarde(x, lijst, synoniemen));
}

/**
 * FIXRONDE 9 (1 okt 2026): een lijstveld dat als losse tekst terugkomt, is een
 * lijst van één. In de herkansing van de proefronde waren 84 van de 124
 * afkeuringen bij Mart Visser precies dit: materials: "onbekend" of "denim" in
 * plaats van ["onbekend"]. Een lege tekst blijft wat hij is en wordt verderop
 * afgekeurd zoals elke niet-lijst.
 */
export function alsLijst(ruw: unknown): unknown {
  return typeof ruw === "string" && ruw.trim() !== "" ? [ruw] : ruw;
}

/**
 * FIXRONDE 9: kleur normaliseren, ook als samengestelde naam. Eerst exact of
 * via de synoniemenlijst; dan dezelfde naam zonder spaties en streepjes
 * ("off white", "light blue"); dan het laatste deel van de samenstelling als
 * dat een basiskleur is en er minstens drie letters voor staan. Lukt niets,
 * dan gaat de waarde ongewijzigd terug en blijft het een afkeuring.
 */
export function normaliseerKleur(ruw: unknown): unknown {
  const direct = normaliseerWaarde(ruw, COLORS, KLEUR_SYNONIEMEN);
  if (inLijst(COLORS, direct) || typeof ruw !== "string") return direct;
  const samen = ruw.trim().toLowerCase().replace(/[\s-]+/g, "");
  const viaSamen = normaliseerWaarde(samen, COLORS, KLEUR_SYNONIEMEN);
  if (inLijst(COLORS, viaSamen)) return viaSamen;
  for (const [woord, kleur] of KLEUR_BASISWOORDEN) {
    if (samen.endsWith(woord) && samen.length - woord.length >= 3) return kleur;
  }
  return ruw;
}

// ---------------------------------------------------------------------------
// Synoniemenlijsten voor de vijf scalaire velden (FIXRONDE 6, controller, 24
// sept 2026). Zelfde regels als KLEUR_SYNONIEMEN/MATERIAAL_SYNONIEMEN
// hierboven: alleen waar de betekenis vaststaat, elke waarde hieronder komt
// uit ofwel een directe NL/EN-vertaling ofwel een concreet, in de lopende
// H&M-ronde waargenomen geval (aantallen in het commentaarblok hierboven).
//
// KLEURTEMPERATUUR_SYNONIEMEN: "warm" heeft geen synoniem nodig (identiek
// gespeld in beide talen, komt in de data ook nooit fout terug).
export const KLEURTEMPERATUUR_SYNONIEMEN: Partial<Record<string, (typeof COLOR_TEMPS)[number]>> = {
  cool: "koel",
  neutral: "neutraal",
};

// LICHTHEID_SYNONIEMEN: "medium" heeft geen synoniem nodig (identiek gespeld).
export const LICHTHEID_SYNONIEMEN: Partial<Record<string, (typeof LIGHTNESS)[number]>> = {
  light: "licht",
  dark: "donker",
};

// PATROON_SYNONIEMEN: "statement" heeft geen synoniem nodig (al Engels/
// internationaal, geen vertaalprobleem waargenomen). "solid" en "plain"
// betekenen allebei "effen" in het Engels (beide waargenomen: 108x resp. 36x).
export const PATROON_SYNONIEMEN: Partial<Record<string, (typeof PATTERNS)[number]>> = {
  solid: "effen",
  plain: "effen",
  subtle: "subtiel",
};

// SILHOUET_SYNONIEMEN: "slim"/"regular"/"relaxed"/"oversized" zijn zelf al
// Engelse leenwoorden (identiek gespeld in beide talen), dus vrijwel geen
// synoniemenbehoefte. "loose" is de enige waargenomen uitzondering (2x): een
// duidelijk, ondubbelzinnig synoniem voor "relaxed" (losvallend silhouet).
export const SILHOUET_SYNONIEMEN: Partial<Record<string, (typeof SILHOUETTES)[number]>> = {
  loose: "relaxed",
};

// SCHOENTYPE_SYNONIEMEN: "sneaker" is al Engels, geen synoniem nodig (het
// meervoud "sneakers" vangt de generieke trailing-"s"-regel al af). "boot" en
// "sandal" zijn de directe Engelse woorden voor "laars"/"sandaal". "net"
// (in de prompt: brede categorie voor nette/formele schoenen, geen sneaker,
// laars of sandaal) heeft geen enkel Engels woord dat het dekt; "dress" en
// "formal" zijn de meest voor de hand liggende Engelse aanduidingen voor
// diezelfde categorie en vallen, binnen deze vier waarden, ondubbelzinnig in
// dezelfde emmer (geen andere schoentype-optie past bij een "dress shoe").
// Geen van deze vijf is in de lopende ronde waargenomen (de enige
// shoe_type-afkeuringen in productie waren een ontbrekend veld, zie
// verderop, en één keer "regular", een silhouette-waarde in het verkeerde
// veld die bewust niet gemapt wordt): dit is preventieve dekking, dezelfde
// vertaalslag als de andere vier lijsten hierboven.
export const SCHOENTYPE_SYNONIEMEN: Partial<Record<string, (typeof SHOE_TYPES)[number]>> = {
  boot: "laars",
  sandal: "sandaal",
  dress: "net",
  formal: "net",
};

// ---------------------------------------------------------------------------

/**
 * Resultaat van valideerTagsGedetailleerd: bij een afkeuring bevat dit WELK
 * veld en WELKE waarde de afkeuring veroorzaakten, in plaats van alleen
 * "waarde buiten schema" (FIXRONDE 5, controller, 24 sept 2026). Vóór deze
 * wijziging moest de oorzaak van 847 afkeuringen in een echte ronde
 * gereconstrueerd worden uit een apart bewaarde modeluitvoer; met veld+waarde
 * in het foutenrecord (zie verwerkResultaten/verwerkCliUitvoer) staat die
 * oorzaak meteen in `tag-fouten-*.json`.
 *
 * Bij een GESLAAGDE validatie kan `weggevallen` losse array-elementen bevatten
 * die wel gefilterd maar niet het hele product hebben gekost (FIXRONDE 8, zie
 * hieronder bij filterMetWeggevallen): altijd aanwezig, leeg als er niets is
 * weggevallen, zodat een aanroeper niet apart hoeft te checken op undefined.
 */
export interface WeggevallenElement {
  veld: string;
  waarde: unknown;
}

export type ValidatieResultaat =
  | { ok: true; tags: TagUitvoer; weggevallen: WeggevallenElement[] }
  | { ok: false; veld: string; waarde: unknown };

/**
 * Filtert een array-veld ELEMENT VOOR ELEMENT tegen de vaste lijst, in plaats
 * van de hele array af te keuren zodra één element niet past (FIXRONDE 8,
 * controller, 25 sept 2026 — het structurele defect achter het plafond van
 * zeven fixrondes, zie het commentaarblok boven MATERIAAL_SYNONIEMEN
 * hierboven).
 *
 * `ruw` is hier al door de normalisatielaag heen (colors/materials via
 * normaliseerLijst, hierboven, vóór deze functie aangeroepen); wat na
 * normalisatie nog steeds niet in de lijst staat, is een element waarvan de
 * betekenis niet vaststaat, geen gok waard. Zo'n element verdwijnt niet
 * stilzwijgend: het komt terug in `weggevallen`, zodat later te tellen is
 * welke waarden vaak wegvallen (dezelfde soort mining als leidde tot
 * FIXRONDE 6/7), zonder dat daar een apart bewaarde modeluitvoer voor nodig
 * is.
 *
 * Geeft `null` terug als `ruw` geen array is: dat is een fout van een ANDER
 * soort (verkeerd veldtype, geen elementen om te filteren) en blijft, net als
 * vóór deze fixronde, een directe afkeuring van het hele veld.
 */
function filterMetWeggevallen<T extends readonly string[]>(
  veld: string,
  ruw: unknown,
  lijst: T,
  weggevallen: WeggevallenElement[]
): T[number][] | null {
  if (!Array.isArray(ruw)) return null;
  const behouden: T[number][] = [];
  for (const element of ruw) {
    if (inLijst(lijst, element)) {
      behouden.push(element);
    } else {
      weggevallen.push({ veld, waarde: element });
    }
  }
  return behouden;
}

export function valideerTagsGedetailleerd(obj: unknown): ValidatieResultaat {
  if (!obj || typeof obj !== "object") return { ok: false, veld: "(geen object)", waarde: obj };
  const o: Record<string, unknown> = { ...(obj as Record<string, unknown>) };

  const onbekendVeld = Object.keys(o).find((veld) => !TOEGESTANE_VELDEN.has(veld));
  if (onbekendVeld) return { ok: false, veld: onbekendVeld, waarde: o[onbekendVeld] };

  // Normalisatielaag. colors/materials zijn arrays (normaliseerLijst,
  // FIXRONDE 5); silhouette/color_temp/lightness/pattern/shoe_type zijn
  // scalaire velden en gaan rechtstreeks door normaliseerWaarde (FIXRONDE 6,
  // zie het commentaarblok boven KLEURTEMPERATUUR_SYNONIEMEN hierboven).
  o.silhouette = normaliseerWaarde(o.silhouette, SILHOUETTES, SILHOUET_SYNONIEMEN);
  o.color_temp = normaliseerWaarde(o.color_temp, COLOR_TEMPS, KLEURTEMPERATUUR_SYNONIEMEN);
  o.lightness = normaliseerWaarde(o.lightness, LIGHTNESS, LICHTHEID_SYNONIEMEN);
  o.pattern = normaliseerWaarde(o.pattern, PATTERNS, PATROON_SYNONIEMEN);
  o.shoe_type = normaliseerWaarde(o.shoe_type, SHOE_TYPES, SCHOENTYPE_SYNONIEMEN);
  // FIXRONDE 9: losse tekst in een lijstveld wordt een lijst van één, en
  // kleuren gaan door normaliseerKleur (samengestelde namen), zie boven.
  o.occasions = alsLijst(o.occasions);
  o.colors = alsLijst(o.colors);
  o.materials = alsLijst(o.materials);
  o.seasons = alsLijst(o.seasons);
  o.colors = Array.isArray(o.colors) ? o.colors.map(normaliseerKleur) : o.colors;
  o.materials = normaliseerLijst(o.materials, MATERIALS, MATERIAAL_SYNONIEMEN);

  if (typeof o.is_fashion !== "boolean") return { ok: false, veld: "is_fashion", waarde: o.is_fashion };
  if (!inLijst(CATEGORIES, o.category)) return { ok: false, veld: "category", waarde: o.category };
  if (!inLijst(GENDERS, o.gender)) return { ok: false, veld: "gender", waarde: o.gender };
  if (![1, 2, 3, 4, 5].includes(o.formality as number)) return { ok: false, veld: "formality", waarde: o.formality };

  // FIXRONDE 8 (controller, 25 sept 2026): het structurele defect. Zie het
  // uitgebreide commentaar bij filterMetWeggevallen hierboven voor de
  // motivatie; hier alleen de per-veld beslissing over wat een LEGE lijst na
  // filteren betekent, met een eigen reden per veld (niet één regel voor
  // alle vier).
  const weggevallen: WeggevallenElement[] = [];

  // occasions: leeg blijft een afkeuring. De systeemprompt eist expliciet
  // minimaal één gelegenheid; zonder gelegenheid kan een product nooit
  // kandidaat worden voor een outfit op die as, dus een lege lijst is geen
  // bruikbaar "we weten het niet"-antwoord zoals bij materials hieronder.
  // `waarde` bij een afkeuring is de OORSPRONKELIJKE (ongefilterde) invoer,
  // zodat zichtbaar blijft wat er precies mis was (bijvoorbeeld uitsluitend
  // "smart casual", nul geldige gelegenheden).
  const occasionsGefilterd = filterMetWeggevallen("occasions", o.occasions, OCCASIONS, weggevallen);
  if (occasionsGefilterd === null || occasionsGefilterd.length === 0) {
    return { ok: false, veld: "occasions", waarde: o.occasions };
  }
  o.occasions = occasionsGefilterd;

  if (!inLijst(SILHOUETTES, o.silhouette)) return { ok: false, veld: "silhouette", waarde: o.silhouette };
  if (!inLijst(COLOR_TEMPS, o.color_temp)) return { ok: false, veld: "color_temp", waarde: o.color_temp };
  if (!inLijst(LIGHTNESS, o.lightness)) return { ok: false, veld: "lightness", waarde: o.lightness };
  if (!inLijst(PATTERNS, o.pattern)) return { ok: false, veld: "pattern", waarde: o.pattern };
  // shoe_type telt alleen mee bij category "footwear": voor elke andere
  // categorie forceert de TagUitvoer hieronder de waarde sowieso naar null,
  // ongeacht wat het model invulde. FIXRONDE 6 (controller, 24 sept 2026):
  // vóór deze wijziging werd een lege of ontbrekende shoe_type bij een
  // NIET-footwear product hier alsnog afgekeurd (het model laat het veld
  // soms helemaal weg in plaats van "null" te schrijven, want --json-schema
  // is sinds 23 sept geen standaard meer en niets dwingt het veld af) -
  // precies de "lege string is niet hetzelfde als afwezig"-fout uit de
  // opdracht. In de lopende H&M-ronde was dit 86 van de 86 shoe_type-
  // afkeuringen (alle "waarde: ontbrekend", geen enkele een echt foutief
  // schoentype bij een schoen); zie ook de toelichting bij
  // SCHOENTYPE_SYNONIEMEN hierboven. Bij category "footwear" blijft de
  // controle onverkort: een model dat daar iets anders dan de vier geldige
  // schoentypes teruggeeft (of null, wat voor een schoen zelf al onvolledig
  // is) blijft een afkeuring.
  // EINDREVIEW 27 sept 2026: hier stond `o.shoe_type !== null` in de
  // voorwaarde, waardoor een expliciete null bij een schoen juist ONTSNAPTE
  // aan de afkeuring die het commentaar hierboven belooft. Een schoen zonder
  // schoentype werd dan weggeschreven zonder in de foutenlijst te belanden en
  // was daarna nergens op shoe_type te matchen. De guard is weg: bij footwear
  // moet shoe_type een van de vier waarden zijn.
  if (o.category === "footwear" && !inLijst(SHOE_TYPES, o.shoe_type)) {
    return { ok: false, veld: "shoe_type", waarde: o.shoe_type };
  }
  // colors: leeg blijft een afkeuring. Zonder herkenbare kleur is een item
  // niet te matchen in een outfit: kleur is een van de assen waarop de
  // stylist-compositie (spec 5.1/5.4) items combineert, en "geen enkele
  // kleur" is geen bruikbaar antwoord op die vraag.
  const colorsGefilterd = filterMetWeggevallen("colors", o.colors, COLORS, weggevallen);
  if (colorsGefilterd === null || colorsGefilterd.length === 0) {
    return { ok: false, veld: "colors", waarde: o.colors };
  }
  o.colors = colorsGefilterd;

  // materials: leeg wordt ["onbekend"], GEEN afkeuring. "onbekend" staat al
  // in MATERIALS (spec 5.1) en is precies wat er op dat moment feitelijk
  // bekend is over het materiaal, niet een gok. Dit is het exacte defect uit
  // de opdracht: vóór deze fixronde kostte bijvoorbeeld
  // materials: ["viscose", "kralen"] het HELE product (dertien overigens
  // correcte velden inbegrepen) om "kralen" alleen. Een product zonder
  // herkend materiaal is nog steeds op categorie, kleur, gelegenheid en
  // formaliteit te matchen, dus dat mag niet langer de reden zijn om alles
  // weg te gooien.
  const materialsGefilterd = filterMetWeggevallen("materials", o.materials, MATERIALS, weggevallen);
  if (materialsGefilterd === null) {
    return { ok: false, veld: "materials", waarde: o.materials };
  }
  o.materials = materialsGefilterd.length > 0 ? materialsGefilterd : ["onbekend"];

  // seasons: leeg blijft OOK GEEN afkeuring, net als materials maar met een
  // eigen, downstream-onderbouwde reden (anders dan materials' "onbekend"):
  // src/engine/outfitComposer.ts (isSeasonMatch) en src/engine/helpers.ts
  // behandelen een product zonder seizoensdata al expliciet als "geschikt
  // voor alle seizoenen" ("If product has no season data, assume it's
  // suitable for all seasons"). Een lege seasons-array na het wegfilteren
  // van een onherkend seizoenswoord heeft dus al een vaste, correcte
  // downstream-betekenis; er hoeft niets aan toegevoegd te worden zoals bij
  // materials, en het is geen gok om die betekenis te laten staan.
  const seasonsGefilterd = filterMetWeggevallen("seasons", o.seasons, SEASONS, weggevallen);
  if (seasonsGefilterd === null) {
    return { ok: false, veld: "seasons", waarde: o.seasons };
  }
  o.seasons = seasonsGefilterd;

  if (typeof o.confidence !== "number" || o.confidence < 0 || o.confidence > 1) {
    return { ok: false, veld: "confidence", waarde: o.confidence };
  }

  return {
    ok: true,
    weggevallen,
    tags: {
      // Spec 5.1: category anders dan de zes echte waarden ("geen") betekent
      // is_fashion false. Dit forceren we hier zelf in plaats van te vertrouwen
      // op een consistente modeluitvoer. keten_schrijf_tags (taak 2, migratie
      // 20260916100000) berekent is_fashion onafhankelijk met dezelfde regel
      // (pa.is_fashion and coalesce(is_fashion, true) and category <> 'geen'),
      // dus dit is niet de enige verdedigingslinie tegen badkleding-in-de-
      // accessoire-emmer. Deze forcering telt wel voor de TagRij zelf, vóór
      // die de database in gaat: logging, QA en de foutenlijst zien anders een
      // rij die intern tegenstrijdig is (is_fashion true met category 'geen').
      is_fashion: o.category === "geen" ? false : o.is_fashion,
      category: o.category,
      gender: o.gender,
      formality: o.formality as TagUitvoer["formality"],
      occasions: [...new Set(o.occasions as TagUitvoer["occasions"])],
      silhouette: o.silhouette,
      color_temp: o.color_temp,
      lightness: o.lightness,
      pattern: o.pattern,
      shoe_type: o.category === "footwear" ? (o.shoe_type as TagUitvoer["shoe_type"]) : null,
      colors: [...new Set(o.colors as TagUitvoer["colors"])],
      materials: [...new Set(o.materials as TagUitvoer["materials"])],
      seasons: [...new Set(o.seasons as TagUitvoer["seasons"])],
      confidence: o.confidence,
    },
  };
}

/** Dunne, backwaarts-compatibele wrapper rond valideerTagsGedetailleerd voor
 * bestaande aanroepers die alleen geldig/ongeldig nodig hebben, geen veld+waarde. */
export function valideerTags(obj: unknown): TagUitvoer | null {
  const resultaat = valideerTagsGedetailleerd(obj);
  return resultaat.ok ? resultaat.tags : null;
}

export function schatKosten(invoer: { aantal: number; gemInputTokens: number; gemOutputTokens: number }) {
  const inputUsd = (invoer.aantal * invoer.gemInputTokens * BATCH_INPUT_USD_PER_MTOK) / 1_000_000;
  const outputUsd = (invoer.aantal * invoer.gemOutputTokens * BATCH_OUTPUT_USD_PER_MTOK) / 1_000_000;
  return { inputUsd, outputUsd, totaalUsd: inputUsd + outputUsd };
}

// Structureel type voor batchresultaten, zodat de verwerking zonder SDK-object
// te testen is. De SDK levert dezelfde vorm (custom_id + result).
export interface BatchResultaat {
  custom_id: string;
  result: {
    type: string;
    message?: { stop_reason?: string | null; content: Array<{ type: string; text?: string }> };
    error?: { type?: string; message?: string };
  };
}

export interface VerwerkFout {
  custom_id: string;
  reden: string;
  // Alleen gezet bij reden "waarde buiten schema" (FIXRONDE 5, controller, 24
  // sept 2026): welk veld en welke waarde de afkeuring veroorzaakten, zodat de
  // oorzaak uit tag-fouten-*.json is af te lezen in plaats van gereconstrueerd
  // te moeten worden uit een apart bewaarde modeluitvoer.
  veld?: string;
  waarde?: unknown;
}

/**
 * Eén weggevallen array-element bij een verder GESLAAGDE validatie (FIXRONDE
 * 8, controller, 25 sept 2026, zie filterMetWeggevallen/WeggevallenElement
 * hierboven). Dit is bewust een apart, lichter record naast VerwerkFout in
 * plaats van er een veld op te plakken: een weggevallen element is geen
 * afkeuring (het product is wél geschreven), en meeliften op VerwerkFout zou
 * "mislukt" en "gelukt met een kanttekening" door elkaar laten lopen in
 * tag-fouten-*.json, precies het soort tellingsfout die deze fixronde
 * repareert. Wel dezelfde velden (custom_id/veld/waarde) zodat dezelfde
 * mining-aanpak als bij de vorige fixrondes (tellen per veld+waarde) er
 * rechtstreeks op los kan.
 */
export interface WeggevallenRecord {
  custom_id: string;
  veld: string;
  waarde: unknown;
}

export function verwerkResultaten(
  resultaten: BatchResultaat[],
  modus: Modus
): { rijen: TagRij[]; fouten: VerwerkFout[]; weggevallen: WeggevallenRecord[] } {
  const versie = modus === "foto" ? TAGGER_VERSION_FOTO : TAGGER_VERSION;
  const rijen: TagRij[] = [];
  const fouten: VerwerkFout[] = [];
  const weggevallen: WeggevallenRecord[] = [];

  for (const r of resultaten) {
    if (r.result.type !== "succeeded" || !r.result.message) {
      fouten.push({ custom_id: r.custom_id, reden: `${r.result.type}: ${r.result.error?.type ?? "geen detail"}` });
      continue;
    }
    if (r.result.message.stop_reason === "max_tokens") {
      fouten.push({ custom_id: r.custom_id, reden: "max_tokens: uitvoer afgekapt" });
      continue;
    }
    const tekst = r.result.message.content.find((b) => b.type === "text")?.text ?? "";
    let obj: unknown;
    try {
      obj = JSON.parse(tekst);
    } catch {
      fouten.push({ custom_id: r.custom_id, reden: "geen geldige JSON" });
      continue;
    }
    const resultaat = valideerTagsGedetailleerd(obj);
    if (!resultaat.ok) {
      fouten.push({ custom_id: r.custom_id, reden: "waarde buiten schema", veld: resultaat.veld, waarde: resultaat.waarde });
      continue;
    }
    for (const w of resultaat.weggevallen) {
      weggevallen.push({ custom_id: r.custom_id, veld: w.veld, waarde: w.waarde });
    }
    rijen.push({ ...resultaat.tags, product_id: r.custom_id, tagger_version: versie });
  }

  return { rijen, fouten, weggevallen };
}
