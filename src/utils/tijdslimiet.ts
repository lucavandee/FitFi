/**
 * Geeft een belofte een tijdslimiet. Komt het antwoord niet binnen `ms`, dan weigert de uitkomst met
 * de fout die `maakFout` levert; het antwoord dat daarna alsnog komt wordt genegeerd.
 *
 * Waarom: als de database niet antwoordt, wacht de browser tot de gateway opgeeft (ongeveer 75
 * seconden op 9 oktober 2026) voordat de bezoeker een foutmelding krijgt. Dit annuleert het verzoek
 * zelf niet; het geeft de pagina alleen eerder een eerlijke uitkomst.
 */
export function metTijdslimiet<T>(belofte: PromiseLike<T>, ms: number, maakFout: () => Error): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(maakFout()), ms);
    Promise.resolve(belofte).then(
      (waarde) => {
        clearTimeout(timer);
        resolve(waarde);
      },
      (fout) => {
        clearTimeout(timer);
        reject(fout);
      }
    );
  });
}

/**
 * Hoe lang get_kandidaten maximaal mag duren voordat de site opgeeft. De functie heeft zelf een limiet
 * van 8 seconden aan de databasekant; dit is het dubbele daarvan en ruim boven de gemeten 0,5 tot 3
 * seconden van een gewone aanroep, ook als de cache koud is.
 */
export const KANDIDATEN_TIJDSLIMIET_MS = 15_000;
