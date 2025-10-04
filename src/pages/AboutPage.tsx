import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Container } from '@/components/layout/Container';
import { Users, Target, Award, Heart, Sparkles, TrendingUp } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>Over FitFi - Jouw perfecte stijl begint hier</title>
        <meta name="description" content="Ontdek het verhaal achter FitFi en hoe wij AI-technologie gebruiken om jouw perfecte stijl te vinden." />
      </Helmet>

      <div className="min-h-screen bg-[var(--color-bg)]">
        {/* Hero Section */}
        <section className="relative py-20">
          <Container>
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[var(--color-border)] rounded-full text-sm text-[var(--color-text-muted)] mb-8">
                <span className="text-[var(--color-primary)]">✨</span>
                Over FitFi
              </div>

              {/* Main heading */}
              <h1 className="text-4xl md:text-6xl font-bold text-[var(--color-text)] mb-6 leading-tight">
                Jouw perfecte stijl
                <br />
                <span className="text-[var(--color-primary)]">begint hier</span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl text-[var(--color-text-secondary)] mb-12 max-w-3xl mx-auto leading-relaxed">
                Wij geloven dat iedereen een unieke stijl heeft. Met AI-technologie en 
                persoonlijke begeleiding helpen wij je jouw perfecte look te ontdekken.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[var(--color-primary)] mb-2">10K+</div>
                  <div className="text-sm text-[var(--color-text-secondary)]">Tevreden gebruikers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[var(--color-primary)] mb-2">50K+</div>
                  <div className="text-sm text-[var(--color-text-secondary)]">Outfits gecreëerd</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[var(--color-primary)] mb-2">98%</div>
                  <div className="text-sm text-[var(--color-text-secondary)]">Tevredenheid</div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Mission Section */}
        <section className="py-16">
          <Container>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-[var(--color-text)] mb-6">
                Onze missie
              </h2>
              <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed">
                Wij maken stijladvies toegankelijk voor iedereen door de kracht van AI te combineren 
                met menselijke expertise en persoonlijke aandacht.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">
                      Persoonlijk & Precies
                    </h3>
                    <p className="text-[var(--color-text-secondary)]">
                      Elke stijlanalyse is uniek en gebaseerd op jouw persoonlijke voorkeuren, 
                      lichaamsbouw en levensstijl.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">
                      Altijd Up-to-date
                    </h3>
                    <p className="text-[var(--color-text-secondary)]">
                      Onze AI leert continu van de nieuwste trends en past zich aan 
                      aan jouw evoluerende smaak.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">
                      Met Liefde Gemaakt
                    </h3>
                    <p className="text-[var(--color-text-secondary)]">
                      Elk detail is zorgvuldig ontworpen om jou te helpen je 
                      zelfverzekerder en mooier te voelen.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-accent)]/10 rounded-3xl flex items-center justify-center">
                  <div className="w-32 h-32 bg-[var(--color-primary)]/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-16 h-16 text-[var(--color-primary)]" />
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Values Section */}
        <section className="py-16">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[var(--color-text)] mb-4">
                Onze waarden
              </h2>
              <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
                Deze principes staan centraal in alles wat wij doen
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-[var(--color-border)] hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-[var(--color-primary)]/10 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-[var(--color-primary)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-text)] mb-4">
                  Inclusiviteit
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  Stijl is voor iedereen. Wij omarmen alle lichaamstypes, budgetten 
                  en persoonlijke voorkeuren zonder oordeel.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-[var(--color-border)] hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-[var(--color-primary)]/10 rounded-2xl flex items-center justify-center mb-6">
                  <Award className="w-8 h-8 text-[var(--color-primary)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-text)] mb-4">
                  Kwaliteit
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  Wij streven naar excellentie in elke aanbeveling en zorgen ervoor 
                  dat je altijd de beste stijladvies krijgt.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-[var(--color-border)] hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-[var(--color-primary)]/10 rounded-2xl flex items-center justify-center mb-6">
                  <Sparkles className="w-8 h-8 text-[var(--color-primary)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-text)] mb-4">
                  Innovatie
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  Wij blijven vooroplopen met de nieuwste technologieën om jouw 
                  stijlervaring steeds beter te maken.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* Story Section */}
        <section className="py-16">
          <Container>
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-[var(--color-text)] mb-8">
                  Ons verhaal
                </h2>
                <div className="prose prose-lg max-w-none text-[var(--color-text-secondary)] leading-relaxed space-y-6">
                  <p>
                    FitFi ontstond uit een simpele observatie: iedereen verdient het om zich 
                    goed te voelen in hun kleding, maar niet iedereen heeft toegang tot 
                    persoonlijk stijladvies.
                  </p>
                  <p>
                    Door de kracht van kunstmatige intelligentie te combineren met jarenlange 
                    expertise in mode en styling, hebben wij een platform gecreëerd dat 
                    persoonlijke stijladvies democratiseert.
                  </p>
                  <p>
                    Vandaag helpen wij duizenden mensen dagelijks om hun perfecte stijl te 
                    ontdekken en zich zelfverzekerder te voelen. En dit is nog maar het begin.
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <Container>
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-[var(--color-text)] mb-4">
                Klaar om jouw perfecte stijl te ontdekken?
              </h2>
              <p className="text-lg text-[var(--color-text-secondary)] mb-8 leading-relaxed">
                Begin vandaag nog met onze gratis stijlanalyse en ontdek wat FitFi voor jou kan betekenen.
              </p>
              <button className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--color-primary)] text-white font-semibold rounded-xl hover:bg-[var(--color-primary-hover)] transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                <Sparkles className="w-5 h-5" />
                Start gratis
              </button>
            </div>
          </Container>
        </section>
      </div>
    </>
  );
}