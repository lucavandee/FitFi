/**
 * De selfie-route belooft alleen wat de code doet.
 *
 * Aanleiding (8 oktober 2026). De quiz stuurde een publieke URL van een privé
 * bucket naar analyze-selfie-color; OpenAI kreeg de foto nooit en de quiz ging
 * stil door. Ondertussen zei de site "Lokaal verwerkt, niet opgeslagen", "na
 * analyse direct van onze servers verwijderd" en "we slaan geen gezichtsdata
 * op", en linkten drie knoppen naar /onboarding?step=photo, een stap die niet
 * bestaat. De repo-versie van de functie gebruikte bovendien corsHeaders
 * zonder hem te definiëren.
 *
 * Deze test leest de bron zonder commentaar: wat in een opmerking staat om
 * uit te leggen wat er vroeger stond, telt niet.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const WORTEL = join(__dirname, '../..');

function bronZonderCommentaar(pad: string): string {
  return readFileSync(join(WORTEL, pad), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

const COPY = [
  'src/components/quiz/PhotoUpload.tsx',
  'src/components/results/ColorPaletteSection.tsx',
  'src/pages/EnhancedResultsPage.tsx',
  'src/pages/HowItWorksPage.tsx',
  'src/pages/FAQPage.tsx',
  'src/pages/PrivacyPage.tsx',
];

const FUNCTIE = 'supabase/functions/analyze-selfie-color/index.ts';

describe('selfie-route', () => {
  it('belooft geen lokale verwerking, directe verwijdering of "geen gezichtsdata"', () => {
    for (const bestand of COPY) {
      expect(bronZonderCommentaar(bestand), bestand).not.toMatch(
        /Lokaal verwerkt|niet opgeslagen|direct verwijderd|direct van onze servers|gezichtsdata|biometrische/i
      );
    }
  });

  it('linkt niet naar /onboarding?step=photo', () => {
    for (const bestand of COPY) {
      expect(bronZonderCommentaar(bestand), bestand).not.toContain('step=photo');
    }
  });

  it('vraagt voor de selfie geen publieke URL op, en de functie geeft OpenAI alleen een ondertekende link', () => {
    expect(bronZonderCommentaar('src/components/quiz/PhotoUpload.tsx')).not.toContain('getPublicUrl');
    const functie = bronZonderCommentaar(FUNCTIE);
    expect(functie).not.toContain('getPublicUrl');
    expect(functie).toContain('createSignedUrl(controle.pad, LINK_SECONDEN)');
    expect(functie).toContain('url: link.signedUrl');
  });

  it('bouwt de CORS-headers van de functie met de gedeelde helper', () => {
    const functie = bronZonderCommentaar(FUNCTIE);
    expect(functie).toMatch(/const corsHeaders = buildCorsHeaders\(req\)/);
  });

  it('noemt OpenAI, de VS, de link van 60 seconden en privacy@fitfi.ai op de privacypagina', () => {
    const privacy = bronZonderCommentaar('src/pages/PrivacyPage.tsx');
    expect(privacy).toContain('OpenAI');
    expect(privacy).toContain('Verenigde Staten');
    expect(privacy).toContain('60 seconden');
    expect(privacy).toContain('privacy@fitfi.ai');
  });

  it('toont geen betrouwbaarheid die het model zelf schat', () => {
    expect(bronZonderCommentaar('src/components/quiz/PhotoUpload.tsx')).not.toContain('Betrouwbaarheid');
  });

  it('heeft geen gedachtestreepjes in de bestanden van deze route', () => {
    for (const bestand of [
      'src/components/quiz/PhotoUpload.tsx',
      'src/lib/quiz/selfieFoto.ts',
      FUNCTIE,
      'supabase/functions/analyze-selfie-color/regels.ts',
      'src/pages/PrivacyPage.tsx',
    ]) {
      const treffers = readFileSync(join(WORTEL, bestand), 'utf8')
        .split('\n')
        .map((regel, i) => `${bestand}:${i + 1}: ${regel.trim()}`)
        .filter((regel) => /[\u2013\u2014]/.test(regel));
      expect(treffers).toEqual([]);
    }
  });
});
