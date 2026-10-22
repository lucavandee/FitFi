// plugins/kleurkamer-vooraf.ts
// Vite plugin (alleen bij build): zet de held van de homepage vooraf in index.html.
//
// Zonder dit wacht de foto, het grootste element boven de vouw, op de hele
// JavaScript-keten: Lighthouse mobiel gaf op 22 oktober 2026 een LCP van 3,2 tot
// 3,3 s, met de eerste verf pas na 2,3 s (review van de kleurkamer, snelheid 2).
// De markup komt uit de echte component (src/prerender/kleurkamerVooraf.tsx), dus
// maat en plek zijn gelijk aan wat React daarna tekent; createRoot vervangt het
// blok bij het mounten. Het script in de head van index.html beslist of het
// getoond wordt (alleen op / zonder ?kleur= of ?wie=), index.css bepaalt wat
// ervan zichtbaar is. Het invoegen zelf staat in src/prerender/voegVoorafIn.ts.

import type { Plugin } from "vite";
import { createServer } from "vite";
import { voegVoorafIn } from "../src/prerender/voegVoorafIn";

type Options = {
  /** pad naar vite.config.ts, voor dezelfde aliassen en plugins bij het renderen */
  configFile: string;
};

export default function kleurkamerVooraf(opts: Options): Plugin {
  return {
    name: "fitfi-kleurkamer-vooraf",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      async handler(html) {
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
          return voegVoorafIn(html, markup);
        } finally {
          await server.close();
        }
      },
    },
  };
}
