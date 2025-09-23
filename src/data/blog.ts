// Lightweight content-bron voor lijst + detail (kan straks vervangen door CMS).
// Tokens-first UI; geen hexcodes hier, alleen data.

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO
  author: string;
  cover: string; // public path (e.g. /images/blog/...)
  tags: string[];
  readingMinutes: number;
  body: { type: "p" | "h2" | "h3" | "li" | "img" | "quote"; content: string }[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "kleur-garderobe",
    title: "De kracht van kleur in je garderobe",
    excerpt:
      "Hoe kleurtemperatuur je uitstraling beïnvloedt en hoe Nova dit vertaalt naar outfits die rust geven.",
    date: "2025-06-01",
    author: "FitFi Editorial",
    cover: "/images/blog/kleur.jpg",
    tags: ["Kleur", "AI", "Styling"],
    readingMinutes: 4,
    body: [
      { type: "p", content: "Kleur werkt onbewust. Warme tinten voelen benaderbaar; koel oogt scherper." },
      { type: "p", content: "Nova leest je context en matcht kleurtemperatuur met silhouet en texturen." },
      { type: "h2", content: "Warm vs. koel — wat past bij jou?" },
      { type: "p", content: "Let op huidondertoon en contrast: zacht neutraal werkt vaak het hele jaar." },
      { type: "quote", content: "\"Een rustige basiskleur + 1 accent is vaak genoeg."" },
      { type: "p", content: "Begin met één accentkleur in accessoires of bovenstukken." }
    ],
  },
  {
    slug: "minimalistische-essentials",
    title: "Minimalistische essentials",
    excerpt:
      "Waarom minder meer kan zijn — en hoe je outfits samenstelt die altijd werken.",
    date: "2025-07-12",
    author: "FitFi Editorial",
    cover: "/images/blog/minimal.jpg",
    tags: ["Minimalisme", "Capsule", "Basics"],
    readingMinutes: 3,
    body: [
      { type: "p", content: "Essentials bouwen rust op. Denk aan silhouet, materiaal en laagjes." },
      { type: "h2", content: "3 lagen, 2 texturen" },
      { type: "p", content: "Mix katoen en wol; voeg structuur toe met rib of twill." },
      { type: "p", content: "Herhaal kleuren subtiel voor samenhang." }
    ],
  },
  {
    slug: "ai-in-mode",
    title: "AI in mode: geen hype, wel praktijk",
    excerpt:
      "Hoe FitFi AI inzet voor transparantie en eenvoud — met uitleg, niet alleen advies.",
    date: "2025-08-20",
    author: "FitFi Editorial",
    cover: "/images/blog/ai.jpg",
    tags: ["AI", "Uitleg", "Transparantie"],
    readingMinutes: 4,
    body: [
      { type: "p", content: "AI helpt keuzes onderbouwen: waarom iets werkt, niet alleen wat je koopt." },
      { type: "h2", content: "Nova's aanpak" },
      { type: "p", content: "Context + silhouet + kleurtemperatuur → voorstel met toelichting." },
      { type: "p", content: "Privacy-first: alleen verwerken wat nodig is." }
    ],
  },
];