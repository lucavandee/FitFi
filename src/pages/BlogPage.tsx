import React from "react";
import PageHero from "@/components/marketing/PageHero";

type Post = { title: string; excerpt: string; href: string; tag: "Silhouet" | "Kleur" | "Garderobe" | "AI-insights"; author: string };

const POSTS: Post[] = [
  { title: "Wat je silhouet zegt over je outfitkeuzes", excerpt: "Leer verhoudingen lezen en combineren — met rust in je keuzes.", href: "/blog/silhouet-outfits", tag: "Silhouet", author: "Team FitFi" },
  { title: "Kleurtemperatuur: warm, koel of neutraal?", excerpt: "Ontdek je kleurwereld en combineer zonder twijfelen.", href: "/blog/kleurtemperatuur-gids", tag: "Kleur", author: "Team FitFi" },
  { title: "Capsule wardrobe: weinig kopen, alles dragen", excerpt: "Maximale combinaties, minder twijfel.", href: "/blog/capsule-wardrobe", tag: "Garderobe", author: "Team FitFi" },
  { title: "Hoe AI stylingkeuzes uitlegbaar maakt", excerpt: "Van regels en verhoudingen naar draagbare outfits.", href: "/blog/ai-uitlegbaarheid-stijl", tag: "AI-insights", author: "Team FitFi" },
];

const TAGS: Post["tag"][] = ["Silhouet", "Kleur", "Garderobe", "AI-insights"];

export default function BlogPage() {
  const [tag, setTag] = React.useState<Post["tag"] | "Alle">("Alle");

  const filtered = tag === "Alle" ? POSTS : POSTS.filter(p => p.tag === tag);

  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <PageHero
        id="page-blog"
        eyebrow="INSIGHTS"
        title="Blog"
        subtitle="Praktische gidsen over silhouet, kleur en outfits — premium stijl, nuchtere uitleg."
        align="left"
        as="h1"
        size="sm"
        ctas={[
          { label: "Start gratis", to: "/results", variant: "primary" },
          { label: "Hoe het werkt", to: "/hoe-het-werkt", variant: "secondary" }
        ]}
      />

      {/* Filter chips */}
      <section className="ff-container py-4">
        <div className="flex flex-wrap gap-2">
          {(["Alle", ...TAGS] as const).map(t => (
            <button
              key={t}
              onClick={() => setTag(t as any)}
              className={`px-3 py-1.5 rounded-full border text-sm ${tag === t ? "border-[var(--ff-color-primary-700)]" : "border-[var(--color-border)]"}`}
              aria-pressed={tag === t}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      {/* Highlight / trending */}
      <section className="ff-container py-4 sm:py-6">
        <article className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shadow-[var(--shadow-soft)]">
          <div className="p-5">
            <div className="text-[var(--color-text)]/70 text-sm">Aanrader</div>
            <h2 className="font-montserrat text-xl mt-1">De slimme basis van een capsule wardrobe</h2>
            <p className="text-[var(--color-text)]/80 mt-1">
              Hoe je met weinig items maximaal kunt combineren—zonder concessies te doen aan stijl.
            </p>
            <a href="/blog/capsule-wardrobe" className="ff-btn ff-btn-quiet mt-3">Lees meer</a>
          </div>
        </article>
      </section>

      {/* Grid */}
      <section id="posts" className="ff-container ff-stack-lg py-6 sm:py-10">
        {filtered.length === 0 ? (
          <p className="text-[var(--color-text)]/70">Geen artikelen in deze categorie.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {filtered.map((p) => (
              <article key={p.href} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] overflow-hidden">
                <a href={p.href} className="block" aria-label={`Lees: ${p.title}`}>
                  <div className="w-full" style={{ paddingTop: "56.25%" }} />
                  <div className="p-4">
                    <div className="text-[var(--color-text)]/70 text-sm">{p.tag} • 5 min • {p.author}</div>
                    <h3 className="font-montserrat text-lg text-[var(--color-text)] mt-1">{p.title}</h3>
                    <p className="text-[var(--color-text)]/80 mt-1">{p.excerpt}</p>
                    <div className="mt-3"><span className="ff-btn ff-btn-quiet">Lees meer</span></div>
                  </div>
                </a>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Newsletter / community */}
      <section className="ff-container py-8 sm:py-12">
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
          <h2 className="font-montserrat text-xl sm:text-2xl">Ontvang onze gidsen in je inbox</h2>
          <p className="text-[var(--color-text)]/80 mt-1">Praktische tips, géén spam. Schrijf je in voor updates.</p>
          <form className="mt-3 grid gap-3 sm:flex">
            <input
              type="email"
              required
              placeholder="jij@voorbeeld.nl"
              className="flex-1 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 outline-none"
              aria-label="E-mailadres"
            />
            <button type="submit" className="ff-btn ff-btn-primary">Inschrijven</button>
          </form>
        </div>
      </section>
    </main>
  );
}