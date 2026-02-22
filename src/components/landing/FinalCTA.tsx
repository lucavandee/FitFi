import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, Shield, Sparkles, CheckCircle } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { events } from '@/utils/ga4';

export function FinalCTA() {
  const { user } = useUser();
  const navigate = useNavigate();

  const handleClick = () => {
    events.start_style_report('final_cta');
    if (user) {
      navigate('/onboarding');
    } else {
      navigate('/registreren');
    }
  };

  return (
    <section className="relative py-12 sm:py-20 lg:py-28 bg-gradient-to-br from-[var(--color-bg)] via-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] overflow-hidden">

      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute top-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-[var(--ff-color-primary-200)] rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-[var(--ff-color-accent-200)] rounded-full blur-3xl opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-[40rem] sm:h-[40rem] bg-[var(--ff-color-primary-100)] rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="bg-gradient-to-br from-[var(--ff-color-primary-700)] to-[var(--ff-color-primary-500)] rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-8 sm:p-10 md:p-14 lg:p-16 text-center shadow-2xl border border-[var(--ff-color-primary-600)] overflow-hidden">

          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl opacity-10" aria-hidden="true"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl opacity-10" aria-hidden="true"></div>

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs sm:text-sm font-medium mb-6 sm:mb-8">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
              Gratis starten — geen creditcard
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Weet vandaag nog wat
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>je aantrekt
            </h2>

            <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
              Beantwoord een paar vragen over jouw stijl en ontvang een persoonlijk rapport met outfit-combinaties en shoplinks.
            </p>

            <button
              onClick={handleClick}
              className="group inline-flex items-center justify-center gap-2 sm:gap-3 px-8 sm:px-10 py-4 sm:py-5 lg:py-6 min-h-[56px] bg-[var(--color-surface)] hover:bg-[var(--ff-color-primary-50)] text-[var(--ff-color-primary-700)] rounded-xl sm:rounded-2xl font-bold text-lg sm:text-xl shadow-2xl transition-all hover:scale-105 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] mb-3 w-full sm:w-auto"
            >
              Start gratis stijlquiz
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </button>

            <p className="text-white/55 text-sm mb-8 sm:mb-10">
              Duurt ongeveer 2 minuten — geen creditcard nodig
            </p>

            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-white/70 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <span>Duurt ~2 minuten</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-white/30 hidden sm:block" aria-hidden="true" />
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <span>Privacy first</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-white/30 hidden sm:block" aria-hidden="true" />
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <span>Gratis, altijd</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
