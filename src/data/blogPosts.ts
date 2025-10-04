export type BlogPost = {
  id: string;
  title: string;
  date: string;      // ISO, bv. "2025-09-16"
  excerpt: string;
  content: string;   // markdown-achtig, we renderen dit veilig (zie BlogPostPage)
  tags: string[];
  imageId?: string;  // SmartImage id (optioneel)
};

// UIT (18) – samengevoegd en ongewijzigd qua inhoudelijke tekst.
// Voeg hier gerust meer posts toe in hetzelfde formaat.
export const posts: BlogPost[] = [
  {
    id: "kleurtemperatuur-warm-koel-neutraal",
    title: "Kleurtemperatuur: warm, koel of neutraal?",
    date: "2025-09-16",
    excerpt:
      "Herken je kleurtemperatuur en kies outfits die je huid laten stralen.",
    content: `Kleurtemperatuur gaat niet over "mooie" of "foute" kleuren — het gaat over harmonie met je ondertoon. We onderscheiden grofweg warm, koel en neutraal. Deze gids helpt je in **2–3 minuten** de juiste richting te kiezen.

## Zo test je het snel
- Hou goud- en zilverkleur bij je gezicht; wat oogt frisser?
- Kijk naar aders bij je pols: neigt het naar groen (warm) of blauw/paars (koel)?
- Foto's buitenlicht: welke outfits maken je huid egaler?

## Kleuren per categorie
**Warm:** zand, camel, olijfgroen, terracotta.  
**Koel:** marine, ijsblauw, bordeaux.  
**Neutraal:** mix van beide, vermijd de extreme varianten.

> "Kleur is richting: de juiste temperatuur brengt direct rust in je look."`,
    tags: ["kleur", "gids"],
    imageId: "blog-color",
  },
  {
    id: "silhouet-outfits",
    title: "Wat je silhouet écht zegt over je outfitkeuzes",
    date: "2025-09-09",
    excerpt:
      "Waarom proporties, lengte en snit het verschil maken.",
    content: `Silhouet bepaalt waar je nadruk legt: schouders, taille, benen. Kies vormen die balanceren in plaats van verbergen.

## Praktische richtlijnen
- **Lengte:** bij cropped jacks hoort een hogere rise; bij langere jassen kan de broek iets langer.
- **Proportie:** combineer oversized boven met gestroomlijnd onder — of andersom.
- **Volume:** 1 volumepunt tegelijk voorkomt dat de outfit "zwaar" oogt.`,
    tags: ["silhouet", "basics"],
    imageId: "blog-silhouet",
  },
  {
    id: "capsule-wardrobe-10-stuks",
    title: "Capsule wardrobe: 10 stuks, eindeloze combinaties",
    date: "2025-08-31",
    excerpt:
      "De premium manier om rust en consistentie in je kast te krijgen.",
    content: `Met een capsule bouw je op basisstukken die alles met elkaar mixen. Minder twijfel, meer consistentie.

## De 3 stappen
1. **Bepaal je temperatuur** (warm/koel/neutraal) en kies 2–3 basiskleuren.
2. **Selecteer 8–12 tijdloze items** (goede materialen) die jouw silhouet versterken.
3. **Voeg 1–2 accenten per seizoen toe** voor variatie zonder ruis.

### Checklist
- Neutrale basis + 1 accentkleur dicht bij het gezicht.
- Silhouet-aanpassingen: lengte mouwen/zooms, plaats van volume.
- Materialen die bij je huid en klimaat passen.

> "Een kleine, doordachte garderobe verslaat altijd een volle, chaotische kast."`,
    tags: ["gids", "capsule", "stijl"],
    imageId: "blog-capsule",
  },
  {
    id: "ai-style-report-uitleg",
    title: "AI Style Report: zo vertaalt FitFi jouw smaak naar outfits",
    date: "2025-08-28",
    excerpt:
      "Van 6 antwoorden naar concrete looks met context — privacy-first.",
    content: `We starten met zes korte vragen. Daaruit bepalen we je stijlprofiel (archetypen, kleuraccenten, pasvormrichting) en genereren outfits met uitleg.

## Wat je krijgt
- Meerdere looks met combinatietips
- Uitleg per item: waarom dit werkt voor jou
- Shoplinks zonder ruis

## Waarom het werkt
We combineren je voorkeuren met beproefde principes (silhouet, kleur, proportie) en houden het nuchter: geen black box, wel duidelijke keuzes.`,
    tags: ["uitleg", "report"],
    imageId: "blog-report",
  },
];

export default posts;