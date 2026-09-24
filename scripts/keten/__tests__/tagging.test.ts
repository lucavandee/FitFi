import { describe, expect, it } from "vitest";
import {
  BATCH_INPUT_USD_PER_MTOK,
  BATCH_OUTPUT_USD_PER_MTOK,
  COLOR_TEMPS,
  KLEUR_SYNONIEMEN,
  KLEURTEMPERATUUR_SYNONIEMEN,
  LICHTHEID_SYNONIEMEN,
  LIGHTNESS,
  MATERIALS,
  MATERIAAL_SYNONIEMEN,
  PATROON_SYNONIEMEN,
  PATTERNS,
  SCHOENTYPE_SYNONIEMEN,
  SHOE_TYPES,
  SILHOUET_SYNONIEMEN,
  SILHOUETTES,
  TAG_SCHEMA,
  TAGGER_MODEL,
  TAGGER_VERSION,
  TAGGER_VERSION_FOTO,
  bouwGebruikersTekst,
  bouwSysteemPrompt,
  bouwVerzoek,
  normaliseerLijst,
  normaliseerWaarde,
  schatKosten,
  valideerTags,
  valideerTagsGedetailleerd,
  verwerkResultaten,
  type TagProduct,
} from "../tagging";

const product: TagProduct = {
  product_id: "11111111-1111-4111-8111-111111111111",
  name: "Slim fit overhemd van katoen",
  brand: "H&M",
  description: "Overhemd van geweven katoen met een slanke pasvorm.",
  price: 29.99,
  retailer: "H&M (NL)",
  raw_category: "top",
  gender: "male",
  image_url: "https://example.com/overhemd.jpg",
  confidence: null,
};

const geldigeTags = {
  is_fashion: true,
  category: "top",
  gender: "male",
  formality: 3,
  occasions: ["work", "date"],
  silhouette: "slim",
  color_temp: "koel",
  lightness: "licht",
  pattern: "effen",
  shoe_type: null,
  colors: ["wit"],
  materials: ["katoen"],
  seasons: ["lente", "zomer", "herfst"],
  confidence: 0.85,
};

describe("TAG_SCHEMA", () => {
  it("eist elk veld en verbiedt extra velden", () => {
    expect(TAG_SCHEMA.additionalProperties).toBe(false);
    expect([...TAG_SCHEMA.required].sort()).toEqual(Object.keys(TAG_SCHEMA.properties).sort());
    expect(TAG_SCHEMA.properties.occasions.items.enum).toEqual([
      "work", "casual", "formal", "date", "travel", "sport", "party",
    ]);
  });
});

describe("bouwVerzoek", () => {
  it("gebruikt het product_id als custom_id en structured output met het schema", () => {
    const v = bouwVerzoek(product, "tekst");
    expect(v.custom_id).toBe(product.product_id);
    expect(v.params.output_config).toEqual({ format: { type: "json_schema", schema: TAG_SCHEMA } });
    expect(typeof v.params.messages[0].content).toBe("string");
    expect(v.params.messages[0].content).toContain("H&M (NL)");
  });

  it("stuurt in foto-modus de afbeelding mee als url-blok", () => {
    const v = bouwVerzoek(product, "foto");
    const inhoud = v.params.messages[0].content as Array<{ type: string }>;
    expect(inhoud[0]).toEqual({ type: "image", source: { type: "url", url: product.image_url } });
    expect(inhoud[1].type).toBe("text");
  });

  it("valt in foto-modus terug op platte tekst zonder image_url", () => {
    const zonderFoto: TagProduct = { ...product, image_url: null };
    const v = bouwVerzoek(zonderFoto, "foto");
    expect(typeof v.params.messages[0].content).toBe("string");
  });

  it("gebruikt hetzelfde model en dezelfde systeemprompt in beide modi", () => {
    const tekstVerzoek = bouwVerzoek(product, "tekst");
    const fotoVerzoek = bouwVerzoek(product, "foto");
    expect(tekstVerzoek.params.model).toBe(TAGGER_MODEL);
    expect(fotoVerzoek.params.system).toBe(tekstVerzoek.params.system);
  });
});

