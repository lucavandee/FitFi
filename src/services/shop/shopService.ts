import { supabase } from "@/lib/supabaseClient";
import type { BoltProduct } from "@/services/data/types";
import { naarKandidatenParams, type KandidaatRij } from "@/services/outfits/kandidaten";
import { CatalogusOnbereikbaar } from "@/services/outfits/outfitService";
import { KANDIDATEN_TIJDSLIMIET_MS, metTijdslimiet } from "@/utils/tijdslimiet";
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

  // Geen antwoord binnen de tijdslimiet is geen tijdelijke fout om te herhalen: een database die niet
  // antwoordt wordt er door een tweede wacht niet sneller van. De bezoeker kan zelf opnieuw proberen.
  const vraag = () =>
    metTijdslimiet(
      client.rpc("get_kandidaten", params),
      KANDIDATEN_TIJDSLIMIET_MS,
      () => new CatalogusOnbereikbaar(`geen antwoord binnen ${KANDIDATEN_TIJDSLIMIET_MS / 1000} s`)
    );
  let { data, error } = await vraag();
  if (error && TIJDELIJKE_FOUTCODES.has(String(error.code))) {
    await new Promise((klaar) => setTimeout(klaar, HERKANSING_NA_MS));
    ({ data, error } = await vraag());
  }
  if (error) {
    throw new CatalogusOnbereikbaar(error.message || "rpc get_kandidaten faalde");
  }

  return bouwShopItems((data ?? []) as KandidaatRij[], params.p_occasions);
}
