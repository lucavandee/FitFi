/**
 * Bewaakt dat elke @/-import verwijst naar een bestand dat git exact zo kent.
 *
 * Aanleiding (2026-08-07). De build op Netlify faalde op:
 *
 *   [vite:load-fallback] Could not load src/components/Dashboard/SubscriptionManager
 *   (imported by src/pages/BillingPage.tsx): ENOENT
 *
 * Git kent dat bestand als src/components/dashboard/SubscriptionManager.tsx,
 * met een kleine d. De import vroeg om Dashboard/ met een hoofdletter.
 *
 * Waarom git en niet het bestandssysteem: de repo heeft twee mappen die
 * alleen in hoofdletter verschillen, src/components/dashboard/ (19 bestanden)
 * en src/components/Dashboard/ (6). Op een hoofdletter-ongevoelig
 * bestandssysteem zoals macOS smelten die op schijf samen tot een map, en dan
 * klopt elke schrijfwijze. Een eerdere versie van deze test las de schijf en
 * gaf daardoor precies het omgekeerde antwoord: hij keurde de kapotte import
 * goed en de werkende af.
 *
 * De Linux-buildmachine checkt uit uit git en krijgt wel twee mappen. Git is
 * hier dus de enige bruikbare bron van waarheid.
 */
import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WORTEL = path.resolve(__dirname, '../..');
const EXTENSIES = ['', '.ts', '.tsx', '.js', '.jsx', '.json', '/index.ts', '/index.tsx'];
const IMPORT_PATROON = /from\s+['"](@\/[^'"]+)['"]/g;

/** Alles wat git kent, exact zoals git het spelt. Vaste argumenten, geen shell. */
function bestandenVolgensGit(): Set<string> {
  const uitvoer = execFileSync('git', ['ls-files', '-z'], {
    cwd: WORTEL,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
  return new Set(uitvoer.split('\0').filter(Boolean));
}

describe('import-paden komen exact overeen met wat git kent', () => {
  const inGit = bestandenVolgensGit();
  const bronnen = [...inGit].filter(
    (f) => f.startsWith('src/') && /\.tsx?$/.test(f) && !f.includes('__tests__')
  );

  it('git kent bronbestanden om te controleren', () => {
    expect(bronnen.length).toBeGreaterThan(100);
  });

  it('elke @/-import bestaat in git met exact die hoofdletters', () => {
    const fouten: string[] = [];

    for (const bestand of bronnen) {
      const absoluut = path.join(WORTEL, bestand);
      if (!fs.existsSync(absoluut)) continue; // in git, niet uitgecheckt

      const inhoud = fs.readFileSync(absoluut, 'utf8');

      for (const treffer of inhoud.matchAll(IMPORT_PATROON)) {
        const spec = treffer[1];
        const doel = 'src/' + spec.slice(2);
        if (EXTENSIES.some((ext) => inGit.has(doel + ext))) continue;

        // Bestaat het wel als je hoofdletters negeert, dan is het een
        // case-fout en geen ontbrekend bestand. Dat onderscheid scheelt
        // zoekwerk als deze test ooit rood wordt.
        const laag = doel.toLowerCase();
        const bijnaTreffer = [...inGit].find((f) =>
          EXTENSIES.some((ext) => f.toLowerCase() === (laag + ext).toLowerCase())
        );

        const regel = inhoud.slice(0, treffer.index).split('\n').length;
        fouten.push(
          bijnaTreffer
            ? `${bestand}:${regel} importeert ${spec}, maar git kent het als ${bijnaTreffer}`
            : `${bestand}:${regel} importeert ${spec}, dat git helemaal niet kent`
        );
      }
    }

    expect(fouten, `\n${fouten.join('\n')}\n`).toEqual([]);
  });
});
