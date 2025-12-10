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
          className="w-full h-full object-cover object-[center_35%] sm:object-[center_40%] md:object-center"
          loading="eager"
          fetchpriority="high"
          style={{ objectFit: 'cover' }}
        />

        {/* Gradient overlay for text readability - stronger on mobile for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-b sm:bg-gradient-to-r from-black/75 via-black/55 to-black/35 sm:from-black/60 sm:via-black/40 sm:to-black/20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24">
        <div className="max-w-4xl">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/95 backdrop-blur-sm rounded-full text-sm font-bold text-[var(--ff-color-primary-700)] mb-8 shadow-2xl">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
            AI stijladvies
          </div>

          {/* H1 - THE Hero Message */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-white leading-[1.05] sm:leading-[0.95] tracking-tight mb-6 sm:mb-8">
            Jouw stijlgids{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-[var(--ff-color-accent-300)] via-white to-[var(--ff-color-primary-300)] bg-clip-text text-transparent">
                in 5 minuten
              </span>
              <span className="absolute -bottom-2 left-0 right-0 h-3 bg-[var(--ff-color-accent-400)] opacity-30 blur-sm"></span>
            </span>
          </h1>

          {/* Subline - Clear Value Prop */}
          <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white/95 leading-relaxed sm:leading-tight max-w-2xl mb-10 sm:mb-12 font-light">
            Ontdek outfits die bij je passen en{' '}
            <span className="font-bold">shop ze direct</span>
          </p>

          {/* CTAs - Mobile-first with 44px+ touch targets */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-5">
            <button
              onClick={handleStartClick}
              className="group inline-flex items-center justify-center gap-2 sm:gap-3 px-8 py-4 sm:px-9 sm:py-5 lg:px-10 lg:py-6 min-h-[52px] sm:min-h-[56px] bg-white hover:bg-gray-50 text-[var(--color-text)] rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg lg:text-xl shadow-2xl transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_25px_80px_rgba(255,255,255,0.4)]"
            >
              Start nu
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 transition-transform duration-300 group-hover:translate-x-2" />
            </button>

            <button
              onClick={handleExampleClick}
              className="group inline-flex items-center justify-center gap-2 sm:gap-3 px-8 py-4 sm:px-9 sm:py-5 lg:px-10 lg:py-6 min-h-[52px] sm:min-h-[56px] bg-white/15 hover:bg-white/25 backdrop-blur-md border-2 border-white/40 hover:border-white/60 text-white rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg lg:text-xl transition-all duration-300 hover:scale-[1.03]"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              Zie voorbeeld
            </button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-5 lg:gap-6 mt-6 sm:mt-8 lg:mt-10 text-white/90 text-sm sm:text-base">
            {todayCount !== undefined && todayCount > 0 && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                <span className="font-semibold">
                  <span className="text-green-400">{todayCount}</span> {todayCount === 1 ? 'persoon' : 'mensen'} vandaag
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-semibold">Gratis start</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-semibold">~2 minuten</span>
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
