import React from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";

type OutfitCard = {
  id: string;
  title: string;
  bullets: string[];
  img?: string; // optioneel; gradient fallback als je nog geen afbeeldingen hebt
  alt?: string;
  link: string;
};

const OUTFITS: OutfitCard[] = [
  {
    id: "smart-casual",
    title: "Smart casual (dagelijks)",
    bullets: [
      "Netter denim — rechte pijp",
      "Witte sneaker — minimal",
      "Licht overshirt — koele tint",
    ],
    // img: "/images/outfits/smart-casual.jpg",
    alt: "Smart casual look",
    link: "#smart-casual",
  },
  {
    id: "mono-workday",
    title: "Monochrome workday",
    bullets: [
      "Fijngebreide crew — off-white",
      "Wolmix pantalon — rechte pijp",
      "Leren loafer — clean buckle",
    ],
    // img: "/images/outfits/monochrome-workday.jpg",
    alt: "Monochrome workday",
    link: "#mono-workday",
  },
  {
    id: "athflow-weekend",
    title: "Athflow weekend",
    bullets: ["Merino zip hoodie", "Tech jogger", "Minimal runner"],
    // img: "/images/outfits/athflow-weekend.jpg",
    alt: "Athflow weekend",
    link: "#athflow-weekend",
  },
];

const ResultsPremium: React.FC = () => {
  return (
    <main id="main" className="min-h-screen bg-[var(--color-bg)]">
      <Seo
        title="Jouw AI Style Resultaten | FitFi"
        description="Op maat gemaakte outfits die passen bij jouw silhouet en smaak — met slimme shoplinks. Privacy-first, klaar in 2 minuten."
        canonical="https://fitfi.ai/results"
      />

      {/* Editorial header */}
      <section className="py-10 sm:py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-widest text-[var(--color-muted)] uppercase">
            Onze aanbeveling
          </p>

          <h1 className="mt-2 text-[clamp(1.75rem,3.2vw,2.5rem)] font-semibold leading-tight text-[var(--color-text)]">
            Dit past bij jouw stijl — clean, smart-casual
          </h1>

          <p className="mt-3 max-w-2xl text-[var(--color-muted)]">
            We kozen voor een cleane, smart-casual look: netter denim, witte
            sneaker en licht overshirt — minimalistisch en comfortabel.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              to="/onboarding"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-semibold text-white bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] shadow-sm"
            >
              Shop deze look
            </Link>
            <Link
              to="/quiz"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-semibold border border-[var(--color-border)] bg-[var(--ff-color-neutral-50)] text-[var(--color-text)] hover:border-[var(--ff-color-primary-400)]"
            >
              Nieuwe analyse
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {["100% gratis", "Klaar in 2 min", "Outfits + shoplinks", "Privacy-first"].map((c) => (
              <span
                key={c}
                className="rounded-full border border-[var(--color-border)] bg-[var(--ff-color-neutral-50)] text-[var(--color-muted)] px-2.5 py-1 text-sm"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="py-10 sm:py-14 bg-[var(--color-bg)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {OUTFITS.map((o) => (
              <article
                key={o.id}
                className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-[0_1px_0_rgba(15,23,42,.02)] hover:shadow-[0_10px_30px_rgba(2,8,23,.08)] transition"
              >
                <div className="relative aspect-[4/3] bg-gradient-to-br from-[#1e40af] to-[#0b1025]">
                  {o.img && (
                    <img
                      src={o.img}
                      alt={o.alt || ""}
                      loading="lazy"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                </div>

                <div className="p-4 sm:p-5">
                  <h3 className="text-lg font-semibold text-[var(--color-text)]">{o.title}</h3>
                  <ul className="mt-2 space-y-1 text-[var(--color-muted)]">
                    {o.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>

                  <Link
                    to={o.link}
                    className="mt-3 inline-flex text-[var(--color-primary)] hover:underline"
                  >
                    Shop vergelijkbare items
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Premium rail */}
          <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white border border-[var(--color-border)] p-4 sm:p-5">
            <p className="text-[var(--color-muted)]">
              Meer varianten per silhouet en seizoen? Ontgrendel premium outfits.
            </p>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-semibold text-white bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] shadow-sm"
            >
              Ontgrendel premium
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ResultsPremium;