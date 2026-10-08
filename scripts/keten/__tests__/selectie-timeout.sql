-- De functies die de scripts met de service role aanroepen, en die op een koude
-- cache langer dan 8 s kunnen duren, hebben een eigen limiet van 60 s.
--
-- Waarom: de service role erft de 8 s van de authenticator. In de premiumrun van
-- 2 tot 5 oktober 2026 stierven 14 van de 41 blokken op de eerste pagina van
-- keten_tag_kandidaten, die in product_id-volgorde duizenden al getagde rijen
-- moet overslaan. Een instelling op de functie gaat voor op die van de rol, maar
-- alleen langs de weg die productie neemt (PostgREST). Gemeten op 8 oktober 2026
-- met een slapende wegwerpfunctie via de REST-API:
--   anon          4 s slapen, zonder instelling   57014 na 3,8 s
--   anon          4 s slapen, met 60 s            200 na 4,3 s
--   service_role  10 s slapen, zonder instelling  57014 na 8,2 s
--   service_role  10 s slapen, met 60 s           200 na 10,3 s
-- In het CLI-pad (de Management API, één transactie met set local) werkt de
-- override niet, dus een gedragstest via de CLI is niet mogelijk en de echte
-- functies zijn niet op commando traag. Deze test bewaakt daarom de instelling
-- zelf: een latere migratie die een van deze functies opnieuw aanmaakt zonder
-- statement_timeout zet de 8 s stil terug (net als bij work_mem op get_kandidaten).
--
-- Draaien via selectieTimeout.live.test.ts, of los:
--   supabase db query --linked -f scripts/keten/__tests__/selectie-timeout.sql

do $$
declare
  r record;
  v_gezien int := 0;
begin
  for r in
    select p.oid::regprocedure::text as sig, p.proconfig
    from pg_proc p
    where p.pronamespace = 'public'::regnamespace
      and p.proname in ('keten_tag_kandidaten', 'keten_embed_kandidaten',
                        'keten_schrijf_tags', 'zet_classificatie', 'keten_schrijf_embeddings')
  loop
    v_gezien := v_gezien + 1;
    assert 'statement_timeout=60s' = any(coalesce(r.proconfig, '{}')),
      format('%s heeft geen eigen limiet van 60 s: de scripts krijgen de 8 s van de service role', r.sig);
  end loop;
  assert v_gezien = 5, format('verwacht vijf functies, gezien: %s', v_gezien);
end $$;

select 'SELECTIE_TIMEOUT_OK' as uitkomst;
