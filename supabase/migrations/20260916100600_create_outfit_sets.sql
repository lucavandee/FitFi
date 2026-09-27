/*
  # outfit_sets: cache van de stylist per profiel (spec 5.5)

  1. Nieuwe tabel
    - `outfit_sets`
      - `profile_hash` (text) sha256 van de genormaliseerde profiel-invoer (spec 5.2.1)
      - `stylist_version` (text) versie van prompt plus validatie; samen met profile_hash de sleutel
      - `source` (text) 'stylist' of 'v2-fallback'
      - `outfits` (jsonb) het schema uit spec 5.4, verrijkt met productdata
      - `model` (text) het gebruikte model-id
      - `latency_ms` (integer) doorlooptijd van de aanroep
      - `input_tokens`, `output_tokens` (integer) tokenverbruik uit het API-antwoord,
        aanvulling op spec 5.5 zodat de kosten per week een query zijn
      - `created_at` (timestamptz)

  2. Beveiliging
    - RLS aan, geen policies: alleen de service role (de edge function
      compose-outfits) leest en schrijft. Clients krijgen de outfits via de
      edge function, nooit rechtstreeks uit deze tabel.
    - De CHECK op `source` laat bewust alleen 'stylist' en 'v2-fallback' toe,
      niet 'cache'. Het type OutfitBron in keten-types.ts kent 'cache' wel,
      maar dat is het antwoord dat compose-outfits aan de client teruggeeft
      bij een cache-hit; bij het upsert-en in deze tabel schrijft
      compose-outfits altijd 'stylist' als bron. 'cache' hoort dus niet in
      deze CHECK: het beschrijft nooit een rij die hier zelf staat, alleen
      hoe die rij later aan een client werd gepresenteerd. Niet oprekken.

  3. Levensduur
    - De edge function telt een rij alleen als cache-hit als created_at jonger
      is dan 14 dagen en elk product nog op voorraad is, en verwijdert na elke
      schrijfactie rijen ouder dan 30 dagen. De index op created_at dient die
      twee queries en het tellen per week.

  ## Terugdraaien
  drop index if exists idx_outfit_sets_created_at;
  drop table if exists public.outfit_sets;
*/

CREATE TABLE IF NOT EXISTS public.outfit_sets (
  profile_hash text NOT NULL,
  stylist_version text NOT NULL,
  source text NOT NULL CHECK (source IN ('stylist', 'v2-fallback')),
  outfits jsonb NOT NULL,
  model text,
  latency_ms integer,
  input_tokens integer,
  output_tokens integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_hash, stylist_version)
);

ALTER TABLE public.outfit_sets ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_outfit_sets_created_at
  ON public.outfit_sets (created_at);

COMMENT ON TABLE public.outfit_sets IS
  'Cache van de stylist per profile_hash en stylist_version (spec 5.5). Alleen service role. Levensduur 14 dagen, opruimen na 30 (compose-outfits).';
