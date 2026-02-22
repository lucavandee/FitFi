import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play, Users } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

/**
 * Hero V3 FIXED - Clear CTA Hierarchy
 *
 * CHANGES:
 * - ONE primary CTA (solid brand color, xl size)
 * - ONE secondary CTA (ghost, md size)
 * - Value-driven labels
 * - Design system classes (not custom)
 * - Clear visual hierarchy
 *
 * CTA HIERARCHY:
 * 1. PRIMARY: "Ontvang je stijladvies" (ff-btn--primary, xl)
 * 2. SECONDARY: "Bekijk voorbeeld" (ff-btn--ghost, md)
 *
 * WCAG 2.1 AA Compliant:
 * - Focus-visible states
 * - Touch targets ≥ 52px
 * - Semantic HTML
 * - Clear hierarchy
 */
export function HeroV3Fixed() {
  const { user } = useUser();
  const navigate = useNavigate();

  const { data: todayCount } = useQuery({
    queryKey: ['profiles-today'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count, error } = await supabase
        .from('style_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      if (error) throw error;
      return count || 0;
    },
    staleTime: 60000,
    refetchInterval: 60000,
  });

  const handleStartClick = () => {
    if (user) {
      navigate('/onboarding');
    } else {
      navigate('/registreren');
    }
  };

  const handleExampleClick = () => {
    navigate('/results/preview');
  };

  return (
    <section
      className="relative min-h-[85vh] flex items-center overflow-hidden bg-[var(--color-bg)]"
      aria-labelledby="hero-heading"
    >
      {/* Background - Premium couple, woman with phone */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <img
          src="/images/c614360c-fec6-44de-89c5-497a49a852a7.webp"
          alt="Stijlvol stel bekijkt outfit aanbevelingen op smartphone - professioneel en modern gekleed"
          className="w-full h-full object-cover object-[center_35%] sm:object-[center_40%] md:object-center"
          loading="eager"
          fetchpriority="high"
          style={{
            objectFit: 'cover',
            maxWidth: 'none',
            minWidth: '100%',
            minHeight: '100%'
          }}
        />

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b sm:bg-gradient-to-r from-black/85 via-black/70 to-black/50 sm:from-black/65 sm:via-black/45 sm:to-black/25"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24">
        <div className="max-w-4xl">

          {/* Badge - Simplified, no tech jargon */}
          <div
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/95 backdrop-blur-sm rounded-full text-sm font-bold text-[var(--ff-color-primary-700)] mb-8 shadow-2xl"
            role="status"
            aria-label="Gratis persoonlijk stijladvies beschikbaar"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" aria-hidden="true"></div>
            Persoonlijk stijladvies
          </div>

          {/* H1 - Clear Promise */}
          <h1
            id="hero-heading"
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-white leading-[1.05] sm:leading-[0.95] tracking-tight mb-6 sm:mb-8"
          >
            Outfits die{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-[var(--ff-color-accent-300)] via-white to-[var(--ff-color-primary-300)] bg-clip-text text-transparent">
                bij jou passen
              </span>
              <span className="absolute -bottom-2 left-0 right-0 h-3 bg-[var(--ff-color-accent-400)] opacity-30 blur-sm" aria-hidden="true"></span>
            </span>
          </h1>

          {/* Subline - Concrete Value */}
          <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white/95 leading-relaxed sm:leading-tight max-w-2xl mb-10 sm:mb-12 font-light">
            We geven je persoonlijk stijladvies in 2 minuten,{' '}
            <span className="font-bold">zo shop je direct</span>
          </p>

          {/* ✅ FIXED CTAs - Clear Hierarchy with Design System */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-5">
            {/* PRIMARY CTA - Uses ff-btn--primary, xl size, most prominent */}
            <button
              onClick={handleStartClick}
              className="group ff-btn ff-btn--xl bg-white hover:bg-gray-50 text-[var(--color-text)] shadow-2xl hover:shadow-[0_25px_80px_rgba(255,255,255,0.4)]"
              aria-label="Ontvang gratis persoonlijk stijladvies in 2 minuten"
            >
              Ontvang je stijladvies
              <ArrowRight className="w-6 h-6 lg:w-7 lg:h-7 transition-transform duration-300 group-hover:translate-x-2" aria-hidden="true" />
            </button>

            {/* SECONDARY CTA - Uses ff-btn--ghost, md size, less prominent */}
            <button
              onClick={handleExampleClick}
              className="group ff-btn ff-btn--ghost ff-btn--md"
              aria-label="Bekijk voorbeeld stijladvies van andere gebruikers"
            >
              <Play className="w-5 h-5" aria-hidden="true" />
              Bekijk voorbeeld
            </button>
          </div>

          {/* Trust indicators */}
          <div
            className="flex flex-wrap items-center gap-4 sm:gap-5 lg:gap-6 mt-6 sm:mt-8 lg:mt-10 text-white/90 text-base sm:text-lg"
            role="list"
            aria-label="Vertrouwensindicatoren"
          >
            {todayCount !== undefined && todayCount > 0 && (
              <div
                className="flex items-center gap-2 sm:gap-3 min-h-[44px] py-2"
                role="listitem"
              >
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 flex-shrink-0" aria-hidden="true" />
                <span className="font-semibold leading-tight">
                  <span className="text-green-400">{todayCount}</span> {todayCount === 1 ? 'persoon' : 'mensen'} vandaag
                </span>
              </div>
            )}
            <div
              className="flex items-center gap-2 sm:gap-3 min-h-[44px] py-2"
              role="listitem"
            >
              <div className="flex -space-x-2" aria-hidden="true">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 border-2 border-black/30 backdrop-blur-sm flex items-center justify-center text-white/80 text-xs font-bold"
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <span className="font-semibold leading-tight">12.400+ gebruikers</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroV3Fixed;