describe("bouwSysteemPrompt", () => {
  it("noemt zwemkleding en ondergoed expliciet als niet-fashion", () => {
    const prompt = bouwSysteemPrompt();
    expect(prompt).toContain("zwemkleding");
    expect(prompt).toContain("ondergoed");
  });

  it("sluit zwemkleding expliciet uit van de accessory-categorie", () => {
    const prompt = bouwSysteemPrompt();
    const accessoryRegel = prompt.split("\n").find((r) => r.startsWith("- category:"));
    expect(accessoryRegel).toBeDefined();
    expect(accessoryRegel).toContain("Zwemkleding");
    expect(accessoryRegel).toContain("geen accessory");
  });

  // FIXRONDE 5 (controller, 24 sept 2026): het model haalde "smart casual"
  // (formaliteitsniveau 3) en occasions door elkaar, goed voor bijna 90% van
  // het verlies in een echte ronde (847 van de 851 afkeuringen op één reden,
  // een steekproef van 83 objecten liet occasions:"smart casual" 16x zien).
  // Deze tests bewaken dat de twee velden nu onmiskenbaar gescheiden zijn.
  it("beschrijft formality als een cijferschaal die GEEN gelegenheid is", () => {
    const prompt = bouwSysteemPrompt();
    const formalityRegel = prompt.split("\n").find((r) => r.startsWith("- formality"));
    expect(formalityRegel).toBeDefined();
    expect(formalityRegel).toContain("CIJFERSCHAAL");
    expect(formalityRegel).toContain("GEEN gelegenheid");
    expect(formalityRegel).toContain("smart casual");
  });

  it("occasions herhaalt zijn eigen zeven toegestane waarden en verbiedt 'smart casual' expliciet, vlak bij het veld", () => {
    const prompt = bouwSysteemPrompt();
    const occasionsRegel = prompt.split("\n").find((r) => r.startsWith("- occasions"));
    expect(occasionsRegel).toBeDefined();
    expect(occasionsRegel).toContain("work, casual, formal, date, travel, sport, party");
    expect(occasionsRegel).toContain("'smart casual' staat hier NIET tussen");
  });

  it("noemt 'smart casual' nooit als een van de zeven occasions-waarden zelf", () => {
    const prompt = bouwSysteemPrompt();
    const occasionsRegel = prompt.split("\n").find((r) => r.startsWith("- occasions"));
    const lijstDeel = occasionsRegel!.split(":")[1].split(".")[0];
    expect(lijstDeel.toLowerCase()).not.toContain("smart casual");
  });
});

describe("bouwGebruikersTekst", () => {
  it("vult ontbrekende velden met 'onbekend' of 'geen' in plaats van 'null'", () => {
    const leeg: TagProduct = {
      ...product,
      brand: null,
      retailer: null,
      raw_category: null,
      gender: null,
      description: null,
    };
    const tekst = bouwGebruikersTekst(leeg);
    expect(tekst).not.toContain("null");
    expect(tekst).toContain("Merk: onbekend");
    expect(tekst).toContain("Beschrijving: geen");
  });
});

