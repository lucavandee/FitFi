import React from 'react';
import { ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import track from '@/utils/telemetry';
import Button from '../ui/Button';
import SmartImage from '@/components/media/SmartImage';
import HeroTitle from '../marketing/HeroTitle';
import { useABTesting, trackHeroCTA } from '@/hooks/useABTesting';

interface HeroProps {
  onCTAClick?: () => void;
  className?: string;
}

const Hero: React.FC<HeroProps> = ({ onCTAClick, className = '' }) => {
  const { heroCTA } = useABTesting();
  
  const ctaText = heroCTA === 'ai-style-report' ? 'Ontvang je AI Style Report' : 'Ja, geef mij mijn gratis AI Style Report';
  
  const handleCTAClick = () => {
    trackHeroCTA(heroCTA);
    if (typeof track === 'function') track('cta_click', { loc: 'home_hero', cta: 'start_style_report' });
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'cta_click', { location: 'home_hero' });
    }
    
    if (onCTAClick) {
      onCTAClick();
    } else {
      // Default behavior: navigate to dynamic onboarding
      window.location.href = '/dynamic-onboarding';
    }
  };

  return (
    <section className={`not-prose relative py-20 md:py-28 overflow-hidden bg-gradient-to-br from-white via-gray-50 to-purple-50 ${className}`} aria-labelledby="hero-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className="mb-6">
              <div className="inline-flex items-center space-x-2 bg-[#bfae9f]/10 text-[#bfae9f] px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles size={16} />
                <span>Gratis AI Style Report</span>
              </div>
              
              <div className="mb-6">
                <HeroTitle
                  lines={["Ontdek wat jouw stijl over je zegt"]}
                  accents={{ 0: [{ word: 'stijl', className: 'text-gradient accent-bump sheen' }] }}
                  className="text-ink"
                  balance
                />
              </div>
              
              <p className="copy-muted text-lg md:text-xl mt-6 copy-narrow mb-8 leading-relaxed">
                Krijg in 2 minuten een gepersonaliseerd AI-rapport dat laat zien hoe jouw kledingkeuzes je persoonlijkheid weerspiegelen — inclusief concrete outfits en shopbare aanbevelingen.
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
                data-ff-event="cta_click"
                data-ff-loc="home_hero"
                data-analytics="hero-cta"
                data-cta="primary"
                variant="primary"
                size="lg"
                icon={<ArrowRight size={20} />}
                iconPosition="right"
                className="ff-cta cta-btn px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                aria-label="Start je gratis AI Style Report"
              >
                {ctaText}
              </Button>
              
              <p className="text-sm text-gray-500">
                Geen creditcard vereist • Privacy gegarandeerd • 10.000+ rapporten gegenereerd
              </p>
            </div>
          </div>
          
          {/* Visual */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative">
              {/* Main Image in Glass Card */}
              <div className="rounded-3xl shadow-[var(--ff-soft-shadow)] bg-white h-[500px] w-[350px] overflow-hidden">
                <SmartImage
                  src="https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&dpr=2"
                  alt="Vrouw die haar perfecte stijl heeft ontdekt met FitFi"
                  id="hero-main"
                  kind="generic"
                  width={350}
                  height={500}
                  sizes="(max-width: 768px) 280px, 350px"
                  aspect="7/10"
                  imgClassName="img-fit"
                  priority
                />
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 shadow-sm rounded-2xl bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 p-4 animate-fade-in">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle size={16} className="text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">95% Match</div>
                    <div className="text-xs text-gray-600">Match</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 shadow-sm rounded-2xl bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 p-4 animate-fade-in">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Sparkles size={16} className="text-purple-600" />
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