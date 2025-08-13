import React from 'react';
import { ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';
import SmartImage from '@/components/media/SmartImage';

interface HeroProps {
  onCTAClick?: () => void;
  className?: string;
}

const Hero: React.FC<HeroProps> = ({ onCTAClick, className = '' }) => {
  const handleCTAClick = () => {
    if (onCTAClick) {
      onCTAClick();
    } else {
      // Default behavior: navigate to dynamic onboarding
      window.location.href = '/dynamic-onboarding';
    }
    
    // Track CTA click
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'cta_click', {
        event_category: 'conversion',
        event_label: 'hero_cta_ai_style_report',
        page_location: window.location.href
      });
    }
  };

  return (
    <section className={`relative py-20 md:py-28 overflow-hidden bg-gradient-to-br from-white via-gray-50 to-purple-50 ${className}`} aria-labelledby="hero-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className="mb-6">
              <div className="inline-flex items-center space-x-2 bg-[#bfae9f]/10 text-[#bfae9f] px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles size={16} />
                <span>Gratis AI Style Report</span>
              </div>
              
              <h1 id="hero-heading" className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 leading-tight mb-6">
                <span className="hero-title text-balance">
                  Ontdek wat jouw <span className="heading-reset">stijl</span> over je zegt
                </span>
              </h1>
              
              <p className="copy-muted text-lg md:text-xl mt-4 max-w-2xl mx-auto lg:mx-0 mb-8">
                Krijg in 2 minuten een gepersonaliseerd AI-rapport dat onthult hoe jouw kledingkeuzes 
                jouw persoonlijkheid weerspiegelen en hoe je dit kunt gebruiken om jouw doelen te bereiken.
              </p>
            </div>
            
            {/* Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { icon: <CheckCircle size={16} />, text: '100% Gratis' },
                { icon: <CheckCircle size={16} />, text: '2 Minuten' },
                { icon: <CheckCircle size={16} />, text: 'Direct Resultaat' }
              ].map((benefit, index) => (
                <div key={index} className="flex items-center justify-center lg:justify-start space-x-2 text-gray-700">
                  <div className="text-green-600">{benefit.icon}</div>
                  <span className="text-sm font-medium">{benefit.text}</span>
                </div>
              ))}
            </div>
            
            {/* CTA */}
            <div className="space-y-4">
              <Button
                onClick={handleCTAClick}
                variant="primary"
                size="lg"
                icon={<ArrowRight size={20} />}
                iconPosition="right"
                className="cta-btn px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                aria-label="Start je gratis AI Style Report"
              >
                Ja, geef mij mijn gratis AI Style Report
              </Button>
              
              <p className="text-sm text-gray-500">
                Geen creditcard vereist • Privacy gegarandeerd • 10.000+ rapporten gegenereerd
              </p>
            </div>
          </div>
          
          {/* Visual */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative">
              {/* Main Image */}
              <SmartImage
                src="https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&dpr=2"
                alt="Vrouw die haar perfecte stijl heeft ontdekt met FitFi"
                id="hero-main"
                kind="generic"
                width={350}
                height={500}
                sizes="(max-width: 768px) 280px, 350px"
                aspect="7/10"
                containerClassName="h-[500px] w-[350px] rounded-3xl shadow-2xl"
                priority
                eager
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#bfae9f]/20 to-transparent"></div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center animate-bounce-gentle">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#bfae9f]">95%</div>
                  <div className="text-xs text-gray-600">Match</div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg p-4 animate-fade-in">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#bfae9f] rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">Nova AI</div>
                    <div className="text-xs text-gray-600">Jouw stylist</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;