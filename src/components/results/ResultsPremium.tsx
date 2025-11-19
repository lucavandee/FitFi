import React from "react";
import SmartImage from "@/components/ui/SmartImage";
import ComposedLook from "./ComposedLook";

type Outfit = {
  slug: string;
  title: string;
  tags?: string[];
  bullets: string[];
  img?: string;
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
  const composedLookItems = [
    { img: "/images/fallbacks/top.jpg", alt: "Premium shirt" },
    { img: "/images/fallbacks/bottom.jpg", alt: "Tailored broek" },
    { img: "/images/fallbacks/footwear.jpg", alt: "Designer sneakers" },
    { img: "/images/fallbacks/accessory.jpg", alt: "Statement accessoire" }
  ];

  return (
    <main className="ff-results ff-container">
      <section className="res-hero">
        <p className="eyebrow">Onze aanbeveling</p>
        <h1 className="res-hero__title">
          Dit past bij jouw stijl — <span>clean, smart-casual</span>
        </h1>
        <p className="res-hero__sub">
          We kozen voor een cleane, smart-casual look: netter denim, witte sneaker en licht overshirt —
          minimalistisch en comfortabel.
        </p>

        <div className="res-hero__cta">
          <button className="btn btn-primary">Shop deze look</button>
          <button className="btn btn-ghost">Nieuwe analyse</button>
        </div>

        <ul className="chips" aria-label="USP's">
          <li className="chip chip--active">100% gratis</li>
          <li className="chip"></li>
          <li className="chip">Outfits + shoplinks</li>
          <li className="chip"></li>
        </ul>
      </section>

      <section aria-labelledby="outfits-heading">
        <h2 id="outfits-heading" className="sr-only">Outfits</h2>
        <div className="results__grid">
          <article className="res-card">
            <div className="res-card__mosaic">
              <SmartImage
                src="/images/fallbacks/top.jpg"
                alt=""
                aspectRatio={1}
                className="res-card__tile"
                fetchPriority="high"
              />
              <SmartImage
                src="/images/fallbacks/bottom.jpg"
                alt=""
                aspectRatio={1}
                className="res-card__tile"
              />
              <SmartImage
                src="/images/fallbacks/footwear.jpg"
                alt=""
                aspectRatio={1}
                className="res-card__tile"
              />
              <SmartImage
                src="/images/fallbacks/accessory.jpg"
                alt=""
                aspectRatio={1}
                className="res-card__tile"
              />
            </div>

            <div className="res-card__body">
              <h3 className="res-card__title">Smart casual (dagelijks)</h3>
              <ul className="res-card__bullets">
                <li>Netter denim — rechte pijp</li>
                <li>Witte sneaker — minimal</li>
                <li>Licht overshirt — koele tint</li>
              </ul>
              <a href="#" className="link-cta">Shop vergelijkbare items</a>
            </div>
          </article>

          <article className="res-card">
            <div className="res-card__mosaic">
              <SmartImage
                src="/images/fallbacks/top.jpg"
                alt=""
                aspectRatio={1}
                className="res-card__tile"
              />
              <SmartImage
                src="/images/fallbacks/bottom.jpg"
                alt=""
                aspectRatio={1}
                className="res-card__tile"
              />
              <SmartImage
                src="/images/fallbacks/footwear.jpg"
                alt=""
                aspectRatio={1}
                className="res-card__tile"
              />
              <SmartImage
                src="/images/fallbacks/accessory.jpg"
                alt=""
                aspectRatio={1}
                className="res-card__tile"
              />
            </div>

            <div className="res-card__body">
              <h3 className="res-card__title">Business casual (werk)</h3>
              <ul className="res-card__bullets">
                <li>Chino — tailored fit</li>
                <li>Oxford shirt — wit/lichtblauw</li>
                <li>Loafers — leer, donkerbruin</li>
              </ul>
              <a href="#" className="link-cta">Shop vergelijkbare items</a>
            </div>
          </article>

          <article className="res-card">
            <div className="res-card__mosaic">
              <SmartImage
                src="/images/fallbacks/top.jpg"
                alt=""
                aspectRatio={1}
                className="res-card__tile"
              />
              <SmartImage
                src="/images/fallbacks/bottom.jpg"
                alt=""
                aspectRatio={1}
                className="res-card__tile"
              />
              <SmartImage
                src="/images/fallbacks/footwear.jpg"
                alt=""
                aspectRatio={1}
                className="res-card__tile"
              />
              <SmartImage
                src="/images/fallbacks/accessory.jpg"
                alt=""
                aspectRatio={1}
                className="res-card__tile"
              />
            </div>

            <div className="res-card__body">
              <h3 className="res-card__title">Weekend casual (vrije tijd)</h3>
              <ul className="res-card__bullets">
                <li>Jogger — comfortabel, tapered</li>
                <li>Hoodie — oversized, neutrale kleur</li>
                <li>Chunky sneaker — wit/grijs</li>
              </ul>
              <a href="#" className="link-cta">Shop vergelijkbare items</a>
            </div>
          </article>
        </div>
      </section>

      <footer className="results__footer">
        <div className="results__footer-content">
          <h2>Meer stijladvies nodig?</h2>
          <p>Ontdek onze AI-stylist Nova voor persoonlijke styling tips en outfit inspiratie.</p>
          <button className="btn btn-primary">Probeer Nova gratis</button>
        </div>
      </footer>
    </main>
  );
};

export default ResultsPremium;
