import React from "react";
import { useParams, NavLink } from "react-router-dom";

const POSTS = {
  "kleurtemperatuur-warm-koel-neutraal": {
    title: "Kleurtemperatuur: warm, koel of neutraal?",
    excerpt: "Herken je kleurtemperatuur en kies outfits die je huid laten stralen.",
    dateISO: "2025-09-16",
    date: "16 sep 2025",
    readingTime: "4 min",
    tags: ["Kleur", "Gids"],
    body: (
      <>
        <p>Kleurtemperatuur helpt je bepalen welke tinten je huid laten stralen. Warm? Denk aan zand, camel, olijfgroen. Koel? Marine, ijzig blauw, bordeaux. Neutraal? Je schuift beide op, maar vermijd extreme varianten.</p>
        <h3>Zo test je het snel</h3>
        <ul className="list-disc pl-5">
          <li>Hou goud- en zilverkleur bij je gezicht; wat oogt frisser?</li>
          <li>Kijk naar aders bij je pols: neigt het naar groen (warm) of blauw/paars (koel)?</li>
          <li>Foto's buitenlicht: welke outfits maken je huid egaler?</li>
        </ul>
      </>
    ),
  },
  "silhouet-outfits": {
    title: "Wat je silhouet écht zegt over je outfitkeuzes",
    excerpt: "Waarom proporties, lengte en snit het verschil maken.",
    dateISO: "2025-09-09",
    date: "09 sep 2025",
    readingTime: "5 min",
    tags: ["Silhouet", "Basics"],
    body: (
      <>
        <p>Silhouet bepaalt waar je nadruk legt: schouders, taille, benen. Kies vormen die balanceren i.p.v. verbergen.</p>
        <h3>Praktische richtlijnen</h3>
        <ul className="list-disc pl-5">
          <li>Lengte: bij cropped jacks hoort een hogere rise; bij lange jassen kan de broek iets langer.</li>
          <li>Proportie: combineer oversized boven met gestroomlijnd onder — of andersom.</li>
          <li>Volume: 1 volumepunt tegelijk voorkomt dat de outfit "zwaar" oogt.</li>
        </ul>
      </>
    ),
  },
  "capsule-wardrobe-10-stuks": {
    title: "Capsule wardrobe: 10 stuks, eindeloze combinaties",
    excerpt: "De premium manier om rust en consistentie in je kast te krijgen.",
    dateISO: "2025-08-31",
    date: "31 aug 2025",
    readingTime: "6 min",
    tags: ["Capsule", "Minimal"],
    body: (
      <>
        <p>Met een capsule bouw je op basisstukken die alles met elkaar mixen. Minder twijfel, meer consistentie.</p>
        <h3>De 10 stuks</h3>
        <ol className="list-decimal pl-5">
          <li>Witte oxford</li><li>Donkere jeans</li><li>Wollen overshirt</li><li>Minimal sneakers</li><li>Chino</li>
          <li>Merino trui</li><li>Net jasje</li><li>Basic tee</li><li>Laaglaars</li><li>Overcoat</li>
        </ol>
      </>
    ),
  }
} as const;

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: keyof typeof POSTS }>();
  const post = slug ? POSTS[slug] : undefined;

  if (!post) {
    return (
      <main className="ff-container ff-page-hero">
        <h1 className="ff-hero-title text-3xl md:text-5xl mt-3">Artikel niet gevonden</h1>
        <div className="mt-6"><NavLink to="/blog" className="ff-btn ff-btn-secondary">Terug naar blog</NavLink></div>
      </main>
    );
  }

  return (
    <main id="main" className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text)]">
      <section className="ff-container ff-page-hero">
        <span className="ff-eyebrow">Blog</span>
        <h1 className="ff-hero-title text-3xl md:text-5xl mt-3">{post.title}</h1>
        <p className="ff-hero-sub mt-4 max-w-2xl">{post.excerpt}</p>
        <div className="mt-3 text-[var(--color-muted)]">
          <time dateTime={post.dateISO}>{post.date}</time> • {post.readingTime}
        </div>
      </section>

      <section className="ff-container ff-section">
        <article className="prose prose-invert max-w-none">
          {post.body}
        </article>
      </section>
    </main>
  );
}