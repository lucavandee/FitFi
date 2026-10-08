// Deno-tests voor de gedeelde classifier. Draai met:
//   deno test --no-check --allow-read supabase/functions/_shared/productClassifier.test.ts
// --no-check omdat de twee aanroepende functiebestanden zelf pre-existente
// deno check-fouten hebben die niets met dit bestand te maken hebben; dit
// testbestand en productClassifier.ts zelf zijn los daarvan schoon, zie
// `deno check supabase/functions/_shared/productClassifier.ts`.
// --allow-read voor de lookbehind-test hieronder, die het eigen bronbestand
// leest.
import { classifyProductRaw } from "./productClassifier.ts";

function assertGelijk(werkelijk: unknown, verwacht: unknown, boodschap: string): void {
  if (werkelijk !== verwacht) {
    throw new Error(`${boodschap}: verwacht ${JSON.stringify(verwacht)}, kreeg ${JSON.stringify(werkelijk)}`);
  }
}

Deno.test("merk bepaalt de categorie niet meer: sweater met een 'Jeans'-merk wordt top", () => {
  const r = classifyProductRaw("Sweater TOMMY JEANS Men color Navy", "", "", "Tommy Jeans");
  assertGelijk(r.category, "top", "Tommy Jeans-sweater");
});

Deno.test("hetzelfde kledingstuk met een merk zonder categoriewoord wordt ook top", () => {
  const r = classifyProductRaw("Sweater TOMMY HILFIGER Men color Navy", "", "", "Tommy Hilfiger");
  assertGelijk(r.category, "top", "Tommy Hilfiger-sweater");
});

Deno.test("Moon Boot blijft footwear zonder ander kledingstukwoord in de naam", () => {
  const r = classifyProductRaw(
    "Ballet Flat MOON BOOT Woman color Black",
    "Ballet Flat MOON BOOT Woman color Black",
    "footwear",
    "Moon Boot",
  );
  assertGelijk(r.category, "footwear", "Moon Boot ballet flat");
});

Deno.test("merk met een punt aan het eind: 'Jeans Co.' mag een trui niet naar bottom trekken", () => {
  // Zelfde grensgeval als fixronde 2 op de client-kant: \b faalde stil op een
  // merk dat eindigt op een leesteken.
  const r = classifyProductRaw("Sweater JEANS CO. Men color Black", "", "", "Jeans Co.");
  assertGelijk(r.category, "top", "Jeans Co.-sweater");
});

Deno.test("Jean Paul Gaultier: 'Jean' matcht dezelfde jeans-regel als 'Jeans'", () => {
  const r = classifyProductRaw("Shirt JEAN PAUL GAULTIER Woman color White", "", "", "Jean Paul Gaultier");
  assertGelijk(r.category, "top", "Jean Paul Gaultier-shirt");
});

Deno.test("zwemkleding wordt afgewezen (spec 5.1): Swimsuit MERK Gender color X", () => {
  const boss = classifyProductRaw("Swimsuit BOSS Men color Black", "", "", "Boss");
  assertGelijk(boss.category, "other", "Swimsuit BOSS");
  const ralphLauren = classifyProductRaw("Swimsuit POLO RALPH LAUREN Men color White", "", "", "Polo Ralph Lauren");
  assertGelijk(ralphLauren.category, "other", "Swimsuit Polo Ralph Lauren");
});

Deno.test("merken die zelf 'Swim(wear)' heten geven geen valse positief: polo/T-shirt/short blijven top/bottom", () => {
  const polo = classifyProductRaw("Polo Shirt MOSCHINO SWIM Men color White", "", "", "Moschino Swim");
  assertGelijk(polo.category, "top", "Moschino Swim polo");
  const short = classifyProductRaw("Shorts MOSCHINO SWIM Men color Multicolor", "", "", "Moschino Swim");
  assertGelijk(short.category, "bottom", "Moschino Swim short");
  const sandalen = classifyProductRaw("Sandals EMPORIO ARMANI SWIMWEAR Men color Black", "", "", "Emporio Armani Swimwear");
  assertGelijk(sandalen.category, "footwear", "Emporio Armani Swimwear sandalen");
});

Deno.test("een echt zwempak van diezelfde merken wordt wel afgewezen", () => {
  const r = classifyProductRaw("Swimsuit EA7 SWIMWEAR Men color Black", "", "", "Ea7 Swimwear");
  assertGelijk(r.category, "other", "Swimsuit Ea7 Swimwear");
});

Deno.test("productClassifier.ts (Deno-kopie) bevat geen negatieve lookbehind", () => {
  // Spiegelt de test in src/engine/__tests__/productClassifier.test.ts.
  const bron = Deno.readTextFileSync(new URL("./productClassifier.ts", import.meta.url));
  const zonderCommentaar = bron.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  if (/\(\?<[!=]/.test(zonderCommentaar)) {
    throw new Error("lookbehind-syntax gevonden in productClassifier.ts (Deno-kopie)");
  }
});

// OFM noemt broeken "5-pocket" en de feed zet ze op "top" (23 van de 355 op
// 1 okt 2026). Zelfde regel als de app-kopie in src/engine/productClassifier.ts.
Deno.test("een 5-pocket van OFM wordt bottom, ook als de feed top zegt", () => {
  for (const naam of ["Pierre Cardin | Heren | 5-pocket Beige", "PME Legend | Heren | Flightrider 5-pocket Groen", "Replay | Heren | 5 pockets Blauw"]) {
    const r = classifyProductRaw(naam, "Stijlvolle 5 pockets voor mannen in maat: 33/32. Gemaakt van katoen.", "top", "Pierre Cardin");
    assertGelijk(r.category, "bottom", naam);
  }
});

// Kleding met een bijgeleverd accessoire blijft kleding (8 oktober 2026, H&M: "Jas met sjaal").
for (
  const [naam, verwacht] of [
    ["H & M - Jas met sjaal - Zwart", "outerwear"],
    ["H & M - Overhemd met stropdas - Wit", "top"],
    ["H & M - Pantalon met riem - Zwart", "bottom"],
    ["H & M - Jas met capuchon en riem - Beige", "outerwear"],
    ["H & M - Chiffon jurk met sjaal - Lichtroze/Bloemen", "dress"],
    ["H & M - Tas met riem - Zwart", "accessory"],
    ["H & M - Muts met sjaal - Grijs", "accessory"],
    ["H & M - Jas met sjaalkraag - Zwart", "outerwear"],
  ] as const
) {
  Deno.test(`bijgeleverd accessoire: "${naam}" is ${verwacht}`, () => {
    assertGelijk(classifyProductRaw(naam, "", "", "H&M").category, verwacht, naam);
  });
}
