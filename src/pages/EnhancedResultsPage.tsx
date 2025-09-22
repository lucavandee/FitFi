import React from "react";
import SmartImage from "@/components/ui/SmartImage";

const EnhancedResultsPage: React.FC = () => {
  // Mock data voor outfit kaarten
  const outfits = [
    {
      id: 1,
      title: "Smart casual (dagelijks)",
      bullets: [
        "Netter denim — rechte pijp",
        "Witte sneaker — minimal", 
        "Licht overshirt — koele tint"
      ],
      images: [
        "/images/fallbacks/top.jpg",
        "/images/fallbacks/bottom.jpg", 
        "/images/fallbacks/footwear.jpg",
        "/images/fallbacks/accessory.jpg"
      ]
    },
    {
      id: 2,
      title: "Business casual (werk)",
      bullets: [
        "Donkere chino — tailored fit",
        "Wit overhemd — classic collar",
        "Loafers — leer, donkerbruin"
      ],
      images: [
        "/images/fallbacks/top.jpg",
        "/images/fallbacks/bottom.jpg",
        "/images/fallbacks/footwear.jpg", 
        "/images/fallbacks/accessory.jpg"
      ]
    },
    {
      id: 3,
      title: "Weekend casual (vrij)",
      bullets: [
        "Relaxed jeans — vintage wash",
        "Basic tee — neutrale kleur",
        "Canvas sneakers — wit/off-white"
      ],
      images: [
        "/images/fallbacks/top.jpg",
        "/images/fallbacks/bottom.jpg",
        "/images/fallbacks/footwear.jpg",
        "/images/fallbacks/accessory.jpg"
      ]
    }
  ];

  return (
    <main className="res-container">
      {/* 1) Hero */}
      <section className="res-hero">
        <p className="eyebrow">Onze aanbeveling</p>
        <h1 className="res-hero__title">
          Dit past bij jouw stijl — <span>clean, smart-casual</span>
        </h1>
        <p className="res-hero__sub">
          We kozen voor een cleane, smart-casual look: netter denim, witte sneaker en licht overshirt — minimalistisch en comfortabel.
        </p>

        <div className="res-hero__cta">
          <button className="btn btn-primary">Shop deze look</button>
          <button className="btn btn-ghost">Nieuwe analyse</button>
        </div>

        <ul className="chips" aria-label="USP's">
          <li className="chip chip--active">100% gratis</li>
          <li className="chip">Klaar in 2 min</li>
          <li className="chip">Outfits + shoplinks</li>
          <li className="chip">Privacy-first</li>
        </ul>
      </section>

      {/* Hero Preview Tiles */}
      <div className="res-hero-preview">
        <div className="preview-tile" />
        <div className="preview-tile" />
      </div>

      {/* 2) Grid met kaarten */}
      <section aria-labelledby="outfits-heading">
        <h2 id="outfits-heading" className="sr-only">Outfits</h2>

        <div className="res-grid">
          {outfits.map((outfit, index) => (
            <article key={outfit.id} className="res-card">
              <div className="res-card__mosaic">
                {outfit.images.map((img, i) => (
                  <SmartImage
                    key={i}
                    src={img}
                    alt=""
                    aspectRatio={1}
                    className="res-card__tile"
                    fetchPriority={index === 0 && i === 0 ? "high" : "auto"}
                  />
                ))}
              </div>

              <div className="res-card__body">
                <h3 className="res-card__title">{outfit.title}</h3>
                <ul className="res-card__bullets">
                  {outfit.bullets.map((bullet, i) => (
                    <li key={i}>{bullet}</li>
                  ))}
                </ul>
                <a href="#" className="link-cta">Shop vergelijkbare items</a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

export default EnhancedResultsPage;