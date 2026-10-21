/**
 * Snelle labeler: het soort stuk uit de productnaam, zonder model.
 *
 * Waarom: de stijl-agent labelt goed, maar elke aanroep kost ruim een minuut
 * opstarttijd op het abonnement. Voor tienduizenden producten is een vaste
 * woordenlijst beter, mits hij met de agent overeenkomt. De lijst hieronder
 * levert dezelfde woorden als STUK_SOORTEN in stijlAgent.ts, zodat beide naast
 * elkaar te leggen zijn (scripts/keten/stijl-vergelijk.ts).
 *
 * Per categorie van specifiek naar algemeen: "coltrui" voor "trui", "cargo"
 * voor "broek". De eerste regel die past, wint.
 */

type Regel = [RegExp, string];

const REGELS: Record<string, Regel[]> = {
  top: [
    [/sportbeha|sporttop|\bsports? ?bra\b|sportshirt|racerback/, "sporttop"],
    [/hoodie|capuchon/, "hoodie"],
    [/sweatshirt|sweater|crewneck/, "sweater"],
    [/coltrui|turtleneck/, "coltrui"],
    [/cardigan|vest\b/, "vest"],
    [/trui|pullover|jumper/, "trui"],
    [/poloshirt|\bpolo\b|golfpolo/, "polo"],
    [/blouse/, "blouse"],
    [/t-shirt|tshirt|\btee\b/, "t-shirt"],
    [/longsleeve|lange mouwen|henley/, "longsleeve"],
    [/overhemd|oxford|\bshirt\b.*(heren|men)|(heren|men).*\bshirt\b/, "overhemd"],
    [/tanktop|singlet|hemdje/, "tanktop"],
    [/\bbody\b/, "body"],
    [/top|crop|bustier|korset|halter|shirt/, "top"],
  ],
  bottom: [
    [/cargo/, "cargobroek"],
    [/jogging|joggers|sweatpant|trainingsbroek/, "joggingbroek"],
    [/legging|\btight\b|shapeluxe/, "legging"],
    [/jeans|spijkerbroek|denim/, "jeans"],
    [/chino/, "chino"],
    [/pantalon|persvouw/, "pantalon"],
    [/short|bermuda/, "short"],
    [/minirok|mini-rok|skort/, "minirok"],
    [/midirok|midi-rok/, "midirok"],
    [/maxirok|maxi-rok|lange rok/, "maxirok"],
    [/rok\b|rok |rokje|skirt/, "rok"],
    [/broek|pants|trousers|culotte|5-pocket/, "broek"],
  ],
  dress: [
    [/jumpsuit|playsuit|overall/, "jumpsuit"],
    [/.*/, "jurk"],
  ],
  outerwear: [
    [/blazer/, "blazer"],
    [/colbert/, "colbert"],
    [/trench/, "trenchcoat"],
    [/parka/, "parka"],
    [/puffer|gewatteerd|dons/, "puffer"],
    [/bomber|pilotenjack/, "bomber"],
    [/biker|leren jack|imitatieleren jack|jack van imitatieleer|leather jacket/, "leren jack"],
    [/spijkerjack|denim jack|truckerjack|jack van denim/, "spijkerjack"],
    [/overshirt|shacket/, "overshirt"],
    [/gilet|bodywarmer/, "gilet"],
    [/fleece/, "fleece"],
    [/trainingsjack|track ?jacket|\bt7\b/, "trainingsjack"],
    [/regenjas|rain|waterafstotend/, "regenjas"],
    [/teddy/, "teddyjas"],
    [/coat|mantel|wollen jas|jas van wol/, "wollen jas"],
    [/.*/, "jas"],
  ],
  footwear: [
    [/hardloop|running|runner|sportschoen|trainingsschoen|trailschoen/, "hardloopschoenen"],
    [/sneaker|trainer|speedcat|palermo|suede classic|\bclub\b|caven|rebound|court|scuderia|evospeed/, "sneakers"],
    [/loafer|mocassin/, "loafers"],
    [/derby|brogue|veterschoen|geklede schoen/, "veterschoenen"],
    [/chelsea/, "chelseaboots"],
    [/stilett|kitten ?heel|kittenhak|met hak|hakken|naaldhak/, "hakken"],
    [/pump|slingback/, "pumps"],
    [/enkellaars|laarsjes|ankle ?boot/, "enkellaarsjes"],
    [/laars|laarzen|boots/, "laarzen"],
    [/ballerina|ballet ?flat|mary ?jane/, "ballerina's"],
    [/teenslipper|badslipper|slipper|flip-?flop/, "slippers"],
    [/sandaal|sandalen|sandalet/, "sandalen"],
    [/instapper|slip-?in|mule/, "instappers"],
  ],
  accessory: [
    [/stropdas/, "stropdas"],
    [/handschoen/, "handschoenen"],
    [/zonnebril|sunglasses/, "zonnebril"],
    [/ketting|oorbel|oorring|oorhanger|oorsteker|armband|bangle|ring\b|broche|sieraad|sieraden/, "sieraad"],
    [/haarklem|diadeem|haarband|scrunchie|haarspeld|haarpin/, "haaraccessoire"],
    [/muts|beanie/, "muts"],
    [/\bpet\b|\bcap\b|buckethat|bucket hat|hoed/, "pet"],
    [/sjaal|shawl/, "sjaal"],
    [/riem|ceintuur/, "riem"],
    [/tashanger|tasbedel/, "anders"],
    [/tas\b|tasje|shopper|clutch|rugzak|crossbody|handtas|schoudertas|bag\b/, "tas"],
  ],
};

/** H&M zet het soort stuk tussen "H & M - " en " - kleur"; anders telt de hele naam. */
function kern(naam: string): string {
  const m = naam.match(/^H ?& ?M - (.*) - [^-]+$/i);
  return (m ? m[1] : naam).toLowerCase();
}

/** Het soort stuk, of null als de naam het niet zegt. */
export function stukUitNaam(naam: string, categorie: string): string | null {
  const tekst = kern(naam);
  for (const [re, stuk] of REGELS[categorie] ?? []) {
    if (re.test(tekst)) return stuk;
  }
  return categorie === "accessory" ? "anders" : null;
}

/**
 * De stijlmatrix: per categorie en soort stuk de stijlen die de stijl-agent het
 * vaakst gaf, en woorden in de naam die een stijl toevoegen of weghalen
 * ("borduursel" maakt een blouse bohemien, "drymove" een shirt sportief).
 * Afgeleid door scripts/keten/stijl-vergelijk.ts uit de labels van de agent.
 */
export interface StijlMatrix {
  soorten: Record<string, Record<string, string[]>>;
  woorden: Record<string, { plus: string[]; min: string[] }>;
}

/** De losse woorden van een naam, zonder kleur na het laatste streepje bij H&M. */
export function naamWoorden(naam: string): string[] {
  return Array.from(new Set(kern(naam).split(/[^a-zà-ÿ0-9]+/).filter((w) => w.length > 3)));
}

/** De stijlen van een product volgens de matrix, of [] als de naam het soort stuk niet zegt. */
export function stijlenUitNaam(naam: string, categorie: string, matrix: StijlMatrix): string[] {
  const stuk = stukUitNaam(naam, categorie);
  if (!stuk) return [];
  const stijlen = new Set(matrix.soorten[categorie]?.[stuk] ?? []);
  for (const w of naamWoorden(naam)) {
    const regel = matrix.woorden[w];
    if (!regel) continue;
    for (const s of regel.plus) stijlen.add(s);
    for (const s of regel.min) stijlen.delete(s);
  }
  return Array.from(stijlen);
}
