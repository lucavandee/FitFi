import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import Seo from '@/components/Seo';
import Button from '@/components/ui/Button';
import { useUser } from '@/context/UserContext';

const HomePage: React.FC = () => {
  const { user } = useUser();

  return (
    <>
      <Seo 
        title="FitFi - AI Styling voor jouw perfecte outfit"
        description="Ontdek jouw unieke stijl met AI-powered aanbevelingen. Persoonlijke styling op basis van jouw voorkeuren en silhouet."
        canonical="https://fitfi.ai/"
        keywords="AI personal stylist, outfit aanbevelingen, stijl quiz, fashion advies"
      />

      <section className="bg-bg">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-20">
          {/* Copy */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--overlay-accent-08a)] px-3 py-1 text-sm text-[color:var(--color-text)]">
                <span aria-hidden="true">✨</span>
                Gratis AI Style Report
              </span>
            </div>

            <h1 className="ff-heading text-[color:var(--color-text)] text-4xl font-extrabold leading-[1.1] sm:text-5xl lg:text-6xl">
              Ontdek wat<br />jouw stijl<br />over je zegt
            </h1>

            <p className="mt-5 max-w-2xl text-lg text-[color:var(--color-muted)]">
              Krijg in 2&nbsp;minuten een gepersonaliseerd AI-rapport met outfits en shopbare aanbevelingen.
            </p>

            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[color:var(--color-text)]">
              <li className="inline-flex items-center gap-2">
                <CheckCircle2 style={{ color: "var(--color-success)" }} className="h-4 w-4" />
                100% Gratis
              </li>
              <li className="inline-flex items-center gap-2">
                <CheckCircle2 style={{ color: "var(--color-success)" }} className="h-4 w-4" />
                2 Minuten
              </li>
              <li className="inline-flex items-center gap-2">
                <CheckCircle2 style={{ color: "var(--color-success)" }} className="h-4 w-4" />
                Direct resultaat
              </li>
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {!user ? (
                <>
                  <Button 
                    as={Link} 
                    to="/onboarding" 
                    variant="primary" 
                    size="lg"
                    aria-label="Start de stijltest"
                  >
                    Ontvang je AI Style Report
                  </Button>
                  <Button 
                    as={Link} 
                    to="/hoe-het-werkt" 
                    variant="ghost" 
                    size="lg"
                    aria-label="Lees hoe FitFi werkt"
                  >
                    Hoe het werkt
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    as={Link} 
                    to="/dashboard" 
                    variant="primary" 
                    size="lg"
                    aria-label="Naar je dashboard"
                  >
                    Ga naar je dashboard
                  </Button>
                  <Button 
                    as={Link} 
                    to="/feed" 
                    variant="ghost" 
                    size="lg"
                    aria-label="Bekijk je feed"
                  >
                    Bekijk de feed
                  </Button>
                </>
              )}
            </div>

            <p className="mt-5 text-sm text-[color:var(--color-muted)]">
              Geen creditcard vereist · Privacy gegarandeerd · 10.000+ rapporten gegenereerd
            </p>
          </div>

          {/* Visual */}
          <div className="lg:col-span-5">
            <div className="hero-shell relative mx-auto w-full max-w-md overflow-hidden rounded-[var(--radius-2xl)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-[var(--shadow-soft)]">
              <img
                src="/images/hero/nova.jpg"
                alt="Nova AI — jouw stylist"
                loading="eager"
                decoding="async"
                className="block h-full w-full object-cover"
              />
            </div>
            <div className="h-2" />
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;