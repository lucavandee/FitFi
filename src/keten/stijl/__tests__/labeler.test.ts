/**
 * De snelle labeler haalt het soort stuk uit de productnaam. Namen hieronder
 * komen uit een steekproef van de pool op 21 oktober 2026.
 */
import { describe, expect, it } from "vitest";
import { stukUitNaam } from "../labeler";
import { STUK_SOORTEN } from "../stijlAgent";

const gevallen: Array<[string, string, string]> = [
  ["top", "PUMA Wardrobe Essentials oversized hoodie voor Dames, Wit, Maat L", "hoodie"],
  ["top", "H & M - Jacquardgebreide trui - Beige", "trui"],
  ["top", "H & M - Overslagvest van wolmix - Roomwit", "vest"],
  ["top", "PUMA Modalon golfpolo voor Heren, Wit, Maat S", "polo"],
  ["top", "Recall | Heren | Overhemd Wit", "overhemd"],
  ["bottom", "H & M - Katoenen chino - Slim Fit - Beige", "chino"],
  ["bottom", "PUMA SHAPELUXE tight met hoge taille voor Dames, Zwart, Maat XL", "legging"],
  ["bottom", "PUMA Evostripe sweatpant voor Dames, Maat S", "joggingbroek"],
  ["bottom", "H & M - Wide Jeans - Lichtblauw", "jeans"],
  ["bottom", "H & M - Utilitybroek met barrel-pijpen - Beige", "broek"],
  ["dress", "H & M - Popeline overhemdjurk met drawstrings - Blauw", "jurk"],
  ["outerwear", "H & M - Pilotenjack - Zwart", "bomber"],
  ["outerwear", "H & M - Carcoat - Donkerbruin", "wollen jas"],
  ["outerwear", "H & M - Gewatteerde bodywarmer - Zwart", "puffer"],
  ["footwear", "H & M - Leren laarzen met kittenheel - Zwart", "hakken"],
  ["footwear", "H & M - Leren slingbackpumps - Zwart", "pumps"],
  ["footwear", "PUMA Speedcat Suede ballerina's voor Dames, Zwart, Maat 42,5", "sneakers"],
  ["footwear", "H & M - Satin lace-up ballet flats - Poederroze", "ballerina's"],
  ["footwear", "H & M - Kniehoge leren laarzen - Zwart", "laarzen"],
  ["footwear", "PUMA Anzarun Lite sportschoenen, Wit, Maat 43", "hardloopschoenen"],
  ["accessory", "H & M - Bucketbag - Donkerbruin", "tas"],
  ["accessory", "H & M - D-frame sunglasses - Donkerbruin", "zonnebril"],
  ["accessory", "H & M - Set van twee bff-tashangers - Lichtroze/Konijntjes", "anders"],
];

describe("stukUitNaam", () => {
  for (const [cat, naam, verwacht] of gevallen) {
    it(`${naam} is ${verwacht}`, () => expect(stukUitNaam(naam, cat)).toBe(verwacht));
  }

  it("geeft alleen woorden uit STUK_SOORTEN", () => {
    for (const [cat, naam] of gevallen) {
      const s = stukUitNaam(naam, cat);
      if (s) expect(STUK_SOORTEN[cat]).toContain(s);
    }
  });
});
