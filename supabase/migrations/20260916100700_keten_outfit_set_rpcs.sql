/*
  # RPC's voor de outfit-cache (taak 6, herzien): keten_outfit_set en keten_schrijf_outfit_set

  ## Probleem
  Plan 3 taak 6 schreef hier een Deno edge function `compose-outfits` voor die
  per bezoeker de Anthropic API aanroept. Dat is vervangen (amendement 27
  september 2026 bij spec 5.2.1): de stylist vult zijn cache vooraf, met een
  script op het Claude Code-abonnement (taak 6b, apart). Wat er voor het
  bezoekmoment overblijft is een cache lezen met een levensduur en een
  voorraadcontrole, en dat is pure SQL, net als `get_kandidaten` en
  `keten_tag_kandidaten` al doen. Deze migratie schrapt daarmee het
  `ANTHROPIC_API_KEY`-secret en `supabase functions deploy` uit dit pad.

  ## Amendement (fix 4, eindreview plan 3, 27 sept 2026)
  keten_outfit_set gaf model, input_tokens en output_tokens aan anon terug,
  terwijl de badge op de resultatenpagina alleen `source` (hier: `bron`)
  nodig heeft. Die drie kolommen zijn uit de RETURNS TABLE en de functiebody
  van keten_outfit_set gehaald; `latency_ms` blijft staan. keten_schrijf_
  outfit_set (het schrijfpad) is ONGEWIJZIGD: die blijft model, input_tokens
  en output_tokens gewoon in outfit_sets schrijven, want taak 8 leest die
  kolommen straks rechtstreeks uit de tabel via de service role, niet via
  deze RPC. Vóór de drop is er een `drop function if exists` gezet omdat
  Postgres het returntype van een bestaande functie niet via een kale
  `create or replace` laat wijzigen; dat maakt dit bestand idempotent (veilig
  opnieuw te draaien tegen een database die de oude óf geen vorm van de
  functie heeft). LET OP: dit bestand is al eerder toegepast met de oude
  (bredere) RETURNS TABLE; de live database heeft die oude vorm nog totdat
  iemand dit bestand na dit amendement opnieuw uitvoert (`supabase db push`
  ziet dit versienummer als al toegepast en slaat het over -- dit vraagt een
  losse, bewuste stap). Zie het eindreview-rapport van 27 sept 2026.

  ## Wat deze migratie doet
  - `keten_outfit_set(p_profile_hash, p_stylist_version)`: het leespad.
    Geeft ten hoogste een rij terug (outfits, source, latency_ms, created_at)
    als er een rij bestaat die
    jonger is dan de cache-levensduur EN waarvan elk product in de outfits
    nog `in_stock` is. `source` komt altijd terug als 'cache': dat is het
    antwoord van het leespad, niet de bron van de compositie (spec 5.5/5.4,
    en de CHECK op outfit_sets.source in migratie 20260916100600 staat
    'cache' als opgeslagen waarde ook niet toe). De voorraadcontrole haalt
    alle product_ids in een keer uit de jsonb (`jsonb_array_elements` over
    outfits en hun items) en toetst ze met een enkele left join tegen
    products; geen lus met een query per product. `security definer` met
    een vast search_path, `stable` (leest alleen), en uitvoerbaar voor anon
    en authenticated: outfit_sets heeft RLS zonder policies, dus dit is het
    enige leespad, en dat is bedoeld (dezelfde publieke productdata die
    get_kandidaten ook levert, alleen al door de stylist samengesteld).
  - `keten_schrijf_outfit_set(...)`: het schrijfpad voor het vulscript.
    Upsert op de primaire sleutel (profile_hash, stylist_version): een
    tweede vulronde overschrijft de bestaande rij en zet created_at op nu,
    zodat de levensduur opnieuw ingaat. `source` wordt altijd als 'stylist'
    geschreven; 'cache' hoort nooit in de tabel zelf te staan (zie hierboven
    en het commentaarblok van migratie 20260916100600). Ruimt daarna rijen
    op die ouder zijn dan de opruimtermijn en geeft dat aantal terug.
    `security definer` met een vast search_path, en revoke all van public,
    anon en authenticated: alleen de service role (het vulscript) mag hem
    aanroepen.

  Beide levensduren staan als een genoemde constante in de functie
  (`v_max_leeftijd_dagen`, `v_opruim_dagen`), niet verstopt in een
  interval-literal.

  ## Risico: statement-timeout op de anon-route
  De anon-rol heeft een statement-timeout van 3 seconden (gemeten in plan 2
  taak 8 op pg_roles.rolconfig); keten_outfit_set wordt door de browser als
  anon aangeroepen. De voorraadcontrole hierboven is een enkele query over
  ten hoogste een handvol outfits (zes outfits x tot zes items), gejoined op
  products.id (primaire sleutel, dus indexed); zie het rapport voor de
  EXPLAIN (ANALYZE, BUFFERS)-meting.

  ## Geen ANALYZE
  Deze migratie voegt geen tabel en geen kolom toe en verandert geen data;
  er is geen reden voor een `analyze`-statement, en de valkuil uit plan 2
  taak 8 (een `analyze` in een migratie die de planner van een andere query
  op andere gedachten brengt, ooit een groene poort rood) is hier dus niet
  van toepassing. Bewust weggelaten, niet vergeten.

  ## Terugdraaien
  drop function if exists keten_schrijf_outfit_set(text, text, jsonb, text, integer, integer, integer);
  drop function if exists keten_outfit_set(text, text);
*/

