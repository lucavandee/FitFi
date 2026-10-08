/*
  # idx_product_attributes_get_kandidaten weg: de planner koos hem voor anon

  ## Probleem, gemeten op 8 oktober 2026
  Een bezoeker zonder quiz zag in de shop een foutmelding: get_kandidaten gaf een
  500 na 9,7 s. Hetzelfde profiel (alle geslachten, tot 150 euro, 60 per
  categorie) kostte als postgres 144 ms, via de REST-API als anon 3 tot 7 s met
  39.319 buffertreffers en nul leesacties: rekenwerk, geen schijf.

  Onder row-level security mag de planner geen kolomstatistieken gebruiken, en
  schat hij voor de selectie 1 rij terwijl het er 36.047 zijn. Bij 1 rij is een
  gewone Index Scan met een tabelopzoeking goedkoper dan de index-only scan, en
  de oudere, kleinere index idx_product_attributes_get_kandidaten (4,8 MB, zelfde
  sleutels en voorwaarde als de dekkende, maar zonder de extra kolommen) wint
  dan. Bij een profiel met een geslacht kiest de planner nog de dekkende index
  (toevallig, op een kostverschil van 18,4 tegen 18,8); bij unisex ontbreekt die
  voorwaarde en wint de oude index. Dat zijn "Beide/Anders" en "Liever niet
  specificeren" in de eerste vraag van de quiz, en de shop voor iedereen zonder
  quiz. Zowel anon als authenticated kregen dit plan; de resultatenpagina is voor
  ingelogden.

  Per aanroep, zelfde profiel:
    met de oude index  37.298 buffers  (3 tot 7 s als anon, op deze machine)
    zonder             ongeveer 5.000 buffers

  ## Wat deze migratie doet
  Haalt de oude index weg. Getest in een teruggedraaide transactie voor zeven
  profielen (female, male, unisex; met en zonder gelegenheden; budget tot 150
  en tot 1.000; 40 en 60 per categorie; met een retailerfilter) en voor beide
  rollen: daarna kiest de planner overal de index-only scan op de dekkende index.
  De index was alleen bedoeld voor get_kandidaten (migratie 20260927100000),
  voor de dekkende index die in 20261001150000 kwam. Elke andere index op deze
  tabel dient een andere selectie.

  De test kandidaat-snelheid.sql draait elk profiel als postgres, anon en
  authenticated en meldt het aantal gelezen buffers. Als postgres is dit niet te
  zien: daar schat de planner wel goed.

  ## Terugdraaien
    create index if not exists idx_product_attributes_get_kandidaten
      on product_attributes (gender, category, price)
      where product_id = canonical_id and is_fashion and in_stock
        and classifier_version is not null and tagger_version is not null;
*/

drop index if exists public.idx_product_attributes_get_kandidaten;
