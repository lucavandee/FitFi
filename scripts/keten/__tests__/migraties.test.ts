/**
 * Contract-test op de migratiebestanden van plan 2: kolomnamen, indexen,
 * functienamen, policies en cron-jobs. Dit is een tekstcontrole op de
 * bestanden, geen bewijs dat de SQL werkt. Het gedrag wordt bewezen door
 * migraties.live.test.ts (tegen de gekoppelde database) en door de
 * controle-queries per taak in het plan.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const MIGRATIES = join(__dirname, "..", "..", "..", "supabase", "migrations");
const lees = (naam: string) => readFileSync(join(MIGRATIES, naam), "utf8").toLowerCase();

describe("20260916100000_keten_tag_kolommen", () => {
  const sql = lees("20260916100000_keten_tag_kolommen.sql");

  it("voegt elke tag-kolom uit spec 5.1 toe", () => {
    for (const kolom of [
      "formality", "occasions", "silhouette", "color_temp", "lightness", "pattern",
      "shoe_type", "colors", "materials", "seasons", "confidence", "tagger_version",
      "embedding", "tagged_at",
    ]) {
      expect(sql).toContain(`add column if not exists ${kolom}`);
    }
  });

  it("maakt de indexen uit spec 5.1 (ivfflat volgt na de embed-run) plus retailer en tagger_version", () => {
    expect(sql).toContain("on product_attributes (canonical_id)");
    expect(sql).toContain("on product_attributes (gender, category, price_band)");
    expect(sql).toContain("using gin (occasions)");
    expect(sql).toContain("on products (retailer)");
    expect(sql).toContain("on product_attributes (tagger_version, product_id)");
    expect(sql).not.toContain("where tagger_version is null");
  });

  it("levert de retailer-controle en de twee tag-RPC's met security definer", () => {
    expect(sql).toContain("function keten_controleer_retailer(");
    expect(sql).toContain("onbekende retailer");
    expect(sql).toContain("function keten_tag_kandidaten(");
    expect(sql).toContain("function keten_schrijf_tags(");
    expect((sql.match(/security definer/g) ?? []).length).toBeGreaterThanOrEqual(3);
    expect((sql.match(/select keten_controleer_retailer\(p_retailer\)/g) ?? []).length).toBeGreaterThanOrEqual(1);
  });

  it("beperkt de tag-RPC's tot de service role", () => {
    expect(sql).toContain("revoke all on function keten_tag_kandidaten");
    expect(sql).toContain("revoke all on function keten_schrijf_tags");
  });

  it("tagt alleen geclassificeerde rijen en laat category aan de classifier", () => {
    expect(sql).toContain("and pa.classifier_version is not null");
    expect(sql).not.toContain("category = case");
    expect(sql).not.toContain("category = r->>");
    expect(sql).toContain("is_fashion = pa.is_fashion");
  });
});

describe("20260922120000_keten_tag_kandidaten_product_attributes", () => {
  const sql = lees("20260922120000_keten_tag_kandidaten_product_attributes.sql");

  it("filtert in_stock en retailer op product_attributes, niet meer via products", () => {
    expect(sql).toContain("and pa.in_stock");
    expect(sql).toContain("and (p_retailer is null or pa.retailer = p_retailer)");
    expect(sql).not.toContain("and p.in_stock");
    expect(sql).not.toContain("and (p_retailer is null or p.retailer = p_retailer)");
  });

  it("legt een partiele index aan die bij de kandidatenquery past, zonder tagger_version erin", () => {
    expect(sql).toContain("idx_product_attributes_tag_kandidaten");
    expect(sql).toContain("on product_attributes (retailer, product_id)");
    expect(sql).toContain("where product_id = canonical_id");
    expect(sql).toContain("and is_fashion");
    expect(sql).toContain("and classifier_version is not null");
    expect(sql).toContain("and in_stock");
    // Bewuste keuze: geen partiele index op tagger_version, zie het
    // commentaarblok. Dat zou een hertagronde met een nieuwe versiestring
    // niet dekken en de query terug laten vallen op een tabelscan.
    expect(sql).not.toContain("where tagger_version");
  });

  it("houdt de foto-tak bewust op products voor image_url, met onderbouwing in het commentaar", () => {
    expect(sql).toContain("p.image_url like 'http%'");
    expect(sql).toContain("image_url-kolom");
  });

  it("behoudt signatuur, security definer en de revoke naar service role", () => {
    expect(sql).toContain("function keten_tag_kandidaten(");
    expect(sql).toContain("p_retailer text default null");
    expect(sql).toContain("p_modus text default 'tekst'");
    expect(sql).toContain("p_versie text default 'haiku-4.5-v1'");
    expect(sql).toContain("p_limit int default 1000");
    expect(sql).toContain("p_after uuid default null");
    expect(sql).toContain("security definer");
    expect(sql).toContain("set search_path = public, extensions");
    expect(sql).toContain("revoke all on function keten_tag_kandidaten(text, text, text, int, uuid) from public, anon, authenticated");
  });
});

describe("20260916100200_keten_get_kandidaten_score", () => {
  const sql = lees("20260916100200_keten_get_kandidaten_score.sql");

  it("vervangt de oude signatuur en voegt p_retailer met default en controle toe", () => {
    expect(sql).toContain("drop function if exists get_kandidaten(text, text[], int, int, jsonb, uuid[], uuid[], int)");
    expect(sql).toContain("p_retailer text default null");
    expect(sql).toContain("select keten_controleer_retailer(p_retailer)");
  });

  it("geeft alleen getagde rijen terug", () => {
    expect(sql).toContain("and pa.tagger_version is not null");
  });

  it("weegt de drie onderdelen 0.5, 0.3 en 0.2 en is deterministisch op product_id", () => {
    expect(sql).toContain("0.5 *");
    expect(sql).toContain("0.3 *");
    expect(sql).toContain("0.2 *");
    expect(sql).toContain("order by g.category, g.score desc, g.product_id");
  });

  it("filtert en rangschikt volledig op product_attributes; products wordt pas na de topN-afkap gejoind", () => {
    expect(sql).not.toContain("join products p on p.id = pa.product_id");
    expect(sql).toContain("and pa.in_stock");
    expect(sql).toContain("and (p_retailer is null or pa.retailer = p_retailer)");
    expect(sql).toContain("join products p on p.id = g.product_id");
    expect(sql).toContain("least(60, greatest(1, coalesce(p_per_category, 12)))");
    expect(sql).toContain("to_jsonb(p.*) as product");
  });

  it("blijft security invoker en aanroepbaar voor de frontend", () => {
    expect(sql).toContain("security invoker");
    expect(sql).not.toContain("security definer");
    expect(sql).toContain("grant execute on function get_kandidaten");
  });
});