describe("valideerTags", () => {
  it("accepteert een geldige uitvoer", () => {
    expect(valideerTags(geldigeTags)).toEqual(geldigeTags);
  });

  it("wijst een waarde buiten de lijst af", () => {
    // "cold" i.p.v. het oudere "cool": sinds FIXRONDE 6 normaliseert "cool"
    // naar "koel" (zie het aparte normaliseerWaarde-testblok verderop), dus
    // die waarde test hier niet langer een echte afkeuring. "cold" heeft geen
    // synoniem en blijft dus wel een afkeuring.
    expect(valideerTags({ ...geldigeTags, color_temp: "cold" })).toBeNull();
    expect(valideerTags({ ...geldigeTags, occasions: ["werk"] })).toBeNull();
    expect(valideerTags({ ...geldigeTags, confidence: 1.4 })).toBeNull();
  });

  it("zet shoe_type op null als de categorie geen footwear is", () => {
    expect(valideerTags({ ...geldigeTags, shoe_type: "sneaker" })?.shoe_type).toBeNull();
    expect(valideerTags({ ...geldigeTags, category: "footwear", shoe_type: "sneaker" })?.shoe_type).toBe("sneaker");
  });

  it("forceert is_fashion op false zodra category 'geen' is, ook als het model true meegeeft", () => {
    const badpak = { ...geldigeTags, is_fashion: true, category: "geen" };
    expect(valideerTags(badpak)?.is_fashion).toBe(false);
  });

  it("laat is_fashion true bij een echte categorie", () => {
    expect(valideerTags(geldigeTags)?.is_fashion).toBe(true);
  });

  it("wijst niet-object en ontbrekende velden af", () => {
    expect(valideerTags(null)).toBeNull();
    expect(valideerTags("tekst")).toBeNull();
    expect(valideerTags(42)).toBeNull();
    const { formality: _formality, ...zonderFormality } = geldigeTags;
    expect(valideerTags(zonderFormality)).toBeNull();
  });

  it("wijst een object met een onbekend extra veld af (additionalProperties: false)", () => {
    expect(valideerTags({ ...geldigeTags, extraField: "x" })).toBeNull();
  });

  it("wijst een formality buiten 1..5 af", () => {
    expect(valideerTags({ ...geldigeTags, formality: 0 })).toBeNull();
    expect(valideerTags({ ...geldigeTags, formality: 6 })).toBeNull();
    expect(valideerTags({ ...geldigeTags, formality: 3.5 })).toBeNull();
  });

  it("accepteert confidence op de grenzen 0 en 1", () => {
    expect(valideerTags({ ...geldigeTags, confidence: 0 })?.confidence).toBe(0);
    expect(valideerTags({ ...geldigeTags, confidence: 1 })?.confidence).toBe(1);
  });

  it("wijst een ongeldige kleur of seizoen af (geen normalisatie op deze velden)", () => {
    // "turquoise" is een echt onopgelost geval (koel of neutraal? geen zekere
    // canonieke kleur), en seasons krijgt bewust geen normalisatielaag (spec
    // 5.1 noemt alleen colors/materials, zie FIXRONDE 5 in tagging.ts).
    expect(valideerTags({ ...geldigeTags, colors: ["turquoise"] })).toBeNull();
    expect(valideerTags({ ...geldigeTags, seasons: ["voorjaar"] })).toBeNull();
  });

  it("normaliseert 'polyester' naar 'synthetisch' vóór validatie (FIXRONDE 5, controller 24 sept 2026)", () => {
    // Polyester is per definitie een synthetische vezel, geen inschatting.
    // Vóór de normalisatielaag werd dit afgekeurd; dat was precies het soort
    // verlies dat de echte ronde grotendeels trof (samen met "elastaan",
    // hieronder apart getest).
    expect(valideerTags({ ...geldigeTags, materials: ["polyester"] })?.materials).toEqual(["synthetisch"]);
  });

  it("wijst een materiaal af dat na normalisatie nog steeds onbekend is (geen gok)", () => {
    // "stretchdenim" is de echte, geobserveerde modeluitvoer (terugdraai-
    // toets 23 sept 2026, aanroep 3): geen canonieke waarde, geen synoniem.
    // Blijft een afkeuring, wordt niet naar "denim" of "synthetisch" geraden.
    expect(valideerTags({ ...geldigeTags, materials: ["stretchdenim"] })).toBeNull();
  });

  it("wijst een shoe_type buiten de lijst af, ook bij category footwear", () => {
    expect(valideerTags({ ...geldigeTags, category: "footwear", shoe_type: "instapper" })).toBeNull();
  });

  it("ontdubbelt herhaalde waarden in occasions, colors, materials en seasons", () => {
    const metDubbelen = {
      ...geldigeTags,
      occasions: ["work", "work", "date"],
      colors: ["wit", "wit"],
      materials: ["katoen", "katoen"],
      seasons: ["lente", "lente", "zomer"],
    };
    const uit = valideerTags(metDubbelen);
    expect(uit?.occasions).toEqual(["work", "date"]);
    expect(uit?.colors).toEqual(["wit"]);
    expect(uit?.materials).toEqual(["katoen"]);
    expect(uit?.seasons).toEqual(["lente", "zomer"]);
  });
});

