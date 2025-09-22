import React from "react";

type Outfit = {
  slug: string;
  title: string;
  tags?: string[];
  bullets: string[];
  img?: string;              // optioneel; valt terug op gradient
  alt?: string;
};

const outfits: Outfit[] = [
  {
    slug: "smart-casual",
    title: "Smart casual (dagelijks)",
    tags: ["clean", "comfort"],
    bullets: [
      "Netter denim — rechte pijp",
      "Witte sneaker — minimal",
      "Licht overshirt — koele tint",
    ],
    img: "/images/results/smart-casual.jpg",
    alt: "Smart casual outfit met nette denim, witte sneaker en licht overshirt",
  },
  {
    slug: "monochrome-workday",
    title: "Monochrome workday",
    tags: ["office", "minimal"],
    bullets: [
      "Fijngebreide crew — off-white",
      "Wolmix pantalon — rechte pijp",
      "Leren loafer — clean buckle",
    ],
    img: "/images/results/monochrome-workday.jpg",
    alt: "Monochrome workday outfit in neutrale tinten",
  },
  {
    slug: "athflow-weekend",
    title: "Athflow weekend",
    tags: ["soft", "relaxed"],
    bullets: ["Merino zip hoodie", "Tech jogger", "Minimal runner"],
    img: "/images/results/athflow-weekend.jpg",
    alt: "Comfortabele weekendlook met hoodie en jogger",
  },
];

const ResultsPremium: React.FC = () => {
  return (
    <main id="main" className="bg-[var(--color-bg)]">
      {/* Hero / intro */}
      <section className="ff-section ff-results-hero">
        <div className="ff-container">
          <p className="ff-eyebrow">Onze aanbeveling</p>
          <h1 className="ff-hero-title">Dit past bij jouw stijl — clean, smart-casual</h1>
          <p className="ff-hero-sub">
            We kozen voor een cleane, smart-casual look: netter denim, witte sneaker en
            licht overshirt — minimalistisch en comfortabel.
          </p>

          <div className="ff-hero-actions">
            <a className="ff-btn ff-btn--primary" href="/shop">Shop deze look</a>
            <a className="ff-btn ff-btn--ghost" href="/onboarding">Nieuwe analyse</a>
          </div>

          <div className="ff-pills">
            <span className="ff-chip">100% gratis</span>
            <span className="ff-chip">Klaar in 2 min</span>
            <span className="ff-chip">Outfits + shoplinks</span>
            <span className="ff-chip">Privacy-first</span>
          </div>
        </div>
      </section>

      {/* Grid met outfits */}
      <section className="ff-section">
        <div className="ff-container">
          <div className="ff-grid-3">
            {outfits.map((o) => (
              <article key={o.slug} className="ff-card ff-card--outfit">
                <figure className="ff-media">
                  {o.img ? (
                    <img
                      src={o.img}
                      alt={o.alt ?? o.title}
                      className="ff-img"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div aria-hidden="true" className="ff-media-fallback" />
                  )}

                  {!!o.tags?.length && (
                    <figcaption className="ff-media-badges">
                      {o.tags.map((t) => (
                        <span key={t} className="ff-chip ff-chip--muted">{t}</span>
                      ))}
                    </figcaption>
                  )}
                </figure>

                <div className="ff-card__body">
                  <h3 className="ff-card__title">{o.title}</h3>
                  <ul className="ff-list">
                    {o.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                  <div className="ff-card__actions">
                    <a className="ff-btn ff-btn--ghost" href="/shop">Shop vergelijkbare items</a>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Premium rail */}
          <div className="ff-premium-rail">
            <div className="ff-premium-rail__content">
              <strong>Meer varianten per silhouet en seizoen?</strong>
              <span className="ff-premium-rail__sub">Ontgrendel 9+ extra outfits & pro-tips.</span>
            </div>
            <a className="ff-btn ff-btn--primary" href="/prijzen">Ontgrendel premium</a>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ResultsPremium;