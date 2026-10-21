import type { ArchetypeKey } from "@/config/archetypes";

/**
 * De looks van de quizstap "Deze of deze?" (stap 5 van de websiteronde van
 * 21 oktober 2026). Ze vervangen de swipes met moodfoto's, die Luc op 16
 * oktober afkeurde.
 *
 * Gemaakt met Higgsfield: FLUX 3 met een castlid als referentie (zes modellen,
 * Soul 2.0). Bij vijf looks zijn daarna alleen de sneakers vervangen, omdat er
 * een merkteken op stond. Het job-ID staat in de bestandsnaam, de prompts en
 * de keuring in ~/claude-artifacts/fitfi-beeld/2026-10-21-website/dezeofdeze/
 * herkomst.json. De personen zijn modellen, geen klanten.
 */

export type LookGeslacht = "female" | "male";

export interface Look {
  id: string;
  geslacht: LookGeslacht;
  archetype: ArchetypeKey;
  /** Pad zonder breedte en extensie; -480.webp en -960.webp staan ernaast. */
  beeld: string;
  alt: string;
}

/**
 * Gewichten per archetype, het gemiddelde van de moodfoto's van 12 oktober
 * (72 beelden plus de 12 minimalistische), gedeeld door 100. Een keuze voor
 * een klassieke look zegt ook iets over zakelijk en smart casual; zo telde
 * een like op een moodfoto ook mee.
 */
export const GEWICHTEN: Record<ArchetypeKey, Record<ArchetypeKey, number>> = {
  MINIMALIST: { MINIMALIST: 0.88, CLASSIC: 0.47, SMART_CASUAL: 0.5, STREETWEAR: 0.1, ATHLETIC: 0.05, AVANT_GARDE: 0.28, BUSINESS: 0.25 },
  CLASSIC: { MINIMALIST: 0.5, CLASSIC: 0.85, SMART_CASUAL: 0.6, STREETWEAR: 0.05, ATHLETIC: 0.05, AVANT_GARDE: 0.1, BUSINESS: 0.56 },
  SMART_CASUAL: { MINIMALIST: 0.53, CLASSIC: 0.61, SMART_CASUAL: 0.83, STREETWEAR: 0.25, ATHLETIC: 0.1, AVANT_GARDE: 0.1, BUSINESS: 0.3 },
  STREETWEAR: { MINIMALIST: 0.26, CLASSIC: 0.17, SMART_CASUAL: 0.41, STREETWEAR: 0.73, ATHLETIC: 0.4, AVANT_GARDE: 0.2, BUSINESS: 0.05 },
  ATHLETIC: { MINIMALIST: 0.31, CLASSIC: 0.05, SMART_CASUAL: 0.32, STREETWEAR: 0.36, ATHLETIC: 0.85, AVANT_GARDE: 0.05, BUSINESS: 0.05 },
  AVANT_GARDE: { MINIMALIST: 0.54, CLASSIC: 0.2, SMART_CASUAL: 0.29, STREETWEAR: 0.23, ATHLETIC: 0.05, AVANT_GARDE: 0.78, BUSINESS: 0.22 },
  BUSINESS: { MINIMALIST: 0.37, CLASSIC: 0.68, SMART_CASUAL: 0.45, STREETWEAR: 0.05, ATHLETIC: 0.05, AVANT_GARDE: 0.11, BUSINESS: 0.88 },
};

const MAP = "/beeld/dezeofdeze";

function look(id: string, job: string, archetype: ArchetypeKey, alt: string): Look {
  return { id, geslacht: id.startsWith("v-") ? "female" : "male", archetype, beeld: `${MAP}/${id}.${job}`, alt };
}

