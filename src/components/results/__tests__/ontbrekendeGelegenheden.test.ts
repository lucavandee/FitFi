/**
 * Een gevraagde gelegenheid zonder outfit verdween tot 16 oktober 2026 stil:
 * de tabs toonden alleen gelegenheden met outfits (Lucs quiz: formeel en date
 * gevraagd, nergens te zien, geen melding). Beslissing 1 van de
 * keten-kritiek: liever minder outfits die kloppen, en dan eerlijk zeggen
 * welke gelegenheid leeg bleef.
 */
import { describe, expect, it } from "vitest";
import { meldingOntbrekend, ontbrekendeGelegenheden } from "../ontbrekendeGelegenheden";

describe("ontbrekendeGelegenheden", () => {
  it("geeft de gevraagde gelegenheden zonder outfit, in de volgorde van de vraag", () => {
    const outfits = [{ occasion: "casual" }, { occasion: "work" }];
    expect(ontbrekendeGelegenheden(["casual", "work", "formal", "date"], outfits)).toEqual(["formal", "date"]);
  });

  it("is leeg als alles gedekt is, er niets gevraagd is of er nog geen outfits zijn", () => {
    expect(ontbrekendeGelegenheden(["casual"], [{ occasion: "Casual" }])).toEqual([]);
    expect(ontbrekendeGelegenheden([], [{ occasion: "casual" }])).toEqual([]);
    expect(ontbrekendeGelegenheden(["casual"], [])).toEqual([]);
  });
});

describe("meldingOntbrekend", () => {
  it("noemt de gelegenheden in gewone zinsbouw", () => {
    expect(meldingOntbrekend(["Formeel"])).toBe("Voor formeel vonden we nu geen outfits die bij je keuzes passen.");
    expect(meldingOntbrekend(["Formeel", "Avondje uit"])).toBe(
      "Voor formeel en avondje uit vonden we nu geen outfits die bij je keuzes passen."
    );
    expect(meldingOntbrekend(["Kantoor", "Formeel", "Avondje uit"])).toBe(
      "Voor kantoor, formeel en avondje uit vonden we nu geen outfits die bij je keuzes passen."
    );
  });

  it("zegt niets als er niets ontbreekt", () => {
    expect(meldingOntbrekend([])).toBe("");
  });
});
