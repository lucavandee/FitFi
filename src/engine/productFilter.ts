import { classifyProductDetailed } from './productClassifier';

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

  // Pure competitive sport gear only — athleisure (joggers, sneakers, hoodies,
  // running shoes, gym wear) blijft door dit filter heen zodat het ATHLETIC
  // archetype producten krijgt.
  /voetbal/i, /\bfootball\b/i, /\bsoccer\b/i, /\brugby\b/i, /\bhockey\b/i, /\bhandbal\b/i, /\bbasketbal\b/i,
  /keepershandschoen/i, /scheenbeschermer/i,
  /wielren/i, /fietsbroek/i, /fietsshirt/i, /wielershirt/i,
  /\btrail\s*run/i, /\bmarathon\b/i,
  /\bsportbeha\b/i, /sport\s?bh/i,
  /\byoga\b/i, /\bpilates\b/i,
  /skibroek/i, /skipak/i, /\bsnowboard/i, /skischoenen/i, /\bskistok\b/i,
  /\bwetsuit\b/i, /\bduik/i, /\bsnorkel/i, /\bsurfboard\b/i,
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

  /kaars/i, /candle/i, /lamp/i, /\bvaas\b/i, /\bdecor\b/i,
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

export function classifyCategory(row: Record<string, any>): string {
  const result = classifyProductDetailed(row.name || '', row.description || '', row.category || '');
  if (result.rejected || result.category === 'underwear') return 'other';
  return result.category;
}
