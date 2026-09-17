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

Deno.test("productClassifier.ts (Deno-kopie) bevat geen negatieve lookbehind", () => {
  // Spiegelt de test in src/engine/__tests__/productClassifier.test.ts.
  const bron = Deno.readTextFileSync(new URL("./productClassifier.ts", import.meta.url));
  const zonderCommentaar = bron.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  if (/\(\?<[!=]/.test(zonderCommentaar)) {
    throw new Error("lookbehind-syntax gevonden in productClassifier.ts (Deno-kopie)");
  }
});
