/**
 * Beweringenregister van de landingspagina onder de hero (plan "Onder de hero",
 * 3.10).
 *
 * Elke zin die de vijf secties onder de hero tonen, staat hier, met per zin
 * waar hij op rust:
 * - { bestand, zoek }: de code bewijst het; de zoektekst staat letterlijk in
 *   dat bestand.
 * - { data, waarde, inTekst }: een getal uit de data (aantal quizstappen,
 *   minimum aantal swipes). inTekst is hoe het getal in de zin staat.
 * - { data, plaatshouder }: een getal dat pas bij het renderen ingevuld wordt
 *   (N outfits uit voorbeeldoutfit.json).
 * - { meting, datum, script }: alleen te meten, niet uit de code af te lezen.
 *
 * __tests__/landingCopy.test.ts faalt als een zoektekst uit zijn bestand
 * verdwijnt, als een getal niet meer bij de data past, of als een meting ouder
 * is dan 180 dagen. De secties halen hun tekst alleen hier vandaan; een test
 * zoekt in de sectiebestanden naar losse tekst (de rol van react/jsx-no-literals,
 * want ESLint draait in deze repo niet).
 *
 * Labels en alt-teksten van eigen beeld staan in beeld.ts: die beschrijven een
 * beeld en rusten op de job-ID, niet op de code van de app.
 */

export type DataSleutel =
  | "aantalStappen"
  | "optioneleStappen"
  | "stapGeslacht"
  | "stapKleuren"
  | "stapContrast"
  | "minimumSwipes"
  | "kalibratieOutfits"
  | "budgetVoorbeeldprofiel";

export type Bron =
  | { bestand: string; zoek: string }
  | { data: DataSleutel; waarde: number; inTekst: string }
  | { data: "outfitsInRun"; plaatshouder: string }
  | { meting: string; datum: string; script: string };

export interface Zin {
  tekst: string;
  bronnen: readonly Bron[];
}

const zin = (tekst: string, ...bronnen: Bron[]): Zin => ({ tekst, bronnen });

const QUIZ = "src/data/quizSteps.ts";
const STAPPEN = (n: number): Bron => ({ data: "aantalStappen", waarde: n, inTekst: String(n) });

/**
 * Het gegevensblok in "Zo werkt het" (plan 4.4) staat uit tot struikeldraad T3
 * in productie gehaald is: gtag pas na toestemming en eigen lettertypen (PR A2)
 * en de selfie-route (PR 0). De zinnen staan hier al, met hun bronnen, voor
 * keuze (a) van PR 0: geen selfie, geen OpenAI. Kiest Luc (b), dan komen er
 * twee zinnen bij (plan 4.4).
 */
export const GEGEVENSBLOK_AAN = false;

