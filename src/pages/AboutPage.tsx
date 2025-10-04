import React from 'react';
import { Sparkles, Target, Heart, Users, CheckCircle, ArrowRight, Star } from 'lucide-react';
import Container from '@/components/layout/Container';
import Button from '@/components/ui/Button';
import { track } from '@/utils/analytics';

export default function AboutPage() {
  const handleCTAClick = (source: string) => {
    track('cta_click', { source, page: 'about' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden about-hero-bg">
        <div className="about-floating-orb about-floating-orb-1"></div>
        <div className="about-floating-orb about-floating-orb-2"></div>
        <div className="about-floating-orb about-floating-orb-3"></div>
        
        <Container className="relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] border border-[var(--ff-color-primary-200)] mb-8 about-premium-badge">
              <Sparkles className="w-4 h-4 text-[var(--ff-color-primary-600)]" />
              <span className="text-sm font-medium text-[var(--ff-color-primary-700)]">
                Nederlandse AI-styling startup
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--ff-color-text)] mb-6 font-montserrat">
              Wij maken{' '}
              <span className="bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-500)] bg-clip-text text-transparent">
                persoonlijk stijladvies
              </span>{' '}
              toegankelijk voor iedereen
            </h1>
            
            <p className="text-xl text-[var(--ff-color-text-muted)] mb-8 max-w-3xl mx-auto leading-relaxed">
              FitFi ontstond uit frustratie over dure personal stylists en generieke mode-apps. 
              Wij geloven dat iedereen recht heeft op stijladvies dat echt bij hen past.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-[var(--ff-color-text-muted)]">100% Privacy-first</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-[var(--ff-color-text-muted)]">Nederlandse startup</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-[var(--ff-color-text-muted)]">AI + menselijke expertise</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-[var(--ff-color-surface)]">
        <Container>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="about-mission-card about-mission-card-primary">
              <div className="about-mission-icon about-mission-icon-gradient">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[var(--ff-color-text)] mb-4 font-montserrat">
                Onze Missie
              </h3>
              <p className="text-[var(--ff-color-text-muted)] mb-6 leading-relaxed">
                Persoonlijk stijladvies democratiseren door AI en menselijke expertise te combineren. 
                Geen dure stylists meer nodig - iedereen verdient toegang tot professioneel stijladvies.
              </p>
            </div>

            <div className="about-mission-card">
              <div className="about-mission-icon">
                <Heart className="w-8 h-8 text-[var(--ff-color-primary-600)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--ff-color-text)] mb-4 font-montserrat">
                Onze Waarden
              </h3>
              <ul className="space-y-3 text-[var(--ff-color-text-muted)]">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[var(--ff-color-primary-500)] to-[var(--ff-color-accent-500)] mt-2 flex-shrink-0"></div>
                  <span>Privacy en transparantie eerst</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[var(--ff-color-primary-500)] to-[var(--ff-color-accent-500)] mt-2 flex-shrink-0"></div>
                  <span>Toegankelijk voor iedereen</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[var(--ff-color-primary-500)] to-[var(--ff-color-accent-500)] mt-2 flex-shrink-0"></div>
                  <span>Authentieke stijl, geen trends</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[var(--ff-color-primary-500)] to-[var(--ff-color-accent-500)] mt-2 flex-shrink-0"></div>
                  <span>Duurzame keuzes stimuleren</span>
                </li>
              </ul>
            </div>

            <div className="about-mission-card">
              <div className="about-mission-icon">
                <Users className="w-8 h-8 text-[var(--ff-color-primary-600)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--ff-color-text)] mb-4 font-montserrat">
                Ons Team
              </h3>
              <p className="text-[var(--ff-color-text-muted)] leading-relaxed">
                Een mix van AI-experts, stylisten en UX-designers uit Nederland. 
                Wij begrijpen de Nederlandse markt en maken producten die echt werken.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Timeline Section */}
      <section className="py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--ff-color-text)] mb-4 font-montserrat">
                Ons Verhaal
              </h2>
              <p className="text-xl text-[var(--ff-color-text-muted)]">
                Van idee tot AI-stylist in 18 maanden
              </p>
            </div>

            <div className="about-timeline">
              <div className="about-timeline-line"></div>
              
              <div className="about-timeline-item">
                <div className="about-timeline-marker">
                  <span className="text-sm font-bold text-white">2023</span>
                </div>
                <div className="about-timeline-content">
                  <h3 className="text-xl font-bold text-[var(--ff-color-text)] mb-2 font-montserrat">
                    Het Begin
                  </h3>
                  <p className="text-[var(--ff-color-text-muted)]">
                    Frustratie over dure personal stylists (€150+ per uur) en generieke mode-apps 
                    die niet begrijpen wat echt bij je past.
                  </p>
                </div>
              </div>

              <div className="about-timeline-item">
                <div className="about-timeline-marker">
                  <span className="text-sm font-bold text-white">Q1 '24</span>
                </div>
                <div className="about-timeline-content">
                  <h3 className="text-xl font-bold text-[var(--ff-color-text)] mb-2 font-montserrat">
                    Eerste Prototype
                  </h3>
                  <p className="text-[var(--ff-color-text-muted)]">
                    AI-model getraind op duizenden outfit-combinaties en stijlprofielen. 
                    Focus op Nederlandse voorkeuren en merken.
                  </p>
                </div>
              </div>

              <div className="about-timeline-item">
                <div className="about-timeline-marker">
                  <span className="text-sm font-bold text-white">Q3 '24</span>
                </div>
                <div className="about-timeline-content">
                  <h3 className="text-xl font-bold text-[var(--ff-color-text)] mb-2 font-montserrat">
                    Beta Launch
                  </h3>
                  <p className="text-[var(--ff-color-text-muted)]">
                    500+ beta-gebruikers testen het platform. 92% tevredenheid en 
                    waardevolle feedback voor verdere ontwikkeling.
                  </p>
                </div>
              </div>

              <div className="about-timeline-item">
                <div className="about-timeline-marker">
                  <span className="text-sm font-bold text-white">Nu</span>
                </div>
                <div className="about-timeline-content">
                  <h3 className="text-xl font-bold text-[var(--ff-color-text)] mb-2 font-montserrat">
                    Publieke Launch
                  </h3>
                  <p className="text-[var(--ff-color-text-muted)]">
                    FitFi is live! Gratis AI Style Reports voor iedereen, 
                    met premium features voor wie meer wil.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-[var(--ff-color-surface)]">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="about-stats-card">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-500)] bg-clip-text text-transparent mb-2 font-montserrat">
                2.000+
              </div>
              <div className="text-sm text-[var(--ff-color-text-muted)]">Style Reports</div>
            </div>
            
            <div className="about-stats-card">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-500)] bg-clip-text text-transparent mb-2 font-montserrat">
                92%
              </div>
              <div className="text-sm text-[var(--ff-color-text-muted)]">Tevredenheid</div>
            </div>
            
            <div className="about-stats-card">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-500)] bg-clip-text text-transparent mb-2 font-montserrat">
                18
              </div>
              <div className="text-sm text-[var(--ff-color-text-muted)]">Maanden ontwikkeling</div>
            </div>
            
            <div className="about-stats-card">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-500)] bg-clip-text text-transparent mb-2 font-montserrat">
                100%
              </div>
              <div className="text-sm text-[var(--ff-color-text-muted)]">Nederlands</div>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden about-cta-bg">
        <div className="about-cta-orb"></div>
        
        <Container className="relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--ff-color-text)] mb-6 font-montserrat">
              Klaar om jouw{' '}
              <span className="bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-500)] bg-clip-text text-transparent">
                perfecte stijl
              </span>{' '}
              te ontdekken?
            </h2>
            
            <p className="text-xl text-[var(--ff-color-text-muted)] mb-8">
              Start vandaag nog met je gratis AI Style Report en ontdek wat echt bij je past.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="about-shimmer-button"
                onClick={() => handleCTAClick('about_hero_primary')}
              >
                <Star className="w-5 h-5 mr-2" />
                Start Gratis Style Quiz
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleCTAClick('about_hero_secondary')}
              >
                Bekijk Voorbeelden
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-[var(--ff-color-text-muted)]">Altijd gratis te starten</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-[var(--ff-color-text-muted)]">Geen verplichtingen</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-[var(--ff-color-text-muted)]">Direct resultaat</span>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}