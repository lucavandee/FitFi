import React from 'react';
import { Heart, Shield, Sparkles, Users, ArrowRight, CheckCircle, Star } from 'lucide-react';
import Seo from '@/components/Seo';
import Button from '@/components/ui/Button';
import SmartImage from '@/components/media/SmartImage';
import ErrorBoundary from '@/components/ErrorBoundary';
import { track } from '@/utils/analytics';

const usp = [
  { 
    title: 'AI-Powered Styling', 
    desc: 'Onze AI vertaalt jouw voorkeuren en silhouet naar outfits met uitleg.',
    icon: Sparkles,
    gradient: 'from-purple-500 to-pink-500'
  },
  { 
    title: 'Onafhankelijk advies', 
    desc: 'Geen gesponsorde push; we optimaliseren voor jouw stijl en budget.',
    icon: Shield,
    gradient: 'from-blue-500 to-cyan-500'
  },
  { 
    title: 'Duurzaam & tijdloos', 
    desc: 'Kwaliteit boven kwantiteit. Bewuste keuzes, seizoens-ready.',
    icon: Heart,
    gradient: 'from-green-500 to-emerald-500'
  },
  { 
    title: 'Privacy-first', 
    desc: 'Alleen data die nodig is voor je advies. Transparant en controleerbaar.',
    icon: Users,
    gradient: 'from-orange-500 to-red-500'
  },
];

const stats = [
  { value: '10.000+', label: 'Tevreden gebruikers', icon: Users },
  { value: '4.8/5', label: 'Gemiddelde waardering', icon: Star },
  { value: '97%', label: 'Tevredenheid eerste outfits', icon: CheckCircle },
];

const AboutPage: React.FC = () => {
  React.useEffect(() => {
    track('page_view', { page: 'about', section: 'about_page' });
  }, []);

  const handleCTAClick = (action: string, href: string) => {
    track('cta_click', { 
      action, 
      location: 'about_hero',
      href,
      page: 'about'
    });
  };

  const handleUSPClick = (title: string) => {
    track('usp_click', {
      usp_title: title,
      location: 'about_usps',
      page: 'about'
    });
  };

  const handleStatsClick = (label: string, value: string) => {
    track('stats_click', {
      stat_label: label,
      stat_value: value,
      location: 'about_stats',
      page: 'about'
    });
  };

  return (
    <ErrorBoundary>
      <Seo
        title="Over ons — Waarom kiezen mensen voor FitFi?"
        description="Wij combineren AI en stijlkennis voor persoonlijk, onafhankelijk stylingadvies. Premium ervaring, privacy-first."
        canonical="https://www.fitfi.ai/over-ons"
      />
      <main className="bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
        {/* Hero */}
        <section className="section bg-gradient-to-b from-[color:var(--color-bg)] to-[color:var(--color-surface)]">
          <div className="container grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="chip inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Onze missie
              </div>
              <h1 className="hero__title mt-2">AI-styling die je écht begrijpt</h1>
              <p className="lead mt-3 max-w-2xl">
                Wij bouwen een stylist die je smaak, context en silhouet snapt — en dit vertaalt naar outfits met
                heldere uitleg en directe opties om te shoppen of te combineren met wat je al hebt.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button 
                  as="a" 
                  href="/registreren" 
                  variant="primary" 
                  size="lg"
                  className="group"
                  onClick={() => handleCTAClick('start_free', '/registreren')}
                >
                  <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Start gratis
                </Button>
                <Button 
                  as="a" 
                  href="/hoe-het-werkt" 
                  variant="ghost" 
                  size="lg"
                  className="group"
                  onClick={() => handleCTAClick('how_it_works', '/hoe-het-werkt')}
                >
                  Hoe het werkt
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="card interactive-elevate overflow-hidden">
                <SmartImage 
                  src="/images/about/team-nova.jpg" 
                  alt="FitFi — team & Nova" 
                  className="w-full h-80 lg:h-full object-cover" 
                />
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="section">
          <div className="container">
            <div className="grid gap-4 md:grid-cols-3">
              {stats.map((stat) => {
                const IconComponent = stat.icon;
                return (
                  <div 
                    key={stat.label} 
                    className="card interactive-elevate cursor-pointer group"
                    onClick={() => handleStatsClick(stat.label, stat.value)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleStatsClick(stat.label, stat.value);
                      }
                    }}
                  >
                    <div className="card__inner text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-[color:var(--color-primary)] to-[color:var(--color-accent)] mb-3 group-hover:scale-110 transition-transform">
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="metric">
                        <div className="metric__value text-[color:var(--color-primary)]">{stat.value}</div>
                        <div className="metric__label">{stat.label}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* USP's */}
        <section className="section">
          <div className="container">
            <div className="text-center mb-8">
              <h2 className="hero__title">Waarom FitFi?</h2>
              <p className="lead mt-2">De voordelen die onze gebruikers het meest waarderen</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {usp.map((u) => {
                const IconComponent = u.icon;
                return (
                  <article 
                    key={u.title} 
                    className="subcard interactive-elevate cursor-pointer group"
                    onClick={() => handleUSPClick(u.title)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleUSPClick(u.title);
                      }
                    }}
                  >
                    <div className="subcard__inner">
                      <div className="flex items-start gap-4">
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${u.gradient} group-hover:scale-110 transition-transform flex-shrink-0`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="subcard__title group-hover:text-[color:var(--color-primary)] transition-colors">{u.title}</h3>
                          <p className="subcard__kicker mt-1">{u.desc}</p>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Trust */}
        <section className="section">
          <div className="container">
            <div className="card interactive-elevate">
              <div className="card__inner">
                <div className="flex items-start gap-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex-shrink-0">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="card__title">Transparantie & privacy</h2>
                    <p className="mt-2 muted">
                      We verzamelen alleen wat nodig is om je outfits te genereren. Je data blijft van jou — altijd in te zien en te verwijderen.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <a 
                        href="/privacy" 
                        className="inline-flex items-center gap-2 text-[color:var(--color-primary)] hover:underline font-medium"
                        onClick={() => track('privacy_link_click', { location: 'about_trust', page: 'about' })}
                      >
                        Lees onze privacyverklaring
                        <ArrowRight className="w-4 h-4" />
                      </a>
                      <a 
                        href="/cookies" 
                        className="inline-flex items-center gap-2 text-[color:var(--color-primary)] hover:underline font-medium"
                        onClick={() => track('cookies_link_click', { location: 'about_trust', page: 'about' })}
                      >
                        Cookie-instellingen
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="section bg-gradient-to-r from-[color:var(--color-primary)] to-[color:var(--color-accent)]">
          <div className="container text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="hero__title text-white">Klaar om je stijl te ontdekken?</h2>
              <p className="lead mt-2 text-white/90">
                Start vandaag nog met je persoonlijke styling-ervaring
              </p>
              <div className="mt-6">
                <Button 
                  as="a" 
                  href="/registreren" 
                  variant="ghost" 
                  size="lg"
                  className="bg-white text-[color:var(--color-primary)] hover:bg-white/90 group"
                  onClick={() => handleCTAClick('start_bottom', '/registreren')}
                >
                  <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Start gratis
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </ErrorBoundary>
  );
};

export default AboutPage;