export const LANDING_COPY = {
  /** "Bekijk voorbeeld" in de hero is een anker; dit is zijn toegankelijke naam. */
  anker: {
    outfit: zin(
      "Bekijk voorbeeld van een outfit, verderop op deze pagina",
      { bestand: "src/components/landing/sections/Voorbeeldoutfit.tsx", zoek: 'id="outfit"' },
    ),
    kleur: zin(
      "Bekijk voorbeeld van een kleurpalet, verderop op deze pagina",
      { bestand: "src/components/landing/sections/KleurPiek.tsx", zoek: 'id="kleur"' },
    ),
  },

  gedragen: {
    kop: zin(
      "Stijladvies op basis van wat je graag draagt",
      { bestand: QUIZ, zoek: "Kies wat jij graag draagt." },
      { bestand: QUIZ, zoek: "title: 'Welke kleuren draag jij het liefst?'" },
    ),
    tekst: [
      zin(
        "Je beantwoordt vragen over kleur, pasvorm en gelegenheden.",
        { bestand: QUIZ, zoek: "title: 'Welke kleuren draag jij het liefst?'" },
        { bestand: QUIZ, zoek: "title: 'Welke pasvorm prefereer je?'" },
        { bestand: QUIZ, zoek: "title: 'Voor welke gelegenheden zoek je outfits?'" },
      ),
      zin(
        "Daarna kies je uit foto's wat je aanspreekt.",
        { bestand: "src/pages/OnboardingFlowPage.tsx", zoek: "setTransitionTo('swipes');" },
        { bestand: "src/components/quiz/VisualPreferenceStepClean.tsx", zoek: "Swipe</strong> door de foto's" },
      ),
    ],
  },

  kleur: {
    stap: zin(
      "Stap 3 van 14",
      { data: "stapKleuren", waarde: 3, inTekst: "3" },
      STAPPEN(14),
      { bestand: "src/pages/OnboardingFlowPage.tsx", zoek: "Stap {currentStep + 1} van {quizSteps.length}" },
    ),
    kop: zin("Welke kleuren draag jij het liefst?", {
      bestand: QUIZ,
      zoek: "title: 'Welke kleuren draag jij het liefst?'",
    }),
    antwoord: zin("Warme tinten", { bestand: QUIZ, zoek: "label: 'Warme tinten'" }),
    antwoordUitleg: zin("Beige, camel, olijfgroen, terracotta, bruin", {
      bestand: QUIZ,
      zoek: "description: 'Beige, camel, olijfgroen, terracotta, bruin'",
    }),
    /*
     * Plan 4.2 had hier "en vooral warme foto's", en als slot "Jouw palet volgt
     * uit je antwoorden en je fotokeuzes." PR A3 mat dat het niet klopt voor de
     * route vanaf deze pagina: zonder account komen de fotokeuzes niet in de
     * database (style_swipes laat alleen authenticated toe) en volgt het palet
     * alleen uit de antwoorden (dataSource quiz_only). Met account maken de
     * foto's het palet zomer, niet herfst. Daarom zonder foto's.
     */
    profiel: zin(
      "Het voorbeeldprofiel koos dit antwoord. Zijn rapport toont onder ‘Draag deze kleuren’:",
      { bestand: "src/content/voorbeeldprofiel.ts", zoek: "neutrals: 'warm'" },
      { bestand: "src/components/results/ColorPaletteSection.tsx", zoek: "Draag deze kleuren" },
      {
        bestand: "src/content/__tests__/voorbeeldprofiel.palet.test.ts",
        zoek: "expect(draagDezeKleuren(uitkomst.colorProfile)).toEqual(HERFST);",
      },
    ),
    /*
     * "hangt af van", niet "volgt uit": met een account tellen de fotokeuzes ook
     * mee (die geven nu zomer), dus "alleen je antwoorden" klopt dan niet.
     */
    slot: zin("Jouw palet hangt af van je antwoorden.", {
      bestand: "src/content/__tests__/voorbeeldprofiel.palet.test.ts",
      zoek: "expect(uitkomst.dataSource).toBe('quiz_only');",
    }),
    /** Toegankelijke naam van de zichtbare lijst: de zes namen volgen uit het palet. */
    lijst: zin("Draag deze kleuren", {
      bestand: "src/components/results/ColorPaletteSection.tsx",
      zoek: "Draag deze kleuren",
    }),
  },

  outfit: {
    kop: zin("Een outfit voor dit profiel", { bestand: "scripts/keten/persona-run.ts", zoek: "runEngineV2" }),
    /*
     * {N} is het aantal outfits in de run (voorbeeldoutfit.json). De profielregel
     * volgt voorbeeldprofiel.ts: dames, warme tinten, de gelikete foto's (het
     * harnas zet ze als swipepatroon, zoals de quiz), budget tot 50 euro.
     */
    tekst: zin(
      "Een van de {N} outfits die FitFi maakte voor het voorbeeldprofiel: dames, warme tinten en warme foto's, tot 50 euro per stuk.",
      { data: "outfitsInRun", plaatshouder: "{N}" },
      { bestand: "src/content/voorbeeldprofiel.ts", zoek: "gender: 'female'" },
      { bestand: "src/content/voorbeeldprofiel.ts", zoek: "neutrals: 'warm'" },
      { bestand: "src/content/voorbeeldprofiel.ts", zoek: "geliket: [" },
      { data: "budgetVoorbeeldprofiel", waarde: 50, inTekst: "50" },
    ),
    stukken: {
      outerwear: zin("Jas", { bestand: "src/content/voorbeeldoutfit.ts", zoek: '"outerwear"' }),
      top: zin("Trui", { bestand: "src/content/voorbeeldoutfit.ts", zoek: '"top"' }),
      bottom: zin("Broek", { bestand: "src/content/voorbeeldoutfit.ts", zoek: '"bottom"' }),
      footwear: zin("Schoenen", { bestand: "src/content/voorbeeldoutfit.ts", zoek: '"footwear"' }),
    },
    partnerlink: zin("Bekijk bij partner", { bestand: "CLAUDE.md", zoek: '"Bekijk bij partner"' }),
    /** Toegankelijke naam van de partnerlink; begint met de zichtbare tekst (WCAG 2.5.3). */
    partnerlinkNaam: zin(
      "Bekijk bij partner: {soort} van {winkel}, opent in een nieuw venster",
      { bestand: "src/components/landing/sections/Voorbeeldoutfit.tsx", zoek: 'target="_blank"' },
    ),
    /** Alt van een productfoto: de titel uit de feed zonder merk, in kleine letters. */
    productfoto: zin("Productfoto van {winkel}: {omschrijving}", {
      bestand: "src/content/voorbeeldoutfit.ts",
      zoek: "imageUrl",
    }),
    vergoeding: zin(
      "Koop je via deze links, dan kan FitFi een vergoeding krijgen. Je betaalt niets extra.",
      { bestand: "src/pages/DisclosurePage.tsx", zoek: "waardoor we een kleine vergoeding ontvangen als je iets koopt" },
      { bestand: "src/pages/DisclosurePage.tsx", zoek: "kost jou niets extra" },
    ),
    vergoedingLink: zin("Zo werkt dat", { bestand: "src/App.tsx", zoek: 'path="/affiliate-disclosure"' }),
    begin: zin("Begin gratis", { bestand: "CLAUDE.md", zoek: '"Begin gratis"' }),
  },

  werkwijze: {
    kop: zin("Zo werkt de quiz", { bestand: "src/pages/OnboardingFlowPage.tsx", zoek: "type QuizPhase" }),
    stappen: [
      {
        titel: zin("14 vragen", STAPPEN(14)),
        tekst: [
          zin(
            "Over kleur, pasvorm, gelegenheden en budget.",
            { bestand: QUIZ, zoek: "title: 'Welke kleuren draag jij het liefst?'" },
            { bestand: QUIZ, zoek: "title: 'Welke pasvorm prefereer je?'" },
            { bestand: QUIZ, zoek: "title: 'Voor welke gelegenheden zoek je outfits?'" },
            { bestand: QUIZ, zoek: "title: 'Wat is jouw budget per kledingstuk?'" },
          ),
          zin("Vijf zijn optioneel.", { data: "optioneleStappen", waarde: 5, inTekst: "Vijf" }),
        ],
      },
      {
        titel: zin("Foto's en outfits", { bestand: "src/pages/OnboardingFlowPage.tsx", zoek: "'swipes' | 'calibration'" }),
        tekst: [
          zin(
            "Je kiest uit minstens 15 foto's en beoordeelt 3 outfits.",
            { data: "minimumSwipes", waarde: 15, inTekst: "15" },
            { data: "kalibratieOutfits", waarde: 3, inTekst: "3" },
          ),
        ],
      },
      {
        titel: zin("Je rapport", { bestand: "src/App.tsx", zoek: 'path="/results"' }),
        tekst: [
          zin(
            "Kleurpalet, stijlprofiel en outfits met links naar winkels.",
            { bestand: "src/pages/EnhancedResultsPage.tsx", zoek: "<ColorPaletteSection" },
            { bestand: "src/pages/EnhancedResultsPage.tsx", zoek: "StyleProfileGenerator.generateStyleProfile(" },
            { bestand: "src/pages/EnhancedResultsPage.tsx", zoek: "affiliateUrl: p.affiliateUrl || p.affiliate_url," },
          ),
          zin("Hiervoor maak je een gratis account.", {
            bestand: "src/App.tsx",
            zoek: '<Route path="/results" element={<RequireAuth>',
          }, { bestand: "src/pages/PricingPage.tsx", zoek: "€0" }),
        ],
      },
    ],
    opname: {
      onderschrift: zin(
        "Opname uit de quiz, stap 5 van 14, mobiele weergave.",
        { data: "stapContrast", waarde: 5, inTekst: "5" },
        STAPPEN(14),
      ),
      beschrijving: zin(
        "In de opname wordt bij stap 5, Hoe combineer je kleur en contrast?, de optie Tonal gekozen en gaat de quiz naar stap 6.",
        { data: "stapContrast", waarde: 5, inTekst: "5" },
        { bestand: QUIZ, zoek: "title: 'Hoe combineer je kleur en contrast?'" },
        { bestand: QUIZ, zoek: "label: 'Tonal" },
      ),
    },
  },

  gegevens: {
    kop: zin("Wat er met je gegevens gebeurt", { bestand: "src/pages/PrivacyPage.tsx", zoek: "privacy@fitfi.ai" }),
    rijen: [
      {
        label: zin("Wat we bewaren", { bestand: "src/pages/PrivacyPage.tsx", zoek: "privacy@fitfi.ai" }),
        /*
         * Plan 4.4 had "Je antwoorden en fotokeuzes, met een account ook je
         * e-mailadres." Zonder account komen fotokeuzes niet in de database
         * (PR A3, gemeten). Daarom de fotokeuzes bij het account.
         */
        tekst: zin(
          "Je antwoorden, met een account ook je fotokeuzes en je e-mailadres.",
          { bestand: "src/pages/OnboardingFlowPage.tsx", zoek: "style_profiles" },
          {
            meting: "style_swipes heeft RLS aan met alleen policies voor authenticated; geen enkele swipe zonder user_id",
            datum: "2026-10-08",
            script: "supabase db query --linked (PR A3, claude-artifacts/fitfi-beeld/pagina/fase3/a3.md)",
          },
        ),
      },
      {
        label: zin("Waar", { bestand: "netlify.toml", zoek: "[build]" }),
        tekst: zin(
          "Bij Supabase in Frankfurt. De site draait bij Netlify.",
          {
            meting: "Supabase-project draait in Central EU (Frankfurt)",
            datum: "2026-10-08",
            script: "supabase projects list",
          },
          { bestand: "netlify.toml", zoek: "[build]" },
        ),
      },
      {
        label: zin("Andere partijen", { bestand: "src/utils/analytics.ts", zoek: "function canTrack" }),
        tekst: zin(
          "Google Analytics als je cookies toestaat, Daisycon en de winkel als je doorklikt, Stripe bij Premium.",
          { bestand: "src/utils/analytics.ts", zoek: "getCookiePrefs().analytics" },
          {
            meting: "zonder keuze en na 'Alleen noodzakelijk' geen enkel verzoek naar Google; na 'Alles accepteren' gtag.js en page_view",
            datum: "2026-10-08",
            script: "claude-artifacts/fitfi-beeld/pagina/fase3/a2/scripts/gtag-toestemming.cjs",
          },
          { bestand: "src/pages/DisclosurePage.tsx", zoek: "waardoor we een kleine vergoeding ontvangen als je iets koopt" },
          { bestand: "src/pages/PrivacyPage.tsx", zoek: "**Payments:** Stripe" },
        ),
      },
      {
        label: zin("Verwijderen", { bestand: "src/pages/PrivacyPage.tsx", zoek: "Stuur een e-mail naar [privacy@fitfi.ai]" }),
        tekst: zin(
          "Mail privacy@fitfi.ai. Je krijgt binnen 30 dagen antwoord.",
          { bestand: "src/pages/PrivacyPage.tsx", zoek: "We reageren binnen **30 dagen**" },
        ),
      },
    ],
    link: zin("Lees de privacyverklaring", { bestand: "src/App.tsx", zoek: 'path="/privacy"' }),
  },

  slot: {
    stap: zin(
      "Stap 1 van 14",
      { data: "stapGeslacht", waarde: 1, inTekst: "1" },
      STAPPEN(14),
      { bestand: "src/pages/OnboardingFlowPage.tsx", zoek: "Stap {currentStep + 1} van {quizSteps.length}" },
    ),
    /** De displaykop: eerste deel serif italic, tweede deel sans bold (CLAUDE.md deel 2). */
    kop: zin("Zoek je kleding voor heren of dames?", {
      bestand: QUIZ,
      zoek: "title: 'Zoek je kleding voor heren of dames?'",
    }),
    kopDelen: ["Zoek je kleding voor ", "heren of dames?"] as const,
    tekst: zin(
      "De quiz is gratis. Voor je rapport maak je een gratis account.",
      { bestand: "src/App.tsx", zoek: '<Route path="/onboarding" element={<WithSeo.Onboarding />} />' },
      { bestand: "src/App.tsx", zoek: '<Route path="/results" element={<RequireAuth>' },
      { bestand: "src/pages/PricingPage.tsx", zoek: "€0" },
    ),
    knop: zin("Begin gratis", { bestand: "CLAUDE.md", zoek: '"Begin gratis"' }),
  },
} as const;
