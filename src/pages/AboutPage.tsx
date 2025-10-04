import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Heart, Users, Sparkles, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <main id="main" className="bg-[var(--color-bg)]">
      <Helmet>
        <title>Over Ons - FitFi</title>
        <meta name="description" content="Ontdek het verhaal achter FitFi en hoe wij jouw perfecte stijl helpen ontdekken met AI-technologie." />
      </Helmet>

      <div className="min-h-screen">
        <section className="pt-24 pb-16">
          <Container>
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-[var(--color-border)] mb-8">
                <Sparkles className="w-4 h-4 text-[var(--ff-color-primary-600)]" />
                <span className="text-sm font-medium text-[var(--color-text)]">Over FitFi</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--color-text)] mb-6 leading-tight">
                Jouw perfecte stijl
                <br />
                <span className="text-[var(--color-text-muted)]">begint hier</span>
              </h1>

              <p className="text-lg md:text-xl text-[var(--color-text-muted)] mb-12 max-w-3xl mx-auto leading-relaxed">
                Wij geloven dat iedereen een unieke stijl heeft. Met AI-technologie en persoonlijke
                begeleiding helpen wij je jouw perfecte look te ontdekken.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-[var(--ff-color-primary-600)] mb-2">10K+</div>
                  <div className="text-sm text-[var(--color-text-muted)]">Tevreden gebruikers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-[var(--ff-color-primary-600)] mb-2">50K+</div>
                  <div className="text-sm text-[var(--color-text-muted)]">Stijladviezen gegenereerd</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-[var(--ff-color-primary-600)] mb-2">95%</div>
                  <div className="text-sm text-[var(--color-text-muted)]">Tevredenheidscore</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button as={Link} to="/quiz" className="bg-[var(--ff-color-primary-700)] text-white">
                  Start gratis <ArrowRight className="w-4 h-4 inline ml-2" />
                </Button>
                <Button as={Link} to="/how-it-works" variant="secondary">
                  Hoe het werkt
                </Button>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-16 bg-[var(--color-surface)]">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-4">Onze Missie</h2>
              <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
                Mode toegankelijk maken voor iedereen, ongeacht budget of stijlkennis.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-[var(--ff-color-primary-100)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-[var(--ff-color-primary-600)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-text)] mb-3">Persoonlijk</h3>
                <p className="text-[var(--color-text-muted)]">
                  Unieke aanbevelingen gebaseerd op jouw voorkeuren en persoonlijkheid.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-[var(--ff-color-accent-100)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-[var(--ff-color-accent-600)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-text)] mb-3">Innovatief</h3>
                <p className="text-[var(--color-text-muted)]">
                  AI-gedreven technologie die jouw perfecte stijl vindt.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-[var(--ff-color-primary-100)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-[var(--ff-color-primary-600)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-text)] mb-3">Toegankelijk</h3>
                <p className="text-[var(--color-text-muted)]">
                  Mode voor iedereen, zonder gedoe of ingewikkelde jargon.
                </p>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-16">
          <Container>
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-4">Ons Verhaal</h2>
              </div>

              <div className="prose prose-lg max-w-none">
                <p className="text-[var(--color-text-muted)] mb-4 leading-relaxed">
                  FitFi.ai ontstond uit de wens om mode toegankelijk te maken voor iedereen.
                  We zagen dat velen worstelden met het vinden van hun perfecte stijl -
                  niet door gebrek aan interesse, maar door het overweldigende aanbod en gebrek aan persoonlijk advies.
                </p>
                <p className="text-[var(--color-text-muted)] mb-4 leading-relaxed">
                  Met de kracht van AI-technologie bieden we nu persoonlijke stijladviezen
                  die echt bij jou passen. Geen onesize-fits-all oplossingen, maar unieke aanbevelingen
                  gebaseerd op jouw persoonlijkheid, voorkeuren en levensstijl.
                </p>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-16 bg-[var(--color-surface)]">
          <Container>
            <div className="text-center max-w-2xl mx-auto">
              <TrendingUp className="w-12 h-12 text-[var(--ff-color-primary-600)] mx-auto mb-6" />
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text)] mb-4">
                Klaar om te beginnen?
              </h2>
              <p className="text-lg text-[var(--color-text-muted)] mb-8">
                Ontdek in 2 minuten jouw perfecte stijl met onze gratis quiz.
              </p>
              <Button as={Link} to="/quiz" className="bg-[var(--ff-color-primary-700)] text-white">
                Start jouw stijlreis <ArrowRight className="w-4 h-4 inline ml-2" />
              </Button>
            </div>
          </Container>
        </section>
      </div>
    </main>
  );
}
