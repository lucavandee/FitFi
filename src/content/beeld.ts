/**
 * Eigen beeld onder de hero van de landingspagina (plan "Onder de hero", 3.6,
 * 3.8 en 3.9): paden, breedtes, alt, label, Higgsfield-job en mediaankleur per
 * beeld, plus de schakelaars voor wat nog op een beslissing wacht.
 *
 * Bestanden staan in public/beeld/ (eigen cacheregel, immutable) en heten
 * <onderwerp>_<verhouding>-<breedte>.<hash8>.<ext>, met de eerste acht tekens
 * van de sha256 van de inhoud. Een nieuwe versie is dus een nieuwe naam: de
 * service worker en de CDN-cache bewaren een beeld een jaar. Elk gegenereerd
 * bestand draagt XMP met DigitalSourceType trainedAlgorithmicMedia en de job-ID
 * (gemaakt met beeldstraat.py). __tests__/beeld.test.ts toetst naam, hash,
 * herkomst en gewicht.
 *
 * Het seizoen staat in drie bestanden: hier, in kleurpiek.ts en in
 * voorbeeldoutfit.json. Een voorjaarswissel raakt alleen die drie.
 */

export interface BeeldBestand {
  pad: string;
  breedte: number;
  hoogte: number;
}

export interface Beeldset {
  /** Higgsfield-job van de bron. Leeg bij een eigen foto of opname uit de app. */
  jobId: string;
  /** Mediaan van de uitsnede: de achtergrond van het vak tot het beeld er is. */
  mediaankleur: string;
  avif: readonly BeeldBestand[];
  webp: readonly BeeldBestand[];
}

export type Hoek = "linksboven" | "rechtsboven";

/** srcset uit een rij bestanden, smal naar breed. */
export function srcset(bestanden: readonly BeeldBestand[]): string {
  return bestanden.map((b) => `${b.pad} ${b.breedte}w`).join(", ");
}

/** Het grootste bestand tot en met deze breedte, als src voor wie geen srcset leest. */
export function terugval(bestanden: readonly BeeldBestand[], tot = 1440): BeeldBestand {
  const passend = bestanden.filter((b) => b.breedte <= tot);
  return passend.length ? passend[passend.length - 1] : bestanden[0];
}

/*
 * Labeltekst (plan 3.6). Een mens in beeld krijgt de tweede zin; een plek of
 * voorwerp niet. Twee zinnen, zodat het label op een smal beeld op twee regels
 * kan staan zonder dat er een zin breekt. De hero heeft "De personen zijn
 * modellen." omdat daar twee mensen staan; verandert die zin ooit, dan hoort
 * deze mee te veranderen.
 */
export const LABEL = {
  mens: ["Beeld gemaakt met AI.", "De persoon is een model."],
  plek: ["Beeld gemaakt met AI."],
} as const;

/* ─── W1 Gedragen ───────────────────────────────────────────────────────────
 * Uitsneden uit de identiteitsstills 08 en 09 van batch 1, nul credits, geen
 * bewerking. Van net onder de kin tot onder de schoenen: geen deel van het
 * gezicht, op ware grootte nagekeken.
 * - 08 (vanaf 1024 px, de vrouw uit de desktophero): x 0 tot 1536, y 820 tot
 *   2740. De kin eindigt op ongeveer y 777.
 * - 09 (onder 1024 px, de vrouw uit de mobiele hero): x 16 tot 1520, y 872 tot
 *   2752. Plan 4.1 noemde y 800, maar daar staat de onderkant van de kin nog in
 *   beeld (tot ongeveer y 824) en de hals tot y 850.
 * Uitsnedescript: claude-artifacts/fitfi-beeld/pagina/fase3/b/w1/uitsnede.py.
 */
