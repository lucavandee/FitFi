/*
  # outfit_ratings en weekly_ratings (spec 5.6)

  ## Probleem
  Niets wordt gemeten. results_feedback heeft twee rijen ooit en schrijft
  alleen voor ingelogde gebruikers. Het stuurcijfer uit de spec is "zou ik
  dragen" per outfit, doel vier van de zes.

  ## Wat deze migratie doet
  1. outfit_ratings: een rij per beoordeling. profile_hash is de sha256 van
     de quiz-antwoorden, outfit_key de sha256 van de gesorteerde product-ids.
  2. RLS: anon en authenticated mogen invoegen met een session_id; niemand
     mag lezen, wijzigen of verwijderen via de API. De meting wordt gelezen
     als tabeleigenaar of service role.
  3. weekly_ratings: per ISO-week het aantal profielen, het percentage
     zou_dragen, het percentage nooit en het gemiddeld aantal beoordeelde
     outfits per profiel. Van mening veranderen geeft een tweede rij; de
     view telt per (profile_hash, session_id, outfit_key) de laatste.

  ## Terugdraaien
  drop view if exists weekly_ratings;
  drop table if exists outfit_ratings;
*/

create table if not exists outfit_ratings (
  id           uuid primary key default gen_random_uuid(),
  profile_hash text not null check (profile_hash ~ '^[0-9a-f]{64}$'),
  outfit_key   text not null check (outfit_key ~ '^[0-9a-f]{64}$'),
  rating       text not null check (rating in ('zou_dragen', 'nooit')),
  session_id   text not null check (length(session_id) between 8 and 128),
  user_id      uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now()
);

create index if not exists idx_outfit_ratings_profile_hash on outfit_ratings (profile_hash);
create index if not exists idx_outfit_ratings_created_at on outfit_ratings (created_at);

alter table outfit_ratings enable row level security;

drop policy if exists "Bezoekers mogen een beoordeling insturen" on outfit_ratings;
create policy "Bezoekers mogen een beoordeling insturen"
  on outfit_ratings
  for insert
  to anon, authenticated
  with check (
    session_id is not null
    and (user_id is null or user_id = auth.uid())
  );

-- Bewust geen select-, update- of delete-policy.

drop view if exists weekly_ratings;
create view weekly_ratings
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
)
select
  date_trunc('week', l.created_at)::date as week_start,
  extract(isoyear from date_trunc('week', l.created_at))::int as iso_jaar,
  extract(week from date_trunc('week', l.created_at))::int as iso_week,
  count(distinct l.profile_hash) as profielen,
  round(100.0 * count(*) filter (where l.rating = 'zou_dragen') / count(*), 1) as pct_zou_dragen,
  round(100.0 * count(*) filter (where l.rating = 'nooit') / count(*), 1) as pct_nooit,
  round(count(*)::numeric / count(distinct l.profile_hash), 2) as beoordeeld_per_profiel
from laatste l
group by 1, 2, 3
order by 1 desc;
