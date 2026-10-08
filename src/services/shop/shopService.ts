import { supabase } from "@/lib/supabaseClient";
import type { BoltProduct } from "@/services/data/types";
import { naarKandidatenParams, type KandidaatRij } from "@/services/outfits/kandidaten";
import { CatalogusOnbereikbaar } from "@/services/outfits/outfitService";
import { SHOP_PER_CATEGORIE, bouwShopItems } from "./shopItems";

/**
 * Foutcodes van get_kandidaten waarbij een tweede poging zin heeft: 57014 is
 * de statement timeout, PGRST002 een PostgREST die na een DDL zijn schema
 * herlaadt. Dezelfde regel als in outfitService.ts; die is daar niet
 * geexporteerd. Samenvoegen met PR 112, die de regel naar
 * src/utils/statementTimeout.ts verplaatst.
 */
const TIJDELIJKE_FOUTCODES = new Set(["57014", "PGRST002"]);
const HERKANSING_NA_MS = 300;

/**
 * De items voor de shop: de gecureerde kandidaten voor deze bezoeker uit
 * get_kandidaten (canoniek, getagd, op voorraad, juiste categorie), in plaats
 * van de eerste 1.000 ruwe rijen uit products. Zonder quizantwoorden gelden
 * dezelfde standaardwaarden als op de resultatenpagina.
 */
export async function haalShopItems(answers: Record<string, any> | null | undefined): Promise<BoltProduct[]> {
  const params = naarKandidatenParams(answers ?? {}, SHOP_PER_CATEGORIE);

  const client = supabase();
  if (!client) {
    throw new CatalogusOnbereikbaar("geen Supabase-client beschikbaar");
  }

  let { data, error } = await client.rpc("get_kandidaten", params);
  if (error && TIJDELIJKE_FOUTCODES.has(String(error.code))) {
    await new Promise((klaar) => setTimeout(klaar, HERKANSING_NA_MS));
    ({ data, error } = await client.rpc("get_kandidaten", params));
  }
  if (error) {
    throw new CatalogusOnbereikbaar(error.message || "rpc get_kandidaten faalde");
  }

  return bouwShopItems((data ?? []) as KandidaatRij[], params.p_occasions);
}
