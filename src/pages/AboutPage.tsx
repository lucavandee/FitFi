import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Heart, Users, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <main id="main" className="bg-[var(--color-bg)]">
      <Helmet>
        <title>Over ons - FitFi.ai</title>
        <meta name="description" content="Ontdek het verhaal achter FitFi.ai en hoe wij jouw perfecte stijl helpen ontdekken." />
      </Helmet>

      <div className="min-h-screen">
        <section className="relative py-24 bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-bg)]">
          <Container>
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-[var(--color-text)] mb-6">
                Over <span className="text-[var(--ff-color-primary-600)]">FitFi.ai</span>
              </h1>
              <p className="text-xl text-[var(--color-text-muted)] mb-8 leading-relaxed">
                Wij geloven dat iedereen recht heeft op een stijl die bij hen past.
              </p>
              <div className="flex gap-4 justify-center">
                <Button as={Link} to="/quiz" className="bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] text-white">
                  Start gratis <ArrowRight className="w-4 h-4 inline ml-2" />
                </Button>
                <Button as={Link} to="/contact" variant="ghost">
                  Contact
                </Button>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-16">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[var(--color-text)] mb-4">Onze Missie</h2>
              <p className="text-lg text-[var(--color-text-muted)] max-w-3xl mx-auto">
                Mode toegankelijk maken voor iedereen.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[var(--ff-color-primary-100)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-[var(--ff-color-primary-600)]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Persoonlijk</h3>
                <p className="text-[var(--color-text-muted)]">
                  Unieke aanbevelingen voor jouw stijl.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-[var(--ff-color-accent-100)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-[var(--ff-color-accent-600)]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Innovatief</h3>
                <p className="text-[var(--color-text-muted)]">
                  AI-gedreven stijladvies.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-[var(--ff-color-primary-100)] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-[var(--ff-color-primary-600)]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Toegankelijk</h3>
                <p className="text-[var(--color-text-muted)]">
                  Voor iedereen, elk budget.
                </p>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-16 bg-[var(--color-surface)]">
          <Container>
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-2xl font-bold mb-6">Ons Verhaal</h3>
              <p className="text-[var(--color-text-muted)] leading-relaxed mb-4">
                FitFi.ai ontstond uit de wens om mode toegankelijk te maken.
              </p>
              <p className="text-[var(--color-text-muted)] leading-relaxed">
                Vandaag helpen we duizenden mensen hun perfecte stijl te vinden.
              </p>
            </div>
          </Container>
        </section>

        <section className="py-16">
          <Container>
            <div className="text-center max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">Klaar om te beginnen?</h3>
              <p className="text-[var(--color-text-muted)] mb-8">
                Ontdek jouw perfecte stijl met FitFi.ai.
              </p>
              <Button as={Link} to="/quiz" className="bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] text-white">
                Start jouw stijlreis <ArrowRight className="w-4 h-4 inline ml-2" />
              </Button>
            </div>
          </Container>
        </section>
      </div>
    </main>
  );
}