// FIXRONDE 5 (controller, 24 sept 2026): normalisatielaag vóór validatie,
// spec 5.1 ("colors/materials genormaliseerd"). Twee harde grenzen: alleen
// normaliseren waar de betekenis vaststaat, en nooit stilzwijgend informatie
// weggooien (een onopgelost geval blijft ongewijzigd staan, dus een afkeuring).
describe("normaliseerLijst (kleuren en materialen, vóór validatie)", () => {
  it("is hoofdletter- en spatie-ongevoelig", () => {
    expect(valideerTags({ ...geldigeTags, colors: [" Zwart "] })?.colors).toEqual(["zwart"]);
    expect(valideerTags({ ...geldigeTags, materials: ["KATOEN"] })?.materials).toEqual(["katoen"]);
  });

  it("herkent Engelse varianten van de Nederlandse schemawaarden", () => {
    expect(valideerTags({ ...geldigeTags, colors: ["black", "white"] })?.colors).toEqual(["zwart", "wit"]);
    expect(valideerTags({ ...geldigeTags, materials: ["cotton", "leather"] })?.materials).toEqual(["katoen", "leer"]);
  });

  it("herkent de simpele meervoudsvorm, ook gecombineerd met een Engels synoniem", () => {
    // "pinks" -> stripped "pink" -> Engels synoniem -> "roze".
    expect(valideerTags({ ...geldigeTags, colors: ["pinks"] })?.colors).toEqual(["roze"]);
  });

  it("mapt elastaan (het geval uit de diagnose) en verwante synthetische vezelnamen naar 'synthetisch'", () => {
    for (const vezel of ["elastaan", "elastane", "spandex", "lycra", "nylon", "polyamide", "acryl"]) {
      expect(valideerTags({ ...geldigeTags, materials: [vezel] })?.materials).toEqual(["synthetisch"]);
    }
  });

  it("laat een onopgelost geval ONGEWIJZIGD staan, zodat het een afkeuring blijft (geen gok naar de dichtstbijzijnde waarde)", () => {
    // Viscose is halfsynthetisch: geen zekere 1-op-1 met een van de negen
    // schemawaarden, dus bewust geen synoniem.
    expect(valideerTags({ ...geldigeTags, materials: ["viscose"] })).toBeNull();
    expect(normaliseerLijst(["viscose"], MATERIALS, MATERIAAL_SYNONIEMEN)).toEqual(["viscose"]);
  });

  it("laat een niet-array-waarde ongemoeid (valideerTags keurt die op de normale manier af)", () => {
    expect(normaliseerLijst("niet-een-array", MATERIALS, MATERIAAL_SYNONIEMEN)).toBe("niet-een-array");
    expect(normaliseerLijst(null, MATERIALS, MATERIAAL_SYNONIEMEN)).toBeNull();
  });

  it("KLEUR_SYNONIEMEN en MATERIAAL_SYNONIEMEN wijzen uitsluitend naar canonieke schemawaarden", () => {
    const kleuren = new Set(TAG_SCHEMA.properties.colors.items.enum);
    const materialen = new Set(TAG_SCHEMA.properties.materials.items.enum);
    for (const doel of Object.values(KLEUR_SYNONIEMEN)) expect(kleuren.has(doel as string)).toBe(true);
    for (const doel of Object.values(MATERIAAL_SYNONIEMEN)) expect(materialen.has(doel as string)).toBe(true);
  });

  it("mapt 'synthetic' en 'plastic' (generieke Engelse woorden, geen specifieke vezelnaam) naar 'synthetisch'", () => {
    expect(valideerTags({ ...geldigeTags, materials: ["synthetic"] })?.materials).toEqual(["synthetisch"]);
    expect(valideerTags({ ...geldigeTags, materials: ["plastic"] })?.materials).toEqual(["synthetisch"]);
  });

  it("mapt 'kunststof', 'kunstleer' en 'imitatieleer' naar 'synthetisch' (Nederlandse woorden, geen gok: toegevoegd na de meting)", () => {
    // Gevonden in de meting die deze fix moest toetsen: kunststof was, samen
    // met kunstleer/imitatieleer, de enige overgebleven reden van afkeuring
    // in producten die op color_temp/lightness/pattern al foutloos waren -
    // zie het commentaar bij MATERIAAL_SYNONIEMEN.
    expect(valideerTags({ ...geldigeTags, materials: ["kunststof"] })?.materials).toEqual(["synthetisch"]);
    expect(valideerTags({ ...geldigeTags, materials: ["kunstleer"] })?.materials).toEqual(["synthetisch"]);
    expect(valideerTags({ ...geldigeTags, materials: ["imitatieleer"] })?.materials).toEqual(["synthetisch"]);
  });

  it("laat 'geweven', 'joggingstof' en 'twill' ONGEWIJZIGD staan (weef-/stoftype, geen vezelnaam, bewust geen synoniem, FIXRONDE 6)", () => {
    // Zelfde principe als viscose hierboven, nu met de drie andere woorden
    // uit de opdracht die samen met viscose de grootste materialen-
    // afkeuringen in de lopende H&M-ronde vormden (740x, 293x, 285x).
    expect(valideerTags({ ...geldigeTags, materials: ["geweven"] })).toBeNull();
    expect(valideerTags({ ...geldigeTags, materials: ["joggingstof"] })).toBeNull();
    expect(valideerTags({ ...geldigeTags, materials: ["twill"] })).toBeNull();
    expect(valideerTags({ ...geldigeTags, materials: ["woven"] })).toBeNull();
  });

  it("laat 'goud' (kleur) ONGEWIJZIGD staan: geen zekere 1-op-1 met een van de vijftien schemakleuren", () => {
    expect(valideerTags({ ...geldigeTags, colors: ["goud"] })).toBeNull();
  });
});

