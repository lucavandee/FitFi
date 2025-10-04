import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

const ClosingCTA: React.FC = () => {
  const navigate = useNavigate();

  const handleStartQuiz = () => {
    navigate('/quiz');
  };

  return (
    <section className="py-24 bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-600 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-sm font-medium text-white/90 shadow-sm mb-8">
            <Sparkles className="w-4 h-4" />
            KLAAR OM TE BEGINNEN?
          </div>

          {/* Main headline */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Ontdek jouw perfecte stijl
            <br />
            <span className="text-white/80">binnen 2 minuten</span>
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed max-w-2xl mx-auto">
            Krijg je persoonlijke stijlrapport met kleuren, archetype en 6-12 complete outfits. 
            Helemaal gratis en zonder gedoe.
          </p>

          {/* CTA Button */}
          <button
            onClick={handleStartQuiz}
            className="group inline-flex items-center justify-center gap-3 px-10 py-5 bg-white hover:bg-gray-50 text-gray-900 font-bold text-lg rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg"
          >
            Start gratis stijlquiz
            <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
          </button>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-10 text-white/70 text-sm">
            <div>✓ 100% Gratis</div>
            <div>✓ Geen account nodig</div>
            <div>✓ Privacy-first</div>
            <div>✓ Direct resultaat</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClosingCTA;