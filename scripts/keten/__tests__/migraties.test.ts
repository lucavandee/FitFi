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

describe("20260925090000_keten_get_kandidaten_attrs_expliciet", () => {
  const sql = lees("20260925090000_keten_get_kandidaten_attrs_expliciet.sql");

  it("bouwt attrs met een expliciete jsonb_build_object, niet met to_jsonb(pa)", () => {
    expect(sql).toContain("jsonb_build_object(");
    // De oude regressie stond letterlijk als "... as attrs"; die vorm mag nergens
    // meer als functionele code voorkomen. Het commentaarblok legt uit waarom en
    // noemt to_jsonb(pa) daarbij bewust wel (leesbaarheid voor de volgende lezer),
    // dus een kale "not toContain to_jsonb(pa)" zou dat commentaar zelf afkeuren.
    expect(sql).not.toContain("to_jsonb(pa) - 'embedding' as attrs");
  });

  it("neemt classifier_version en category op (gedocumenteerd client-contract uit plan 1)", () => {
    expect(sql).toContain("'classifier_version', pa.classifier_version");
    expect(sql).toContain("'category', pa.category");
  });

  it("neemt de tag-attributen uit spec 5.1 op, niet de embedding-kolom", () => {
    for (const veld of [
      "formality", "occasions", "silhouette", "color_temp", "lightness",
      "pattern", "shoe_type", "colors", "materials", "seasons",
    ]) {
      expect(sql).toContain(`'${veld}', pa.${veld}`);
    }
    expect(sql).not.toContain("'embedding', pa.embedding");
  });

  it("laat de rest van de functie ongemoeid: signatuur, plafond, products pas na de afkap, security invoker", () => {
    expect(sql).toContain("p_gender text,");
    expect(sql).toContain("p_retailer text default null");
    expect(sql).toContain("least(60, greatest(1, coalesce(p_per_category, 12)))");
    expect(sql).toContain("to_jsonb(p.*) as product");
    expect(sql).toContain("join products p on p.id = g.product_id");
    expect(sql).not.toContain("join products p on p.id = pa.product_id");
    expect(sql).toContain("security invoker");
    expect(sql).not.toContain("security definer");
    expect(sql).toContain("grant execute on function get_kandidaten");
  });
});

describe("20260916100100_keten_embedding_rpcs", () => {
  const sql = lees("20260916100100_keten_embedding_rpcs.sql");

  it("levert de twee embedding-RPC's met retailer-controle, alleen voor de service role", () => {
    expect(sql).toContain("function keten_embed_kandidaten(");
    expect(sql).toContain("select keten_controleer_retailer(p_retailer)");
    expect(sql).toContain("function keten_schrijf_embeddings(");
    expect(sql).toContain("::extensions.vector");
    expect(sql).toContain("revoke all on function keten_embed_kandidaten");
    expect(sql).toContain("revoke all on function keten_schrijf_embeddings");
  });
});

describe("20260916100300_keten_dedupe_embedding", () => {
  const sql = lees("20260916100300_keten_dedupe_embedding.sql");

  it("maakt de ivfflat-index uit spec 5.1 na de embed-run", () => {
    expect(sql).toContain("using ivfflat (embedding extensions.vector_cosine_ops)");
  });

  it("dedupet op cosine-afstand met drempel 0.999 binnen de retailer, zonder gender- of category-eis, met placeholder-beveiliging", () => {
    expect(sql).toContain("function keten_dedupe_embedding(");
    expect(sql).toContain("p_drempel real default 0.999");
    expect(sql).toContain("perform keten_controleer_retailer(p_retailer)");
    expect(sql).toContain("<=>");
    expect(sql).toContain("ivfflat.probes");
    expect(sql).toContain("keten_placeholder");
    expect(sql).not.toContain("b.gender = a.gender");
    expect(sql).not.toContain("b.category = a.category");
    expect(sql).toContain("order by x.in_stock desc, x.price asc, x.id asc");
    expect(sql).toContain("revoke all on function keten_dedupe_embedding");
  });
});

