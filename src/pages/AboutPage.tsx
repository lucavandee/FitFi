import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Container } from '@/components/layout/Container';

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>Over FitFi - Jouw AI-gestuurde stijlassistent</title>
        <meta name="description" content="Ontdek het verhaal achter FitFi en hoe wij AI-technologie gebruiken om jouw perfecte stijl te vinden." />
      </Helmet>

      {/* Hero Section - exact zoals prijzen pagina */}
      <section className="bg-[var(--color-bg)] py-16 lg:py-24">
        <Container>
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-[var(--color-border)] rounded-full px-4 py-2 text-sm text-[var(--color-text-secondary)] mb-8">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Over FitFi
            </div>

            {/* Title - zwarte tekst, geen gradient */}
            <h1 className="text-4xl lg:text-6xl font-bold text-[var(--color-text)] mb-6">
              Jouw perfecte stijl begint hier
            </h1>

            {/* Subtitle */}
            <p className="text-lg lg:text-xl text-[var(--color-text-secondary)] mb-8 max-w-3xl mx-auto">
              Wij geloven dat iedereen een unieke stijl heeft. Met AI-technologie en 
              persoonlijke begeleiding helpen wij je jouw perfecte look te ontdekken.
            </p>

            {/* Stats - zoals op prijzen pagina */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-[var(--color-text)] mb-2">10K+</div>
                <div className="text-[var(--color-text-secondary)]">Tevreden gebruikers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-[var(--color-text)] mb-2">50K+</div>
                <div className="text-[var(--color-text-secondary)]">Outfits gecreëerd</div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-[var(--color-primary)] mb-2">98%</div>
                <div className="text-[var(--color-text-secondary)]">Tevredenheid</div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Mission Section */}
      <section className="py-16 lg:py-24">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-sm border border-[var(--color-border)]">
              <h2 className="text-3xl lg:text-4xl font-bold text-[var(--color-text)] mb-6 text-center">
                Onze missie
              </h2>
              <p className="text-lg text-[var(--color-text-secondary)] mb-6 text-center">
                Bij FitFi geloven we dat mode persoonlijk is. Daarom hebben we een AI-assistent 
                ontwikkeld die jouw unieke smaak begrijpt en outfits voorstelt die perfect bij 
                jou passen.
              </p>
              <p className="text-lg text-[var(--color-text-secondary)] text-center">
                Geen standaard looks, maar gepersonaliseerde stijladvies dat evolueert met jouw 
                voorkeuren en lifestyle.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Values Section */}
      <section className="bg-[var(--color-bg)] py-16 lg:py-24">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-[var(--color-text)] mb-4">
              Onze waarden
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              Deze principes staan centraal in alles wat we doen
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-[var(--color-border)] text-center">
              <div className="w-12 h-12 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-[var(--color-text)] mb-3">
                Persoonlijk
              </h3>
              <p className="text-[var(--color-text-secondary)]">
                Elke aanbeveling is uniek en afgestemd op jouw persoonlijke stijl en voorkeuren.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-[var(--color-border)] text-center">
              <div className="w-12 h-12 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-semibold text-[var(--color-text)] mb-3">
                Innovatief
              </h3>
              <p className="text-[var(--color-text-secondary)]">
                We gebruiken de nieuwste AI-technologie om jouw perfecte stijl te ontdekken.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-[var(--color-border)] text-center">
              <div className="w-12 h-12 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💚</span>
              </div>
              <h3 className="text-xl font-semibold text-[var(--color-text)] mb-3">
                Duurzaam
              </h3>
              <p className="text-[var(--color-text-secondary)]">
                We helpen je bewuste keuzes te maken die passen bij jouw waarden en lifestyle.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Team Section */}
      <section className="py-16 lg:py-24">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-[var(--color-text)] mb-4">
              Ons team
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              Ontmoet de mensen achter FitFi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-[var(--color-border)] text-center">
              <div className="w-20 h-20 bg-[var(--color-primary)]/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">👨‍💻</span>
              </div>
              <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">
                Alex van der Berg
              </h3>
              <p className="text-[var(--color-primary)] mb-3">CEO & Founder</p>
              <p className="text-[var(--color-text-secondary)] text-sm">
                Voormalig fashion consultant met een passie voor technologie en persoonlijke styling.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-[var(--color-border)] text-center">
              <div className="w-20 h-20 bg-[var(--color-primary)]/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">👩‍🔬</span>
              </div>
              <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">
                Sarah Jansen
              </h3>
              <p className="text-[var(--color-primary)] mb-3">Head of AI</p>
              <p className="text-[var(--color-text-secondary)] text-sm">
                AI-expert met 10+ jaar ervaring in machine learning en computer vision.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-[var(--color-border)] text-center">
              <div className="w-20 h-20 bg-[var(--color-primary)]/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">
                Mike de Vries
              </h3>
              <p className="text-[var(--color-primary)] mb-3">Creative Director</p>
              <p className="text-[var(--color-text-secondary)] text-sm">
                Fashion designer en stylist die trends vertaalt naar persoonlijke stijladvies.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section - exact zoals prijzen pagina */}
      <section className="bg-[var(--color-bg)] py-16 lg:py-24">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-[var(--color-text)] mb-6">
              Klaar om je stijl te ontdekken?
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] mb-8">
              Begin vandaag nog met je persoonlijke stijlreis. Gratis en zonder verplichtingen.
            </p>
            <button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-8 py-4 rounded-full font-semibold text-lg transition-colors">
              Start gratis
            </button>
          </div>
        </Container>
      </section>
    </>
  );
}