import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play, Users, CheckCircle } from 'lucide-react';
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

  const bullets = [
    'Direct combinaties + shoplinks op maat',
    'Outfits voor werk, weekend en uitgaan',
    'Aanbevelingen die meegroeien met jou',
  ];

  return (
    <section aria-labelledby="hero-heading">

      {/* ────────────────────────────────────────────
          MOBILE LAYOUT  (< sm)
          Photo card on warm bg, content below in warm bg
      ──────────────────────────────────────────── */}
      <div className="sm:hidden bg-[var(--color-bg)]">

        {/* Photo — rounded card that feels premium */}
        <div className="px-4 pt-3 pb-0">
          <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl" style={{ aspectRatio: '4/5' }}>
            <img
              src="/images/c614360c-fec6-44de-89c5-497a49a852a7.webp"
              alt="Stijlvol stel met persoonlijk stijladvies"
              className="w-full h-full object-cover object-[55%_top]"
              loading="eager"
            />

            {/* Subtle bottom gradient — blends into the card edge */}
            <div
              className="absolute inset-0 rounded-3xl"
              style={{
                background: 'linear-gradient(to bottom, transparent 45%, rgba(0,0,0,0.28) 100%)',
              }}
              aria-hidden="true"
            />

            {/* Badge — floating pill on the photo */}
            <div
              className="absolute top-4 left-4 inline-flex items-center gap-2 px-3.5 py-2 bg-white/95 backdrop-blur-md rounded-full text-xs font-bold text-[var(--ff-color-primary-700)] shadow-lg"
              role="status"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse flex-shrink-0" aria-hidden="true" />
              Persoonlijk stijladvies
            </div>

            {/* Trust pill — bottom right of photo */}
            {todayCount !== undefined && todayCount > 0 && (
              <div className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-xs font-semibold text-white shadow">
                <Users className="w-3 h-3 text-green-400 flex-shrink-0" aria-hidden="true" />
                <span><span className="text-green-400">{todayCount}</span> vandaag</span>
              </div>
            )}
          </div>
        </div>

        {/* Content — warm background, clean typography */}
        <div className="px-5 pt-7 pb-8">

          {/* Headline */}
          <h1
            id="hero-heading"
            className="text-[2.6rem] font-bold text-[var(--color-text)] leading-[1.06] tracking-tight mb-3"
          >
            Outfits die{' '}
            <span className="text-[var(--ff-color-primary-600)]">bij jou passen</span>
          </h1>

          {/* Subline */}
          <p className="text-[1rem] text-[var(--color-muted)] leading-relaxed mb-5">
            In 2 minuten een stijlrapport dat je écht helpt kiezen wat je aantrekt.
          </p>

          {/* Bullets */}
          <ul className="space-y-2.5 mb-7">
            {bullets.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <CheckCircle
                  className="w-4 h-4 text-[var(--ff-color-primary-600)] flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span className="text-sm text-[var(--color-text)] leading-snug">{item}</span>
              </li>
            ))}
          </ul>

          {/* Primary CTA */}
          <button
            onClick={handleStartClick}
            className="group w-full flex items-center justify-center gap-2.5 px-6 py-4 min-h-[56px] bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] active:scale-[0.98] text-white rounded-2xl font-bold text-base shadow-lg hover:shadow-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2"
            aria-label="Ontvang gratis persoonlijk stijladvies in 2 minuten"
          >
            Start mijn stijlquiz
            <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1 flex-shrink-0" aria-hidden="true" />
          </button>

          {/* Secondary CTA */}
          <button
            onClick={handleExampleClick}
            className="group w-full flex items-center justify-center gap-2 mt-3 px-6 py-3.5 min-h-[48px] border border-[var(--color-border)] hover:border-[var(--ff-color-primary-400)] text-[var(--color-text)] hover:text-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-50)] rounded-2xl font-medium text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-400)]"
            aria-label="Bekijk voorbeeld stijladvies"
          >
            <Play className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            Bekijk voorbeeld
          </button>

          {/* Trust row */}
          <div className="flex items-center justify-center gap-5 mt-5 text-xs text-[var(--color-muted)]">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Gratis start
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              ~2 minuten
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Geen creditcard
            </span>
          </div>

        </div>
      </div>

      {/* ────────────────────────────────────────────
          DESKTOP LAYOUT  (≥ sm)
          Classic full-bleed hero with side gradient
      ──────────────────────────────────────────── */}
      <div
        className="hidden sm:block relative w-full overflow-hidden bg-stone-950"
        style={{ minHeight: 'min(92vh, 800px)' }}
      >
        {/* Background image */}
        <div className="absolute inset-0" aria-hidden="true">
          <img
            src="/images/c614360c-fec6-44de-89c5-497a49a852a7.webp"
            alt=""
            className="w-full h-full object-cover object-[center_30%]"
            loading="eager"
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to right, rgba(10,9,8,0.88) 0%, rgba(10,9,8,0.60) 45%, rgba(10,9,8,0.15) 100%)',
            }}
          />
        </div>

        {/* Desktop content */}
        <div
          className="relative z-10 w-full max-w-7xl mx-auto px-8 lg:px-12 flex items-center"
          style={{ minHeight: 'min(92vh, 800px)' }}
        >
          <div className="max-w-xl lg:max-w-2xl py-24">

            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-sm rounded-full text-sm font-bold text-[var(--ff-color-primary-700)] mb-7 shadow-xl"
              role="status"
            >
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" aria-hidden="true" />
              Persoonlijk stijladvies
            </div>

            <h1
              id="hero-heading"
              className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1.05] tracking-tight mb-5"
            >
              Outfits die{' '}
              <span className="text-[var(--ff-color-accent-300,#e8d5b7)]">bij jou passen</span>
            </h1>

            <p className="text-lg md:text-xl text-white/85 leading-relaxed max-w-lg mb-7 font-light">
              In 2 minuten een stijlrapport dat je écht helpt kiezen wat je aantrekt.
            </p>

            <ul className="space-y-3 mb-9 text-white/90 text-base">
              {bullets.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-row gap-3">
              <button
                onClick={handleStartClick}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 min-h-[56px] bg-white hover:bg-gray-50 text-[var(--color-text)] rounded-xl font-bold text-base shadow-2xl transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(255,255,255,0.3)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/80"
                aria-label="Ontvang gratis persoonlijk stijladvies in 2 minuten"
              >
                Start mijn stijlquiz
                <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1 flex-shrink-0" aria-hidden="true" />
              </button>

              <button
                onClick={handleExampleClick}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 min-h-[56px] bg-white/10 hover:bg-white/16 backdrop-blur-sm border border-white/25 hover:border-white/45 text-white rounded-xl font-medium text-base transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60"
                aria-label="Bekijk voorbeeld stijladvies"
              >
                <Play className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                Bekijk voorbeeld
              </button>
            </div>

            {todayCount !== undefined && todayCount > 0 && (
              <div className="flex items-center gap-1.5 mt-6 text-white/75 text-sm">
                <Users className="w-4 h-4 text-green-400 flex-shrink-0" aria-hidden="true" />
                <span>
                  <span className="text-green-400 font-semibold">{todayCount}</span>{' '}
                  {todayCount === 1 ? 'persoon' : 'mensen'} gestart vandaag
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce" aria-hidden="true">
          <div className="w-6 h-9 border-2 border-white/40 rounded-full flex items-start justify-center pt-1.5">
            <div className="w-1 h-1 bg-white/70 rounded-full" />
          </div>
        </div>
      </div>

    </section>
  );
}