-- Het leespad. Geen schrijven, geen opruiming: dat hoort bij het schrijfpad.
-- Fix 4 (eindreview plan 3, 27 sept 2026): drop vóór create, want Postgres
-- staat niet toe dat een kale `create or replace function` het returntype
-- (hier: de RETURNS TABLE-kolommen) van een bestaande functie wijzigt. Deze
-- drop maakt het bestand idempotent: veilig te draaien of de database nu de
-- oude vorm (met model/input_tokens/output_tokens), de nieuwe vorm, of de
-- functie helemaal niet heeft.
drop function if exists keten_outfit_set(text, text);

create function keten_outfit_set(
  p_profile_hash text,
  p_stylist_version text
)
returns table (
  outfits jsonb,
  source text,
  latency_ms integer,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
declare
  -- Cache-levensduur (spec 5.5 / plan 3 taak 6): een rij die hier ouder dan
  -- is, is geen hit meer, ook niet als elk product nog op voorraad is.
  v_max_leeftijd_dagen constant int := 14;
  v_rij record;
  v_heeft_niet_op_voorraad boolean;
begin
  select os.outfits, os.latency_ms, os.created_at
  into v_rij
  from outfit_sets os
  where os.profile_hash = p_profile_hash
    and os.stylist_version = p_stylist_version
    and os.created_at > now() - make_interval(days => v_max_leeftijd_dagen)
  limit 1;

  if not found then
    return;
  end if;

  -- Voorraadcontrole in een enkele query: alle product_ids uit alle outfits
  -- in een keer uit de jsonb, getoetst met een left join tegen products.
  -- profile_hash bevat bewust geen voorraadstatus (spec 5.2.1), dus zonder
  -- deze controle zou een set met een uitverkocht product veertien dagen
  -- blijven staan.
  select exists (
    select 1
    from jsonb_array_elements(v_rij.outfits) as outfit
    cross join jsonb_array_elements(outfit -> 'items') as item
    left join products p on p.id = (item ->> 'product_id')::uuid
    where p.id is null or p.in_stock is not true
  ) into v_heeft_niet_op_voorraad;

  if v_heeft_niet_op_voorraad then
    return;
  end if;

  outfits := v_rij.outfits;
  source := 'cache';
  latency_ms := v_rij.latency_ms;
  created_at := v_rij.created_at;
  return next;
end;
$$;

grant execute on function keten_outfit_set(text, text) to anon, authenticated;

-- Het schrijfpad voor het vulscript (taak 6b). source staat hier altijd vast
-- op 'stylist': dat is de bron van de compositie, 'cache' is wat het
-- leespad hierboven teruggeeft en de CHECK op outfit_sets.source laat
-- 'cache' als opgeslagen waarde ook niet toe.
create or replace function keten_schrijf_outfit_set(
  p_profile_hash text,
  p_stylist_version text,
  p_outfits jsonb,
  p_model text,
  p_latency_ms integer,
  p_input_tokens integer,
  p_output_tokens integer
)
returns integer
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  -- Opruimtermijn (spec 5.5 / plan 3 taak 6): na elke schrijfactie
  -- verdwijnen rijen die dit aantal dagen niet meer zijn geschreven.
  v_opruim_dagen constant int := 30;
  v_opgeruimd integer;
begin
  insert into outfit_sets (
    profile_hash, stylist_version, source, outfits, model,
    latency_ms, input_tokens, output_tokens, created_at
  )
  values (
    p_profile_hash, p_stylist_version, 'stylist', p_outfits, p_model,
    p_latency_ms, p_input_tokens, p_output_tokens, now()
  )
  on conflict (profile_hash, stylist_version) do update
    set source = 'stylist',
        outfits = excluded.outfits,
        model = excluded.model,
        latency_ms = excluded.latency_ms,
        input_tokens = excluded.input_tokens,
        output_tokens = excluded.output_tokens,
        created_at = now();

  delete from outfit_sets
  where created_at < now() - make_interval(days => v_opruim_dagen);
  get diagnostics v_opgeruimd = row_count;

  return v_opgeruimd;
end;
$$;

revoke all on function keten_schrijf_outfit_set(text, text, jsonb, text, integer, integer, integer)
  from public, anon, authenticated;
