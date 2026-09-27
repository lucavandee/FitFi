/**
 * De ene plek waar de retailer-naam staat. De waarde is products.retailer
 * letterlijk: dat is de programmanaam uit de Daisycon-feed (zie
 * supabase/functions/import-daisycon-feed/index.ts, "retailer: programName").
 * Opgezocht in plan 2 taak 1 met:
 *   supabase db query --linked "select retailer, count(*) from products group by 1 order by 2 desc" -o table
 * Elke RPC met p_retailer controleert de naam tegen products.retailer en
 * geeft een fout bij een onbekende waarde.
 */
export const STANDAARD_RETAILER = "H&M (NL)";

/**
 * De kleinste retailer in products (19 rijen, gemeten 27 september 2026).
 * Bestaat voor de live tests van plan 2 taak 12: keten_vul_nieuwe_producten
 * scant de hele retailer en is op H&M (NL) niet binnen de statement-timeout
 * van de PostgREST-route te halen (gemeten: 17,5s voor de anti-join en 14,6s
 * voor de ververs-stap, tegen 8s limiet van de service-role-route, foutcode
 * 57014). Vanuit pg_cron en de Management API geldt die limiet niet. De test
 * bewijst het gedrag daarom op deze retailer; de meting op H&M (NL) staat in
 * .superpowers/sdd/2026-09-14-plan-2-tagging/taak-12-report.md.
 */
export const KLEINSTE_RETAILER = "The New Originals (NL)";
