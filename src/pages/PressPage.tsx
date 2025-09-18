import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Seo from "@/components/Seo";
import Button from "@/components/ui/Button";
import PressLogoBelt from "@/components/landing/PressLogoBelt";

const boilerplate =
  "FitFi is een premium, rustige styling-ervaring met AI. In twee minuten vertalen we je voorkeuren naar een helder stijlprofiel met outfits en slimme shoplinks — privacy-first, zonder ruis.";

const PressPage: React.FC = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(boilerplate);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main id="main" className="bg-[var(--color-bg)] min-h-screen">
      <Seo
        title="Pers & media — presskit, boilerplate en richtlijnen | FitFi"
        description="Pers & media: korte boilerplate om over FitFi te schrijven, merk-richtlijnen en contact voor interviews of beeld."
        canonical="https://fitfi.ai/pers"
        ogImage="/images/social/press-og.jpg"
      />

      {/* HERO */}
      <section className="ff-section alt-bg">
        <div className="ff-container press-hero">
          <div className="press-hero-copy">
            <p className="kicker">Pers & media</p>
            <h1 className="section-title">Alles om snel en correct over FitFi te schrijven</h1>
            <p className="lead">
              Gebruik de korte boilerplate, bekijk onze merk-richtlijnen en neem contact op voor interviews,
              beeld of aanvullende informatie.
            </p>
            <div className="cluster mt-3">
              <Button variant="primary" size="lg" className="cta-raise" onClick={() => navigate("/contact")}>
                Perscontact
              </Button>
              <Button variant="ghost" size="lg" onClick={copy}>
                {copied ? "Gekopieerd" : "Kopieer boilerplate"}
              </Button>
            </div>
          </div>

          <div className="press-hero-aside">
            <div className="boilerplate card">
              <h2 className="card-title mb-1">Boilerplate</h2>
              <p className="card-text">{boilerplate}</p>
              <div className="mt-2">
                <Button variant="ghost" size="sm" onClick={copy}>
                  {copied ? "Gekopieerd" : "Kopieer tekst"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MEDIA / LOGOS (chips fallback) */}
      <section className="ff-section">
        <div className="ff-container">
          <header className="flow-sm max-w-3xl">
            <h2 className="section-title">Gezien in</h2>
            <p className="text-[var(--color-muted)]">Selectie van platforms die over ons schrijven.</p>
          </header>
          <PressLogoBelt className="mt-3" /* useLogos={true} zodra assets klaar zijn */ />
        </div>
      </section>

      {/* BRAND GUIDELINES */}
      <section className="ff-section alt-bg">
        <div className="ff-container">
          <header className="flow-sm max-w-3xl">
            <h2 className="section-title">Merk-richtlijnen</h2>
            <p className="text-[var(--color-muted)]">Kernregels om FitFi correct te vermelden.</p>
          </header>

          <div className="press-guidelines">
            <article className="card flow-sm">
              <h3 className="card-title">Naam & schrijfwijze</h3>
              <ul className="press-list">
                <li>Schrijf "FitFi" (hoofdletter F + F).</li>
                <li>Gebruik "AI Style Report" als productnaam voor het gratis rapport.</li>
              </ul>
            </article>

            <article className="card flow-sm">
              <h3 className="card-title">Toon & claims</h3>
              <ul className="press-list">
                <li>Rustig, helder en privacy-first; geen hyperbole of misleidende claims.</li>
                <li>Noem concrete voordelen: sneller kiezen, minder miskopen, duidelijke uitleg per outfit.</li>
              </ul>
            </article>

            <article className="card flow-sm">
              <h3 className="card-title">Beeldgebruik</h3>
              <ul className="press-list">
                <li>Gebruik rustige UI-screens (licht/beige palet). Geen drukke collages.</li>
                <li>Vermeld bron bij externe fotografie; respecteer rechten.</li>
              </ul>
            </article>
          </div>

          <div className="cluster mt-4">
            <Link to="/contact" className="btn">Aanvragen: beeld & logo's</Link>
            <Link to="/blog" className="btn ghost">Naar blog</Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default PressPage;