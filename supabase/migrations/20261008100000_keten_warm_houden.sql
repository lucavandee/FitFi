/*
  # keten_warm_houden: de structuren van get_kandidaten in het geheugen houden

  ## Probleem, gemeten op 8 oktober 2026
  De instantie heeft 224 MB shared_buffers (gedeeld werkgeheugen) en de database
  is 1,7 GB, op een schijf van ongeveer 11 tot 15 MB/s. De selectie van
  get_kandidaten leest 21.000 indexregels (de dekkende index, 27 MB) en haalt
  daarna 240 rijen uit de kandidaatkopie (124 MB). Zodra die pagina's uit het
  geheugen zijn, na een stille periode of een bulkjob, leest de eerste bezoeker
  ze van schijf. Gemeten met het geheugen leeggeveegd:
    in de database   1.285 tot 1.395 leesacties   1.550 tot 2.628 ms
    bij de bezoeker  3,0 tot 5,3 s
  Warm: 120 ms in de database. Het verschil is dus bijna helemaal de koude cache.

  ## Wat deze migratie doet
  keten_warm_houden() leest de dekkende index, de kandidaatkopie, haar
  primaire-sleutelindex en de zichtbaarheidskaart van product_attributes in
  shared_buffers (pg_prewarm, modus buffer). Wat al in het geheugen staat, kost
  een buffertreffer; alleen wat verdrongen is, wordt van schijf gelezen. Een
  pg_cron-job roept het elke vijf minuten aan.

  De totale omvang is ongeveer 155 MB van de 224 MB. Dat is veel; de rest (de
  primaire sleutel van products, de indexen van link_health die de linkjob
  gebruikt, en de tabellen waar de tagger en de embeddingjob doorheen lezen)
  past er nog in, en bij een bulkjob verdringt de klokalgoritme-sweep de minst
  gebruikte pagina's eerst. Blijkt de kopie te groot, dan is de volgende stap de
  kopie smaller maken (de URL's zijn 55 procent van elke rij), niet de job
  uitzetten.

  pg_buffercache wordt meegeinstalleerd: alleen-lezen diagnose om te zien wat het
  geheugen vult, en voor kandidaat-warm.sql.

  ## Terugdraaien
    select cron.unschedule('keten-warm-houden');
    drop function if exists keten_warm_houden();
*/

create extension if not exists pg_prewarm with schema extensions;
create extension if not exists pg_buffercache with schema extensions;

-- Volgorde naar belang: de index en de primaire sleutel heeft elke aanroep
-- nodig, de kopie-heap voor de 240 rijen die eruit komen.
create or replace function public.keten_warm_houden()
returns table (relatie text, blokken bigint)
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query select 'idx_product_attributes_get_kandidaten_dekkend'::text,
    extensions.pg_prewarm('public.idx_product_attributes_get_kandidaten_dekkend'::regclass, 'buffer', 'main');
  return query select 'keten_kandidaat_product_pkey'::text,
    extensions.pg_prewarm('public.keten_kandidaat_product_pkey'::regclass, 'buffer', 'main');
  return query select 'product_attributes (zichtbaarheidskaart)'::text,
    extensions.pg_prewarm('public.product_attributes'::regclass, 'buffer', 'vm');
  return query select 'keten_kandidaat_product'::text,
    extensions.pg_prewarm('public.keten_kandidaat_product'::regclass, 'buffer', 'main');
end;
$$;

revoke all on function public.keten_warm_houden() from public, anon, authenticated;
grant execute on function public.keten_warm_houden() to service_role;

-- Idempotent: cron.unschedule('naam') gooit een fout als de job niet bestaat.
do $$
begin
  if exists (select 1 from cron.job where jobname = 'keten-warm-houden') then
    perform cron.unschedule('keten-warm-houden');
  end if;
end $$;

select cron.schedule('keten-warm-houden', '*/5 * * * *', $$select * from public.keten_warm_houden()$$);