// FIXRONDE 6 (controller, 24 sept 2026): dezelfde normalisatielaag, nu ook
// voor de vijf SCALAIRE velden (geen array) met een vaste Nederlandse
// waardenlijst. Aanleiding: de lopende H&M-ronde liet zien dat het model
// hetzelfde "Engels waar Nederlands hoort"-patroon dat FIXRONDE 5 al bij
// colors/materials herkende, ook hier laat zien (color_temp:'cool' 6.475x in
// 248 foutbestanden, lightness:'light' 674x, pattern:'solid' 108x, zie
// tagging.ts). Zelfde twee harde grenzen als hierboven.
describe("normaliseerWaarde (scalaire velden, vóór validatie, FIXRONDE 6)", () => {
  it("normaliseert color_temp: 'cool' -> 'koel', 'neutral' -> 'neutraal', hoofdletter-ongevoelig", () => {
    expect(valideerTags({ ...geldigeTags, color_temp: "cool" })?.color_temp).toBe("koel");
    expect(valideerTags({ ...geldigeTags, color_temp: "Cool" })?.color_temp).toBe("koel");
    expect(valideerTags({ ...geldigeTags, color_temp: "neutral" })?.color_temp).toBe("neutraal");
  });

  it("laat color_temp 'warm' met rust: identiek gespeld in beide talen, geen synoniem nodig", () => {
    expect(valideerTags({ ...geldigeTags, color_temp: "warm" })?.color_temp).toBe("warm");
  });

  it("normaliseert lightness: 'light' -> 'licht', 'dark' -> 'donker'", () => {
    expect(valideerTags({ ...geldigeTags, lightness: "light" })?.lightness).toBe("licht");
    expect(valideerTags({ ...geldigeTags, lightness: "dark" })?.lightness).toBe("donker");
  });

  it("normaliseert pattern: 'solid' en 'plain' -> 'effen', 'subtle' -> 'subtiel'", () => {
    expect(valideerTags({ ...geldigeTags, pattern: "solid" })?.pattern).toBe("effen");
    expect(valideerTags({ ...geldigeTags, pattern: "plain" })?.pattern).toBe("effen");
    expect(valideerTags({ ...geldigeTags, pattern: "subtle" })?.pattern).toBe("subtiel");
  });

  it("normaliseert silhouette: 'loose' -> 'relaxed' (het enige waargenomen geval in productie)", () => {
    expect(valideerTags({ ...geldigeTags, silhouette: "loose" })?.silhouette).toBe("relaxed");
  });

  it("laat een onopgelost geval per scalair veld ONGEWIJZIGD staan (blijft een afkeuring, geen gok)", () => {
    // "cold" is geen woord dat de opdracht of de productiedata noemt; net als
    // viscose bij materials moet dit een afkeuring blijven, geen gok naar
    // "koel".
    expect(valideerTags({ ...geldigeTags, color_temp: "cold" })).toBeNull();
    expect(normaliseerWaarde("cold", COLOR_TEMPS, KLEURTEMPERATUUR_SYNONIEMEN)).toBe("cold");
  });

  it("normaliseert shoe_type bij category footwear: 'boot' -> 'laars', 'sandal' -> 'sandaal', 'dress'/'formal' -> 'net'", () => {
    expect(valideerTags({ ...geldigeTags, category: "footwear", shoe_type: "boot" })?.shoe_type).toBe("laars");
    expect(valideerTags({ ...geldigeTags, category: "footwear", shoe_type: "sandal" })?.shoe_type).toBe("sandaal");
    expect(valideerTags({ ...geldigeTags, category: "footwear", shoe_type: "dress" })?.shoe_type).toBe("net");
    expect(valideerTags({ ...geldigeTags, category: "footwear", shoe_type: "formal" })?.shoe_type).toBe("net");
  });

  it("KLEURTEMPERATUUR_/LICHTHEID_/PATROON_/SILHOUET_/SCHOENTYPE_SYNONIEMEN wijzen uitsluitend naar canonieke schemawaarden", () => {
    const naar = <T extends readonly string[]>(map: Partial<Record<string, T[number]>>, lijst: T) => {
      const toegestaan = new Set<string>(lijst);
      for (const doel of Object.values(map)) expect(toegestaan.has(doel as string)).toBe(true);
    };
    naar(KLEURTEMPERATUUR_SYNONIEMEN, COLOR_TEMPS);
    naar(LICHTHEID_SYNONIEMEN, LIGHTNESS);
    naar(PATROON_SYNONIEMEN, PATTERNS);
    naar(SILHOUET_SYNONIEMEN, SILHOUETTES);
    naar(SCHOENTYPE_SYNONIEMEN, SHOE_TYPES);
  });
});

