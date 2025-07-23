import React from 'react';
import { ArrowRight, Sparkles, Clock, Shield } from 'lucide-react';
import Button from '../ui/Button';

interface ClosingCTAProps {
  onCTAClick?: () => void;
  className?: string;
}

const ClosingCTA: React.FC<ClosingCTAProps> = ({ onCTAClick, className = '' }) => {
  const handleCTAClick = () => {
    if (onCTAClick) {
      onCTAClick();
    } else {
      // Default behavior: navigate to onboarding
      window.location.href = '/onboarding';
    }
    
    // Track final CTA click
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'cta_click', {
        event_category: 'conversion',
        event_label: 'closing_cta_ai_style_report',
        page_location: window.location.href
      });
    }
  };

  return (
    <section className={`py-20 bg-gradient-to-br from-[#bfae9f] to-purple-600 ${className}`} aria-labelledby="closing-cta-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-white">
          <div className="max-w-4xl mx-auto">
            {/* Main Content */}
            <div className="mb-12">
              <h2 id="closing-cta-heading" className="text-4xl md:text-5xl lg:text-6xl font-light leading-tight mb-6">
                Klaar om jouw ideale stijl{' '}
                <span className="font-medium">te ontdekken?</span>
              </h2>
              
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto mb-8">
                Duizenden mensen hebben al hun persoonlijke AI Style Report ontvangen. 
                Jij bent de volgende die zijn stijl en zelfvertrouwen transformeert.
              </p>
            </div>
            
            {/* CTA Button */}
            <div className="mb-12">
              <Button
                onClick={handleCTAClick}
                variant="secondary"
                size="lg"
                icon={<ArrowRight size={24} />}
                iconPosition="right"
                className="bg-white text-[#bfae9f] hover:bg-gray-50 px-12 py-5 text-xl font-medium shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                aria-label="Vraag direct jouw gratis AI Style Report aan"
              >
                Vraag direct jouw gratis AI Style Report aan
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Sparkles size={24} className="text-white" />
                </div>
                <div className="text-center">
                  <div className="font-medium text-lg">100% Gratis</div>
                  <div className="text-white/80 text-sm">Geen verborgen kosten</div>
                </div>
              </div>
              
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Clock size={24} className="text-white" />
                </div>
                <div className="text-center">
                  <div className="font-medium text-lg">2 Minuten</div>
                  <div className="text-white/80 text-sm">Direct resultaat</div>
                </div>
              </div>
              
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Shield size={24} className="text-white" />
                </div>
                <div className="text-center">
                  <div className="font-medium text-lg">Privacy First</div>
                  <div className="text-white/80 text-sm">Jouw data is veilig</div>
                </div>
              </div>
            </div>
            
            {/* Social Proof */}
            <div className="mt-12 pt-8 border-t border-white/20">
              <div className="flex flex-wrap justify-center items-center space-x-8 text-white/80">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>10.000+ rapporten gegenereerd</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>4.8/5 ⭐ beoordeling</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>95% nauwkeurigheid</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClosingCTA;