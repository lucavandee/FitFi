/**
 * De kaart toont de titel, de gelegenheid en de uitleg van de outfit zelf.
 *
 * Aanleiding (16 oktober 2026, gezien met een testaccount op /results). De
 * kaart nam titel en gelegenheidslabel uit generateOutfitDescription, die
 * alleen naar de positie kijkt: kaart 1 heette altijd "Outfit 1: Kantoor",
 * ook als het een outfit voor een avond uit was. De engine geeft `title`,
 * de pagina zocht `name`, dus de titels van de engine kwamen nooit in beeld.
 */
import { describe, expect, it } from "vitest";
import { kaartGegevens } from "../kaartGegevens";

const terugval = { title: "Outfit 1: Kantoor", context: { emoji: "", label: "Kantoor" }, description: "Algemene tekst" };

describe("kaartGegevens", () => {
  it("neemt titel, gelegenheid en uitleg van de outfit", () => {
    const k = kaartGegevens(
      { title: "Ivoorwitte jurk met sneakers", occasion: "date", explanation: "Voor een avond uit. Samen €80." },
      terugval
    );
    expect(k).toEqual({
      titel: "Ivoorwitte jurk met sneakers",
      label: "Avondje uit",
      uitleg: "Voor een avond uit. Samen €80.",
    });
  });

  it("valt alleen terug als de outfit het zelf niet heeft", () => {
    expect(kaartGegevens({}, terugval)).toEqual({ titel: "Outfit 1: Kantoor", label: "Kantoor", uitleg: "Algemene tekst" });
    expect(kaartGegevens({ name: "Oude naam" }, terugval).titel).toBe("Oude naam");
  });
});
