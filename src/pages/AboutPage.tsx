import React from "react";
import Seo from "@/components/Seo";
import SmartImage from "@/components/media/SmartImage";

const AboutPage: React.FC = () => {
  const values = [
    {
      icon: "shield",
      title: "Privacy-first",
      text:
        "We verwerken zo weinig mogelijk data en kiezen standaard voor veilige, transparante keuzes. Jij houdt regie.",
    },
    {
      icon: "sparkles",
      title: "Rustige precisie",
      text:
        "Onze computer vision en ML-modellen vertalen antwoorden naar heldere stijlprofielen — zonder ruis.",
    },
    {
      icon: "heart",
      title: "Minder miskopen",
      text:
        "Concreet advies met outfits die écht bij je passen. Zo bouw je rust in je garderobe en koop je bewuster.",
    },
  ];

  const team = [
    { name: "Nova", role: "AI & UX", id: "team-nova" },
    { name: "Milan", role: "Product", id: "team-milan" },
    { name: "Sanne", role: "Styling", id: "team-sanne" },
  ];

  return (
    <main id="main" className="bg-[var(--color-bg)] min-h-screen">
      <Seo
        title="Over FitFi — AI-gestuurde styling, privacy-first"
        description="Wij bouwen rustige, precieze stijltools die werken voor jouw silhouet en kleurtemperatuur — met respect voor privacy."
        canonical="https://fitfi.ai/over-ons"
        ogImage="/images/social/about-og.jpg"
      />

      {/* Intro */}
      <section className="ff-section ff-container">
        <header className="flow-lg max-w-3xl">
          <h1 className="section-title">Over FitFi</h1>
          <p className="text-[var(--color-muted)]">
            FitFi is een premium platform voor AI-gestuurde styling. We vertalen jouw antwoorden naar een persoonlijk
            stijlprofiel en outfits die kloppen voor silhouet, materialen en kleurtemperatuur — helder, zonder ruis.
          </p>
        </header>
      </section>

      {/* Waarden */}
      <section className="ff-section alt-bg">
        <div className="ff-container">
          <h2 className="section-title mb-6">Onze waarden</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((v) => (
              <article
                key={v.title}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-soft)] flow-sm"
              >
                {/* Simple icon dots i.p.v. externe icon lib; tokens-first */}
                <span
                  aria-hidden
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--ff-color-neutral-50)]"
                />
                <h3 className="font-semibold text-[var(--color-text)]">{v.title}</h3>
                <p className="text-[var(--color-muted)]">{v.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Team (editorial) */}
      <section className="ff-section ff-container">
        <h2 className="section-title mb-6">Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {team.map((m) => (
            <article
              key={m.name}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-soft)]"
            >
              <div className="aspect-[4/5] bg-[var(--color-surface)]">
                <SmartImage
                  id={m.id}
                  kind="generic"
                  alt={`${m.name} — ${m.role}`}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-[var(--color-text)]">{m.name}</h3>
                <p className="text-[var(--color-muted)] text-sm">{m.role}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

export default AboutPage;