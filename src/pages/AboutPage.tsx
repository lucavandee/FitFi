import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Heart, Users, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Helmet>
        <title>Over ons - FitFi.ai</title>
        <meta name="description" content="Wij geloven dat iedereen recht heeft op een stijl die bij hen past. Ontdek ons verhaal, onze missie en het team achter FitFi.ai." />
      </Helmet>

      <div className="min-h-screen bg-[var(--color-bg)]">
        <div className="relative overflow-hidden bg-gradient-to-br from-[var(--color-bg)] via-[var(--color-surface)] to-[var(--color-bg)]">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[var(--ff-color-primary-200)] to-[var(--ff-color-primary-300)] rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-[var(--ff-color-accent-200)] to-[var(--ff-color-accent-300)] rounded-full opacity-20 blur-3xl"></div>
          </div>

          <Container>
            <div className="relative py-24 text-center">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-5xl md:text-6xl font-bold text-[var(--color-text)] mb-6 leading-tight">
                  Over <span className="bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] bg-clip-text text-transparent">FitFi.ai</span>
                </h1>
                <p className="text-xl text-[var(--color-text-muted)] mb-8 leading-relaxed max-w-2xl mx-auto">
                  Wij geloven dat iedereen recht heeft op een stijl die bij hen past.
                  Ontdek ons verhaal, onze missie en het team achter FitFi.ai.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    as={Link}
                    to="/quiz"
                    className="bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-2"
                  >
                    Start gratis <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button
                    as={Link}
                    to="/contact"
                    variant="ghost"
                    className="border border-[var(--color-border)] hover:border-[var(--ff-color-primary-400)] px-8 py-3 rounded-xl font-medium transition-all duration-300 hover:bg-[var(--color-surface)]"
                  >
                    Contact opnemen
                  </Button>
                </div>
              </div>
            </div>
          </Container>
        </div>

        <Container>
          <div className="py-16">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-[var(--color-text)] mb-4">
                Onze Missie
              </h2>
              <p className="text-lg text-[var(--color-text-muted)] max-w-3xl mx-auto">
                Bij FitFi.ai maken we mode toegankelijk voor iedereen. Door de kracht van AI combineren we
                persoonlijke stijl met praktische aanbevelingen, zodat je altijd vol vertrouwen de deur uit gaat.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-[var(--ff-color-primary-500)] to-[var(--ff-color-primary-600)] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-text)] mb-3">Persoonlijk</h3>
                <p className="text-[var(--color-text-muted)] leading-relaxed">
                  Elke aanbeveling is uniek en afgestemd op jouw persoonlijke stijl, lichaamsbouw en voorkeuren.
                </p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-[var(--ff-color-accent-500)] to-[var(--ff-color-accent-600)] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-text)] mb-3">Innovatief</h3>
                <p className="text-[var(--color-text-muted)] leading-relaxed">
                  We gebruiken de nieuwste AI-technologie om jouw perfecte stijl te vinden en te verfijnen.
                </p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-text)] mb-3">Toegankelijk</h3>
                <p className="text-[var(--color-text-muted)] leading-relaxed">
                  Mode voor iedereen, ongeacht budget, lichaamsbouw of ervaring met styling.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[var(--color-surface)] to-[var(--color-bg)] rounded-2xl p-12 border border-[var(--color-border)] mb-16">
              <div className="max-w-3xl mx-auto text-center">
                <h3 className="text-2xl font-bold text-[var(--color-text)] mb-6">
                  Ons Verhaal
                </h3>
                <p className="text-[var(--color-text-muted)] leading-relaxed mb-6">
                  FitFi.ai ontstond uit de frustratie dat mode vaak ontoegankelijk en overweldigend kan zijn.
                  Te veel keuzes, te weinig tijd, en vaak geen idee wat er echt bij je past.
                </p>
                <p className="text-[var(--color-text-muted)] leading-relaxed mb-6">
                  Ons team van mode-experts en AI-specialisten heeft een platform gecreëerd dat de complexiteit
                  wegneemt en jou helpt om je beste zelf te zijn. Elke dag opnieuw.
                </p>
                <p className="text-[var(--color-text-muted)] leading-relaxed">
                  Vandaag helpen we duizenden mensen om hun perfecte stijl te vinden. En dat is nog maar het begin.
                </p>
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-2xl font-bold text-[var(--color-text)] mb-4">
                Klaar om jouw verhaal te beginnen?
              </h3>
              <p className="text-[var(--color-text-muted)] mb-8 max-w-xl mx-auto">
                Sluit je aan bij duizenden tevreden gebruikers en ontdek jouw perfecte stijl met FitFi.ai.
              </p>
              <Button
                as={Link}
                to="/quiz"
                className="bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg inline-flex items-center gap-2"
              >
                Start jouw stijlreis <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Container>
      </div>
    </main>
  );
}
