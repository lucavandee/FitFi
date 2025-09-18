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
    content:
      "Ons model combineert jouw voorkeuren met kleur- en silhouetregels. Bij elk advies vertellen we waarom het past (materiaal, snit, archetype, seizoen). Zo kun je gericht shoppen en miskopen vermijden.",
    tags: ["uitleg", "ai", "gids"],
    imageId: "blog-aisr",
  },
  {
    id: "capsule-garderobe-start",
    title: "Beginnen met een capsule garderobe: 3 rustige stappen",
    date: "2025-07-12",
    excerpt:
      "Minder items, meer combinaties. Zo stel je een capsule samen die bij jouw leven past — met kleurtemperatuur als basis.",
    content:
      "Start met 2–3 kernkleuren (warm/koud), kies 8–12 tijdloze items in fijne materialen, en voeg per seizoen 2 accenten toe. FitFi helpt je de hiaten te zien en gericht aan te vullen.",
    tags: ["gids", "capsule", "stijl"],
    imageId: "blog-capsule",
  },
  {
    id: "kleuren-en-huidtint",
    title: "Kleuren & huidtint: warm, koel of neutraal?",
    date: "2025-06-20",
    excerpt:
      "Kleurtemperatuur is de snelste winst. Zo herken je jouw spectrum en kies je sets die rust brengen.",
    content:
      "Let op ondertoon (ader-test, sieraden-test) en herhaal die temperatuur in tops dicht bij je gezicht. Neutrale garderobebasis + 1 accentkleur werkt verrassend goed.",
    tags: ["kleur", "gids"],
    imageId: "blog-color",
  },
];

export default posts;