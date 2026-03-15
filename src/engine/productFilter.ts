const REJECT_NAME_PATTERNS: RegExp[] = [
  /romper/i, /romperjurk/i, /kruippak/i, /slab\b/i, /boxpak/i, /babypak/i,
  /\bbaby\b/i, /\bbabies\b/i, /\bpeuter\b/i, /\bkleuter\b/i, /\bnewborn\b/i, /\binfant\b/i,
  /\bkinder\b/i, /\bkinderen\b/i, /\bjunior\b/i, /\bkids?\b/i, /\bdreumes\b/i, /\btoddler\b/i,
  /\bjongens\b/i, /\bmeisjes\b/i, /\bboys\b/i, /\bgirls\b/i, /\bchild\b/i, /\bchildren\b/i,

  /\d+-\d+Y\b/i,
  /maat\s+\d{1,2}-\d{1,2}\s*Y/i,
  /maat\s+(1[0-9]|[2-9])\s*[,.\s)]/i,

  /pyjama/i, /nachthem/i, /slaap/i, /ochtendjas/i, /badjas/i, /nightwear/i,
  /\bsokken?\b/i, /\bsocks?\b/i, /\bkousen?\b/i, /\bpanty\b/i,
  /\bonderbroek\b/i, /\bboxer\b/i, /\bbh\b/i, /\bbra\b/i, /\bbralette\b/i,
  /\bondergoed\b/i, /\blingerie\b/i, /\bthong\b/i, /\bunderwear\b/i,
  /\bstring\b(?!er)/i, /hipster.*brief/i, /trunk.*brief/i,
  /bjorn\s*borg/i, /björn\s*borg/i,

  /\bbikini\b/i, /\bbadpak\b/i, /\bzwembroek\b/i, /\bzwemshort\b/i,
  /\bzwemtop\b/i, /\bboardshort\b/i, /\bzwemset\b/i,

  /pantoffel/i, /\bsloffen\b/i, /\bslippers?\b/i, /flip.?flop/i,
  /\bbadslip/i, /\bteenslipper/i,

  /voetbal/i, /\bfootball\b/i, /\bsoccer\b/i, /\brugby\b/i, /\bhockey\b/i,
  /keepershandschoen/i, /scheenbeschermer/i,
  /wielren/i, /\bcycling\b/i, /fietsbroek/i, /fietsshirt/i,
  /\bhardloop/i, /\btrail\s*run/i, /\bmarathon\b/i,
  /\bfitness\b/i, /\bcrossfit\b/i, /\bspinning\b/i, /\bsportbeha\b/i,
  /\byoga\b/i, /\bpilates\b/i,
  /skibroek/i, /skipak/i, /\bsnowboard/i, /skischoenen/i,
  /\bwetsuit\b/i, /\bduik/i, /\bsnorkel/i,
  /tennisschoen/i, /tennisrok/i, /golfschoen/i, /golfbroek/i,
  /wandelschoen/i, /bergschoen/i, /klimschoen/i,
  /\b(fg|ag|sg|mg|tf|ic)\s*[/\\]\s*(fg|ag|sg|mg|tf|ic)\b/i,

  /Scuderia\s+Ferrari/i, /Red\s+Bull\s+Racing/i, /McLAREN/i,
  /\bBMW\s+M\s/i,
  /Marokko\s+20\d/i, /Manchester\s+(City|United)/i,
  /\bMarseille\b/i, /\bArsenal\b/i, /AC\s*Milan/i, /\bBorussia\b/i,
  /\bBarcelona\b/i, /\bBayern\b/i, /\bLiverpool\b/i, /\bChelsea\b/i,
  /voetbalschoen/i, /voetbalbroek/i, /keepers/i,
  /motorsport/i,
  /mini-thuis/i, /mini-uit/i, /thuistenue/i, /uittenue/i, /uitshirt/i, /thuisshirt/i,

  /kaars/i, /candle/i, /\blamp\b/i, /\bvaas\b/i, /\bdecor\b/i,
  /bedrok/i, /\bkussen\b/i, /\bplaid\b/i, /handdoek/i, /baddoek/i,
  /gordijn/i, /laken/i, /dekbed/i, /overtrek/i, /matras/i, /deken/i,
  /vloerkleed/i, /tapijt/i, /\bmok\b/i, /\bbord\b/i, /spiegel/i,
  /knuffeldier/i, /\bknuffel\b/i, /speelgoed/i, /puzzel/i,
  /telefoonhoesje/i, /sleutelhanger/i, /\bposter\b/i,
  /parfum/i, /make-up/i, /mascara/i, /lipstick/i,
  /foundation/i, /concealer/i, /\bserum\b/i, /shampoo/i,
  /douchegel/i, /bodylotion/i, /aftershave/i, /deodorant/i,
  /luier/i, /fopspeen/i, /aankleedkussen/i,
  /oplaadba/i, /oplader/i,

  /\bhemd\b/i,
  /tafelkleed/i, /tafelloper/i, /bedsprei/i,
  /meegroeipakje/i, /wanten/i, /\bbonnet\b/i, /haarbonnet/i,
  /kunstnagel/i, /press-on/i, /\bkwast\b/i, /bronzer/i,

  /\b(\d+)[- ]?(pack|stuks)\b/i,
  /\bset\s+van\s+\d/i,
  /\bmultipack\b/i,

  /loungewear\s*set/i, /tweedelige\s+lounge/i,
];

