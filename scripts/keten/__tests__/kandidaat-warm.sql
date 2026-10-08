-- Gedragstest: keten_warm_houden leest de structuren van get_kandidaten in het
-- werkgeheugen, en een pg_cron-job doet dat elke vijf minuten.
--
-- Waarom: de instantie heeft 224 MB shared_buffers en de database is 1,7 GB. Na
-- elke stille periode of bulkjob ontbreken de pagina's van de dekkende index en
-- van de kandidaatkopie in het geheugen, en leest de eerste bezoeker ze van een
-- schijf van ongeveer 11 tot 15 MB/s (1.300 leesacties, 1,5 tot 2,6 s in de
-- database). De job leest ze elke vijf minuten opnieuw in; wat al in het
-- geheugen staat, kost een buffertreffer.
--
-- Een koude start laat zich hier niet afdwingen: pg_buffercache_evict eist
-- superuser. Deze test controleert daarom wat wel deterministisch is: de functie
-- verwerkt alle blokken van elke relatie (het getal dat pg_prewarm teruggeeft),
-- ze staan daarna vrijwel volledig in shared_buffers, en de job staat aan.
-- Dat het inladen op een echt koude cache werkt, is eenmalig aangetoond (zie de
-- PR); een functie die niets inleest, faalt hier op het eerste punt.
--
-- Draaien via kandidaatWarm.live.test.ts, of los:
--   supabase db query --linked -f scripts/keten/__tests__/kandidaat-warm.sql

create temp table t_rel on commit drop as
select r.naam, c.relfilenode, (pg_relation_size(c.oid) / 8192)::bigint as blokken
from (values
  ('idx_product_attributes_get_kandidaten_dekkend'),
  ('keten_kandidaat_product'),
  ('keten_kandidaat_product_pkey')
) as r(naam)
join pg_class c on c.oid = ('public.' || r.naam)::regclass;

create temp table t_uit on commit drop as
select * from public.keten_warm_houden();

-- Aanwezigheid in procenten, per relatie, direct na de aanroep.
create temp table t_aanwezig on commit drop as
select t.naam, round(100.0 * count(b.bufferid) / greatest(max(t.blokken), 1), 1) as pct
from t_rel t
left join extensions.pg_buffercache b
  on b.relfilenode = t.relfilenode
 and b.relforknumber = 0
 and b.reldatabase = (select oid from pg_database where datname = current_database())
group by t.naam;

do $$
declare
  r record;
begin
  for r in select t.naam, t.blokken, u.blokken as verwerkt, a.pct
           from t_rel t
           left join t_uit u on u.relatie = t.naam
           left join t_aanwezig a on a.naam = t.naam
  loop
    -- Eerste punt: de functie noemt elke relatie en verwerkt al haar blokken.
    assert r.verwerkt is not null, format('keten_warm_houden noemt %s niet', r.naam);
    assert r.verwerkt >= r.blokken, format('keten_warm_houden verwerkte van %s %s van %s blokken', r.naam, r.verwerkt, r.blokken);
    -- Tweede punt: ze staan in het geheugen. 98 procent in plaats van 100: een
    -- buffer die tussen twee metingen door wordt verdrongen, hoort de test niet
    -- te breken.
    assert r.pct >= 98, format('%s staat na keten_warm_houden pas voor %s procent in het geheugen', r.naam, r.pct);
  end loop;

  -- Derde punt: de job.
  assert exists (select 1 from cron.job where jobname = 'keten-warm-houden' and active and schedule = '*/5 * * * *'),
    'de pg_cron-job keten-warm-houden ontbreekt of staat uit';

  -- Vierde punt: bezoekers mogen de functie niet aanroepen. Hij leest 155 MB in
  -- het geheugen; vrij aanroepbaar via PostgREST is dat een manier om de cache
  -- van andere gebruikers te verdringen.
  assert not has_function_privilege('anon', 'public.keten_warm_houden()', 'execute'),
    'anon mag keten_warm_houden aanroepen';
  assert not has_function_privilege('authenticated', 'public.keten_warm_houden()', 'execute'),
    'authenticated mag keten_warm_houden aanroepen';
end $$;

select 'KANDIDAAT_WARM_OK' as uitkomst;
