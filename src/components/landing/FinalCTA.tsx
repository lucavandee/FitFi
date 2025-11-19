import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, Shield, Sparkles } from 'lucide-react';
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
      navigate('/register');
    }
  };

  return (
    <section className="relative py-32 bg-gradient-to-br from-[var(--color-bg)] via-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] overflow-hidden">

      {/* Decorative background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--ff-color-primary-200)] rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--ff-color-accent-200)] rounded-full blur-3xl opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-[var(--ff-color-primary-100)] rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="bg-gradient-to-br from-[var(--ff-color-primary-700)] to-[var(--ff-color-primary-500)] rounded-[2.5rem] p-12 md:p-16 text-center shadow-2xl border border-[var(--ff-color-primary-600)] overflow-hidden">

          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl opacity-10"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl opacity-10"></div>

          {/* Content */}
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              Gratis starten
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Klaar om rust in je
              <br />
              garderobe te brengen?
            </h2>

            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              Begin met de stijlquiz en ontvang direct je persoonlijke Style Report met 6–12 outfits die bij je passen
            </p>

            {/* CTA Button */}
            <button
              onClick={handleClick}
              className="group inline-flex items-center justify-center gap-3 px-10 py-6 bg-white hover:bg-gray-50 text-[var(--ff-color-primary-700)] rounded-2xl font-bold text-xl shadow-2xl transition-all hover:scale-105 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] mb-8"
            >
              Begin je stijlreis
              <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
            </button>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="text-sm font-medium">~2 minuten</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-white/50"></div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium"></span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-white/50"></div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Geen creditcard nodig</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
