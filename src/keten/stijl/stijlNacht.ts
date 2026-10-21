/**
 * De nacht van het vooraf keuren: porties samenstellen, de agent aanroepen, het
 * logboek bijwerken en op tijd stoppen. De aanroep zelf, het logboek en de klok
 * komen van buiten (deps), zodat de tests elk faalpad kunnen naspelen zonder
 * echte aanroep. scripts/keten/stijl-sets.ts geeft de echte mee.
 *
 * Volgorde per aanroep (docs/keten/vooraf-keuren-review.md, 2c): eerst het
 * logboek schrijven, dan tellen, dan de stopregels.
 */
import type { AanroepUitkomst } from "./claudeUitvoer";
import {
  REGELS,
  bouwPortieOpdracht,
  celCijfers,
  herstelStaat,
  isLimiet,
  kandidaatUitRegel,
  keurderSleutel,
  kiesPortie,
  leesPortieAntwoord,
  minimumOordelen,
  omEnOm,
  resetTekst,
  schud,
  telOordeel,
  volgendeStap,
  type AanroepRegel,
  type Kandidaat,
  type OordeelRegel,
  type Stopreden,
} from "./stijlSets";

/** Wat claude in de init-regel meldt bij elke betaalroute. */
const BETAALROUTE: Record<NachtOpties["via"], string> = {
  abonnement: "none",
  sleutel: "ANTHROPIC_API_KEY",
};

export interface NachtOpties {
  run: string;
  keurVersie: string;
  /** Het vaste model-id; meldt claude een ander, dan stopt de nacht. */
  model: string;
  effort: string;
  via: "abonnement" | "sleutel";
  maxAanroepen: number;
  /** Tijdstip (ms) waarna geen aanroep meer mag eindigen, of null. */
  deadline: number | null;
  /** De combinaties die meedoen, in vaste volgorde. */
  cellen: string[];
  /** Nieuwe outfits per combinatie, de beste eerst; al verstuurde vallen weg. */
  nieuw: Map<string, Kandidaat[]>;
  /** Het logboek tot nu toe (alle keurders; de staat leest alleen de eigen). */
  bestaand: OordeelRegel[];
  /**
   * Wat eerdere starts in dezelfde nacht al deden (nachtVan), zodat een herstart
   * het plafond en de nachtlimiet per combinatie niet opnieuw laat beginnen.
   */
  eerder?: { aanroepen: number; ronde1PerCel: Map<string, number> };
}

export interface NachtDeps {
  roepAan(opdracht: string, signal?: AbortSignal): Promise<AanroepUitkomst>;
  schrijfOordeel(r: OordeelRegel): void;
  schrijfAanroep(r: AanroepRegel): void;
  nu(): number;
}

export interface NachtUitslag {
  stopreden: Stopreden;
  aanroepen: number;
  regels: OordeelRegel[];
}

