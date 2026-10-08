-- Gedragstest: get_kandidaten sorteert de gangbare profielen in het geheugen
-- en leest ze uit de dekkende index, voor elke rol waarmee de site draait.
--
-- Sortering. De instantie heeft 2 MB work_mem en een schijf van ongeveer 11 tot
-- 15 MB/s. Voor een vrouw met casual en werk tot 150 euro sorteert de functie
-- 21.459 rijen (7 MB). Met 2 MB liep die sortering over naar schijf (755
-- geschreven blokken): 646 ms in plaats van 115 ms, en op een koude cache nog
-- langzamer. Een latere migratie die get_kandidaten opnieuw aanmaakt zonder
-- work_mem zet dat ongemerkt terug.
--
-- Rollen. De site roept get_kandidaten aan als anon (bezoeker) en authenticated
-- (ingelogd), niet als postgres. Onder row-level security mag de planner geen
-- kolomstatistieken gebruiken en schat hij overal 1 rij, terwijl het er 21.000
-- tot 36.000 zijn. Dan wint bij een profiel zonder geslachtsvoorwaarde (unisex:
-- "Beide/Anders" en "Liever niet specificeren" in de quiz, en de shop zonder quiz)
-- een oudere, kleinere index met een tabelopzoeking per rij: 39.000 buffers en 3 tot
-- 7 s in plaats van 5.000 buffers en 0,1 s. Als postgres is dat niet te zien,
-- want daar schat de planner wel goed. Deze test draait elk profiel daarom ook
-- als anon en authenticated.
--
-- De meting: een tijdelijke functie per run roept get_kandidaten aan, en
-- pg_stat_statements rekent het gebruik van die ene aanroep toe aan de
-- bovenliggende statement (tijdelijke blokken, gelezen buffers). De functie
-- krijgt elke run een nieuwe OID, dus een eigen entry; entries van eerdere
-- runs tellen niet mee.
--
-- Draaien via kandidaatSnelheid.live.test.ts, of los:
--   supabase db query --linked -f scripts/keten/__tests__/kandidaat-snelheid.sql

create temp table t_voor as select queryid from pg_stat_statements;

create function pg_temp.proef_vrouw() returns bigint language sql as $$
  select count(*) from public.get_kandidaten('female', array['casual', 'work'], 0, 150, '{}'::jsonb, '{}'::uuid[], '{}'::uuid[], 40)
$$;

create function pg_temp.proef_man() returns bigint language sql as $$
  select count(*) from public.get_kandidaten('male', array['work'], 50, 150, '{}'::jsonb, '{}'::uuid[], '{}'::uuid[], 40)
$$;

-- Het profiel van een bezoeker zonder quiz, zoals de shop het vraagt: alle
-- geslachten, tot 150 euro, 60 per categorie. Het zwaarste gangbare profiel.
create function pg_temp.proef_uni() returns bigint language sql as $$
  select count(*) from public.get_kandidaten('unisex', '{}'::text[], 0, 150, '{}'::jsonb, '{}'::uuid[], '{}'::uuid[], 60)
$$;

select pg_temp.proef_vrouw();
select pg_temp.proef_man();
select pg_temp.proef_uni();

set role anon;
select pg_temp.proef_vrouw();
select pg_temp.proef_man();
select pg_temp.proef_uni();
reset role;

set role authenticated;
select pg_temp.proef_vrouw();
select pg_temp.proef_man();
select pg_temp.proef_uni();
reset role;

do $$
declare
  r record;
  v_gezien int := 0;
begin
  for r in
    select s.query, s.calls, s.userid::regrole::text as rol, s.temp_blks_written,
           s.shared_blks_hit + s.shared_blks_read as buffers
    from pg_stat_statements s
    where s.dbid = (select oid from pg_database where datname = current_database())
      and s.queryid not in (select queryid from t_voor)
      and s.query ~ 'pg_temp\.proef_(vrouw|man|uni)\(\)'
  loop
    v_gezien := v_gezien + 1;
    assert r.calls = 1, format('%s is %s keer aangeroepen als %s, verwacht 1', r.query, r.calls, r.rol);
    assert r.temp_blks_written = 0,
      format('%s als %s schreef %s tijdelijke blokken: de sortering liep over naar schijf', r.query, r.rol, r.temp_blks_written);
    -- Een index-only scan leest voor deze profielen 4.000 tot 6.000 buffers; een
    -- tabelopzoeking per rij 37.000 tot 39.000. De grens ligt ertussen.
    assert r.buffers < 12000,
      format('%s als %s las %s buffers: de planner koos geen index-only scan op de dekkende index', r.query, r.rol, r.buffers);
  end loop;
  assert v_gezien = 9, format('verwacht negen gemeten aanroepen (3 profielen, 3 rollen), gezien: %s', v_gezien);
end $$;

select 'KANDIDAAT_SNELHEID_OK' as uitkomst;
