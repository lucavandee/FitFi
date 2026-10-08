-- Gedragstest: get_kandidaten sorteert de gangbare profielen in het geheugen.
--
-- Waarom dit een test is: de instantie heeft 2 MB work_mem en een schijf van
-- ongeveer 11 tot 15 MB/s. Voor een vrouw met casual en werk tot 150 euro
-- sorteert de functie 21.459 rijen (7 MB). Met 2 MB liep die sortering over naar
-- schijf (755 geschreven blokken): 646 ms in plaats van 115 ms, en op een koude
-- cache nog langzamer. Een latere migratie die get_kandidaten opnieuw aanmaakt
-- zonder work_mem zet dat ongemerkt terug; deze test vangt dat.
--
-- De meting: een tijdelijke functie per run roept get_kandidaten aan, en
-- pg_stat_statements rekent het tijdelijke-blokkengebruik van die ene aanroep
-- toe aan de bovenliggende statement. De functie krijgt elke run een nieuwe OID,
-- dus een eigen entry; entries van eerdere runs tellen niet mee.
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

select pg_temp.proef_vrouw();
select pg_temp.proef_man();

do $$
declare
  r record;
  v_gezien int := 0;
begin
  for r in
    select s.query, s.calls, s.temp_blks_written
    from pg_stat_statements s
    where s.dbid = (select oid from pg_database where datname = current_database())
      and s.queryid not in (select queryid from t_voor)
      and s.query ~ 'pg_temp\.proef_(vrouw|man)\(\)'
  loop
    v_gezien := v_gezien + 1;
    assert r.calls = 1, format('%s is %s keer aangeroepen, verwacht 1', r.query, r.calls);
    assert r.temp_blks_written = 0,
      format('%s schreef %s tijdelijke blokken: de sortering liep over naar schijf', r.query, r.temp_blks_written);
  end loop;
  assert v_gezien = 2, format('verwacht twee gemeten aanroepen, gezien: %s', v_gezien);
end $$;

select 'KANDIDAAT_SNELHEID_OK' as uitkomst;