export const W1 = {
  alt: "Een vrouw in een crème coltrui, een crème wijde broek en witte sneakers aan de reling van een gracht in de herfst.",
  label: LABEL.mens,
  /** Zelfde wisselpunt als de hero: 1024 px. */
  labelHoek: { vanafLg: "rechtsboven" as Hoek, onderLg: "linksboven" as Hoek },
  /*
   * Alleen in de labelhoek. Een verloop over de volle breedte maakte de crème
   * trui bovenin grauw (beeldkritiek fase 4: het bovenste vijfde half zo licht
   * als de bron). Gemeten op 9 oktober met label-w.cjs en een proef per
   * kandidaat (claude-artifacts/fitfi-beeld/pagina/fase5/w1-verloop-proef*):
   * - vanaf 1024 px: label 5,12 tot 5,97:1, de trui blijft buiten de hoek.
   * - onder 1024 px: het label loopt op een telefoon rechts over lucht, haar en
   *   kraag, dus een kleine vlek haalde 3,05 tot 3,44:1. De kleinste ellips die
   *   het tekstvak (tot 188 x 56 px) dekt, is ongeveer 400 x 120. Deze haalt
   *   6,01 tot 6,63:1 op 360 tot 430 breed en 5,19 tot 5,25:1 op de tablet;
   *   de trui onder het label houdt L* 66 tot 76 (bron 77). Een vlek midden op
   *   het label haalde meer, maar las als een veeg op de trui.
   */
  verloop: {
    vanafLg:
      "radial-gradient(ellipse 420px 190px at 100% 0%, rgba(20,18,15,0.62) 0%, rgba(20,18,15,0.45) 45%, transparent 100%)",
    onderLg:
      "radial-gradient(ellipse 380px 110px at 0% 0%, rgba(20,18,15,0.7) 0%, rgba(20,18,15,0.66) 66%, transparent 100%)",
  },
  desktop: {
    jobId: "5deb2252-02e8-4bfa-abfc-37a95a713c0c",
    mediaankleur: "#826A51",
    avif: [
      { pad: "/beeld/w1-gedragen-desktop_4x5-720.072e5d96.avif", breedte: 720, hoogte: 900 },
      { pad: "/beeld/w1-gedragen-desktop_4x5-1080.42cfd4b0.avif", breedte: 1080, hoogte: 1350 },
      { pad: "/beeld/w1-gedragen-desktop_4x5-1440.2cbf13f4.avif", breedte: 1440, hoogte: 1800 },
      { pad: "/beeld/w1-gedragen-desktop_4x5-1536.d4f35ca1.avif", breedte: 1536, hoogte: 1920 },
    ],
    webp: [
      { pad: "/beeld/w1-gedragen-desktop_4x5-720.3e071360.webp", breedte: 720, hoogte: 900 },
      { pad: "/beeld/w1-gedragen-desktop_4x5-1080.61a296d9.webp", breedte: 1080, hoogte: 1350 },
      { pad: "/beeld/w1-gedragen-desktop_4x5-1440.b1804724.webp", breedte: 1440, hoogte: 1800 },
      { pad: "/beeld/w1-gedragen-desktop_4x5-1536.a28797e0.webp", breedte: 1536, hoogte: 1920 },
    ],
  },
  mobiel: {
    jobId: "25099985-bd93-4122-9658-3015939ecec0",
    mediaankleur: "#997557",
    avif: [
      { pad: "/beeld/w1-gedragen-mobiel_4x5-560.8289205d.avif", breedte: 560, hoogte: 700 },
      { pad: "/beeld/w1-gedragen-mobiel_4x5-780.3940d459.avif", breedte: 780, hoogte: 975 },
      { pad: "/beeld/w1-gedragen-mobiel_4x5-1120.10721679.avif", breedte: 1120, hoogte: 1400 },
      { pad: "/beeld/w1-gedragen-mobiel_4x5-1170.36fa32df.avif", breedte: 1170, hoogte: 1462 },
    ],
    webp: [
      { pad: "/beeld/w1-gedragen-mobiel_4x5-560.13a50dc4.webp", breedte: 560, hoogte: 700 },
      { pad: "/beeld/w1-gedragen-mobiel_4x5-780.cdda44c3.webp", breedte: 780, hoogte: 975 },
      { pad: "/beeld/w1-gedragen-mobiel_4x5-1120.c33790ef.webp", breedte: 1120, hoogte: 1400 },
      { pad: "/beeld/w1-gedragen-mobiel_4x5-1170.7d49dac8.webp", breedte: 1170, hoogte: 1462 },
    ],
  },
} as const;

/* ─── W2 Tafel (de kleurpiek) ───────────────────────────────────────────────
 * W2-NB2-23, de versie met lokale correctie B (ivory 0,59 van het L*-verschil,
 * de andere vijf 0,5). Paden en naamposities staan in kleurpiek.ts.
 * Meting en keuze: claude-artifacts/fitfi-beeld/pagina/fase3/w2.md.
 */

/**
 * Schakelaar voor W2. Uit is terugval T-W2 (plan 10): de zes stalen als
 * vlakken met hun naam op #F5F0EB, zonder foto en zonder wipe.
 */
export const W2_FOTO_AAN = true;