describe("20260916100400_keten_feed_gates", () => {
  const sql = lees("20260916100400_keten_feed_gates.sql");

  it("maakt feed_gates met de kolommen uit het plan en RLS via de admin-helper", () => {
    expect(sql).toContain("create table if not exists feed_gates");
    for (const kolom of ["retailer text", "run_at timestamptz", "groen boolean", "matrix jsonb", "persona_output jsonb"]) {
      expect(sql).toContain(kolom);
    }
    expect(sql).toContain("alter table feed_gates enable row level security");
    expect(sql).toContain("using (is_current_user_admin())");
    expect(sql).not.toContain("->> 'role'");
  });

  it("levert keten_dekkingsmatrix over gender x gelegenheid x prijsband met retailer-controle", () => {
    expect(sql).toContain("function keten_dekkingsmatrix(");
    expect(sql).toContain("select keten_controleer_retailer(p_retailer)");
    expect(sql).toContain("'tot50', '50tot100', '100tot200', 'boven200'");
    expect(sql).toContain("'work', 'casual', 'formal', 'date', 'travel', 'sport', 'party'");
  });

  it("telt volledig op product_attributes, zonder join naar products", () => {
    expect(sql).not.toContain("join products");
    expect(sql).toContain("and pa.in_stock");
    expect(sql).toContain("and pa.retailer = p_retailer");
  });
});

