/**
 * "Begin gratis" in de kop opent de quiz (PR A2, plan fase 2, 5.2).
 *
 * De knop wees naar /registreren, terwijl CLAUDE.md deel 10 "Begin gratis"
 * vastlegt voor quiz starten, en de quiz zonder account begint. Een
 * registratiescherm als eerste stap is een drempel die de hero niet heeft.
 *
 * renderToString dekt de desktopkop. Het mobiele menu rendert pas na een klik
 * (state), dus dat deel toetst de bron: in Navbar.tsx staat geen link meer naar
 * /registreren.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

const gebruiker: { user: null | { name: string } } = { user: null };

vi.mock("@/context/UserContext", () => ({
  useUser: () => ({ user: gebruiker.user, logout: vi.fn() }),
}));

import Navbar from "../Navbar";

const render = (pad: string, element: JSX.Element) =>
  renderToString(<MemoryRouter initialEntries={[pad]}>{element}</MemoryRouter>);

/** Alle links met precies deze zichtbare tekst, met hun href. */
function linksMetTekst(html: string, tekst: string): string[] {
  const uit: string[] = [];
  for (const m of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)) {
    const zichtbaar = m[2].replace(/<[^>]+>/g, "").replace(/<!-- -->/g, "").trim();
    if (zichtbaar !== tekst) continue;
    uit.push(m[1].match(/href="([^"]*)"/)?.[1] ?? "");
  }
  return uit;
}

describe("Navbar", () => {
  it("'Begin gratis' gaat naar /onboarding", () => {
    for (const pad of ["/", "/prijzen", "/blog"]) {
      const html = render(pad, <Navbar />);
      expect(linksMetTekst(html, "Begin gratis")).toEqual(["/onboarding"]);
    }
  });

  it("bevat geen link meer naar /registreren (ook niet in het mobiele menu)", () => {
    const bron = readFileSync(join(__dirname, "../Navbar.tsx"), "utf-8");
    expect(bron).not.toContain('"/registreren"');
  });
});