export const W2 = {
  alt: "Zes gevouwen lappen stof op een donkere houten tafel in laag zonlicht: camel wol, cognac suède, olijfgroene flanel, terracotta ribbreisel, ivoorwitte bouclé en greige kasjmier.",
  label: LABEL.plek,
  labelHoek: "linksboven" as Hoek,
  /** Bovenop de schaduw van het kozijn. */
  verloop: "linear-gradient(to bottom, rgba(20,18,15,0.45) 0%, transparent 22%)",
  set: {
    jobId: "b9c86d74-830b-47f2-84db-788795477d83",
    mediaankleur: "#482E1C",
    avif: [
      { pad: "/beeld/w2-tafel_4x5-780.ccc919dc.avif", breedte: 780, hoogte: 975 },
      { pad: "/beeld/w2-tafel_4x5-1440.b073f4ee.avif", breedte: 1440, hoogte: 1800 },
      { pad: "/beeld/w2-tafel_4x5-1728.ddd108f4.avif", breedte: 1728, hoogte: 2160 },
    ],
    webp: [
      { pad: "/beeld/w2-tafel_4x5-780.fe63d8da.webp", breedte: 780, hoogte: 975 },
      { pad: "/beeld/w2-tafel_4x5-1440.24771efb.webp", breedte: 1440, hoogte: 1800 },
      { pad: "/beeld/w2-tafel_4x5-1728.70587974.webp", breedte: 1728, hoogte: 2160 },
    ],
  },
} as const;

/* ─── W3 Avond (het slot) ───────────────────────────────────────────────────
 * Desktop vanaf 1024 px: k01 met de warme correctie (LUT k01-warm-b12).
 * Onder 1024 px: W3M 36, met dezelfde correctie; de 9:16-uitsnede uit k01 haalde
 * de contrastpoort niet. Meting: claude-artifacts/fitfi-beeld/pagina/fase3/w3.md.
 */

/**
 * Schakelaar voor W3V, de avondclip van 4,96 s in het slot. Gaat pas aan na
 * Lucs ja op de preview. Aan: wie de clip mag zien (vanaf 1024 px, geen reduced
 * motion, geen Save-Data, geen 2G) krijgt clipstart als still eronder; dat is
 * frame 0 van de clip, dus de overgang valt niet op. Alle anderen houden de
 * scherpe W3.
 */
export const W3V_CLIP_AAN = false;

