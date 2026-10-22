/**
 * Het invoegen van de vooraf getekende held in index.html, los van de Vite-plugin
 * (plugins/kleurkamer-vooraf.ts), zodat het zonder build te toetsen is.
 *
 * De held gaat in een <template>: index.html geldt voor elke route, en een <img>
 * in een verborgen blok haalt zijn foto toch op. Het inline script zet de inhoud
 * tijdens het parsen in #root, maar alleen als het script in de head de klasse
 * kk-vooraf-aan op <html> heeft gezet (op / zonder ?kleur= of ?wie=).
 */

export const LEGE_ROOT = '<div id="root"></div>';

export const INVOEGEN =
  '(function(){var t=document.getElementById("kk-vooraf");if(t&&document.documentElement.classList.contains("kk-vooraf-aan"))document.getElementById("root").appendChild(t.content.cloneNode(true));})();';

export function voegVoorafIn(html: string, markup: string): string {
  if (!html.includes(LEGE_ROOT)) {
    throw new Error(`kleurkamer-vooraf: ${LEGE_ROOT} niet gevonden in index.html`);
  }
  return html.replace(LEGE_ROOT, `${LEGE_ROOT}\n    <template id="kk-vooraf">${markup}</template>\n    <script>${INVOEGEN}</script>`);
}
