-- =====================================================
-- DUBBELE STYLE_PROFILES OPRUIMEN
-- =====================================================
--
-- WAAROM DIT BESTAAT
--
-- profileSyncService controleerde met een query zonder LIMIT of er al een
-- profiel bestond. Had een gebruiker meer dan een rij, dan gaf die query een
-- fout in plaats van data, concludeerde de code "nog geen profiel" en deed een
-- INSERT. Elke sync legde er zo een rij bij. Sinds de fix (.limit(1) op alle
-- style_profiles-queries) groeit dit niet meer, en pakt de app altijd de
-- nieuwste rij. Bestaande dubbelen breken dus niets meer.
--
-- Opruimen is daarom OPTIONEEL. Doe het voor een schonere database en
-- snellere queries, niet omdat er iets stuk is.
--
-- LET OP: style_embedding_snapshots heeft een foreign key naar
-- style_profiles(id) met ON DELETE CASCADE. Snapshots die aan een verwijderde
-- profielrij hangen, gaan mee. Dat is historie van hoe een voorkeur zich
-- ontwikkelde, geen actieve data.
--
-- =====================================================

-- STAP 1: kijken hoe groot het is. Verandert niets.

SELECT
  COUNT(*)                                        AS totaal_rijen,
  COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) AS unieke_gebruikers,
  COUNT(*) FILTER (WHERE user_id IS NULL)         AS anonieme_rijen
FROM style_profiles;

-- STAP 2: de tien gebruikers met de meeste dubbelen. Verandert niets.

SELECT
  user_id,
  COUNT(*)          AS aantal_rijen,
  MIN(created_at)   AS oudste,
  MAX(created_at)   AS nieuwste
FROM style_profiles
WHERE user_id IS NOT NULL
GROUP BY user_id
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC
LIMIT 10;

-- STAP 3: precies zien wat straks weggaat. Verandert niets.

WITH genummerd AS (
  SELECT
    id,
    user_id,
    created_at,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC, id DESC) AS positie
  FROM style_profiles
  WHERE user_id IS NOT NULL
)
SELECT COUNT(*) AS wordt_verwijderd
FROM genummerd
WHERE positie > 1;

-- =====================================================
-- STAP 4: opruimen. DIT VERWIJDERT RIJEN.
--
-- Draai dit als een blok. Het staat in een transactie met ROLLBACK aan het
-- eind, dus de eerste keer verandert er nog niets: je ziet alleen wat het zou
-- doen. Klopt het aantal met stap 3, vervang dan ROLLBACK door COMMIT en
-- draai het opnieuw.
-- =====================================================

BEGIN;

WITH genummerd AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC, id DESC) AS positie
  FROM style_profiles
  WHERE user_id IS NOT NULL
)
DELETE FROM style_profiles
WHERE id IN (SELECT id FROM genummerd WHERE positie > 1);

-- Controle: hier hoort per gebruiker nog exact een rij te staan.
SELECT COUNT(*) AS gebruikers_met_dubbelen
FROM (
  SELECT user_id
  FROM style_profiles
  WHERE user_id IS NOT NULL
  GROUP BY user_id
  HAVING COUNT(*) > 1
) x;

ROLLBACK;
-- Vervang de regel hierboven door COMMIT; als de aantallen kloppen.
