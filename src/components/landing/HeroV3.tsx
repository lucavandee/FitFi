import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play, Users } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

export function HeroV3() {
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
    navigate(user ? '/onboarding' : '/register');
  };

  const handleExampleClick = () => {
    navigate('/results/preview');
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-[#0e0e0d]"
      style={{ minHeight: 'min(90vh, 700px)' }}
      aria-labelledby="hero-heading"
    >
      {/* ── Full-bleed background image ── */}
      <div className="absolute inset-0" aria-hidden="true">
        <img
          src="/images/c614360c-fec6-44de-89c5-497a49a852a7.webp"
          alt="Stijlvol stel bekijkt outfit aanbevelingen"
          className="w-full h-full object-cover object-[60%_top] sm:object-[center_40%]"
          loading="eager"
          fetchpriority="high"
        />

        {/* Mobile gradient: dark bottom panel where text lives */}
        <div
          className="absolute inset-0 sm:hidden"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.35) 38%, rgba(14,14,13,0.96) 58%, rgb(14,14,13) 100%)',
          }}
        />
        {/* Desktop gradient: side-to-side */}
        <div
          className="absolute inset-0 hidden sm:block"
          style={{
            background: 'linear-gradient(to right, rgba(14,14,13,0.82) 0%, rgba(14,14,13,0.55) 50%, rgba(14,14,13,0.18) 100%)',
          }}
        />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">

        {/*
          Mobile layout: image takes ~42% of height, content starts below midpoint.
          We use padding-top to push content to the lower portion.
        */}
        <div
          className="flex flex-col justify-end sm:justify-center"
          style={{ minHeight: 'min(90vh, 700px)' }}
        >
          {/* Inner content wrapper — max width on desktop */}
          <div className="w-full sm:max-w-xl lg:max-w-2xl pb-8 sm:pb-0 sm:py-20 lg:py-28">

            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-sm rounded-full text-xs sm:text-sm font-bold text-[var(--ff-color-primary-700)] mb-5 sm:mb-7 shadow-xl"
              role="status"
            >
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" aria-hidden="true" />
              Persoonlijk stijladvies
            </div>

            {/* H1 */}
            <h1
              id="hero-heading"
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1.05] tracking-tight mb-4 sm:mb-5"
            >
              Outfits die{' '}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-[var(--ff-color-accent-300)] via-white to-[var(--ff-color-primary-300)] bg-clip-text text-transparent">
                  bij jou passen
                </span>
              </span>
            </h1>

            {/* Subline */}
            <p className="text-base sm:text-lg md:text-xl text-white/90 leading-relaxed max-w-lg mb-5 sm:mb-7 font-light">
              In 2 minuten een stijlrapport dat je écht helpt kiezen wat je aantrekt.
            </p>

            {/* Bullets */}
            <ul className="space-y-2.5 mb-7 sm:mb-9 text-white/90 text-sm sm:text-base">
              {[
                'Direct een overzicht met combinaties + shoplinks',
                'Outfits voor werk, weekend en uitgaan',
                'Pas je antwoorden aan en zie direct nieuwe aanbevelingen',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleStartClick}
                className="group inline-flex items-center justify-center gap-2 px-7 py-4 min-h-[52px] bg-white hover:bg-gray-50 text-[var(--color-text)] rounded-xl font-bold text-sm sm:text-base shadow-2xl transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(255,255,255,0.35)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/80"
                aria-label="Ontvang gratis persoonlijk stijladvies in 2 minuten"
              >
                Start mijn stijlquiz
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:translate-x-1 flex-shrink-0" aria-hidden="true" />
              </button>

              <button
                onClick={handleExampleClick}
                className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[52px] bg-white/10 hover:bg-white/18 backdrop-blur-sm border border-white/25 hover:border-white/45 text-white rounded-xl font-medium text-sm sm:text-base transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60"
                aria-label="Bekijk voorbeeld stijladvies"
              >
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" aria-hidden="true" />
                Bekijk voorbeeld
              </button>
            </div>

            {/* Trust indicators */}
            <div
              className="flex flex-wrap items-center gap-3 sm:gap-5 mt-5 sm:mt-7 text-white/80 text-xs sm:text-sm"
              role="list"
              aria-label="Vertrouwensindicatoren"
            >
              {todayCount !== undefined && todayCount > 0 && (
                <div className="flex items-center gap-1.5" role="listitem">
                  <Users className="w-4 h-4 text-green-400 flex-shrink-0" aria-hidden="true" />
                  <span className="font-semibold">
                    <span className="text-green-400">{todayCount}</span>{' '}
                    {todayCount === 1 ? 'persoon' : 'mensen'} vandaag
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5" role="listitem">
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-semibold">Gratis start</span>
              </div>
              <div className="flex items-center gap-1.5" role="listitem">
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="font-semibold">~2 minuten</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Scroll hint — desktop only */}
      <div
        className="hidden sm:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce"
        aria-hidden="true"
      >
        <div className="w-7 h-10 border-2 border-white/50 rounded-full flex items-start justify-center pt-2">
          <div className="w-1.5 h-1.5 bg-white/80 rounded-full" />
        </div>
      </div>
    </section>
  );
}
