import React from "react";
import Seo from "@/components/Seo";
import ResultsHeader from "@/components/results/ResultsHeader";
import WhyItFits from "@/components/results/WhyItFits";
import OutfitGrid from "@/components/results/OutfitGrid";
import ResultsSkeleton from "@/components/results/ResultsSkeleton";

type Outfit = React.ComponentProps<typeof OutfitGrid>["outfits"][number];

const mockOutfits: Outfit[] = [
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
];

const ResultsPage: React.FC = () => {
  // TODO: vervang later door echte data/loader
  const isLoading = false;

  const whyBullets = [
    "Silhouet: je staat beter met een iets taps toelopende lijn i.p.v. skinny.",
    "Materiaal: matte breisels en suède verzachten — glans vermijden.",
    "Kleur: koele neutrale basis (off-white, grijsblauw, antraciet) werkt het best.",
    "Archetype: modern-rustig; vermijd grote logo's en drukke contrasten.",
  ];

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
          {/* Hero-achtige header + korte context */}
          <section className="ff-section bg-[var(--color-bg)]">
            <div className="ff-container grid items-start gap-10 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <ResultsHeader
                  title="Jouw stijlprofiel is klaar"
                  subtitle="Rustig, modern en tijdloos — met aandacht voor silhouet, materiaal en kleurtemperatuur."
                  badges={["Koel neutraal", "Modern-rustig", "Smart casual"]}
                />

                {/* CTA rail */}
                <div className="mt-5 flex flex-wrap gap-3">
                  <a href="/onboarding" className="btn btn-primary">
                    Volgende outfit
                  </a>
                  <a href="/pricing" className="btn btn-ghost">
                    Meer outfits met Pro
                  </a>
                </div>

                {/* Uitleg */}
                <div className="mt-6 max-w-2xl">
                  <WhyItFits bullets={whyBullets} />
                </div>
              </div>

              {/* Visual kaart naast header */}
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

          {/* Outfits */}
          <OutfitGrid outfits={mockOutfits} />

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