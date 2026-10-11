import { describe, expect, it } from "vitest";
import { doosVanEersteScherm, isQuiz, magBannerTonen, wijktVoorHero, zichtbaarAandeel } from "../cookieBannerRegels";

describe("zichtbaarAandeel", () => {
  it("hero van een scherm hoog, bovenaan: helemaal zichtbaar", () => {
    expect(zichtbaarAandeel({ top: 0, bottom: 900, height: 900 }, 900)).toBe(1);
  });

  it("450 px gescrold op 1440x900: precies de helft", () => {
    expect(zichtbaarAandeel({ top: -450, bottom: 450, height: 900 }, 900)).toBe(0.5);
  });

  it("hero hoger dan het venster (1024x600, hero 700): bovenaan 6/7", () => {
    expect(zichtbaarAandeel({ top: 0, bottom: 700, height: 700 }, 600)).toBeCloseTo(600 / 700);
  });

  it("helemaal voorbij gescrold: 0", () => {
    expect(zichtbaarAandeel({ top: -1200, bottom: -300, height: 900 }, 900)).toBe(0);
  });

  it("geen hoogte telt als niet zichtbaar", () => {
    expect(zichtbaarAandeel({ top: 0, bottom: 0, height: 0 }, 900)).toBe(0);
  });
});

describe("magBannerTonen", () => {
  it("op andere routes direct", () => {
    for (const pad of ["/prijzen", "/results", "/blog/iets", "/registreren"]) {
      expect(magBannerTonen(pad, 1)).toBe(true);
    }
  });

  it("nooit tijdens de quiz, wat de hero ook doet", () => {
    for (const pad of ["/onboarding", "/onboarding/stap-3"]) {
      expect(isQuiz(pad)).toBe(true);
      expect(magBannerTonen(pad, 0)).toBe(false);
    }
    expect(isQuiz("/")).toBe(false);
  });

  it("op / niet zolang meer dan de helft van de hero in beeld is", () => {
    expect(magBannerTonen("/", 1)).toBe(false);
    expect(magBannerTonen("/", 0.51)).toBe(false);
  });

  it("op / wel vanaf de helft uit beeld", () => {
    expect(magBannerTonen("/", 0.5)).toBe(true);
    expect(magBannerTonen("/", 0)).toBe(true);
  });
});

describe("wijktVoorHero", () => {
  it("onder 1024 px wijkt hij op / zolang de hero voor meer dan de helft in beeld is", () => {
    expect(wijktVoorHero("/", 1, true)).toBe(true);
    expect(wijktVoorHero("/", 0.51, true)).toBe(true);
    expect(wijktVoorHero("/", 0.5, true)).toBe(false);
  });

  it("vanaf 1024 px blijft hij staan: de kaart ligt rechtsonder naast de heroknop", () => {
    expect(wijktVoorHero("/", 1, false)).toBe(false);
  });

  it("op andere routes wijkt hij nooit voor een hero", () => {
    expect(wijktVoorHero("/prijzen", 1, true)).toBe(false);
  });
});

describe("doosVanEersteScherm (terugval zonder hero)", () => {
  it("verschijnt na een half scherm scrollen", () => {
    const toon = (scrollY: number) => magBannerTonen("/", zichtbaarAandeel(doosVanEersteScherm(scrollY, 844), 844));
    expect(toon(0)).toBe(false);
    expect(toon(421)).toBe(false);
    expect(toon(422)).toBe(true);
  });
});
