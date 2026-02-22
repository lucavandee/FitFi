import { NavLink, useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Zap, BookOpen } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { events } from '@/utils/ga4';

export function HeroMinimal() {
  const { user } = useUser();
  const navigate = useNavigate();

  const handleStartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    events.cta_click_hero_primary('A');
    if (user) {
      navigate('/onboarding');
    } else {
      navigate('/registreren');
    }
  };

  const handleExampleClick = () => {
    events.cta_click_hero_secondary('A');
  };

  return (
    <section className="relative bg-[var(--color-bg)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 lg:pt-32 lg:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left Column - Content */}
          <div className="text-center lg:text-left space-y-8">

            {/* H1 - Result or Speed */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--color-text)] leading-tight tracking-tight">
              Jouw stijl in{' '}
              <span className="bg-gradient-to-r from-[var(--ff-color-primary-700)] to-[var(--ff-color-primary-500)] bg-clip-text text-transparent">
                2 minuten
              </span>
            </h1>

            {/* Subline - Clear Value Prop */}
            <p className="text-lg sm:text-xl text-[var(--color-muted)] max-w-xl leading-relaxed">
              Style Report + 6–12 outfits + uitleg waarom ze voor je werken.
              <br />
              <strong className="text-[var(--color-text)]">Helder. Direct toepasbaar.</strong>
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={handleStartClick}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] text-white rounded-[var(--radius-xl)] font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
              >
                Begin gratis
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>

              <NavLink
                to="/hoe-het-werkt"
                onClick={handleExampleClick}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border border-[var(--color-border)] hover:border-[var(--ff-color-primary-700)] text-[var(--color-text)] rounded-[var(--radius-xl)] font-semibold transition-all hover:scale-[1.02]"
              >
                Bekijk voorbeeld
              </NavLink>
            </div>

            {/* Micro-proof badges */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 pt-2">
              <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                <Shield className="w-4 h-4 text-[var(--ff-color-primary-700)]" />
                <span></span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                <Zap className="w-4 h-4 text-[var(--ff-color-primary-700)]" />
                <span>Geen spam</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                <BookOpen className="w-4 h-4 text-[var(--ff-color-primary-700)]" />
                <span>Uitleg bij elke look</span>
              </div>
            </div>
          </div>

          {/* Right Column - LCP Visual: 3 Overlapping Outfit Cards */}
          <div className="relative lg:pl-8">
            <div className="relative h-[500px] lg:h-[600px]">

              {/* Card 1: Werk - Back */}
              <div
                className="absolute top-0 left-[5%] w-[280px] sm:w-[320px] bg-[var(--color-surface)] rounded-[var(--radius-2xl)] shadow-xl border border-[var(--color-border)] overflow-hidden transform rotate-[-4deg] transition-transform hover:rotate-[-2deg] hover:scale-105 z-10"
                style={{ willChange: 'transform' }}
              >
                <div className="aspect-[3/4] bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] flex items-center justify-center">
                  <div className="text-center p-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-[var(--ff-color-primary-700)] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      W
                    </div>
                    <p className="text-sm font-semibold text-[var(--color-text)]">Werk</p>
                    <p className="text-xs text-[var(--color-muted)] mt-1">3 outfits</p>
                  </div>
                </div>
                <div className="p-4 bg-[var(--color-surface)]">
                  <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Slim fit, klassiek</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Weekend - Middle (Front) */}
              <div
                className="absolute top-[80px] left-[20%] w-[280px] sm:w-[320px] bg-[var(--color-surface)] rounded-[var(--radius-2xl)] shadow-2xl border-2 border-[var(--ff-color-primary-700)] overflow-hidden transform rotate-[2deg] transition-transform hover:rotate-[0deg] hover:scale-105 z-30"
                style={{ willChange: 'transform' }}
              >
                <div className="aspect-[3/4] bg-gradient-to-br from-[var(--ff-color-accent-50)] to-[var(--ff-color-secondary-50)] flex items-center justify-center">
                  <div className="text-center p-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[var(--ff-color-primary-700)] to-[var(--ff-color-accent-600)] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      W
                    </div>
                    <p className="text-sm font-semibold text-[var(--color-text)]">Weekend</p>
                    <p className="text-xs text-[var(--color-muted)] mt-1">4 outfits</p>
                  </div>
                </div>
                <div className="p-4 bg-[var(--color-surface)]">
                  <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span>Casual, comfortabel</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Avond - Back Right */}
              <div
                className="absolute top-[40px] right-[5%] w-[280px] sm:w-[320px] bg-[var(--color-surface)] rounded-[var(--radius-2xl)] shadow-xl border border-[var(--color-border)] overflow-hidden transform rotate-[6deg] transition-transform hover:rotate-[4deg] hover:scale-105 z-20"
                style={{ willChange: 'transform' }}
              >
                <div className="aspect-[3/4] bg-gradient-to-br from-[var(--ff-color-secondary-50)] to-[var(--ff-color-primary-50)] flex items-center justify-center">
                  <div className="text-center p-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-[var(--ff-color-secondary-700)] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      A
                    </div>
                    <p className="text-sm font-semibold text-[var(--color-text)]">Avond</p>
                    <p className="text-xs text-[var(--color-muted)] mt-1">2 outfits</p>
                  </div>
                </div>
                <div className="p-4 bg-[var(--color-surface)]">
                  <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <span>Smart, verfijnd</span>
                  </div>
                </div>
              </div>

              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[var(--ff-color-primary-100)] via-transparent to-[var(--ff-color-accent-100)] opacity-20 blur-3xl -z-10"></div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
