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
