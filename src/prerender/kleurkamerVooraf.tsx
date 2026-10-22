import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import Kleurkamer from "@/components/landing/v3/Kleurkamer";
import type { KleurkamerStand } from "@/components/landing/v3/useKleurkamer";
import { LG, ONDER_LG } from "@/components/landing/v3/stijl";
import { START_KAMER } from "@/content/kleurkamers";

/** Een doorzichtige gif van 1 bij 1: de variant die niet past, haalt zo geen foto op. */
const LEEG = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

const START: KleurkamerStand = {
  kamer: START_KAMER,
  wie: "dames",
  eigenKeuze: null,
  bewegingUit: false,
  kies: () => undefined,
  kiesWie: () => undefined,
  zetBeweging: () => undefined,
};

function variant(staand: boolean): string {
  const html = renderToString(
    <MemoryRouter initialEntries={["/"]}>
      <Kleurkamer stand={START} beginStaand={staand} />
    </MemoryRouter>,
  );
  const eigen = staand ? "-vs" : "-vl";
  const nietHier = staand ? LG : ONDER_LG;
  return (
    html
      // twee varianten in één document: elk eigen id's
      .replace(/\b(id|for|aria-labelledby|aria-describedby|aria-controls)="([^"]+)"/g, (_, attr: string, waarde: string) =>
        `${attr}="${waarde.split(" ").map((w) => w + eigen).join(" ")}"`,
      )
      // de variant die op deze breedte verborgen is, laadt geen foto (display: none houdt een img niet tegen)
      .replace(/<picture>/g, `<picture><source media="${nietHier}" srcset="${LEEG}"/>`)
  );
}

/**
 * De held van de homepage als HTML, voor index.html (plugins/kleurkamer-vooraf.ts):
 * de startkamer (diep rood, dames), staand en liggend, uit dezelfde component die
 * React daarna tekent, dus met dezelfde maten. index.css toont er alleen foto, veld
 * en AI-label van; createRoot vervangt het blok bij het mounten.
 */
export function renderVoorafHeld(): string {
  return `<div class="kk-vooraf" aria-hidden="true"><div class="kk-vooraf-staand">${variant(true)}</div><div class="kk-vooraf-liggend">${variant(false)}</div></div>`;
}
