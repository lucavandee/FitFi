/**
 * De blinde steekproef na de meetnacht (docs/keten/vooraf-keuren-review.md,
 * Meten): Luc beoordeelt 40 outfits zonder te weten wat de agent zei, 20
 * bevestigd, 10 twijfel en 10 fout, door elkaar. De vraag per outfit: zou ik
 * dit dragen. De bibliotheek gaat pas naar de site als minstens 17 van de 20
 * bevestigde een ja krijgen en de bevestigde duidelijk beter scoren dan twijfel
 * en fout.
 *
 * "Duidelijk beter" is hier: het aandeel ja bij de bevestigde ligt minstens 25
 * procentpunt boven dat bij twijfel en fout samen. Het rapport geeft beide
 * aandelen, zodat Luc zelf kan oordelen.
 */
import { celCijfers, herstelStaat, omEnOm, schud, type LogStuk, type OordeelRegel } from "./stijlSets";

export type Groep = "bevestigd" | "twijfel" | "fout";

export interface SteekproefOutfit {
  /** Het nummer dat Luc ziet, 1 tot en met het aantal. */
  nr: number;
  cel: string;
  outfit_key: string;
  stukken: LogStuk[];
  /** Wat de agent zei. Niet tonen tot de steekproef af is. */
  groep: Groep;
}

const GROEPEN: Groep[] = ["bevestigd", "twijfel", "fout"];
export const POORT = { bevestigdJa: 17, verschil: 0.25 } as const;

function zaadVan(tekst: string, basis: number): number {
  let h = basis >>> 0;
  for (let i = 0; i < tekst.length; i++) h = (Math.imul(h ^ tekst.charCodeAt(i), 0x01000193) >>> 0);
  return h;
}

/**
 * Kiest per groep beurtelings uit de combinaties, zodat geen combinatie de
 * steekproef bepaalt, en husselt het geheel. Is er van een groep te weinig, dan
 * staat dat in `tekort`; er wordt niet aangevuld uit een andere groep.
 */
export function kiesSteekproef(
  regels: OordeelRegel[],
  keurder: string,
  o: { bevestigd: number; twijfel: number; fout: number; zaad: number }
): { outfits: SteekproefOutfit[]; tekort: Record<Groep, number> } {
  const staat = herstelStaat(regels, keurder);
  const cellen = [...staat.perCel.keys()].sort();
  const gekozen: Omit<SteekproefOutfit, "nr">[] = [];
  const tekort: Record<Groep, number> = { bevestigd: 0, twijfel: 0, fout: 0 };
  for (const groep of GROEPEN) {
    const perCel = cellen.map((cel) => {
      const c = staat.perCel.get(cel)!;
      const sleutels =
        groep === "bevestigd"
          ? celCijfers(c).bevestigd
          : [...c.ronde1.entries()].filter(([, u]) => u.telling === groep).map(([k]) => k);
      return schud([...sleutels].sort(), zaadVan(`${groep}|${cel}`, o.zaad)).map((k) => ({
        cel,
        outfit_key: k,
        stukken: c.laatste.get(k)!.stukken,
        groep,
      }));
    });
    const lijst = omEnOm(perCel).slice(0, o[groep]);
    tekort[groep] = o[groep] - lijst.length;
    gekozen.push(...lijst);
  }
  const outfits = schud(gekozen, zaadVan("alles", o.zaad)).map((x, i) => ({ ...x, nr: i + 1 }));
  return { outfits, tekort };
}

export interface SteekproefUitslag {
  bevestigd: { ja: number; totaal: number };
  twijfel: { ja: number; totaal: number };
  fout: { ja: number; totaal: number };
  onbeantwoord: number;
  /** Aandeel ja bij bevestigd min dat bij twijfel en fout samen. */
  verschil: number;
  geslaagd: boolean;
}

export function telSteekproef(outfits: SteekproefOutfit[], antwoorden: Map<number, "ja" | "nee">): SteekproefUitslag {
  const tel = (g: Groep) => {
    const eigen = outfits.filter((x) => x.groep === g);
    return { ja: eigen.filter((x) => antwoorden.get(x.nr) === "ja").length, totaal: eigen.length };
  };
  const bevestigd = tel("bevestigd");
  const twijfel = tel("twijfel");
  const fout = tel("fout");
  const onbeantwoord = outfits.filter((x) => !antwoorden.has(x.nr)).length;
  const aandeel = (ja: number, totaal: number) => (totaal > 0 ? ja / totaal : 0);
  const verschil = aandeel(bevestigd.ja, bevestigd.totaal) - aandeel(twijfel.ja + fout.ja, twijfel.totaal + fout.totaal);
  const geslaagd = onbeantwoord === 0 && bevestigd.ja >= POORT.bevestigdJa && verschil >= POORT.verschil;
  return { bevestigd, twijfel, fout, onbeantwoord, verschil, geslaagd };
}
