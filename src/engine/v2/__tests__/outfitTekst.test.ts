/**
 * Titel en uitleg van een outfit zeggen alleen wat er echt in zit.
 *
 * Aanleiding (keten-kritiek, 16 oktober 2026). Lucs uitslag had titels als
 * "Dagelijks comfort · leer h" (het eerste woord van "H & M - Leren jack"),
 * "rood relaxed" bij een ivoorwitte jurk (de meest voorkomende kleur van de
 * hele outfit, plus een vast woord per stijl) en acht keer dezelfde opening.
 * De uitleg zei "Volledig in leer" bij een outfit met een leren stuk,
 * "In je warme kleurpalet" bij zwart en wit, "Gebouwd rond de Victoria
 * Victoria Beckham shirt", "Compleet van top tot schoen" bij een jurk met
 * schoenen en "Voor je vrije dag 6".
 */
import { describe, expect, it } from "vitest";
import { outfitTitel, outfitUitleg, type TekstStuk } from "../outfitTekst";

const stuk = (category: string, name: string, colors: string[] = [], price = 50): TekstStuk => ({
  category,
  product: { id: name, name, colors, price },
});

const jurkMetSneakers = [
  stuk("dress", "H & M - Popeline jurk met flared rok - Ivoorwit", ["ivoorwit"], 19.99),
  stuk("footwear", "PUMA Court Classic Vulcanised Formstrip uniseks sneakers, Zwart/Wit, Maat 40", ["zwart/wit"], 59.95),
];
const truiRokSneakers = [
  stuk("top", "H & M - Trui van mohairmix - Wit", ["wit"], 129),
  stuk("bottom", "H & M - Katoenen rok met kant - Wit", ["wit"], 49.99),
  stuk("footwear", "PUMA CA Pro Classic II sneakers, Wit, Maat 44,5", ["wit"], 89.95),
];

describe("outfitTitel", () => {
  it("beschrijft het hoofdstuk met zijn eigen kleur, en de schoen", () => {
    expect(outfitTitel(jurkMetSneakers)).toBe("Ivoorwitte jurk met sneakers");
    expect(outfitTitel(truiRokSneakers)).toBe("Witte trui, witte rok en sneakers");
  });

  it("verbuigt de kleur niet bij een het-woord", () => {
    const t = outfitTitel([
      stuk("top", "H & M - Overhemd van popeline - Lichtblauw", ["lichtblauw"]),
      stuk("bottom", "H & M - Rechte broek van twill - Zwart", ["zwart"]),
      stuk("footwear", "H & M - Leren loafers - Bruin", ["bruin"]),
    ]);
    expect(t).toBe("Lichtblauw overhemd, zwarte broek en loafers");
  });

  it("laat een kleur weg die niet te verbuigen is, en het stuk niet", () => {
    const t = outfitTitel([
      stuk("top", "Caroline Tensen Carberry Blouse Wit", ["wit"]),
      stuk("bottom", "Felice Broek Off White", ["off white"]),
      stuk("footwear", "PUMA Fade sneakers uniseks, Groen/Zwart, Maat 41", ["groen/zwart"]),
    ]);
    expect(t).toBe("Witte blouse, broek en sneakers");
  });

  it("vindt het woord ook in een samenstelling", () => {
    expect(
      outfitTitel([
        stuk("dress", "H & M - Popeline overhemdjurk met drawstrings - Blauw", ["blauw"]),
        stuk("footwear", "H & M - Kniehoge leren laarzen - Zwart", ["zwart"]),
      ])
    ).toBe("Blauwe jurk met laarzen");
    expect(
      outfitTitel([
        stuk("top", "H & M - Trui van kasjmiermix - Wit", ["wit"]),
        stuk("bottom", "H & M - Bootcut-broek van wolmix - Grijs", ["grijs"]),
        stuk("footwear", "H & M - Kniehoge leren laarzen - Zwart", ["zwart"]),
      ])
    ).toBe("Witte trui, grijze broek en laarzen");
  });

  it("geeft nooit een losse letter of een stijlwoord als titel", () => {
    const t = outfitTitel([
      stuk("top", "H & M - Leren jack - Bruin", ["bruin"]),
      stuk("bottom", "H & M - Wide leg jeans - Lichtblauw", ["lichtblauw"]),
      stuk("footwear", "H & M - Sneakers - Wit", ["wit"]),
    ]);
    expect(t).not.toMatch(/\b[a-z]\b|relaxed|tailored|essential/);
    expect(t).toBe("Bruin jack, lichtblauwe jeans en sneakers");
  });
});

describe("outfitUitleg", () => {
  const luc = { stylePreferences: ["streetwear"], lightness: "licht", materials: ["katoen", "wol", "denim"] };

  it("opent met de gelegenheid, noemt een feit en de totaalprijs", () => {
    const u = outfitUitleg(jurkMetSneakers, "date", luc, 0);
    expect(u).toBe("Voor een avond uit. Met sneakers, passend bij streetwear. Samen €80.");
  });

  it("wisselt het feit per outfit als er meer kloppen", () => {
    expect(outfitUitleg(truiRokSneakers, "casual", luc, 1)).toBe(
      "Voor je vrije dag. Licht van kleur, zoals je koos. Samen €269."
    );
    expect(outfitUitleg(truiRokSneakers, "casual", luc, 2)).toBe(
      "Voor je vrije dag. Met katoen, een van je materialen. Samen €269."
    );
  });

  it("noemt geen feit dat niet klopt", () => {
    const donker = [
      stuk("top", "H & M - Trui - Zwart", ["zwart"]),
      stuk("bottom", "H & M - Broek - Zwart", ["zwart"]),
      stuk("footwear", "H & M - Leren laarzen - Zwart", ["zwart"]),
    ];
    const u = outfitUitleg(donker, "work", luc, 1);
    expect(u).not.toMatch(/sneakers|Licht van kleur|katoen/);
    expect(u).toBe("Voor kantoor. Samen €150.");
  });

  it("noemt licht alleen als er geen donker stuk in zit", () => {
    const donkereJurk = [
      stuk("dress", "H & M - Gedrapeerde jurk - Donkerbruin", ["donkerbruin"]),
      stuk("footwear", "PUMA Basket Classic XXI sneakers, Wit", ["wit"]),
    ];
    for (const i of [0, 1, 2]) {
      expect(outfitUitleg(donkereJurk, "casual", luc, i)).not.toMatch(/Licht van kleur/);
    }
  });

  it("gebruikt geen van de oude loze zinnen", () => {
    for (const i of [0, 1, 2, 3]) {
      const u = outfitUitleg(truiRokSneakers, "casual", luc, i);
      expect(u).not.toMatch(/Volledig in|kleurpalet|Gebouwd rond|Compleet van top tot schoen|vrije dag \d/);
    }
  });
});
