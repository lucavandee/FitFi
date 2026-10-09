/**
 * Geen gedachtestreepje (U+2013, U+2014) in wat een bezoeker leest.
 *
 * Aanleiding (copy-controle fase 4, 8 oktober 2026, bevinding 13). In de
 * bestanden die PR #130 aanraakte stonden nog 63 regels zichtbare tekst met een
 * streepje, naast regels die de PR wel opschoonde. De landing heeft al zo'n test
 * (landingCopy.test.ts, secties.render.test.tsx); dit is dezelfde regel voor de
 * andere bestanden van die PR, plus de pagina's die in dezelfde ronde zijn
 * opgeschoond.
 *
 * De bron wordt gelezen zonder commentaar: wat in een opmerking staat, ziet
 * niemand. Niet in de lijst: LandingPage, src/components/landing/, src/content/,
 * EnhancedResultsPage en src/components/results/ (die doet de hoofdsessie, met
 * eigen tests), en src/data/colorPalettes.ts.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const WORTEL = join(__dirname, "../..");

const BESTANDEN = [
  "src/App.tsx",
  "src/pages/AboutPage.tsx",
  "src/pages/BlogPage.tsx",
  "src/pages/ContactPage.tsx",
  "src/pages/CookiesPage.tsx",
  "src/pages/DisclosurePage.tsx",
  "src/pages/FAQPage.tsx",
  "src/pages/HowItWorksPage.tsx",
  "src/pages/LoginPage.tsx",
  "src/pages/OnboardingFlowPage.tsx",
  "src/pages/PricingPage.tsx",
  "src/pages/PrivacyPage.tsx",
  "src/pages/RegisterPage.tsx",
  "src/pages/ShopPage.tsx",
  "src/pages/TermsPage.tsx",
  "src/components/analytics/AnalyticsLoader.tsx",
  "src/components/layout/Footer.tsx",
  "src/components/layout/MobileBottomNav.tsx",
  "src/components/layout/Navbar.tsx",
  "src/components/legal/AffiliateDisclosureNote.tsx",
  "src/components/legal/CookieBanner.tsx",
  "src/components/legal/cookieBannerRegels.ts",
  "src/components/profile/CookieSettings.tsx",
  "src/components/quiz/ArchetypePreviewEnhanced.tsx",
  "src/components/quiz/CalibrationStep.tsx",
  "src/components/quiz/PhaseTransition.tsx",
  "src/components/quiz/SwipeCard.tsx",
  "src/components/quiz/VisualPreferenceStepClean.tsx",
  "src/data/quizSteps.ts",
  "src/hooks/useHoogteInVariabele.ts",
  "src/utils/analytics.ts",
  "src/utils/serviceWorker.ts",
];

function zonderCommentaar(bron: string): string {
  return bron.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

describe("geen gedachtestreepjes in zichtbare tekst", () => {
  for (const pad of BESTANDEN) {
    it(pad, () => {
      expect(existsSync(join(WORTEL, pad))).toBe(true);
      const treffers = zonderCommentaar(readFileSync(join(WORTEL, pad), "utf8"))
        .split("\n")
        .filter((regel) => /[–—]/.test(regel))
        .map((regel) => regel.trim());
      expect(treffers).toEqual([]);
    });
  }
});
