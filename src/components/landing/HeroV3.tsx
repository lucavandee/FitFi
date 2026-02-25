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
    navigate(user ? '/onboarding' : '/registreren');
  };

  const handleExampleClick = () => {
    navigate('/results/preview');
  };

  return (
    <section aria-labelledby="hero-heading">

      {/* ═══════════════════════════════════════════════
          MOBILE  (< sm)  —  Cinematic full-viewport hero
          Foto vult volledig scherm, premium overlays,
          tekst + CTA vastgepind onderaan
      ═══════════════════════════════════════════════ */}
      <div
        className="sm:hidden relative w-full overflow-hidden"
        style={{ height: '100svh', minHeight: '640px', background: '#1c120a' }}
      >
        {/* ── Full-bleed foto ── */}
        <img
          src="/images/hf_20260221_211319_a32928c5-35c0-46c6-be6e-cfa9d8747078.webp"
          alt="Stijlvol stel op een Amsterdams kanaal"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: '50% 22%' }}
          loading="eager"
          fetchpriority="high"
        />

        {/* ── Bovenste fade — versmelt met header ── */}
        <div
          className="absolute top-0 inset-x-0 pointer-events-none"
          style={{
            height: '30%',
            background:
              'linear-gradient(to bottom, rgba(28,18,10,0.62) 0%, rgba(28,18,10,0.18) 60%, transparent 100%)',
          }}
          aria-hidden="true"
        />

        {/* ── Onderste gradient — breed, zacht, diep ── */}
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{
            height: '72%',
            background:
              'linear-gradient(to bottom, transparent 0%, rgba(20,13,8,0.50) 30%, rgba(20,13,8,0.82) 58%, rgba(20,13,8,0.96) 78%, rgba(20,13,8,1.0) 100%)',
          }}
          aria-hidden="true"
        />

        {/* ── Zachte vignet op de randen ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 50%, rgba(20,13,8,0.30) 100%)',
          }}
          aria-hidden="true"
        />

        {/* ── AI badge — top left, met frosted glass ── */}
        <div
          className="absolute top-5 left-4 z-20 inline-flex items-center gap-2 px-3.5 py-2 rounded-full"
          style={{
            background: 'rgba(247,243,236,0.15)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(247,243,236,0.25)',
            boxShadow: '0 2px 16px rgba(0,0,0,0.18)',
          }}
        >
          <Sparkles
            className="w-3 h-3"
            style={{ color: '#e8d5b0' }}
            aria-hidden="true"
          />
          <span
            className="text-[11px] font-bold tracking-[0.08em] uppercase"
            style={{ color: '#F7F3EC' }}
          >
            AI Stijladvies
          </span>
        </div>

        {/* ── Tekstblok + CTA — vastgepind onderaan, ruime zijmarges ── */}
        <div className="absolute bottom-0 inset-x-0 z-20 px-6 pb-10">

          {/* Live count pill */}
          {todayCount !== undefined && todayCount > 0 && (
            <div
              className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full"
              style={{
                background: 'rgba(247,243,236,0.10)',
                border: '1px solid rgba(247,243,236,0.16)',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0"
                style={{ background: '#b8976a' }}
                aria-hidden="true"
              />
              <span
                className="text-[11px] font-semibold tracking-wide"
                style={{ color: 'rgba(247,243,236,0.72)' }}
              >
                <span style={{ color: '#e8d5b0', fontWeight: 700 }}>{todayCount}</span>
                &nbsp;{todayCount === 1 ? 'persoon' : 'mensen'} gestart vandaag
              </span>
            </div>
          )}

          {/* Heading */}
          <h1
            id="hero-heading"
            className="font-heading font-bold tracking-tight mb-3"
            style={{
              fontSize: 'clamp(2.5rem, 10.5vw, 3.1rem)',
              lineHeight: 1.04,
              color: '#F7F3EC',
              letterSpacing: '-0.02em',
            }}
          >
            Outfits die{' '}
            <em
              className="not-italic"
              style={{ color: '#d4a96a' }}
            >
              bij jou
            </em>
            <br />
            passen
          </h1>

          {/* Subtekst */}
          <p
            className="text-[15px] font-light leading-[1.6] mb-7"
            style={{ color: 'rgba(247,243,236,0.68)', maxWidth: '88%' }}
          >
            Beantwoord een paar vragen over jouw stijl en ontvang een persoonlijk rapport — compleet met outfits en shoplinks.
          </p>

          {/* Dunne scheidslijn */}
          <div
            className="mb-6"
            style={{
              height: '1px',
              background: 'linear-gradient(to right, rgba(247,243,236,0.18) 0%, transparent 80%)',
            }}
            aria-hidden="true"
          />

          {/* CTA knoppen */}
          <div className="flex flex-col gap-3">
            {/* Primary */}
            <button
              onClick={handleStartClick}
              className="group w-full inline-flex items-center justify-between px-5 min-h-[56px] rounded-[16px] font-bold text-[15px] transition-all duration-200 active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #9b7a52 0%, #7a5c38 100%)',
                color: '#F7F3EC',
                boxShadow: '0 4px 24px rgba(100,72,40,0.55), 0 1px 0 rgba(255,255,255,0.08) inset',
                letterSpacing: '0.01em',
              }}
              aria-label="Start gratis jouw persoonlijk stijlquiz"
            >
              <span>Start gratis stijlquiz</span>
              <span
                className="w-8 h-8 rounded-xl inline-flex items-center justify-center transition-transform duration-200 group-hover:translate-x-0.5"
                style={{ background: 'rgba(255,255,255,0.14)' }}
                aria-hidden="true"
              >
                <ArrowRight className="w-4 h-4" />
              </span>
            </button>

            {/* Secondary row */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleExampleClick}
                className="flex-1 inline-flex items-center justify-center min-h-[46px] rounded-[13px] font-medium text-[13px] tracking-wide transition-all duration-200 active:scale-[0.98]"
                style={{
                  background: 'rgba(247,243,236,0.08)',
                  border: '1px solid rgba(247,243,236,0.18)',
                  color: 'rgba(247,243,236,0.86)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }}
                aria-label="Bekijk voorbeeld rapport"
              >
                Bekijk voorbeeld
              </button>

              <div
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 min-h-[46px] rounded-[13px] text-[12px] font-semibold"
                style={{
                  background: 'rgba(247,243,236,0.08)',
                  border: '1px solid rgba(247,243,236,0.18)',
                  color: 'rgba(247,243,236,0.62)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }}
              >
                <svg
                  className="w-3 h-3 flex-shrink-0"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2.5 6l2.5 2.5 4.5-5"
                    stroke="#b8976a"
                    strokeWidth="1.5"
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
              className="text-lg md:text-xl leading-relaxed max-w-lg mb-10 font-light"
              style={{ color: 'rgba(247,243,236,0.82)' }}
            >
              Beantwoord een paar vragen over jouw stijl en ontvang een persoonlijk rapport — compleet met outfits en shoplinks.
            </p>

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
                Start gratis stijlquiz
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
