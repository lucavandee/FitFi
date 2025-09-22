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
      <section className="results ff-container">
        <header className="results__header">
          <p className="eyebrow">Onze aanbeveling</p>
          <h1 className="results__title">
            Dit past bij jouw stijl — clean, smart-casual
          </h1>
          <p className="results__intro">
            We kozen voor een cleane, smart-casual look: netter denim, witte sneaker
            en licht overshirt — minimalistisch en comfortabel.
          </p>
          <div className="results__actions">
            <button className="btn btn--primary">Shop deze look</button>
            <button className="btn btn--ghost">Nieuwe analyse</button>
          </div>

          <ul className="results__chips">
            <li className="chip">100% gratis</li>
            <li className="chip">Klaar in 2 min</li>
            <li className="chip">Outfits + shoplinks</li>
            <li className="chip">Privacy-first</li>
          </ul>
        </header>

        <div className="results__grid">
          {/* Card 1 */}
          <article className="result-card">
            <figure className="result-card__media">
              <img
                src="/images/results/smart-casual.jpg"
                alt="Smart casual outfit met nette denim, witte sneaker en licht overshirt"
                loading="eager"
                decoding="async"
              />
            </figure>
            <div className="result-card__body">
              <h2 className="result-card__title">Smart casual (dagelijks)</h2>
              <ul className="result-card__list">
                <li>Netter denim — rechte pijp</li>
                <li>Witte sneaker — minimal</li>
                <li>Licht overshirt — koele tint</li>
              </ul>
              <a className="result-card__cta" href="#">Shop vergelijkbare items</a>
            </div>
          </article>

          {/* Card 2 */}
          <article className="result-card">
            <figure className="result-card__media">
              <img
                src="/images/results/monochrome.jpg"
                alt="Monochrome workday outfit in neutrale tinten"
                loading="lazy"
                decoding="async"
              />
            </figure>
            <div className="result-card__body">
              <h2 className="result-card__title">Monochrome workday</h2>
              <ul className="result-card__list">
                <li>Fijngebreide crew — off-white</li>
                <li>Wolmix pantalon — rechte pijp</li>
                <li>Leren loafer — clean buckle</li>
              </ul>
              <a className="result-card__cta" href="#">Shop vergelijkbare items</a>
            </div>
          </article>

          {/* Card 3 */}
          <article className="result-card">
            <figure className="result-card__media">
              <img
                src="/images/results/athflow.jpg"
                alt="Comfortabele weekendlook met hoodie en jogger"
                loading="lazy"
                decoding="async"
              />
            </figure>
            <div className="result-card__body">
              <h2 className="result-card__title">Athflow weekend</h2>
              <ul className="result-card__list">
                <li>Merino zip hoodie</li>
                <li>Tech jogger</li>
                <li>Minimal runner</li>
              </ul>
              <a className="result-card__cta" href="#">Shop vergelijkbare items</a>
            </div>
          </article>
        </div>

        <footer className="results__footer">
          <p>Meer varianten per silhouet en seizoen?</p>
          <a className="btn btn--pill" href="#">
            Ontgrendel premium outfits
          </a>
        </footer>
      </section>
    </main>
  );
};

export default ResultsPremium;