import React from "react";
import Seo from "@/components/Seo";
import Button from "@/components/ui/Button";
import SmartImage from "@/components/media/SmartImage";
import { Clock, Shield, Image as ImageIcon, ClipboardList, Sparkles, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HowItWorksPage: React.FC = () => {
  const navigate = useNavigate();

  const steps = [
    {
      icon: ClipboardList,
      title: "Beantwoord 6 vragen",
      text: "Vertel je stijlvoorkeuren en doelen. Klaar in minder dan 2 minuten.",
    },
    {
      icon: Sparkles,
      title: "Ontvang je AI Style Report",
      text: "Onze modellen vertalen je antwoorden (en optioneel je foto) naar een persoonlijk profiel.",
    },
    {
      icon: ShoppingBag,
      title: "Krijg outfits & shoplinks",
      text: "Je ziet concrete outfits die écht bij je passen en shopt gerichter op silhouet en kleurtemperatuur.",
    },
  ];

  return (
    <main id="main" className="bg-[var(--color-bg)] min-h-screen">
      <Seo
        title="Hoe het werkt — 3 rustige stappen | FitFi"
        description="Zo werkt FitFi: in 3 rustige stappen naar een persoonlijk AI Style Report met outfits en shoplinks. Privacy-first, zonder ruis."
        canonical="https://fitfi.ai/hoe-het-werkt"
        ogImage="/images/social/hiw-og.jpg"
      />

      {/* Hero block */}
      <section className="ff-section alt-bg">
        <div className="ff-container hiw-hero">
          <div className="hiw-hero-copy anim-fade-up">
            <p className="kicker">Privacy-first</p>
            <h1 className="section-title">AI-gestuurde styling in 3 rustige stappen</h1>
            <p className="lead">
              Onze computer vision en ML-modellen vertalen je antwoorden naar een stijlprofiel met outfits die werken
              voor jouw silhouet, materialen en kleurtemperatuur — zonder ruis.
            </p>

            <ul className="meta-chips" aria-label="Kernpunten">
              <li className="chip"><Clock size={14} aria-hidden /> Klaar in 2 minuten</li>
              <li className="chip"><Shield size={14} aria-hidden /> Privacy-first</li>
              <li className="chip"><ImageIcon size={14} aria-hidden /> Foto optioneel</li>
            </ul>

            <div className="cluster mt-3 anim-fade-up">
              <Button variant="primary" size="lg" className="cta-raise" onClick={() => navigate("/onboarding")}>
                Start gratis
              </Button>
              <Button variant="ghost" size="lg" onClick={() => navigate("/results")}>
                Bekijk voorbeeld
              </Button>
            </div>
          </div>

          <figure className="hiw-hero-visual anim-fade-up">
            <SmartImage
              id="hiw-diagram"
              kind="generic"
              alt="Schematische weergave van de drie stappen van het AI Style Report"
              className="h-full w-full object-cover"
            />
            <figcaption className="sr-only">
              Diagram met de drie stappen: vragen beantwoorden, persoonlijk profiel, outfits met shoplinks.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Trio cards */}
      <section className="ff-section">
        <div className="ff-container">
          <ol className="hiw-grid stagger-3" aria-label="Stappen">
            {steps.map((s) => (
              <li key={s.title} className="hiw-card card card-hover flow-sm">
                <span className="icon-chip" aria-hidden>
                  <s.icon size={16} />
                </span>
                <h2 className="card-title">{s.title}</h2>
                <p className="card-text">{s.text}</p>
              </li>
            ))}
          </ol>

          <p className="hiw-note text-[var(--color-muted)] mt-4">
            Bij elk outfit-advies tonen we <strong>waaróm</strong> het past: silhouet, materiaal, kleurtemperatuur,
            archetype en seizoen — helder, in 1–2 zinnen.
          </p>

          <div className="hiw-cta-rail cluster mt-6 anim-fade-up">
            <Button variant="primary" size="lg" className="cta-raise" onClick={() => navigate("/onboarding")}>
              Start je gratis AI Style Report
            </Button>
            <Button variant="ghost" size="lg" onClick={() => navigate("/pricing")}>
              Bekijk plannen
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HowItWorksPage;