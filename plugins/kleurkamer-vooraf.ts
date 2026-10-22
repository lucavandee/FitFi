// plugins/kleurkamer-vooraf.ts
// Vite plugin (alleen bij build): zet de held van de homepage vooraf in index.html.
//
// Zonder dit wacht de foto, het grootste element boven de vouw, op de hele
// JavaScript-keten: Lighthouse mobiel gaf op 22 oktober 2026 een LCP van 3,2 tot
// 3,3 s, met de eerste verf pas na 2,3 s (review van de kleurkamer, snelheid 2).
// De markup komt uit de echte component (src/prerender/kleurkamerVooraf.tsx), dus
// maat en plek zijn gelijk aan wat React daarna tekent; createRoot vervangt het
// blok bij het mounten. Of het getoond wordt, beslist het script in de head van
// index.html (alleen op / zonder ?kleur= of ?wie=), wat ervan zichtbaar is
// index.css.

import type { Plugin } from "vite";
import { createServer } from "vite";

type Options = {
  /** pad naar vite.config.ts, voor dezelfde aliassen en plugins bij het renderen */
  configFile: string;
};

const LEGE_ROOT = '<div id="root"></div>';
const INVOEGEN =
  '(function(){var t=document.getElementById("kk-vooraf");if(t&&document.documentElement.classList.contains("kk-vooraf-aan"))document.getElementById("root").appendChild(t.content.cloneNode(true));})();';

export default function kleurkamerVooraf(opts: Options): Plugin {
  return {
    name: "fitfi-kleurkamer-vooraf",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      async handler(html) {
        if (!html.includes(LEGE_ROOT)) {
          throw new Error(`kleurkamer-vooraf: ${LEGE_ROOT} niet gevonden in index.html`);
        }
        const server = await createServer({
          configFile: opts.configFile,
          server: { middlewareMode: true, hmr: false },
          appType: "custom",
          logLevel: "error",
          optimizeDeps: { noDiscovery: true, include: [] },
        });
        try {
          const mod = await server.ssrLoadModule("/src/prerender/kleurkamerVooraf.tsx");
          const markup = (mod as { renderVoorafHeld: () => string }).renderVoorafHeld();
          // In een <template>: index.html geldt voor elke route, en een <img> in een
          // verborgen blok haalt zijn foto toch op. Alleen op / (kk-vooraf-aan, gezet
          // door het script in de head) komt de inhoud in #root, tijdens het parsen.
          return html.replace(
            LEGE_ROOT,
            `${LEGE_ROOT}\n    <template id="kk-vooraf">${markup}</template>\n    <script>${INVOEGEN}</script>`,
          );
        } finally {
          await server.close();
        }
      },
    },
  };
}
