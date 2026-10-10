/**
 * Vet in de markdownpagina's (privacyverklaring). Alleen vet aan het begin van
 * een regel werd vet; in lijstregels en midden in een zin stonden de
 * sterretjes letterlijk op de pagina.
 */
import { describe, expect, it, vi } from "vitest";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
// DOMPurify heeft een DOM nodig en de tests draaien in node. De sanitizer laat
// strong met class door (sanitizeHtml.ts), dus hier geeft hij alles door.
vi.mock("@/utils/sanitizeHtml", () => ({ sanitizeRichHtml: (html: string) => html }));

import MarkdownPage from "../MarkdownPage";
import PrivacyPage from "@/pages/PrivacyPage";

const tekst = (html: string) => html.replace(/<[^>]+>/g, "");

describe("MarkdownPage: vet", () => {
  it("vet in een lijstregel en midden in een zin wordt strong", () => {
    const html = renderToString(
      <MemoryRouter>
        <MarkdownPage content={"- **Opslag:** bij Supabase\n\nDe foto gaat **niet** naar Google."} backLink="" />
      </MemoryRouter>,
    );
    expect(html).toContain('<strong class="font-semibold">Opslag:</strong>');
    expect(html).toContain('<strong class="font-semibold">niet</strong>');
    expect(tekst(html)).not.toContain("**");
  });

  it("de privacyverklaring toont geen losse sterretjes", () => {
    const html = renderToString(
      <HelmetProvider>
        <MemoryRouter>
          <PrivacyPage />
        </MemoryRouter>
      </HelmetProvider>,
    );
    expect(tekst(html)).not.toContain("**");
  });
});