export const W3 = {
  alt: "Lege kade langs een gracht kort na zonsondergang, met brandende lantaarns en verlichte ramen die spiegelen in het water.",
  label: LABEL.plek,
  labelHoek: "linksboven" as Hoek,
  verloop: {
    /** Dezelfde lagen als de hero, plus een band bovenin voor het label. */
    basis: [
      "linear-gradient(to right, rgba(20,18,15,0.72) 0%, rgba(20,18,15,0.35) 45%, transparent 70%)",
      "linear-gradient(to top, rgba(20,18,15,0.6) 0%, transparent 40%)",
      "linear-gradient(to bottom, rgba(20,18,15,0.5) 0%, transparent 25%)",
    ].join(", "),
    /**
     * Onder 768 px in plaats van de extra mobiele laag van de hero. Nodig voor
     * 4,5:1 op 360 x 640 (kop van 2,88 naar 5,12) en 412 x 780 (3,50 naar 8,72).
     */
    onderMd: "linear-gradient(to top, rgba(20,18,15,0.6) 0%, rgba(20,18,15,0.55) 45%, transparent 75%)",
  },
  desktop: {
    jobId: "acd6ec80-2c9b-4bf7-abd7-2e1157dde577",
    mediaankleur: "#281A10",
    avif: [
      { pad: "/beeld/w3-avond_16x9-1280.6f8b74b7.avif", breedte: 1280, hoogte: 720 },
      { pad: "/beeld/w3-avond_16x9-1920.9ccb9eaf.avif", breedte: 1920, hoogte: 1080 },
      { pad: "/beeld/w3-avond_16x9-2560.1c46eb42.avif", breedte: 2560, hoogte: 1440 },
      { pad: "/beeld/w3-avond_16x9-3840.f80d6c5b.avif", breedte: 3840, hoogte: 2160 },
    ],
    webp: [
      { pad: "/beeld/w3-avond_16x9-1280.d88ae75f.webp", breedte: 1280, hoogte: 720 },
      { pad: "/beeld/w3-avond_16x9-1920.37ea70a4.webp", breedte: 1920, hoogte: 1080 },
      { pad: "/beeld/w3-avond_16x9-2560.3d317a40.webp", breedte: 2560, hoogte: 1440 },
      { pad: "/beeld/w3-avond_16x9-3840.de7d9426.webp", breedte: 3840, hoogte: 2160 },
    ],
  },
  mobiel: {
    jobId: "a9e635a6-9552-45c9-9bd2-064cb8bf3ad4",
    mediaankleur: "#291B0F",
    avif: [
      { pad: "/beeld/w3-avond_9x16-780.d47d56ec.avif", breedte: 780, hoogte: 1387 },
      { pad: "/beeld/w3-avond_9x16-1170.4738289f.avif", breedte: 1170, hoogte: 2080 },
    ],
    webp: [
      { pad: "/beeld/w3-avond_9x16-780.a0962724.webp", breedte: 780, hoogte: 1387 },
      { pad: "/beeld/w3-avond_9x16-1170.8523c266.webp", breedte: 1170, hoogte: 2080 },
    ],
  },
  /**
   * Frame 0 van take 41 met dezelfde correctie en uitsnede als de clip. Alleen
   * onder de clip, want hij is zachter dan de desktopstill (geen 3840: de bron
   * is 3826 breed). In de herkomst (route-a) heten deze bestanden ook w3-avond;
   * hier clipstart, zodat ze niet met de scherpe W3 te verwarren zijn.
   */
  clipstart: {
    jobId: "8db63946-6d83-4d89-a215-e57ae9bbcec1",
    mediaankleur: "#281B10",
    avif: [
      { pad: "/beeld/w3-avond-clipstart_16x9-1280.f278001c.avif", breedte: 1280, hoogte: 720 },
      { pad: "/beeld/w3-avond-clipstart_16x9-1920.036b5a7c.avif", breedte: 1920, hoogte: 1080 },
      { pad: "/beeld/w3-avond-clipstart_16x9-2560.b9324a4e.avif", breedte: 2560, hoogte: 1440 },
    ],
    webp: [
      { pad: "/beeld/w3-avond-clipstart_16x9-1280.6a0e7376.webp", breedte: 1280, hoogte: 720 },
      { pad: "/beeld/w3-avond-clipstart_16x9-1920.f015abc7.webp", breedte: 1920, hoogte: 1080 },
      { pad: "/beeld/w3-avond-clipstart_16x9-2560.bf06ad3a.webp", breedte: 2560, hoogte: 1440 },
    ],
  },
  /**
   * Kling 3.0 4K vanaf k01, take 41: 2048 x 1152, 119 frames op 24 fps is
   * 4,958 s, H.264 crf 25, geen geluid, met de AIGC-tag uit de bron.
   */
  clip: {
    pad: "/video/slot-avond_16x9.cb2b4972.mp4",
    jobId: "8db63946-6d83-4d89-a215-e57ae9bbcec1",
    breekpunt: "(min-width: 1024px)",
  },
} as const;

/* ─── A1, opname van de quiz ───────────────────────────────────────────────
 * Stap 5 van de echte quiz op 390 x 844, 4,8 s, een keer afgespeeld (plan 4.4).
 * Komt na PR A1 en PR 0. Tot die er is staat hier null en toont "Zo werkt het"
 * alleen de tekstkolom. Een opname uit de app krijgt nooit een AI-label.
 */
export interface Opname {
  /** /video/<naam>.<hash8>.mp4, H.264, zonder geluid, hoogstens 350 KB. */
  clip: string;
  /** Het eindbeeld van de clip, hoogstens 60 KB. */
  poster: string;
  /** Css-pixels op ware grootte. */
  breedte: number;
  hoogte: number;
}

/**
 * A1: de echte quiz in de mobiele weergave, stap 5 naar stap 6, 4,800 s (120
 * beelden op 25 fps, elk beeld op een virtuele klok gezet; afwijking tussen
 * beelden 0,21 ms). 780 x 1300 op 2x, dus 390 x 650 css-pixels op ware grootte.
 * Opgenomen op de lokale build met onderschepte schrijfacties, nooit naar
 * Higgsfield. Verslag: claude-artifacts/fitfi-beeld/pagina/fase3/a1/a1.md.
 */
export const OPNAME_A1: Opname | null = {
  clip: "/video/quiz-stap5_3x5.891aa5a8.mp4",
  poster: "/beeld/quiz-stap5_3x5.18c3bc2f.webp",
  breedte: 390,
  hoogte: 650,
};