// FIXRONDE 6 (controller, 24 sept 2026), punt 2 van de opdracht: "lege string
// is niet hetzelfde als afwezig". shoe_type is de concrete diagnose (86 van
// 86 shoe_type-afkeuringen in de lopende H&M-ronde waren een ontbrekend
// veld bij een NIET-footwear product, geen enkele een echt foutief
// schoentype bij een schoen, zie het commentaar in tagging.ts).
describe("shoe_type: leeg/ontbrekend bij een niet-footwear product is geen afkeuring meer (FIXRONDE 6)", () => {
  it("accepteert een lege string bij een niet-footwear product en zet shoe_type op null", () => {
    const resultaat = valideerTagsGedetailleerd({ ...geldigeTags, category: "top", shoe_type: "" });
    expect(resultaat.ok).toBe(true);
    if (resultaat.ok) expect(resultaat.tags.shoe_type).toBeNull();
  });

  it("accepteert een volledig ONTBREKEND shoe_type-veld bij een niet-footwear product (het echte model-gedrag zonder --json-schema)", () => {
    const { shoe_type: _shoe_type, ...zonderShoeType } = geldigeTags;
    expect(zonderShoeType).not.toHaveProperty("shoe_type");
    const resultaat = valideerTagsGedetailleerd({ ...zonderShoeType, category: "top" });
    expect(resultaat.ok).toBe(true);
    if (resultaat.ok) expect(resultaat.tags.shoe_type).toBeNull();
  });

  it("blijft een echt foutief schoentype bij een FOOTWEAR-product afkeuren, ook na deze fix", () => {
    expect(valideerTagsGedetailleerd({ ...geldigeTags, category: "footwear", shoe_type: "" })).toEqual({
      ok: false,
      veld: "shoe_type",
      waarde: "",
    });
    expect(valideerTagsGedetailleerd({ ...geldigeTags, category: "footwear", shoe_type: "instapper" })).toEqual({
      ok: false,
      veld: "shoe_type",
      waarde: "instapper",
    });
  });

  it("reproduceert het echte productiepad: JSON.stringify laat een ontbrekend shoe_type-veld weg, verwerkResultaten accepteert het toch voor een niet-footwear product", () => {
    // JSON.stringify(undefined-veld) laat de sleutel volledig weg (geen
    // "null" in de tekst); dat is precies wat --json-schema-loze aanroepen
    // soms teruggeven. Dit reproduceert dat pad end-to-end, niet alleen op
    // een handmatig object.
    const { shoe_type: _shoe_type, ...zonderShoeType } = geldigeTags;
    const tekst = JSON.stringify({ ...zonderShoeType, category: "top" });
    expect(tekst).not.toContain("shoe_type");
    const resultaat = {
      custom_id: "zonder-shoe-type",
      result: { type: "succeeded", message: { stop_reason: "end_turn", content: [{ type: "text", text: tekst }] } },
    };
    const uit = verwerkResultaten([resultaat], "tekst");
    expect(uit.fouten).toEqual([]);
    expect(uit.rijen[0].shoe_type).toBeNull();
  });
});

// FIXRONDE 6 (controller, 24 sept 2026), punt 4 van de opdracht: gender en
// formality zijn GEEN normalisatiekwestie (geen NL/EN-verwarring, gewoon een
// ontbrekende waarde) en horen afgekeurd te blijven. Deze tests controleren
// alleen dat ze correct als ONTBREKEND herkend worden, niet als iets anders,
// inclusief het echte JSON.stringify-gedrag (sleutel valt weg, niet "null").
describe("gender/formality: ontbrekend blijft afgekeurd, niet iets anders (FIXRONDE 6, geen normalisatiekwestie)", () => {
  it("keurt een ontbrekend gender-veld af als 'gender', niet als een ander veld", () => {
    const { gender: _gender, ...zonderGender } = geldigeTags;
    expect(valideerTagsGedetailleerd(zonderGender)).toEqual({ ok: false, veld: "gender", waarde: undefined });
  });

  it("keurt een ontbrekend formality-veld af als 'formality', niet als een ander veld", () => {
    const { formality: _formality, ...zonderFormality } = geldigeTags;
    expect(valideerTagsGedetailleerd(zonderFormality)).toEqual({ ok: false, veld: "formality", waarde: undefined });
  });

  it("reproduceert het echte productiepad voor beide via JSON.stringify (sleutel valt weg, geen 'null' in de tekst)", () => {
    const { gender: _gender, ...zonderGender } = geldigeTags;
    const tekstGender = JSON.stringify(zonderGender);
    expect(tekstGender).not.toContain("gender");
    const uitGender = verwerkResultaten(
      [{ custom_id: "a", result: { type: "succeeded", message: { stop_reason: "end_turn", content: [{ type: "text", text: tekstGender }] } } }],
      "tekst"
    );
    expect(uitGender.rijen).toEqual([]);
    expect(uitGender.fouten).toEqual([{ custom_id: "a", reden: "waarde buiten schema", veld: "gender", waarde: undefined }]);

    const { formality: _formality, ...zonderFormality } = geldigeTags;
    const tekstFormality = JSON.stringify(zonderFormality);
    expect(tekstFormality).not.toContain("formality");
    const uitFormality = verwerkResultaten(
      [{ custom_id: "b", result: { type: "succeeded", message: { stop_reason: "end_turn", content: [{ type: "text", text: tekstFormality }] } } }],
      "tekst"
    );
    expect(uitFormality.rijen).toEqual([]);
    expect(uitFormality.fouten).toEqual([{ custom_id: "b", reden: "waarde buiten schema", veld: "formality", waarde: undefined }]);
  });
});

