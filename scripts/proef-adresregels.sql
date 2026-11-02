-- Toets op de toegang tot moodfoto's en Brams Fruit, als de rollen van de site.
-- Veilig op productie: het blok eindigt altijd op een fout, en daarmee wordt alles teruggedraaid.
--   supabase db query --linked -f scripts/proef-adresregels.sql
-- De uitslag staat in de foutmelding (UITSLAG). Verwacht:
--   ANON:      upload=FOUT(42501)
--   QA:        mood=0 brams=0 obj=0 inactief=0 upload=FOUT(42501) wis=0
--   BEHEERDER: mood=1 brams=1 obj=1 inactief>0 upload=1 wis=1
do $$
declare
  n int; uit text := ''; rij record; poging record;
  doel_mood bigint; doel_obj uuid;
begin
  set local lock_timeout = '3s';
  select id into doel_mood from public.mood_photos order by id limit 1;
  select id into doel_obj from storage.objects where bucket_id = 'mood-photos' order by id limit 1;

  uit := ' | ANON:';
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  begin
    set local role anon;
    insert into storage.objects (bucket_id, name) values ('mood-photos', 'proef-adresregels/anon.txt');
    uit := uit || ' upload=1';
  exception when others then
    uit := uit || ' upload=FOUT(' || sqlstate || ')';
  end;
  reset role;

  for rij in select u.id, u.email, v.naam from (values ('QA', 'info+qa@fitfi.ai'), ('BEHEERDER', 'info@fitfi.ai')) v(naam, mail)
             join auth.users u on u.email = v.mail
             order by v.naam desc loop -- QA eerst: de beheerder wist de testrij binnen deze transactie
    uit := uit || ' | ' || rij.naam || ':';
    perform set_config('request.jwt.claims', json_build_object('sub', rij.id, 'email', rij.email, 'role', 'authenticated', 'app_metadata', '{}'::json)::text, true);
    for poging in select * from (values
      ('mood', format('update public.mood_photos set id = id where id = %L', doel_mood)),
      ('brams', 'update public.brams_fruit_products set id = id where id = (select id from public.brams_fruit_products order by id limit 1)'),
      ('obj', format('update storage.objects set metadata = metadata where id = %L', doel_obj)),
      ('inactief', ''),
      ('upload', format('insert into storage.objects (bucket_id, name) values (''mood-photos'', %L)', 'proef-adresregels/' || rij.naam || '.txt')),
      ('wis', format('delete from public.mood_photos where id = %L', doel_mood))
    ) t(naam, opdracht) loop
      begin
        set local role authenticated;
        if poging.naam = 'inactief' then
          select count(*) into n from public.mood_photos where not coalesce(active, false);
        else
          execute poging.opdracht; get diagnostics n = row_count;
        end if;
        uit := uit || ' ' || poging.naam || '=' || n;
      exception when others then
        uit := uit || ' ' || poging.naam || '=FOUT(' || sqlstate || ')';
      end;
      reset role;
    end loop;
  end loop;
  raise exception 'UITSLAG (alles teruggedraaid)%', uit;
end $$;
