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
    navigate('/results/preview');
  };

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-[var(--color-bg)]">

      {/* Background - Premium couple, woman with phone */}
      <div className="absolute inset-0">
        <img
          src="/images/c614360c-fec6-44de-89c5-497a49a852a7.webp"
          alt="Stijlvol gekleed stel, vrouw met telefoon bekijkt outfit advies"
          className="w-full h-full object-cover object-[center_30%] sm:object-[center_40%] md:object-center"
          loading="eager"
          fetchPriority="high"
        />

        {/* Gradient overlay for text readability - stronger on mobile for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-b sm:bg-gradient-to-r from-black/70 via-black/50 to-black/30 sm:from-black/60 sm:via-black/40 sm:to-black/20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-4xl">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/95 backdrop-blur-sm rounded-full text-sm font-bold text-[var(--ff-color-primary-700)] mb-8 shadow-2xl">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
            AI-powered stijladvies
          </div>

          {/* H1 - Short & Punchy */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-white leading-[1.05] sm:leading-[0.95] tracking-tight mb-6 sm:mb-8">
            Outfits die{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-[var(--ff-color-accent-300)] via-white to-[var(--ff-color-primary-300)] bg-clip-text text-transparent">
                kloppen
              </span>
              <span className="absolute -bottom-2 left-0 right-0 h-3 bg-[var(--ff-color-accent-400)] opacity-30 blur-sm"></span>
            </span>
          </h1>

          {/* Subline - Short & Direct */}
          <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white/95 leading-relaxed sm:leading-tight max-w-2xl mb-10 sm:mb-12 font-light">
            AI vindt wat past. <span className="font-bold">2 minuten, gratis.</span>
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
            <button
              onClick={handleStartClick}
              className="group inline-flex items-center justify-center gap-3 px-8 py-5 sm:px-10 sm:py-6 bg-white hover:bg-gray-50 text-[var(--color-text)] rounded-2xl font-bold text-lg sm:text-xl shadow-2xl transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_25px_80px_rgba(255,255,255,0.4)]"
            >
              Start nu
              <ArrowRight className="w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-300 group-hover:translate-x-2" />
            </button>

            <button
              onClick={handleExampleClick}
              className="group inline-flex items-center justify-center gap-3 px-8 py-5 sm:px-10 sm:py-6 bg-white/15 hover:bg-white/25 backdrop-blur-md border-2 border-white/40 hover:border-white/60 text-white rounded-2xl font-bold text-lg sm:text-xl transition-all duration-300 hover:scale-[1.03]"
            >
              <Play className="w-5 h-5 sm:w-6 sm:h-6" />
              Zie voorbeeld
            </button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center gap-5 sm:gap-8 mt-8 sm:mt-10 text-white/90">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-semibold text-base sm:text-lg">Gratis start</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-semibold text-base sm:text-lg">~2 minuten</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="font-semibold text-base sm:text-lg">Privacy-first</span>
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
