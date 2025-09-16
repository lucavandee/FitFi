import React from 'react';
import Seo from '@/components/Seo';
import Button from '@/components/ui/Button';
import SmartImage from '@/components/media/SmartImage';
import ErrorBoundary from '@/components/ErrorBoundary';

const usp = [
  { title: 'AI-Powered Styling', desc: 'Onze AI vertaalt jouw voorkeuren en silhouet naar outfits met uitleg.' },
  { title: 'Onafhankelijk advies', desc: 'Geen gesponsorde push; we optimaliseren voor jouw stijl en budget.' },
  { title: 'Duurzaam & tijdloos', desc: 'Kwaliteit boven kwantiteit. Bewuste keuzes, seizoens-ready.' },
  { title: 'Privacy-first', desc: 'Alleen data die nodig is voor je advies. Transparant en controleerbaar.' },
];

const AboutPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <Seo
        title="Over ons — Waarom kiezen mensen voor FitFi?"
        description="Wij combineren AI en stijlkennis voor persoonlijk, onafhankelijk stylingadvies. Premium ervaring, privacy-first."
        canonical="https://www.fitfi.ai/over-ons"
      />
      <main className="bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
        {/* Hero */}
        <section className="section">
          <div className="container grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <span className="chip chip--accent">Onze missie</span>
              <h1 className="hero__title mt-2">AI-styling die je écht begrijpt</h1>
              <p className="lead mt-3 max-w-2xl">
                Wij bouwen een stylist die je smaak, context en silhouet snapt — en dit vertaalt naar outfits met
                heldere uitleg en directe opties om te shoppen of te combineren met wat je al hebt.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button as="a" href="/registreren" variant="primary" size="lg">Start gratis</Button>
                <Button as="a" href="/hoe-het-werkt" variant="ghost" size="lg">Hoe het werkt</Button>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="card card--elevated overflow-hidden">
                <SmartImage src="/images/about/team-nova.jpg" alt="FitFi — team & Nova" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </section>

        {/* USP's */}
        <section className="section">
          <div className="container">
            <div className="grid gap-4 md:grid-cols-2">
              {usp.map((u) => (
                <article key={u.title} className="subcard">
                  <div className="subcard__inner">
                    <h3 className="subcard__title">{u.title}</h3>
                    <p className="subcard__kicker">{u.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Trust */}
        <section className="section">
          <div className="container card card--elevated">
            <div className="card__inner">
              <h2 className="card__title">Transparantie & privacy</h2>
              <p className="mt-2 muted">
                We verzamelen alleen wat nodig is om je outfits te genereren. Je data blijft van jou — altijd in te zien en te verwijderen.
              </p>
              <div className="mt-4">
                <a href="/privacy" className="link">Lees onze privacyverklaring</a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </ErrorBoundary>
  );
};

export default AboutPage;