import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import Seo from '@/components/Seo';
import Button from '@/components/ui/Button';
import { useUser } from '@/context/UserContext';
import SmartImage from '@/components/media/SmartImage';

const HomePage: React.FC = () => {
  const { user } = useUser();

  return (
    <>
      <Seo
        title="FitFi - AI Styling voor jouw perfecte outfit"
        description="Ontdek jouw unieke stijl met AI. Persoonlijke outfits met uitleg en shopbare suggesties — in 2 minuten."
        canonical="https://fitfi.ai/"
        keywords="AI personal stylist, outfit aanbevelingen, stijl quiz, fashion advies"
      />

      <main className="bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
        <section className="section">
          <div className="container grid grid-cols-1 gap-10 lg:grid-cols-12">
            {/* Copy */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="mb-6">
                <span className="chip chip--accent">
                  ✨ Gratis AI Style Report
                </span>
              </div>

              <h1 className="hero__title">
                Ontdek wat<br />jouw stijl<br />over je zegt
              </h1>

              <p className="lead mt-4 max-w-2xl">
                Krijg in 2&nbsp;minuten een gepersonaliseerd AI-rapport met outfits en shopbare aanbevelingen.
              </p>

              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm">
                <li className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[color:var(--color-success)]" />
                  100% Gratis
                </li>
                <li className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[color:var(--color-success)]" />
                  2 Minuten
                </li>
                <li className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[color:var(--color-success)]" />
                  Direct resultaat
                </li>
              </ul>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                {!user ? (
                  <>
                    <Button as={Link as any} to="/registreren" variant="primary" size="lg" aria-label="Start gratis">
                      Ja, geef mij mijn gratis AI Style Report
                    </Button>
                    <Button as={Link as any} to="/hoe-het-werkt" variant="ghost" size="lg" aria-label="Lees hoe het werkt">
                      Hoe het werkt
                    </Button>
                  </>
                ) : (
                  <>
                    <Button as={Link as any} to="/dashboard" variant="primary" size="lg" aria-label="Naar je dashboard">
                      Ga naar je dashboard
                    </Button>
                    <Button as={Link as any} to="/feed" variant="ghost" size="lg" aria-label="Bekijk je feed">
                      Bekijk de feed
                    </Button>
                  </>
                )}
              </div>

              <p className="mt-5 text-sm muted">
                Geen creditcard vereist · Privacy gegarandeerd · 10.000+ rapporten gegenereerd
              </p>
            </div>

            {/* Visual */}
            <div className="lg:col-span-5">
              <div className="card card--elevated overflow-hidden">
                <SmartImage
                  src="/images/hero/nova-hero.jpg"
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
      </main>
    </>
  );
};

export default HomePage;