describe("valideerTagsGedetailleerd (veld+waarde bij een afkeuring, FIXRONDE 5)", () => {
  it("geeft bij een geldige uitvoer ok:true met de getagde rij", () => {
    const resultaat = valideerTagsGedetailleerd(geldigeTags);
    expect(resultaat.ok).toBe(true);
    if (resultaat.ok) expect(resultaat.tags).toEqual(geldigeTags);
  });

  it("meldt precies welk veld en welke waarde een occasions-afkeuring veroorzaakten (het 'smart casual'-geval)", () => {
    const resultaat = valideerTagsGedetailleerd({ ...geldigeTags, occasions: ["work", "smart casual"] });
    expect(resultaat).toEqual({ ok: false, veld: "occasions", waarde: ["work", "smart casual"] });
  });

  it("meldt veld+waarde voor elk van de andere schemavelden", () => {
    // "cold" i.p.v. "cool": zie de toelichting bij "wijst een waarde buiten
    // de lijst af" hierboven (FIXRONDE 6 normaliseert "cool" nu naar "koel").
    expect(valideerTagsGedetailleerd({ ...geldigeTags, color_temp: "cold" })).toEqual({
      ok: false,
      veld: "color_temp",
      waarde: "cold",
    });
    expect(valideerTagsGedetailleerd({ ...geldigeTags, formality: 9 })).toEqual({
      ok: false,
      veld: "formality",
      waarde: 9,
    });
  });

  it("meldt het onbekende veld zelf bij additionalProperties-schending", () => {
    const resultaat = valideerTagsGedetailleerd({ ...geldigeTags, extraField: "x" });
    expect(resultaat).toEqual({ ok: false, veld: "extraField", waarde: "x" });
  });

  it("valideerTags blijft een dunne wrapper: null bij ok:false, de rij bij ok:true", () => {
    expect(valideerTags({ ...geldigeTags, formality: 9 })).toBeNull();
    expect(valideerTags(geldigeTags)).toEqual(geldigeTags);
  });
});

describe("schatKosten", () => {
  it("rekent met de batchprijs van Haiku 4.5 (helft van 1 en 5 dollar per miljoen)", () => {
    const k = schatKosten({ aantal: 100_000, gemInputTokens: 900, gemOutputTokens: 150 });
    expect(k.inputUsd).toBeCloseTo(45, 2);
    expect(k.outputUsd).toBeCloseTo(37.5, 2);
    expect(k.totaalUsd).toBeCloseTo(82.5, 2);
  });

  it("gebruikt de batchtarieven 0.5 en 2.5 per miljoen (helft van de standaardprijs)", () => {
    expect(BATCH_INPUT_USD_PER_MTOK).toBe(0.5);
    expect(BATCH_OUTPUT_USD_PER_MTOK).toBe(2.5);
  });

  it("geeft ruwweg 76 dollar voor de eerste tagronde (91.650 producten)", () => {
    // Luc's eigen ruwe raming voor de eerste ronde: circa 76 dollar bij
    // 91.650 producten, ~900 input- en ~150 outputtokens per stuk.
    const k = schatKosten({ aantal: 91_650, gemInputTokens: 900, gemOutputTokens: 150 });
    expect(k.totaalUsd).toBeGreaterThan(70);
    expect(k.totaalUsd).toBeLessThan(80);
  });

  it("is nul bij nul producten en schaalt lineair met het aantal", () => {
    expect(schatKosten({ aantal: 0, gemInputTokens: 900, gemOutputTokens: 150 }).totaalUsd).toBe(0);
    const een = schatKosten({ aantal: 1, gemInputTokens: 900, gemOutputTokens: 150 });
    const duizend = schatKosten({ aantal: 1000, gemInputTokens: 900, gemOutputTokens: 150 });
    expect(duizend.totaalUsd).toBeCloseTo(een.totaalUsd * 1000, 6);
  });
});

