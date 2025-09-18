export type BlogPost = {
  id: string;
  title: string;
  date: string; // ISO
  excerpt: string;
  content: string;
  tags: string[];
  imageId?: string; // SmartImage id (optioneel)
};

const posts: BlogPost[] = [
  {
    id: "ai-style-report-uitleg",
    title: "AI Style Report: zo vertaalt FitFi jouw smaak naar outfits",
    date: "2025-08-28",
    excerpt:
      "Van 6 korte vragen naar een persoonlijk profiel met outfits die werken voor silhouet en kleurtemperatuur — zonder ruis.",
    content: `Ons model combineert jouw voorkeuren met kleur- en silhouetregels. Bij elk advies vertellen we waarom het past (materiaal, snit, archetype, seizoen). Zo kun je gericht shoppen en miskopen vermijden.

## Waarom dit werkt
- Focus op keuze-architectuur: minder ruis, betere beslissingen.
- Kleurtemperatuur dicht bij het gezicht zorgt voor direct zichtbaar effect.
- Silhouetregels beperken de ruimte tot wat écht staat.

### Wat je krijgt
1. Een helder stijlprofiel (archetype, materialen, kleurtemperatuur).
2. 10+ outfits met shoplinks en uitleg per set.
3. Wekelijkse updates op basis van seizoenswissels.

> "Rust brengt kwaliteit: minder items, betere combinaties, meer zelfvertrouwen."

## Volgende stap
Beantwoord 6 vragen en ontvang binnen 2 minuten je rapport. Upgrade later pas als je meer verdieping wilt.`,
    tags: ["uitleg", "ai", "gids"],
    imageId: "blog-aisr",
  },
  {
    id: "capsule-garderobe-start",
    title: "Beginnen met een capsule garderobe: 3 rustige stappen",
    date: "2025-07-12",
    excerpt:
      "Minder items, meer combinaties. Zo stel je een capsule samen die bij jouw leven past — met kleurtemperatuur als basis.",
    content: `Een capsule is een kleine set kleding die onderling moeiteloos combineert. De winst: rust in je kast, sneller kiezen, minder miskopen.

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
    id: "kleuren-en-huidtint",
    title: "Kleuren & huidtint: warm, koel of neutraal?",
    date: "2025-06-20",
    excerpt:
      "Kleurtemperatuur is de snelste winst. Zo herken je jouw spectrum en kies je sets die rust brengen.",
    content: `Kleurtemperatuur bepaalt of een set "werkt" — vooral bij tops, omdat de kleur dicht bij je gezicht zit.

## Snelle checks
- **Ader-test**: ogen je aders meer groen (warm) of blauw/paars (koel)?
- **Sieraden-test**: goud (warm) of zilver (koel) flatteert meer?
- **Neutraal?** Combineer warm en koel met zachte, middenkleuren.

### Basics om te onthouden
- Herhaal je temperatuur in sjaals, truien en jacks.
- Laat accentkleuren terugkomen in schoenen of tas.
- Houd prints rustig: beperkt palet, duidelijke schaal.

> "Kleur is richting: de juiste temperatuur brengt direct rust in je look."`,
    tags: ["kleur", "gids"],
    imageId: "blog-color",
  },
];

export default posts;