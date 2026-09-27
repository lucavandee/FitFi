/*
  # weekly_ratings: weekgrens naar Europe/Amsterdam (spec 5.6, revisie)

  ## Probleem
  date_trunc('week', l.created_at) draait in de sessie-tijdzone van deze
  database, en die is UTC. Voor een Nederlands publiek betekent dat: een stem
  vlak na Nederlandse middernacht (bijvoorbeeld 00:30 's nachts, al maandag
  in Nederland) valt qua klokwaarde nog in de UTC-zondag en wordt daardoor
  stil meegeteld bij de aflopende week in plaats van de nieuwe. Aangetoond
  met een live testrij: 2026-09-13 21:30 NL en 2026-09-14 00:30 NL (de
  tweede al maandag) vielen vóór deze migratie allebei in de week van
  2026-09-07; de tweede hoort bij de week van 2026-09-14.

  ## Wat deze migratie doet
  Vervangt weekly_ratings door een gelijke view, met als enige verschil dat
  created_at eerst wordt omgezet naar Europe/Amsterdam voor de weekgrens
  wordt bepaald. week_start, iso_jaar en iso_week worden alle drie afgeleid
  van diezelfde omgezette waarde, zodat de view intern consistent blijft.
  De onderliggende tabel en RLS zijn ongewijzigd; dit raakt alleen de view.

  Tijdzone-reden (niet terugdraaien zonder deze regel te lezen): FitFi is
  een Nederlands product, de weekmeting moet de Nederlandse kalenderweek
  volgen, niet de UTC-kalenderweek van de database-sessie.

  ## Terugdraaien
  Zet weekly_ratings terug op date_trunc('week', l.created_at) zonder de
  at time zone-omzetting (de versie uit 20260914120200_outfit_ratings.sql).
*/

create or replace view weekly_ratings
with (security_invoker = true) as
with laatste as (
  select distinct on (profile_hash, session_id, outfit_key)
    profile_hash,
    session_id,
    outfit_key,
    rating,
    created_at
  from outfit_ratings
  order by profile_hash, session_id, outfit_key, created_at desc
),
laatste_nl as (
  select
    profile_hash,
    rating,
    date_trunc('week', l.created_at at time zone 'Europe/Amsterdam') as week_nl
  from laatste l
)
select
  week_nl::date as week_start,
  extract(isoyear from week_nl)::int as iso_jaar,
  extract(week from week_nl)::int as iso_week,
  count(distinct profile_hash) as profielen,
  round(100.0 * count(*) filter (where rating = 'zou_dragen') / count(*), 1) as pct_zou_dragen,
  round(100.0 * count(*) filter (where rating = 'nooit') / count(*), 1) as pct_nooit,
  round(count(*)::numeric / count(distinct profile_hash), 2) as beoordeeld_per_profiel
from laatste_nl
group by week_nl
order by week_nl desc;
