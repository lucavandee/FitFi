/*
  # Anonieme dagtellingen voor de site

  Quiz-starts stonden alleen in Google Analytics, en dat laadt alleen na
  toestemming; FitFi had zelf geen cijfer om de nieuwe homepage aan te meten
  (plan van 21 oktober 2026, de stoplijn). Dit telt per dag drie dingen:
  homepage geladen, quiz gestart, rapport gemaakt.

  ## Wat er wordt bewaard
  Alleen een aantal per dag en per gebeurtenis. Geen IP-adres, geen sessie,
  geen gebruiker, geen apparaat. De site slaat er niets voor op het apparaat
  op, dus er is geen toestemming voor nodig (Telecommunicatiewet 11.7a gaat
  over lezen en schrijven op het apparaat).

  ## Toegang
  Niemand leest of schrijft de tabel rechtstreeks. Anon en authenticated
  mogen alleen tel_gebeurtenis aanroepen, die een vaste lijst gebeurtenissen
  kent. Lezen gaat via de service role of postgres.

  ## Terugdraaien
    drop function public.tel_gebeurtenis(text);
    drop table public.site_tellingen;
*/

create table if not exists public.site_tellingen (
  dag date not null,
  gebeurtenis text not null check (gebeurtenis in ('home', 'quiz_start', 'quiz_af')),
  aantal integer not null default 0,
  primary key (dag, gebeurtenis)
);

comment on table public.site_tellingen is
  'Anonieme aantallen per dag: homepage geladen, quiz gestart, rapport gemaakt. Geen persoonsgegevens.';

alter table public.site_tellingen enable row level security;
revoke all on public.site_tellingen from anon, authenticated;

create or replace function public.tel_gebeurtenis(p_gebeurtenis text)
returns void
language sql
security definer
set search_path = ''
set statement_timeout = '2s'
as $$
  insert into public.site_tellingen (dag, gebeurtenis, aantal)
  select (now() at time zone 'Europe/Amsterdam')::date, p_gebeurtenis, 1
  where p_gebeurtenis in ('home', 'quiz_start', 'quiz_af')
  on conflict (dag, gebeurtenis) do update set aantal = public.site_tellingen.aantal + 1;
$$;

revoke all on function public.tel_gebeurtenis(text) from public;
grant execute on function public.tel_gebeurtenis(text) to anon, authenticated;
