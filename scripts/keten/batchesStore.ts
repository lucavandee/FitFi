/**
 * Administratie van verstuurde Batch API-batches in scripts/keten/.batches.json
 * (gitignored, zie scripts/keten/.gitignore). Hiermee kan het tag-script (taak 5)
 * na een crash of Ctrl-C verder: open batches worden eerst opgehaald en verwerkt
 * voordat er nieuwe worden aangemaakt. Een tagronde raakt 91.650 producten, duurt
 * uren en kost circa 76 dollar aan de Anthropic Batch API; dit bestand bestaat om
 * te voorkomen dat een lopende batch zoekraakt of dubbel wordt verstuurd.
 *
 * Faalgevallen: wat hier wel en niet is opgelost.
 *
 * Wel opgelost:
 * - Corruptie van een reeds bestaand bestand door een crash tijdens het schrijven.
 *   schrijfBatches schrijft naar <pad>.tmp en hernoemt pas daarna naar <pad>. renameSync
 *   is atomisch op hetzelfde bestandssysteem, en de .tmp staat altijd in dezelfde map als
 *   het doel, dus dit is nooit een cross-device rename. Bestond er al een <pad> met eerdere
 *   batches, dan ziet een lezer daardoor nooit een half geschreven versie ervan: ofwel de
 *   volledige oude inhoud, ofwel de volledige nieuwe inhoud. Wordt het proces gedood tijdens
 *   het schrijven van de .tmp zelf, dan blijft dat bestaande origineel ongemoeid (de rename
 *   heeft nog niet plaatsgevonden); een achtergebleven .tmp-bestand wordt bij de
 *   eerstvolgende schrijfactie gewoon overschreven. Zie hieronder voor het geval waarin er
 *   nog geen origineel was: dat is NIET dezelfde vraag en niet opgelost.
 * - Bestand ontbreekt (eerste run). leesBatches geeft dan bewust { batches: [] } terug:
 *   dat is een geldige beginstand, geen fout.
 * - Bestand bestaat maar is leeg, bevat geen geldige JSON, of heeft niet de vorm
 *   { batches: [...] } (bijvoorbeeld door handmatig bewerken, een volle schijf
 *   tijdens een eerdere schrijfactie, of schade). leesBatches GOOIT dan een fout in
 *   plaats van stilzwijgend { batches: [] } terug te geven. Dat laatste zou een
 *   lopende batch onzichtbaar maken: de aanroeper denkt dat er niets openstaat en
 *   stuurt de hele ronde opnieuw. Dit is een bewuste afwijking van de referentie-
 *   implementatie in taak-4-brief.md, die bij een ontbrekend of verkeerd getypeerd
 *   batches-veld stil terugvalt op een lege lijst; hier is dat gepromoveerd tot een
 *   harde fout.
 * - markeerVerwerkt op een onbekend id gooit een fout in plaats van geruisloos niets
 *   te doen. Zonder die controle laat een typo of een verouderd id een batch voor
 *   onbepaalde tijd als "open" staan zonder enig signaal.
 *
 * Bewust niet opgelost:
 * - Twee processen die gelijktijdig tegen dezelfde .batches.json lezen en schrijven.
 *   Er is geen bestandslock. Bij een race tussen twee lees-wijzig-schrijf-cycli wint
 *   de laatste schrijver; een update uit de andere cyclus kan dan verloren gaan. Dit
 *   bestand gaat uit van één actief tag-proces per keer. Twee terminal-runs (of twee
 *   Claude-sessies) tegelijk tegen dezelfde .batches.json is niet veilig.
 * - Stroomuitval of een OS-crash precies tussen het schrijven van de .tmp en de
 *   rename. renameSync zelf is atomisch, maar er wordt niet ge-fsynct voor de
 *   rename. Op een laptop-run is dat risico verwaarloosbaar naast de gevallen
 *   hierboven, dus dat is bewust niet dichtgetimmerd.
 * - Verlies van de laatst geschreven update wanneer <pad> op het moment van de crash nog
 *   NIET bestond (de allereerste schrijfactie ooit, of een eerder verwijderd bestand).
 *   Wordt het proces gedood na writeFileSync(tmp) maar vóór renameSync(tmp, pad), dan staat
 *   de nieuwe data wel in de .tmp, maar leesBatches(pad) ziet existsSync(pad) === false en
 *   geeft stilzwijgend { batches: [] } terug: precies het scenario waar dit bestand voor
 *   bestaat, een lopende batch die onzichtbaar wordt. De eerstvolgende schrijfactie
 *   overschrijft die wees-.tmp bovendien geruisloos, dus de data is dan ook echt weg, niet
 *   alleen tijdelijk onzichtbaar. Het venster hiervoor is klein: één synchrone
 *   writeFileSync van een paar kilobytes, dus alleen een vrijwel gelijktijdige kill (of een
 *   crash) raakt het. Klein risico, maar niet nul, en dus niet "opgelost": leesBatches kan
 *   corruptie van een bestaand bestand detecteren (zie boven), maar heeft geen manier om
 *   een ontbrekend bestand te onderscheiden van een bestand dat er nooit had mogen
 *   ontbreken.
 */
import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import type { Modus } from "./tagging";

export interface BatchRecord {
  id: string;
  retailer: string;
  modus: Modus;
  tagger_version: string;
  aantal: number;
  aangemaakt: string;
  status: "open" | "verwerkt";
  verwerkt_op?: string;
}

export interface BatchesBestand {
  batches: BatchRecord[];
}

export function leesBatches(pad: string): BatchesBestand {
  if (!existsSync(pad)) return { batches: [] };

  const ruw = readFileSync(pad, "utf8");
  let data: unknown;
  try {
    data = JSON.parse(ruw);
  } catch (err) {
    throw new Error(
      `Kan ${pad} niet lezen: geen geldige JSON (${(err as Error).message}). ` +
        "Dit bestand houdt bij welke Batch API-batches nog open staan; herstel of " +
        "verwijder het handmatig voordat er nieuwe batches worden aangemaakt, anders " +
        "kan een lopende batch onopgemerkt zoekraken."
    );
  }

  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data) ||
    !Array.isArray((data as Partial<BatchesBestand>).batches)
  ) {
    throw new Error(
      `Kan ${pad} niet lezen: verwacht een object van de vorm { "batches": [...] }, ` +
        "kreeg iets anders. Herstel of verwijder het bestand handmatig voordat er " +
        "nieuwe batches worden aangemaakt, anders kan een lopende batch onopgemerkt " +
        "zoekraken."
    );
  }

  return { batches: (data as BatchesBestand).batches };
}

export function schrijfBatches(pad: string, data: BatchesBestand): void {
  const tmp = `${pad}.tmp`;
  writeFileSync(tmp, JSON.stringify(data, null, 2) + "\n");
  renameSync(tmp, pad);
}

export function openBatches(data: BatchesBestand, retailer: string, modus: Modus): BatchRecord[] {
  return data.batches.filter((b) => b.status === "open" && b.retailer === retailer && b.modus === modus);
}

export function markeerVerwerkt(
  data: BatchesBestand,
  id: string,
  wanneer: string = new Date().toISOString()
): BatchesBestand {
  if (!data.batches.some((b) => b.id === id)) {
    throw new Error(
      `markeerVerwerkt: geen batch met id "${id}" gevonden. Een onbekend id stilzwijgend ` +
        "negeren zou die batch voor onbepaalde tijd als open laten staan."
    );
  }
  return {
    batches: data.batches.map((b) => (b.id === id ? { ...b, status: "verwerkt", verwerkt_op: wanneer } : b)),
  };
}