export const LOOKS: Record<string, Look> = Object.fromEntries(
  [
    look("v-min-1", "2207af4b", "MINIMALIST", "Lange camel jas open over een zwarte col, zwarte pantalon en loafers"),
    look("v-min-2", "4d47d858", "MINIMALIST", "Crème trui, wijde lichtgrijze pantalon, witte sneakers en een klein zwart tasje"),
    look("v-kla-1", "b15dbd76", "CLASSIC", "Beige trenchcoat over een donkerblauwe trui, plooirok in camel en bruine laarzen"),
    look("v-kla-2", "0f23a75d", "CLASSIC", "Wit overhemd onder een donkerblauwe kabeltrui, crème pantalon en bruine loafers"),
    look("v-sma-1", "5ddf2c61", "SMART_CASUAL", "Grijze wollen blazer over een wit T-shirt, rechte jeans en suède enkellaarsjes"),
    look("v-sma-2", "b718e474", "SMART_CASUAL", "Donkerblauw overshirt over een crème gebreide polo, beige chino en witte sneakers"),
    look("v-str-1", "194567e1", "STREETWEAR", "Ruime grijze hoodie, wijde lichte jeans, dikke sneakers en een zwarte muts"),
    look("v-str-2", "ce074dd6", "STREETWEAR", "Olijfgroen bomberjack over een ruim wit T-shirt, wijde zwarte cargobroek en een pet"),
    look("v-spo-1", "af0c510c", "ATHLETIC", "Grijs joggingpak, zwarte bodywarmer en witte hardloopschoenen"),
    look("v-spo-2", "de46e962", "ATHLETIC", "Zwarte legging, crème fleece met korte rits, grijze sneakers en een pet"),
    look("v-avg-1", "f01af3a3", "AVANT_GARDE", "Asymmetrische zwarte jurk over een wijde broek, grote zwarte jas en zware laarzen"),
    look("v-avg-2", "d2b4bbe7", "AVANT_GARDE", "Grote crème jas met brede schouders, lange gebreide top, wijde grijze broek"),
    look("v-zak-1", "eedcff7a", "BUSINESS", "Antraciet broekpak, witte blouse en zwarte pumps"),
    look("v-zak-2", "88e9d494", "BUSINESS", "Donkerblauwe jurk met bijpassende blazer, zwarte kniehoge laarzen en een handtas"),
    look("m-min-1", "14604289", "MINIMALIST", "Lange donkerblauwe jas over een zwarte trui, grijze pantalon en zwarte schoenen"),
    look("m-min-2", "f1559f5b", "MINIMALIST", "Grijze fijngebreide trui, zwarte pantalon en witte sneakers"),
    look("m-kla-1", "95d20fba", "CLASSIC", "Camel overjas, lichtblauw overhemd onder een donkerblauwe trui, grijze pantalon"),
    look("m-kla-2", "3f5f0eee", "CLASSIC", "Trenchcoat over een wit shirt, beige chino en donkerbruine veterboots"),
    look("m-sma-1", "f9874de7", "SMART_CASUAL", "Donkerblauwe blazer over een wit T-shirt, donkere jeans en suède chelsea boots"),
    look("m-sma-2", "b232f91d", "SMART_CASUAL", "Olijfgroen overshirt over een crème gebreide polo, beige chino en witte sneakers"),
    look("m-str-1", "edb3f811", "STREETWEAR", "Ruime zwarte hoodie, olijfgroene cargobroek, grijze sneakers en een muts"),
    look("m-str-2", "88089594", "STREETWEAR", "Donkerblauwe pufferjas over een grijze hoodie, wijde jeans, witte sneakers en een pet"),
    look("m-spo-1", "4917641e", "ATHLETIC", "Grijs trainingspak en witte hardloopschoenen"),
    look("m-spo-2", "12d4256e", "ATHLETIC", "Zwarte fleece met korte rits, zwarte joggingbroek, grijze trailschoenen en een pet"),
    look("m-avg-1", "44989834", "AVANT_GARDE", "Grote asymmetrische zwarte jas, wijde zwarte plooibroek en zware laarzen"),
    look("m-avg-2", "ca4d540a", "AVANT_GARDE", "Lang wit overhemd onder een kort zwart jasje, wijde grijze broek en zwarte boots"),
    look("m-zak-1", "2c510ec6", "BUSINESS", "Donkerblauw pak, wit overhemd zonder das en zwarte schoenen"),
    look("m-zak-2", "aa16ed50", "BUSINESS", "Antraciet colbert, grijze pantalon, lichtblauw overhemd, overjas en loafers"),
  ].map((l) => [l.id, l])
);

/**
 * Zeven rondes, elk archetype twee keer, met twee looks die duidelijk
 * verschillen (geen minimalist tegen smart casual, geen klassiek tegen
 * zakelijk). Een archetype staat nooit in twee rondes na elkaar, en links en
 * rechts staan nooit hetzelfde model. Beide geslachten volgen hetzelfde
 * schema, zodat een gemengde reeks (non-binair, zeg ik liever niet) per ronde
 * dezelfde twee archetypen vergelijkt.
 */
export const RONDES: Record<LookGeslacht, Array<[string, string]>> = {
  female: [
    ["v-min-1", "v-str-1"],
    ["v-avg-2", "v-kla-1"],
    ["v-sma-1", "v-spo-1"],
    ["v-min-2", "v-zak-2"],
    ["v-kla-2", "v-str-2"],
    ["v-sma-2", "v-avg-1"],
    ["v-spo-2", "v-zak-1"],
  ],
  male: [
    ["m-min-1", "m-str-1"],
    ["m-avg-1", "m-kla-1"],
    ["m-sma-1", "m-spo-1"],
    ["m-min-2", "m-zak-1"],
    ["m-kla-2", "m-str-2"],
    ["m-sma-2", "m-avg-2"],
    ["m-spo-2", "m-zak-2"],
  ],
};

export const AANTAL_RONDES = 7;