export async function draaiNacht(o: NachtOpties, deps: NachtDeps, signal?: AbortSignal): Promise<NachtUitslag> {
  const keurder = keurderSleutel(o.keurVersie, o.model, o.effort);
  const regels = [...o.bestaand];
  const ronde1DezeNacht = new Map<string, number>(o.eerder?.ronde1PerCel ?? []);
  const eerdereAanroepen = o.eerder?.aanroepen ?? 0;
  let aanroepen = 0;
  let misOpRij = 0;
  const klaar = (stopreden: Stopreden): NachtUitslag => ({ stopreden, aanroepen, regels });

  for (;;) {
    if (signal?.aborted) return klaar("onderbroken");
    const rem = volgendeStap({ nu: deps.nu(), deadline: o.deadline, aanroepen: eerdereAanroepen + aanroepen, maxAanroepen: o.maxAanroepen, misOpRij });
    if (rem) return klaar(rem);

    const staat = herstelStaat(regels, keurder);
    const ronde2: Kandidaat[][] = [];
    const herkansing: Kandidaat[] = [];
    const nieuw: Kandidaat[][] = [];
    // De combinatie met de minste keuringen eerst. In een vaste volgorde kregen
    // de laatste combinaties (de heren) bij een vroege stop een derde van de
    // keuringen van de eerste (review 21 oktober 2026).
    const open = o.cellen
      .map((cel, i) => {
        const c = staat.perCel.get(cel);
        return { cel, i, c, cijfers: c ? celCijfers(c) : null };
      })
      .filter((x) => !x.cijfers || x.cijfers.status === "open")
      .sort((a, b) => (a.cijfers?.keuringen ?? 0) - (b.cijfers?.keuringen ?? 0) || a.i - b.i);
    for (const { cel, c, cijfers } of open) {
      if (c && cijfers) {
        ronde2.push(cijfers.wachtrij2.map((k) => kandidaatUitRegel(c.laatste.get(k)!, 2, (c.pogingen2.get(k) ?? 0) + 1)));
        for (const k of cijfers.herkansing1) herkansing.push(kandidaatUitRegel(c.laatste.get(k)!, 1, 2));
      }
      const ruimte = Math.max(0, REGELS.ronde1PerNacht - (ronde1DezeNacht.get(cel) ?? 0));
      const bekend = cijfers?.bekend ?? new Set<string>();
      nieuw.push((o.nieuw.get(cel) ?? []).filter((k) => !bekend.has(k.outfit_key)).slice(0, ruimte));
    }
    const portie = kiesPortie({ ronde2: omEnOm(ronde2), herkansing, nieuw, grootte: REGELS.portie, maxRonde2: REGELS.maxRonde2PerPortie });
    if (portie.length === 0) return klaar("klaar");

    aanroepen += 1;
    const geschud = schud(portie, aanroepen);
    const kort = geschud.map((_, i) => `k${i + 1}`);
    const u = await deps.roepAan(bouwPortieOpdracht(geschud, kort), signal);

    const modelKlopt = u.model === o.model;
    const betalingKlopt = u.apiKeySource === null || u.apiKeySource === BETAALROUTE[o.via];
    const gelezen = u.ok ? leesPortieAntwoord(u.tekst, kort) : { perId: new Map(), onbekend: 0, dubbel: 0 };
    const gelukt = u.ok && modelKlopt && gelezen.perId.size >= minimumOordelen(geschud.length);
    const tijd = new Date(deps.nu()).toISOString();

    geschud.forEach((k, i) => {
      const ruw = gelezen.perId.get(kort[i]) ?? null;
      const r: OordeelRegel = {
        tijd,
        run: o.run,
        keurder,
        keur_versie: o.keurVersie,
        model: u.model ?? o.model,
        effort: o.effort,
        cel: k.cel,
        outfit_key: k.outfit_key,
        stukken: k.stukken,
        p_zaad: k.p_zaad,
        engine_zaad: k.engine_zaad,
        ronde: k.ronde,
        poging: k.poging,
        aanroep: aanroepen,
        aanroep_gelukt: gelukt,
        kort_id: kort[i],
        ruw,
        telling: gelukt ? telOordeel(ruw ?? undefined) : "geen oordeel",
      };
      deps.schrijfOordeel(r);
      regels.push(r);
      if (gelukt && k.ronde === 1 && k.poging === 1) ronde1DezeNacht.set(k.cel, (ronde1DezeNacht.get(k.cel) ?? 0) + 1);
    });

    misOpRij = gelukt ? 0 : misOpRij + 1;
    const limiet = !u.ok && isLimiet(u.tekst);
    let stopreden: Stopreden | null = null;
    if (signal?.aborted) stopreden = "onderbroken";
    else if (limiet) stopreden = "limiet";
    else if (u.ok && !modelKlopt) stopreden = "ander-model";
    else if (!betalingKlopt) stopreden = "verkeerde-betaling";

    deps.schrijfAanroep({
      tijd,
      run: o.run,
      nummer: aanroepen,
      via: o.via,
      verstuurd: geschud.length,
      gelezen: gelezen.perId.size,
      onbekend: gelezen.onbekend,
      dubbel: gelezen.dubbel,
      gelukt,
      timeout: u.timeout,
      duration_ms: u.duration_ms,
      total_cost_usd: u.total_cost_usd,
      usage: u.usage,
      modelUsage: u.modelUsage,
      num_turns: u.num_turns,
      model: u.model,
      apiKeySource: u.apiKeySource,
      is_error: !u.ok,
      // Ook bij een antwoord dat niet te lezen was, zodat drie mislukte op rij te verklaren zijn.
      fout: gelukt ? null : u.tekst.slice(0, 300),
      stopreden,
      reset: limiet ? resetTekst(u.tekst) : null,
      rate_limits: u.rateLimits,
    });
    if (stopreden) return klaar(stopreden);
  }
}
