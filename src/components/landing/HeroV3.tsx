import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
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
    <section aria-labelledby="hero-heading">

      {/* ═══════════════════════════════════════════════
          MOBILE  (< sm)  —  Editorial magazine layout
          Full-viewport, photo top-half, warm content below
      ═══════════════════════════════════════════════ */}
      <div
        className="sm:hidden relative flex flex-col"
        style={{ minHeight: '100svh' }}
      >
        {/* ── Photo half ── */}
        <div className="relative flex-shrink-0" style={{ height: '52svh' }}>
          <img
            src="/images/c614360c-fec6-44de-89c5-497a49a852a7.webp"
            alt="Stijlvol stel met persoonlijk stijladvies"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: '50% 18%' }}
            loading="eager"
          />

          {/* Top fade — merges with header */}
          <div
            className="absolute top-0 inset-x-0 h-24 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, var(--color-bg) 0%, transparent 100%)',
            }}
            aria-hidden="true"
          />

          {/* Bottom wave fade — merges photo into warm bg below */}
          <div
            className="absolute bottom-0 inset-x-0 h-32 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, transparent 0%, var(--color-bg) 100%)',
            }}
            aria-hidden="true"
          />

          {/* AI badge — top left */}
          <div
            className="absolute top-5 left-4 inline-flex items-center gap-2 px-3.5 py-2 rounded-full shadow-lg"
            style={{
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <Sparkles
              className="w-3 h-3"
              style={{ color: 'var(--ff-color-primary-600)' }}
              aria-hidden="true"
            />
            <span
              className="text-[11px] font-bold tracking-wide uppercase"
              style={{ color: 'var(--ff-color-primary-700)' }}
            >
              AI Stijladvies
            </span>
          </div>

          {/* Live count pill — bottom right of photo */}
          {todayCount !== undefined && todayCount > 0 && (
            <div
              className="absolute bottom-10 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{
                background: 'rgba(255,255,255,0.88)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: '#22c55e' }}
                aria-hidden="true"
              />
              <span
                className="text-[11px] font-semibold"
                style={{ color: 'var(--color-text)' }}
              >
                {todayCount} gestart vandaag
              </span>
            </div>
          )}
        </div>

        {/* ── Content half — sits on warm bg, no dark bg ── */}
        <div
          className="flex-1 flex flex-col justify-between px-5 pb-6 pt-0"
          style={{ background: 'var(--color-bg)' }}
        >
          {/* Text block */}
          <div>
            <h1
              id="hero-heading"
              className="font-heading font-bold leading-[1.05] tracking-tight mb-3"
              style={{
                fontSize: 'clamp(2.4rem, 10vw, 3rem)',
                color: 'var(--color-text)',
              }}
            >
              Outfits die{' '}
              <em
                className="not-italic"
                style={{ color: 'var(--ff-color-primary-600)' }}
              >
                bij jou
              </em>{' '}
              passen
            </h1>

            <p
              className="text-base leading-relaxed mb-5"
              style={{ color: 'var(--color-muted)' }}
            >
              In 2 minuten een stijlrapport dat je écht helpt kiezen wat je aantrekt.
            </p>

            {/* Feature chips — compact horizontal */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                'Combinaties + shoplinks',
                'Werk & weekend outfits',
                'Aanpasbaar & persoonlijk',
              ].map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                >
                  <svg
                    className="w-3 h-3 flex-shrink-0"
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="var(--ff-color-primary-600)"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* CTA block */}
          <div className="flex flex-col gap-3">
            {/* Primary */}
            <button
              onClick={handleStartClick}
              className="group w-full inline-flex items-center justify-between px-6 min-h-[58px] rounded-2xl font-bold text-[15px] transition-all duration-200 active:scale-[0.98]"
              style={{
                background: 'var(--ff-color-primary-700)',
                color: '#fff',
                boxShadow: '0 8px 32px -4px rgba(0,0,0,0.22)',
              }}
              aria-label="Start gratis jouw persoonlijk stijlquiz"
            >
              <span>Start mijn stijlquiz</span>
              <span
                className="w-9 h-9 rounded-xl inline-flex items-center justify-center transition-transform duration-200 group-hover:translate-x-0.5"
                style={{ background: 'rgba(255,255,255,0.15)' }}
                aria-hidden="true"
              >
                <ArrowRight className="w-4 h-4" />
              </span>
            </button>

            {/* Secondary + trust inline */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleExampleClick}
                className="flex-1 inline-flex items-center justify-center min-h-[46px] rounded-xl font-medium text-sm transition-all duration-200"
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                }}
                aria-label="Bekijk voorbeeld rapport"
              >
                Bekijk voorbeeld
              </button>

              <div
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 min-h-[46px] rounded-xl text-xs font-semibold"
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-muted)',
                }}
              >
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3.5 7l2.5 2.5 4.5-5"
                    stroke="#22c55e"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Gratis
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          DESKTOP  (≥ sm)
          Full-bleed editorial hero — nieuwe Amsterdam foto
      ═══════════════════════════════════════════════ */}
      <div
        className="hidden sm:block relative w-full overflow-hidden"
        style={{
          minHeight: 'min(92vh, 820px)',
          background: '#2a1f14',
        }}
      >
        {/* ── Full-bleed foto ── */}
        <div className="absolute inset-0" aria-hidden="true">
          <img
            src="/images/hf_20260221_210750_e12efd50-544c-4e35-986d-bfff9999542b.webp"
            alt=""
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center 20%' }}
            loading="eager"
          />
          {/* Linker overlay: warm donker verloop → tekst leesbaar op linker helft */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(100deg, rgba(30,20,10,0.82) 0%, rgba(30,20,10,0.55) 38%, rgba(30,20,10,0.08) 65%, transparent 100%)',
            }}
          />
          {/* Onderste fade naar website-achtergrond voor naadloze overgang */}
          <div
            className="absolute bottom-0 inset-x-0 h-40"
            style={{
              background: 'linear-gradient(to bottom, transparent 0%, rgba(247,243,236,0.18) 100%)',
            }}
          />
        </div>

        {/* ── Tekstkolom links ── */}
        <div
          className="relative z-10 w-full max-w-7xl mx-auto px-8 lg:px-14 flex items-center"
          style={{ minHeight: 'min(92vh, 820px)' }}
        >
          <div className="max-w-xl lg:max-w-2xl py-28">

            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-7 shadow-xl"
              style={{
                background: 'rgba(247,243,236,0.96)',
                color: 'var(--ff-color-primary-700)',
              }}
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              Persoonlijk AI-stijladvies
            </div>

            <h1
              id="hero-heading"
              className="font-heading font-bold leading-[1.05] tracking-tight mb-5"
              style={{
                fontSize: 'clamp(3rem, 6vw, 5.5rem)',
                color: '#F7F3EC',
              }}
            >
              Outfits die{' '}
              <em
                className="not-italic"
                style={{ color: 'var(--ff-color-primary-300)' }}
              >
                bij jou passen
              </em>
            </h1>

            <p
              className="text-lg md:text-xl leading-relaxed max-w-lg mb-8 font-light"
              style={{ color: 'rgba(247,243,236,0.82)' }}
            >
              In 2 minuten een stijlrapport dat je écht helpt kiezen wat je aantrekt.
            </p>

            <ul className="space-y-3 mb-10">
              {[
                'Direct combinaties + shoplinks op maat',
                'Outfits voor werk, weekend en uitgaan',
                'Aanbevelingen die meegroeien met jou',
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-base"
                  style={{ color: 'rgba(247,243,236,0.88)' }}
                >
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <circle cx="10" cy="10" r="9" stroke="rgba(247,243,236,0.25)" strokeWidth="1.5" />
                    <path d="M6.5 10l2.5 2.5 4.5-4.5" stroke="var(--ff-color-primary-300)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            {/* CTA knoppen */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleStartClick}
                className="group inline-flex items-center gap-2.5 px-8 py-4 min-h-[56px] rounded-xl font-bold text-base transition-all duration-200 hover:scale-[1.02]"
                style={{
                  background: 'var(--ff-color-primary-700)',
                  color: '#F7F3EC',
                  boxShadow: '0 8px 40px rgba(122,97,74,0.45)',
                }}
                aria-label="Start gratis stijlquiz"
              >
                Start mijn stijlquiz
                <ArrowRight
                  className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </button>

              <button
                onClick={handleExampleClick}
                className="inline-flex items-center gap-2 px-6 py-4 min-h-[56px] rounded-xl font-medium text-base transition-all duration-200"
                style={{
                  background: 'rgba(247,243,236,0.10)',
                  border: '1px solid rgba(247,243,236,0.28)',
                  color: 'rgba(247,243,236,0.90)',
                }}
                aria-label="Bekijk voorbeeld rapport"
              >
                Bekijk voorbeeld
              </button>
            </div>

            {todayCount !== undefined && todayCount > 0 && (
              <p
                className="mt-5 text-sm flex items-center gap-2"
                style={{ color: 'rgba(247,243,236,0.60)' }}
              >
                <span
                  className="w-2 h-2 rounded-full animate-pulse inline-block"
                  style={{ background: 'var(--ff-color-primary-300)' }}
                  aria-hidden="true"
                />
                <span style={{ color: 'var(--ff-color-primary-300)', fontWeight: 600 }}>{todayCount}</span>
                &nbsp;{todayCount === 1 ? 'persoon' : 'mensen'} gestart vandaag
              </p>
            )}
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce"
          aria-hidden="true"
        >
          <div
            className="w-6 h-10 rounded-full border-2 flex items-start justify-center pt-2"
            style={{ borderColor: 'rgba(247,243,236,0.30)' }}
          >
            <div
              className="w-1 h-2 rounded-full"
              style={{ background: 'rgba(247,243,236,0.55)' }}
            />
          </div>
        </div>
      </div>

    </section>
  );
}
