import React from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";

type Outfit = {
  id: string;
  title: string;
  bullets: string[];
  image?: string;
  shopUrl?: string;
};

type ResultsData = {
  summary?: string;
  outfits?: Outfit[];
};

function loadResults(): ResultsData | null {
  try {
    const raw = localStorage.getItem("fitfi.results");
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

const FALLBACK_OUTFITS: Outfit[] = [
  {
    id: "smart-casual",
    title: "Smart casual (dagelijks)",
    bullets: [
      "Netter denim — rechte pijp",
      "Witte sneaker — minimal",
      "Licht overshirt — koele tint",
    ],
    image: "/images/results/smart-casual.jpg",
    shopUrl: "/shop/smart-casual",
  },
  {
    id: "mono-work",
    title: "Monochrome workday",
    bullets: [
      "Fijngebreide crew — off-white",
      "Wolmix pantalon — rechte pijp",
      "Leren loafer — clean buckle",
    ],
    image: "/images/results/mono-work.jpg",
    shopUrl: "/shop/monochrome",
  },
  {
    id: "athflow-weekend",
    title: "Athflow weekend",
    bullets: ["Merino zip hoodie", "Tech jogger", "Minimal runner"],
    image: "/images/results/athflow-weekend.jpg",
    shopUrl: "/shop/athflow",
  },
];

const ResultsPage: React.FC = () => {
  const data = loadResults();
  const outfits = (data?.outfits?.length ? data.outfits : FALLBACK_OUTFITS).slice(0, 3);

  return (
    <main id="main" className="bg-[var(--color-bg)] min-h-screen">
      <Seo
        title="Jouw stijlresultaten — FitFi"
        description="Persoonlijk advies met 3 concrete outfits — inclusief vergelijkbare items en shoplinks."
        canonical="https://fitfi.ai/results"
      />

      {/* Hero/editorial header */}
      <section className="ff-section">
        <div className="ff-container">
          <div className="ff-results-hero">
            <div className="ff-hero-copy">
              <p className="ff-eyebrow">Onze aanbeveling</p>
              <h1 className="ff-hero-title">
                {data?.summary
                  ? data.summary
                  : "We kozen voor een cleane, smart-casual richting: netter denim, witte sneaker en licht overshirt — minimalistisch en comfortabel."}
              </h1>

              <div className="ff-cta-row">
                <Link to={outfits[0]?.shopUrl || "#"} className="btn btn-primary">
                  Shop deze look
                </Link>
                <Link to="/onboarding" className="btn btn-secondary">
                  Nieuwe analyse
                </Link>
              </div>

              <ul className="ff-meta-chips">
                <li className="ff-chip">100% gratis</li>
                <li className="ff-chip">Klaar in 2 min</li>
                <li className="ff-chip">Outfits + shoplinks</li>
                <li className="ff-chip">Privacy-first</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3 outfit cards */}
      <section className="ff-section">
        <div className="ff-container">
          <div className="ff-grid-3">
            {outfits.map((o) => (
              <article key={o.id} className="ff-card">
                <div className="ff-img-frame">
                  {o.image ? (
                    <img
                      src={o.image}
                      alt={o.title}
                      className="ff-img"
                      onError={(e) => {
                        // toon gradient fallback als image ontbreekt
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                        e.currentTarget.parentElement?.classList.add("ff-img-fallback");
                      }}
                    />
                  ) : (
                    <div className="ff-img-fallback" aria-hidden />
                  )}
                </div>

                <div className="ff-card-body">
                  <h3 className="ff-card-title">{o.title}</h3>
                  <ul className="ff-bullets">
                    {o.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>

                  <div className="ff-card-actions">
                    <Link to={o.shopUrl || "#"} className="btn btn-ghost">
                      Shop vergelijkbare items
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Premium rail */}
      <section className="ff-section pb-24">
        <div className="ff-container">
          <div className="ff-premium-rail">
            <div>
              <p className="ff-eyebrow mb-1">Meer varianten per silhouet en seizoen?</p>
              <h2 className="ff-rail-title">Ontgrendel premium outfits</h2>
            </div>
            <Link to="/prijzen" className="btn btn-primary">
              Bekijk pakketten
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ResultsPage;