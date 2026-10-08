/**
 * De vangrails van een feed-sync. Een feed die leeg, afgekapt of veel te klein
 * is mag nooit leiden tot "alles uit voorraad".
 *
 * Aanleiding: de opgeslagen H&M-URL gaf HTTP 204 (lege respons) tot 8 oktober
 * 2026. Een sync die "niet gezien in de feed" als "uit voorraad" leest, had
 * toen 73.026 producten uitgezet. De regels hieronder maken dat onmogelijk,
 * en dwingen een bewuste keuze af als er toch heel veel verdwijnt (de H&M-feed
 * van 8 oktober bevat maar 44 procent van de oude rijen terug).
 */
import type { Plan } from "./plan";

export interface BewakingInvoer {
  feedAantalGelezen: number;
  feedAantalKop: number | null;
  dbRijen: number;
  dbInStock: number;
  plan: Plan;
  /** Bewust toestaan dat meer dan de helft van wat op voorraad staat verdwijnt. */
  staVeelWegToe: boolean;
}

export interface Oordeel {
  fouten: string[];
  waarschuwingen: string[];
  info: string[];
}

const procent = (deel: number, geheel: number) => `${((deel / geheel) * 100).toFixed(1).replace(/\.0$/, "")}%`;

export function beoordeel(inv: BewakingInvoer): Oordeel {
  const fouten: string[] = [];
  const waarschuwingen: string[] = [];
  const info: string[] = [];

  if (inv.feedAantalGelezen === 0) {
    fouten.push("De feed bevat geen producten (een lege of 204-respons). Er wordt niets gewijzigd.");
  } else {
    if (inv.feedAantalKop != null && inv.feedAantalGelezen !== inv.feedAantalKop) {
      fouten.push(
        `Onvolledige feed: de kop belooft ${inv.feedAantalKop} producten, er kwamen er ${inv.feedAantalGelezen} binnen (afgekapte download?).`
      );
    }
    if (inv.dbInStock > 0 && inv.feedAantalGelezen < inv.dbInStock * 0.5) {
      fouten.push(
        `De feed (${inv.feedAantalGelezen}) is minder dan de helft van wat nu op voorraad staat (${inv.dbInStock}). Dat is geen normale feed.`
      );
    }
  }

  if (inv.dbInStock > 0) {
    const aandeel = inv.plan.verdwenen.length / inv.dbInStock;
    const tekst = `${inv.plan.verdwenen.length} van de ${inv.dbInStock} producten op voorraad (${procent(inv.plan.verdwenen.length, inv.dbInStock)}) staan niet meer in de feed`;
    if (aandeel > 0.5) {
      if (inv.staVeelWegToe) waarschuwingen.push(`${tekst}; bewust toegestaan.`);
      else fouten.push(`${tekst}: meer dan de helft. Controleer de aantallen en draai met --sta-veel-weg-toe als dat klopt.`);
    } else if (aandeel >= 0.2) {
      waarschuwingen.push(`${tekst}.`);
    }
  }

  const opSleutel = inv.plan.koppelingen.filter((k) => k.via === "sleutel").length;
  if (opSleutel > 0) {
    info.push(`${opSleutel} rijen zijn op artikel en maat herkoppeld omdat het feed-id veranderde (sleutel in plaats van id).`);
  }
  if (inv.plan.dubbeleFeedIds > 0) {
    waarschuwingen.push(`${inv.plan.dubbeleFeedIds} feedregels hebben een dubbel id en zijn overgeslagen.`);
  }
  if (inv.dbRijen > 0 && inv.plan.nieuw.length > inv.dbRijen * 2) {
    waarschuwingen.push(
      `${inv.plan.nieuw.length} nieuwe rijen is meer dan tweemaal zoveel als er al staan (${inv.dbRijen}). Is dit de juiste feed voor deze retailer?`
    );
  }

  return { fouten, waarschuwingen, info };
}
