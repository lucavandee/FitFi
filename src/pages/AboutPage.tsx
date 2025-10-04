import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Heart, TrendingUp, Sparkles } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>Over Ons - FitFi</title>
        <meta name="description" content="Ontdek het verhaal achter FitFi en hoe wij jouw perfecte stijl helpen ontdekken met AI-technologie." />
      </Helmet>

      <div className="min-h-screen bg-[var(--color-bg)]">
        {/* Hero Section */}
        <section className="pt-24 pb-16">
          <Container>
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-[var(--color-border)] mb-8">
                <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />
                <span className="text-sm font-medium text-[var(--color-text)]">Over FitFi</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--color-text)] mb-6 leading-tight">
                Jouw perfecte stijl
                <br />
                <span className="text-[var(--color-text-muted)]">begint hier</span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-[var(--color-text-muted)] mb-12 max-w-3xl mx-auto leading-relaxed">
                Wij geloven dat iedereen een unieke stijl heeft. Met AI-technologie en persoonlijke 
                begeleiding helpen wij je jouw perfecte look te ontdekken.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-[var(--color-primary)] mb-2">10K+</div>
                  <div className="text-sm text-[var(--color-text-muted)]">Tevreden gebruikers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-[var(--color-primary)] mb-2">50K+</div>
                  <div className="text-sm text-[var(--color-text-muted)]">Outfits gecreëerd</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-[var(--color-primary)] mb-2">98%</div>
                  <div className="text-sm text-[var(--color-text-muted)]">Tevredenheid</div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Mission Section */}
        <section className="py-16 bg-white">
          <Container>
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-6">
                Onze missie
              </h2>
              <p className="text-lg text-[var(--color-text-muted)] leading-relaxed">
                Wij maken stijladvies toegankelijk voor iedereen door de kracht van AI te combineren met 
                menselijke expertise en persoonlijke aandacht.
              </p>
            </div>
          </Container>
        </section>

        {/* Values Section */}
        <section className="py-16">
          <Container>
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Value 1 */}
                <div className="bg-white rounded-2xl p-8 border border-[var(--color-border)] text-center hover:shadow-lg transition-shadow duration-300">
                  <div className="w-12 h-12 bg-[var(--color-primary-50)] rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="w-6 h-6 text-[var(--color-primary)]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[var(--color-text)] mb-4">
                    Persoonlijk & Precies
                  </h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    Elke stijlanalyse is uniek en gebaseerd op jouw persoonlijke voorkeuren, 
                    lichaamsbouw en levensstijl.
                  </p>
                </div>

                {/* Value 2 */}
                <div className="bg-white rounded-2xl p-8 border border-[var(--color-border)] text-center hover:shadow-lg transition-shadow duration-300">
                  <div className="w-12 h-12 bg-[var(--color-primary-50)] rounded-full flex items-center justify-center mx-auto mb-6">
                    <TrendingUp className="w-6 h-6 text-[var(--color-primary)]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[var(--color-text)] mb-4">
                    Altijd Up-to-date
                  </h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    Onze AI leert continu van de nieuwste trends en past zich aan aan jouw 
                    evoluerende smaak.
                  </p>
                </div>

                {/* Value 3 */}
                <div className="bg-white rounded-2xl p-8 border border-[var(--color-border)] text-center hover:shadow-lg transition-shadow duration-300">
                  <div className="w-12 h-12 bg-[var(--color-primary-50)] rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-6 h-6 text-[var(--color-primary)]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[var(--color-text)] mb-4">
                    Met Liefde Gemaakt
                  </h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    Elk detail is zorgvuldig ontworpen om jou te helpen je zelfverzekerder en 
                    mooier te voelen.
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Story Section */}
        <section className="py-16 bg-white">
          <Container>
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-6">
                  Ons verhaal
                </h2>
                <div className="w-16 h-1 bg-[var(--color-primary)] mx-auto mb-8 rounded-full"></div>
              </div>
              
              <div className="prose prose-lg max-w-none text-[var(--color-text-muted)] leading-relaxed space-y-6">
                <p className="text-lg">
                  FitFi ontstond uit een simpele observatie: iedereen verdient het om zich goed te voelen 
                  in hun kleding, maar niet iedereen heeft toegang tot persoonlijk stijladvies.
                </p>
                
                <p>
                  We zagen hoe technologie de mode-industrie transformeerde, maar merkten dat de focus 
                  vaak lag op trends in plaats van op wat echt bij jou past. Daarom besloten we een 
                  platform te bouwen dat de kracht van AI combineert met echte menselijke expertise.
                </p>
                
                <p>
                  Vandaag helpen we duizenden mensen dagelijks om hun perfecte stijl te ontdekken. 
                  Van casual weekend looks tot professionele outfits - wij zorgen ervoor dat je altijd 
                  met vertrouwen de deur uit gaat.
                </p>
                
                <p className="text-lg font-medium text-[var(--color-text)]">
                  Want stijl is niet alleen wat je draagt, het is hoe je je voelt.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <Container>
            <div className="bg-gradient-to-br from-[var(--color-primary-50)] to-white rounded-3xl p-12 text-center border border-[var(--color-border)]">
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-6">
                Klaar om jouw stijl te ontdekken?
              </h2>
              <p className="text-lg text-[var(--color-text-muted)] mb-8 max-w-2xl mx-auto">
                Begin vandaag nog met onze gratis stijlquiz en ontdek welke looks perfect bij jou passen.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-600)] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                >
                  Start gratis quiz
                </Button>
                <Button 
                  variant="ghost" 
                  size="lg"
                  className="border border-[var(--color-border)] hover:border-[var(--color-primary)] px-8 py-4 rounded-xl font-semibold transition-all duration-300"
                >
                  Bekijk voorbeelden
                </Button>
              </div>
            </div>
          </Container>
        </section>
      </div>
    </>
  );
}