describe("verwerkResultaten", () => {
  const geslaagd = {
    custom_id: product.product_id,
    result: {
      type: "succeeded",
      message: { stop_reason: "end_turn", content: [{ type: "text", text: JSON.stringify(geldigeTags) }] },
    },
  };

  it("maakt van een geslaagd resultaat een tagrij met de juiste versie", () => {
    const uit = verwerkResultaten([geslaagd], "tekst");
    expect(uit.fouten).toEqual([]);
    expect(uit.rijen[0]).toMatchObject({ product_id: product.product_id, tagger_version: TAGGER_VERSION, formality: 3 });
    expect(verwerkResultaten([geslaagd], "foto").rijen[0].tagger_version).toBe(TAGGER_VERSION_FOTO);
  });

  it("zet errored, expired en onleesbare uitvoer bij de fouten", () => {
    const uit = verwerkResultaten(
      [
        { custom_id: "a", result: { type: "errored", error: { type: "invalid_request" } } },
        { custom_id: "b", result: { type: "expired" } },
        { custom_id: "c", result: { type: "succeeded", message: { stop_reason: "end_turn", content: [{ type: "text", text: "{geen json" }] } } },
      ],
      "tekst"
    );
    expect(uit.rijen).toEqual([]);
    expect(uit.fouten.map((f) => f.custom_id)).toEqual(["a", "b", "c"]);
  });

  it("forceert is_fashion op false via het volledige pad (JSON-parse plus validatie) wanneer category 'geen' is", () => {
    const badpak = {
      custom_id: "swim-1",
      result: {
        type: "succeeded",
        message: {
          stop_reason: "end_turn",
          content: [{ type: "text", text: JSON.stringify({ ...geldigeTags, is_fashion: true, category: "geen" }) }],
        },
      },
    };
    const uit = verwerkResultaten([badpak], "tekst");
    expect(uit.fouten).toEqual([]);
    expect(uit.rijen[0].is_fashion).toBe(false);
    expect(uit.rijen[0].category).toBe("geen");
  });

  it("zet een resultaat met stop_reason max_tokens bij de fouten in plaats van afgekapte tags te accepteren", () => {
    const afgekapt = {
      custom_id: "d",
      result: {
        type: "succeeded",
        message: { stop_reason: "max_tokens", content: [{ type: "text", text: JSON.stringify(geldigeTags).slice(0, 40) }] },
      },
    };
    const uit = verwerkResultaten([afgekapt], "tekst");
    expect(uit.rijen).toEqual([]);
    expect(uit.fouten).toEqual([{ custom_id: "d", reden: "max_tokens: uitvoer afgekapt" }]);
  });

  it("zet een succesvol resultaat zonder tekstblok (bijvoorbeeld alleen een ander blok) bij de fouten", () => {
    const zonderTekst = {
      custom_id: "e",
      result: {
        type: "succeeded",
        message: { stop_reason: "end_turn", content: [{ type: "thinking" }] },
      },
    };
    const uit = verwerkResultaten([zonderTekst], "tekst");
    expect(uit.rijen).toEqual([]);
    expect(uit.fouten).toEqual([{ custom_id: "e", reden: "geen geldige JSON" }]);
  });

  it("zet geldige JSON die het schema niet haalt bij de fouten met reden 'waarde buiten schema'", () => {
    // "cold" i.p.v. "cool": zie de toelichting bij "wijst een waarde buiten
    // de lijst af" hierboven (FIXRONDE 6 normaliseert "cool" nu naar "koel").
    const buitenSchema = {
      custom_id: "f",
      result: {
        type: "succeeded",
        message: { stop_reason: "end_turn", content: [{ type: "text", text: JSON.stringify({ ...geldigeTags, color_temp: "cold" }) }] },
      },
    };
    const uit = verwerkResultaten([buitenSchema], "tekst");
    expect(uit.rijen).toEqual([]);
    // FIXRONDE 5 (controller, 24 sept 2026): het foutenrecord bevat nu ook
    // veld+waarde, zodat de oorzaak niet meer uit een apart bewaarde
    // modeluitvoer gereconstrueerd hoeft te worden.
    expect(uit.fouten).toEqual([{ custom_id: "f", reden: "waarde buiten schema", veld: "color_temp", waarde: "cold" }]);
  });

  it("verwerkt een gemengde lijst en houdt geslaagde en gefaalde rijen in de oorspronkelijke volgorde uit elkaar", () => {
    const fout = { custom_id: "g", result: { type: "expired" } };
    const uit = verwerkResultaten([geslaagd, fout], "tekst");
    expect(uit.rijen).toHaveLength(1);
    expect(uit.fouten).toHaveLength(1);
    expect(uit.rijen[0].product_id).toBe(product.product_id);
    expect(uit.fouten[0].custom_id).toBe("g");
  });
});
