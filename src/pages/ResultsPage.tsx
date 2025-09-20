import React from "react";
import Seo from "@/components/Seo";
import ResultsHeader from "@/components/results/ResultsHeader";
import WhyItFits from "@/components/results/WhyItFits";
import OutfitGrid from "@/components/results/OutfitGrid";
import ResultsSkeleton from "@/components/results/ResultsSkeleton";

// ———————————————————————————————————————————————————————————————
// Let op: we tonen ALTIJD iets.
// Als er (nog) geen data is, laten we editorial defaults zien i.p.v. een lege kaart.
// ———————————————————————————————————————————————————————————————

const defaults = {
  headerTitle: "Jouw stijlprofiel is klaar",
  headerSub:
    "Rustig, modern en tijdloos — met aandacht voor silhouet, materiaal en kleurtemperatuur.",
  badges: ["Koel neutraal", "Modern-rustig", "Smart casual"],
  why: [
    "Silhouet: taps toelopend i.p.v. skinny oogt evenwichtiger.",
    "Materiaal: matte breisels en suède verzachten — glans vermijden.",
    "Kleur: koele neutrale basis (off-white, grijsblauw, antraciet) werkt het best.",
    "Archetype: modern-rustig; vermijd grote logo's en harde contrasten.",
  ],
  outfits: [
    {
      id: "o1",
      title: "Minimal modern (casual smart)",
      items: [
        { name: "Gebreide polo", note: "lichtgewicht, zacht" },
        { name: "Tapered chino", note: "enkelvrij, clean" },
        { name: "Suède sneaker", note: "warm grijs" },
      ],
      shop: { label: "Shop vergelijkbare items", href: "/#" },
    },
    {
      id: "o2",
      title: "Soft monochrome (workday)",
      items: [
        { name: "Fijngebreide crew", note: "koel off-white" },
        { name: "Wolmix pantalon", note: "rechte pijp" },
        { name: "Leren loafer", note: "minimal buckle" },
      ],
      shop: { label: "Shop vergelijkbare items", href: "/#" },
    },
    {
      id: "o3",
      title: "Athflow weekend",
      items: [
        { name: "Merino zip hoodie" },
        { name: "Tech jogger", note: "mat, geen glans" },
        { name: "Retro runner" },
      ],
      shop: { label: "Shop vergelijkbare items", href: "/#" },
    },
  ],
};

const ResultsPage: React.FC = () => {
  // In de echte app zou je hier context / query-data lezen.
  // Voor nu forceren we 'loaded' zodat er nooit een lege pagina is.
  const isLoading = false;

  return (
    <main id="main" className="bg-[var(--color-bg)] min-h-screen">
      <Seo
        title="Jouw AI Style Report | FitFi"
        description="Je persoonlijke stijlprofiel met outfits en shoplinks — inclusief heldere uitleg waarom het past."
        canonical="https://fitfi.ai/results"
      />

      {isLoading ? (
        <ResultsSkeleton />
      ) : (
        <>
          {/* Editorial header + visual (rechts) */}
          <section className="ff-section bg-[var(--color-bg)]">
            <div className="ff-container grid items-start gap-10 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <ResultsHeader
                  title={defaults.headerTitle}
                  subtitle={defaults.headerSub}
                  badges={defaults.badges}
                />

                {/* CTA-rail */}
                <div className="mt-5 flex flex-wrap gap-3">
                  <a href="/onboarding" className="btn btn-primary">
                    Volgende outfit
                  </a>
                  <a href="/pricing" className="btn btn-ghost">
                    Meer outfits met Pro
                  </a>
                </div>

                {/* Waarom-uitleg (verplicht) */}
                <div className="mt-6 max-w-2xl">
                  <WhyItFits bullets={defaults.why} />
                </div>
              </div>

              {/* Visual kaart naast header — gradient + plinth (zero payload) */}
              <div className="lg:col-span-5">
                <div className="relative w-full ml-auto max-w-[680px]">
                  <div
                    aria-hidden="true"
                    className="block w-full h-auto aspect-[4/3] rounded-[var(--radius-2xl)] shadow-[var(--shadow-soft)]"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--ff-color-primary-600), var(--ff-color-primary-900))",
                    }}
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-3 left-1/2 h-3 w-[82%] -translate-x-1/2 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-soft)]"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Outfits-grid */}
          <OutfitGrid outfits={defaults.outfits as any} />

          {/* Footer-CTA */}
          <section className="ff-section bg-[var(--color-bg)]">
            <div className="ff-container flex flex-wrap items-center justify-between gap-4">
              <p className="section-intro m-0">
                Wil je meer varianten per silhouet en seizoen?
              </p>
              <a href="/pricing" className="btn btn-primary">
                Ontgrendel premium outfits
              </a>
            </div>
          </section>
        </>
      )}
    </main>
  );
};

export default ResultsPage;