const MIN_ADULT_PRICE = 12;

export function isAdultClothingProduct(row: Record<string, any>): boolean {
  const name = (row.name || row.title || '').trim();
  if (!name) return false;

  const price = typeof row.price === 'number' ? row.price : parseFloat(row.price) || 0;
  if (price < MIN_ADULT_PRICE) return false;

  if (!row.image_url && !row.imageUrl) return false;

  for (const pattern of REJECT_NAME_PATTERNS) {
    if (pattern.test(name)) return false;
  }

  const desc = (row.description || '');
  if (/\b(baby|babies|peuter|kleuter|newborn|infant|kinder|kinderen|junior|kids?|dreumes|toddler|jongens|meisjes|boys|girls|child|children)\b/i.test(desc)) return false;

  return true;
}

const CATEGORY_NAME_MAP: Record<string, RegExp[]> = {
  footwear: [
    /sneaker/i, /schoen/i, /\bshoe\b/i, /laars/i, /\bboot\b/i, /\bboots\b/i,
    /chelsea/i, /loafer/i, /mocassin/i, /\bpump\b/i, /\bpumps\b/i,
    /espadrille/i, /instapper/i, /slip-on/i, /oxford/i, /derby/i, /brogue/i,
    /veterschoen/i, /enkellaars/i, /kuitlaars/i, /laarzen/i,
  ],
  bottom: [
    /\bbroek\b/i, /\bjeans\b/i, /\bchino\b/i, /pantalon/i, /\bjogger\b/i,
    /\bshort\b/i, /\bshorts\b/i, /\bcargo\b/i, /\blegging\b/i,
    /\bdenim\b/i, /palazzo/i, /culottes/i, /bermuda/i, /korte broek/i,
    /sweatpant/i, /trainingsbroek/i,
  ],
  outerwear: [
    /\bjas\b/i, /\bjack\b/i, /\bjacket\b/i, /\bcoat\b/i, /\bblazer\b/i,
    /\bparka\b/i, /\bbomber\b/i, /puffer/i, /donsjas/i, /winterjas/i,
    /trenchcoat/i, /\btrench\b/i, /overcoat/i, /\bmantel\b/i,
    /\bgilet\b/i, /bodywarmer/i, /windbreaker/i, /softshell/i,
    /fleecejack/i, /gewatteerd/i, /tussenjas/i, /zomerjas/i,
    /spijkerjack/i, /leren jas/i, /\bovershirt\b/i,
  ],
  dress: [
    /\bjurk\b/i, /\bdress\b/i, /maxijurk/i, /minijurk/i, /midijurk/i,
    /avondjurk/i, /cocktailjurk/i, /zomerjurk/i,
  ],
  accessory: [
    /\btas\b/i, /\bbag\b/i, /rugzak/i, /\briem\b/i, /\bbelt\b/i,
    /\bsjaal\b/i, /\bscarf\b/i, /zonnebril/i, /\bhorloge\b/i,
    /\bketting\b/i, /\barmband\b/i, /\boorbel/i, /\bdas\b/i,
    /\bstropdas\b/i, /\bvlinderdas\b/i, /portemonnee/i,
    /\bmuts\b/i, /\bbeanie\b/i, /\bpet\b/i, /\bhoed\b/i,
  ],
  skirt: [
    /\brok\b/i, /\bskirt\b/i, /minirok/i, /midirok/i, /maxirok/i,
    /kokerrok/i, /plooirok/i,
  ],
  top: [
    /t-shirt/i, /\bshirt\b/i, /overhemd/i, /blouse/i, /\bpolo\b/i,
    /\btrui\b/i, /sweater/i, /hoodie/i, /\bvest\b/i, /cardigan/i,
    /tanktop/i, /longsleeve/i, /crewneck/i, /sweatshirt/i,
    /turtleneck/i, /coltrui/i, /pullover/i, /\bknit\b/i, /gebreid/i,
    /poloshirt/i,
  ],
};

export function classifyCategory(row: Record<string, any>): string {
  const name = (row.name || '').toLowerCase();
  const desc = (row.description || '').toLowerCase();
  const text = `${name} ${desc}`;

  for (const [cat, patterns] of Object.entries(CATEGORY_NAME_MAP)) {
    for (const p of patterns) {
      if (p.test(name)) return cat;
    }
  }

  for (const [cat, patterns] of Object.entries(CATEGORY_NAME_MAP)) {
    for (const p of patterns) {
      if (p.test(text)) return cat;
    }
  }

  const dbCat = (row.category || '').toLowerCase();
  if (['top', 'bottom', 'footwear', 'outerwear', 'accessory', 'dress', 'skirt'].includes(dbCat)) {
    return dbCat;
  }

  return 'other';
}
