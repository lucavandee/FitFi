import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import { useUser } from '@/context/UserContext';

export function HeroV3() {
  const { user } = useUser();
  const navigate = useNavigate();

  const handleStartClick = () => {
    if (user) {
      navigate('/onboarding');
    } else {
      navigate('/register');
    }
  };

  const handleExampleClick = () => {
    navigate('/results');
  };

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-[var(--color-bg)]">

      {/* Background - Using local hero image */}
      <div className="absolute inset-0">
        <picture>
          <source media="(min-width: 1024px)" srcSet="/hero/hero-style-report-lg.webp" />
          <source media="(min-width: 768px)" srcSet="/hero/hero-style-report-md.webp" />
          <source media="(min-width: 640px)" srcSet="/hero/hero-style-report-sm.webp" />
          <img
            src="/hero/hero-style-report-xs.webp"
            alt="Style Report Preview"
            className="w-full h-full object-cover object-center"
            loading="eager"
            fetchPriority="high"
          />
        </picture>

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-4xl">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/95 backdrop-blur-sm rounded-full text-sm font-bold text-[var(--ff-color-primary-700)] mb-8 shadow-2xl">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
            AI-powered stijladvies
          </div>

          {/* H1 - Massive & Bold */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.05] tracking-tight mb-8">
            Ontdek outfits<br />
            die{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-[var(--ff-color-accent-300)] via-white to-[var(--ff-color-primary-300)] bg-clip-text text-transparent">
                perfect
              </span>
              <span className="absolute -bottom-2 left-0 right-0 h-3 bg-[var(--ff-color-accent-400)] opacity-30 blur-sm"></span>
            </span>
            {' '}bij<br />
            je passen
          </h1>

          {/* Subline */}
          <p className="text-xl sm:text-2xl lg:text-3xl text-white/95 leading-relaxed max-w-3xl mb-12 font-light">
            Persoonlijk Style Report met kleuren die flatteren, snit die respecteert,
            en 6–12 complete looks. <span className="font-semibold">In 2 minuten.</span>
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-5">
            <button
              onClick={handleStartClick}
              className="group inline-flex items-center justify-center gap-3 px-10 py-6 bg-white hover:bg-gray-50 text-[var(--color-text)] rounded-2xl font-bold text-xl shadow-2xl transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_25px_80px_rgba(255,255,255,0.4)]"
            >
              Begin je stijlreis
              <ArrowRight className="w-7 h-7 transition-transform duration-300 group-hover:translate-x-2" />
            </button>

            <button
              onClick={handleExampleClick}
              className="group inline-flex items-center justify-center gap-3 px-10 py-6 bg-white/15 hover:bg-white/25 backdrop-blur-md border-2 border-white/40 hover:border-white/60 text-white rounded-2xl font-bold text-xl transition-all duration-300 hover:scale-[1.03]"
            >
              <Play className="w-6 h-6" />
              Zie voorbeeld
            </button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center gap-8 mt-10 text-white/90">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-semibold text-lg">Gratis start</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-semibold text-lg">~2 minuten</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="font-semibold text-lg">Privacy-first</span>
            </div>
          </div>

        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <div className="w-8 h-12 border-3 border-white/60 rounded-full flex items-start justify-center p-2">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>

    </section>
  );
}
