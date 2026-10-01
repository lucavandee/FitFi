/**
 * Welke fouten van de database een tweede poging waard zijn, op een plek.
 *
 * Statement-timeout. De anon-rol heeft een statement_timeout van 3 s en de
 * authenticated-rol van 8 s (gelezen uit pg_roles.rolconfig op 1 oktober
 * 2026). Een koude get_kandidaten ging daar na een stille periode overheen:
 * plan 2 mat een koude aanroep die na 3,47 s HTTP 500 gaf en een tweede die in
 * 0,59 s slaagde. Sinds PR 116 (migratie 20261001150000, op 1 oktober 2026 live
 * toegepast) heeft get_kandidaten zelf een functie-instelling
 * statement_timeout = 8s, die voor die van de rol gaat. Gemeten op 1 oktober
 * 2026 als anon: de eerste aanroep na 3, 6, 9, 12 en 15 minuten stilte duurde
 * 5,1 tot 6,6 s bij de gateway (female, 0 tot 150, 40 per categorie) en gaf
 * HTTP 200, net als alle 35 aanroepen in die vijf rondes. keten_outfit_set
 * heeft nog de 3 s van de rol. De herkansing blijft als vangnet voor wat
 * boven de 8 s uitkomt.
 *
 * PostgREST laadt na een DDL even zijn schema opnieuw en geeft in die tijd
 * PGRST002 (HTTP 503, "Could not query the database for the schema cache").
 * Dat is net zo tijdelijk als een timeout.
 *
 * Wie hier gebruik van maakt:
 * - src/keten/composeClient.ts (get_kandidaten en keten_outfit_set) herkanst
 *   alleen op de statement-timeout: isStatementTimeout.
 * - src/services/outfits/outfitService.ts (get_kandidaten, voor de
 *   kalibratiestap en de resultatenpagina) herkanst op beide: isTijdelijkeFout.
 *   PR 115 op main (4a034520) deed hetzelfde met een eigen lijst foutcodes;
 *   deze module is de bron waaruit beide leven, zodat ze niet uit elkaar lopen.
 *
 * Een afgebroken verbinding aan de clientkant (AbortSignal.timeout, fout met
 * naam TimeoutError en een bericht zonder "statement timeout") is bewust geen
 * treffer: dat is een verbinding die niet antwoordt, geen database die zelf
 * afbreekt, en een tweede poging lost dat niet op dezelfde manier op.
 *
 * scripts/keten/feed-poort.ts heeft zijn eigen isTimeout voor een andere
 * runtime (service role, foutvorm met optionele velden). Wijzig je hier de
 * herkenning, kijk daar dan ook.
 */

/** SQLSTATE van Postgres voor "canceling statement due to statement timeout". */
export const STATEMENT_TIMEOUT_SQLSTATE = '57014';

/** Foutcode van PostgREST terwijl het zijn schema (opnieuw) laadt. */
export const SCHEMA_CACHE_LAADT_CODE = 'PGRST002';

/** Genoeg van een Postgres-fout om te bepalen of het een statement-timeout was. */
export interface RpcFout {
  code: string;
  message: string;
}

export function isStatementTimeout(fout: Partial<RpcFout>): boolean {
  return fout.code === STATEMENT_TIMEOUT_SQLSTATE || /statement timeout/i.test(fout.message ?? '');
}

/** Een statement-timeout, of PostgREST dat zijn schema herlaadt: beide verdienen precies een herkansing. */
export function isTijdelijkeFout(fout: Partial<RpcFout>): boolean {
  return isStatementTimeout(fout) || fout.code === SCHEMA_CACHE_LAADT_CODE;
}
