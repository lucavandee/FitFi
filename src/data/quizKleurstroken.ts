/**
 * Kleurstroken bij de antwoorden van de drie kleurvragen in de quiz: de
 * kleuren die het antwoord zelf al noemt ("Beige, camel, olijfgroen,
 * terracotta, bruin"). Domeindata, geen interfacekleuren (zie
 * scripts/check-design-compliance.mjs): ze laten zien wat een antwoord
 * betekent, met dezelfde kleurcode als op de homepage (CLAUDE.md deel 18).
 */
import type { KleurcodeKleur } from "@/components/landing/v2/Kleurcode";

export const QUIZ_KLEURSTROKEN: Record<string, Record<string, KleurcodeKleur[]>> = {
  neutrals: {
    warm: [
      { hex: "#D9C3A5", naam: "Beige" },
      { hex: "#B8865B", naam: "Camel" },
      { hex: "#6B6B3A", naam: "Olijfgroen" },
      { hex: "#A5533A", naam: "Terracotta" },
      { hex: "#6B4A35", naam: "Bruin" },
    ],
    koel: [
      { hex: "#9AA0A6", naam: "Grijs" },
      { hex: "#1F2A44", naam: "Navy" },
      { hex: "#C9DCE8", naam: "IJsblauw" },
      { hex: "#2F4A3A", naam: "Donkergroen" },
      { hex: "#FFFFFF", naam: "Wit" },
    ],
    neutraal: [
      { hex: "#111111", naam: "Zwart" },
      { hex: "#FFFFFF", naam: "Wit" },
      { hex: "#8E8E8E", naam: "Grijs" },
      { hex: "#B8865B", naam: "Camel" },
      { hex: "#1F2A44", naam: "Navy" },
    ],
  },
  lightness: {
    licht: [
      { hex: "#F3EBDD", naam: "Crèmewit" },
      { hex: "#FFFDF0", naam: "Ivoor" },
      { hex: "#D9D9D9", naam: "Lichtgrijs" },
      { hex: "#EBCFCB", naam: "Pastelroze" },
      { hex: "#CFE0EC", naam: "Pastelblauw" },
    ],
    medium: [
      { hex: "#8A8455", naam: "Kaki" },
      { hex: "#5B7A99", naam: "Denimblauw" },
      { hex: "#A0523D", naam: "Steenrood" },
      { hex: "#8B7D6B", naam: "Taupe" },
      { hex: "#C69C3A", naam: "Mosterd" },
    ],
    donker: [
      { hex: "#111111", naam: "Zwart" },
      { hex: "#1C2833", naam: "Donkerblauw" },
      { hex: "#5E1A2B", naam: "Bordeaux" },
      { hex: "#4A3428", naam: "Donkerbruin" },
      { hex: "#3A3A3A", naam: "Antraciet" },
    ],
  },
  contrast: {
    laag: [
      { hex: "#D9C3A5", naam: "Beige" },
      { hex: "#EFE6D6", naam: "Crème" },
      { hex: "#B8865B", naam: "Camel" },
    ],
    medium: [
      { hex: "#CFE0EC", naam: "Lichtblauw" },
      { hex: "#5B7A99", naam: "Middenblauw" },
      { hex: "#D9D9D9", naam: "Lichtgrijs" },
    ],
    hoog: [
      { hex: "#111111", naam: "Zwart" },
      { hex: "#FFFFFF", naam: "Wit" },
    ],
  },
};