describe("20260916100500_keten_cron", () => {
  const sql = lees("20260916100500_keten_cron.sql");

  it("schakelt pg_cron en pg_net in en roept edge functions via de vault aan", () => {
    expect(sql).toContain("create extension if not exists pg_cron");
    expect(sql).toContain("create extension if not exists pg_net");
    expect(sql).toContain("function keten_roep_edge(");
    expect(sql).toContain("vault.decrypted_secrets");
    expect(sql).not.toMatch(/eyj[a-z0-9]{20,}/i);
  });

  it("geeft de linkjob de index die hij nodig heeft om binnen de statement-timeout te blijven", () => {
    expect(sql).toContain("on products (link_last_checked_at asc nulls first)");
  });

  it("vult alleen nieuwe producten, controleert de import vooraf en logt elke run", () => {
    expect(sql).toContain("create table if not exists keten_cron_log");
    expect(sql).toContain("using (is_current_user_admin())");
    expect(sql).toContain("function keten_vul_nieuwe_producten(");
    expect(sql).toContain("not exists (select 1 from product_attributes pa where pa.product_id = p.id)");
    expect(sql).toContain("on conflict (product_id) do nothing");
    expect(sql).not.toContain("vul_product_attributes(");
    expect(sql).toContain("function keten_vul_na_import(");
    expect(sql).toContain("di.status <> 'success'");
    expect(sql).toContain("set in_stock = false");
  });

  it("ververst price, in_stock, retailer en price_band voor elke rij van de retailer, zonder canonical_id aan te raken", () => {
    expect(sql).toContain(
      "insert into product_attributes (product_id, canonical_id, is_fashion, category, gender, price_band, price, in_stock, retailer)"
    );
    expect(sql).toContain("returns table (aantal_nieuw bigint, aantal_feedvelden_ververst bigint)");
    expect(sql).toContain("set price = b.price,");
    expect(sql).toContain("in_stock = b.in_stock,");
    expect(sql).toContain("retailer = b.retailer,");
    expect(sql).not.toContain("canonical_id = b.");
    expect(sql).toContain("v_vul.aantal_feedvelden_ververst");
    expect(sql).toContain("'feedvelden_ververst'");
  });

  it("plant de drie jobs en maakt ze herhaalbaar", () => {
    for (const job of ["keten-feed-import-wekelijks", "keten-vul-na-import", "keten-links-elke-10-min"]) {
      expect(sql).toContain(`cron.unschedule('${job}')`);
      expect(sql).toContain(`cron.schedule('${job}'`);
    }
    expect(sql).toContain("'0 3 * * 0'");
    expect(sql).toContain("'0 5-11 * * 0'");
    expect(sql).toContain("'*/10 * * * *'");
    expect(sql).toContain("validate-product-links");
    expect(sql).toContain("keten_vul_na_import()");
  });

  it("zet de twee zondagsjobs inactief en laat de linkjob actief", () => {
    // Via cron.alter_job: de postgres-rol heeft geen update-recht op cron.job.
    expect(sql).toContain("perform cron.alter_job(job_id := v_jobid, active := false)");
    expect(sql).toContain("where jobname in ('keten-feed-import-wekelijks', 'keten-vul-na-import')");
    // De linkjob mag niet in het uitzet-blok staan.
    const vanaf = sql.slice(sql.indexOf("select jobid from cron.job\n     where jobname in ("));
    expect(vanaf.slice(0, vanaf.indexOf(";") + 1)).not.toContain("keten-links-elke-10-min");
    // De weg terug staat in de commentaar, zodat niemand hoeft te raden.
    expect(sql).toContain(
      "select cron.alter_job((select jobid from cron.job where jobname = 'keten-feed-import-wekelijks'), active := true)"
    );
    expect(sql).toContain(
      "select cron.alter_job((select jobid from cron.job where jobname = 'keten-vul-na-import'), active := true)"
    );
  });

  it("logt per retailer hoeveel rijen op de classificeer-ronde wachten, en logt ook de al_gedaan-tak", () => {
    expect(sql).toContain("'ongeclassificeerd_per_retailer'");
    expect(sql).toContain("where pa.classifier_version is null");
    // Drie takken (wacht, al_gedaan, klaar), drie inserts in het log.
    expect(sql.match(/insert into keten_cron_log \(job, resultaat\) values \('keten-vul-na-import'/g)).toHaveLength(3);
  });

  it("dedupliceert op de fotogroep, niet op de naam", () => {
    expect(sql).toContain("coalesce(nullif(b.image_url, ''), 'naam:' || b.merk || ':' || b.naam)");
    expect(sql).not.toContain("partition by n.retailer, n.merk, n.naam");
  });
});

/**
 * Drie kopieen van dezelfde afspraak. Zolang ze kopieen zijn, moeten ze
 * letterlijk gelijk blijven: een aanpassing aan een ervan maakt deze suite
 * rood in plaats van stil af te wijken. Samenvoegen naar een functie is een
 * migratie op bestaande functies en valt buiten plan 2 taak 12.
 */
describe("gedeelde afspraken tussen de vulfuncties", () => {
  const BESTANDEN = [
    "20260914120000_product_attributes_fundament.sql",
    "20260914120400_keten_kandidaten_kolommen.sql",
    "20260916100500_keten_cron.sql",
  ];

  const leesRuw = (naam: string) => readFileSync(join(MIGRATIES, naam), "utf8");

  const haalNietKleding = (naam: string) => {
    const treffer = leesRuw(naam).match(/niet_kleding constant text :=\s*\r?\n\s*('(?:[^']|'')*')/);
    if (!treffer) throw new Error(`niet_kleding-regex niet gevonden in ${naam}`);
    return treffer[1];
  };

  it("de niet_kleding-regex is in alle drie de migraties letterlijk gelijk", () => {
    const [eerste, ...rest] = BESTANDEN.map(haalNietKleding);
    expect(eerste).toContain("vaas|vazen|lamp");
    for (const andere of rest) expect(andere).toBe(eerste);
  });

  it("de dedupe-sleutel (retailer, image_url met naam-terugval) staat letterlijk gelijk in alle drie", () => {
    const sleutel = "coalesce(nullif(b.image_url, ''), 'naam:' || b.merk || ':' || b.naam)";
    for (const bestand of BESTANDEN) {
      expect(leesRuw(bestand), `dedupe-sleutel ontbreekt in ${bestand}`).toContain(sleutel);
    }
  });
});

/**
 * outfit_sets zelf heeft geen taak-eigen test in plan 3, maar taak 6 schrijft
 * erin en taak 8 leest de tokenkolommen voor de kostenquery per week. De
 * kolomlijst en de RLS-zonder-policy zijn dus een contract tussen taken; deze
 * suite bewaakt dat contract, niet alleen de stand van vandaag (zie
 * taak-3-brief.md, punt 3).
 */
describe("20260916100600_create_outfit_sets", () => {
  const sql = lees("20260916100600_create_outfit_sets.sql");

  it("bevat alle negen kolommen uit de interfacesectie van het plan", () => {
    for (const kolom of [
      "profile_hash",
      "stylist_version",
      "source",
      "outfits",
      "model",
      "latency_ms",
      "input_tokens",
      "output_tokens",
      "created_at",
    ]) {
      expect(sql).toContain(kolom);
    }
  });

  it("heeft (profile_hash, stylist_version) als primaire sleutel", () => {
    expect(sql).toContain("primary key (profile_hash, stylist_version)");
  });

  it("zet RLS aan zonder een enkele policy: alleen de service role komt erbij", () => {
    expect(sql).toContain("enable row level security");
    expect(sql).not.toContain("create policy");
  });

  it("beperkt source met een CHECK tot 'stylist' en 'v2-fallback', niet 'cache'", () => {
    expect(sql).toContain("check (source in ('stylist', 'v2-fallback'))");
    // 'cache' mag in het commentaarblok staan (dat legt juist uit waarom het
    // niet in de CHECK hoort), maar niet in de create table-statement zelf.
    const vanTabel = sql.slice(sql.indexOf("create table if not exists public.outfit_sets"));
    expect(vanTabel.slice(0, vanTabel.indexOf(";") + 1)).not.toContain("'cache'");
  });

  it("heeft een index op created_at voor de levensduur- en kostenqueries", () => {
    expect(sql).toContain("idx_outfit_sets_created_at");
    expect(sql).toContain("on public.outfit_sets (created_at)");
  });
});
