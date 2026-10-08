/**
 * De shop toont de gecureerde kandidaten per pagina van 48, met "Toon meer",
 * en belooft alleen afstemming als de bezoeker de quiz deed.
 *
 * Aanleiding (8 oktober 2026, gemeten op de live site): de shop las
 * `select * from products` zonder volgorde of limiet. PostgREST kapt dat af op
 * 1.000 rijen, dus elke bezoeker kreeg dezelfde willekeurige plak: alle 1.000
 * van een winkel (Giglio), geen enkele top, mediane prijs 234 euro, een bikini
 * en ondergoed, 2,2 MB aan data en een pagina van 161.000 pixels hoog. Elke
 * kaart zei "Past bij jouw jouw stijl stijl door outerwear".
 *
 * renderToString dekt de eerste staat van de pagina, niet de klik op "Toon
 * meer": dat is jsdom-werk, zie EnhancedResultsPage.outfitRatingPlacement.test.tsx
 * voor dezelfde afweging. De logica van de paginering zit daarom in een pure
 * functie (zichtbareItems) die hieronder apart getoetst wordt.
 */
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BoltProduct } from "@/services/data/types";

const hookStatus: {
  data: BoltProduct[] | null;
  loading: boolean;
  error: string | null;
  afgestemd: boolean;
} = { data: [], loading: false, error: null, afgestemd: false };

vi.mock("@/hooks/useShopItems", () => ({
  useShopItems: () => ({ ...hookStatus, refetch: vi.fn() }),
}));

// Een eenvoudige kaart: de test gaat over welke items de pagina toont, niet
// over hoe een kaart eruitziet.
vi.mock("@/components/ProductCard", () => ({
  default: (props: { id: string; title: string; reason?: string }) => (
    <article data-kaart={props.id}>
      {props.title}
      {props.reason ? <span data-reden>{props.reason}</span> : null}
    </article>
  ),
}));

import ShopPage from "../ShopPage";
import { SHOP_PAGINA, zichtbareItems } from "@/services/shop/shopItems";

const items = (aantal: number, extra: Partial<BoltProduct> = {}): BoltProduct[] =>
  Array.from({ length: aantal }, (_, i) => ({
    id: `p${i + 1}`,
    title: `Item ${i + 1}`,
    brand: i % 2 === 0 ? "Acme" : "Beta",
    price: 20 + i,
    category: ["top", "bottom", "footwear"][i % 3],
    imageUrl: `https://x/${i + 1}.jpg`,
    url: `https://x/aff/${i + 1}`,
    ...extra,
  }));

const render = () =>
  renderToString(
    <HelmetProvider>
      <MemoryRouter>
        <ShopPage />
      </MemoryRouter>
    </HelmetProvider>
  );

const aantalKaarten = (html: string) => (html.match(/data-kaart="/g) ?? []).length;

describe("zichtbareItems", () => {
  it("toont de eerste pagina en meldt hoeveel er nog overblijven", () => {
    const uit = zichtbareItems(items(100), SHOP_PAGINA);
    expect(uit.zichtbaar).toHaveLength(SHOP_PAGINA);
    expect(uit.resterend).toBe(100 - SHOP_PAGINA);
  });

  it("toont alles als het binnen de pagina past", () => {
    const uit = zichtbareItems(items(30), SHOP_PAGINA);
    expect(uit.zichtbaar).toHaveLength(30);
    expect(uit.resterend).toBe(0);
  });

  it("laat een volgende pagina hetzelfde begin houden", () => {
    const alles = items(100);
    const eerste = zichtbareItems(alles, SHOP_PAGINA).zichtbaar.map((i) => i.id);
    const tweede = zichtbareItems(alles, SHOP_PAGINA * 2).zichtbaar.map((i) => i.id);
    expect(tweede.slice(0, SHOP_PAGINA)).toEqual(eerste);
    expect(tweede).toHaveLength(SHOP_PAGINA * 2);
  });

  it("geeft bij geen items niets terug", () => {
    expect(zichtbareItems([], SHOP_PAGINA)).toEqual({ zichtbaar: [], resterend: 0 });
  });
});

describe("ShopPage, eerste staat", () => {
  beforeEach(() => {
    hookStatus.data = [];
    hookStatus.loading = false;
    hookStatus.error = null;
    hookStatus.afgestemd = false;
  });

  it("toont maximaal een pagina kaarten en biedt Toon meer als er meer zijn", () => {
    hookStatus.data = items(100);
    const html = render();
    expect(aantalKaarten(html)).toBe(SHOP_PAGINA);
    expect(html).toContain("Toon meer");
    // Het totaal blijft zichtbaar, ook als maar een deel getoond wordt.
    expect(html).toContain("100");
  });

  it("biedt geen Toon meer als alles in een pagina past", () => {
    hookStatus.data = items(30);
    const html = render();
    expect(aantalKaarten(html)).toBe(30);
    expect(html).not.toContain("Toon meer");
  });

  it("toont de reden van een kaart alleen als er een is", () => {
    hookStatus.data = [
      ...items(1, { id: "met", title: "Met reden", itemReason: "Past bij werk." }),
      ...items(1, { id: "zonder", title: "Zonder reden" }),
    ];
    const html = render();
    expect(html).toContain("Past bij werk.");
    expect((html.match(/data-reden/g) ?? []).length).toBe(1);
  });

  it("belooft geen afstemming op jouw stijl aan wie de quiz niet deed", () => {
    hookStatus.data = items(5);
    hookStatus.afgestemd = false;
    const html = render();
    expect(html).not.toContain("afgestemd op jouw persoonlijke stijl");
    expect(html).toContain("stijlquiz");
  });

  it("belooft afstemming aan wie de quiz wel deed", () => {
    hookStatus.data = items(5);
    hookStatus.afgestemd = true;
    expect(render()).toContain("afgestemd op jouw persoonlijke stijl");
  });

  // Zonder quiz geldt dezelfde standaardgrens als op de resultatenpagina (150
  // euro). Dat moet zichtbaar zijn: anders verdwijnen de duurdere items zonder
  // dat de bezoeker weet waarom.
  it("toont de werkelijke budgetgrens, ook als de bezoeker de quiz niet deed", () => {
    hookStatus.data = items(5);
    const html = render();
    expect(html).toContain("Gefilterd op");
    expect(html).toContain("Tot €150");
  });

  it("toont de laadstaat, de foutstaat en de lege staat", () => {
    hookStatus.loading = true;
    hookStatus.data = null;
    expect(render()).toContain("Producten worden geladen");

    hookStatus.loading = false;
    hookStatus.error = "Catalogus onbereikbaar";
    expect(render()).toContain("Items konden niet worden geladen");

    hookStatus.error = null;
    hookStatus.data = [];
    expect(render()).toContain("Geen items gevonden");
  });
});
