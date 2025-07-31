import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import Button from '../ui/Button';
import ImageWithFallback from '../ui/ImageWithFallback';

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
        event_category: 'engagement',
        event_label: 'hero_ai_style_report',
        page_location: window.location.href
      });
    }
  };

  return (
    <section className={`relative min-h-screen bg-gradient-to-br from-[#FAF8F6] via-white to-[#F5F3F0] overflow-hidden ${className}`} aria-labelledby="hero-heading">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#bfae9f]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Content */}
          <div className="text-center lg:text-left space-y-8">
            <div className="space-y-6">
              <h1 id="hero-heading" className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 leading-tight">
                Wat zegt jouw stijl{' '}
                <span className="font-medium text-[#bfae9f]">écht</span>{' '}
                over jou?
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-2xl">
                Ontdek wat jouw kledingkeuzes vertellen over jouw persoonlijkheid, doelen en verborgen talenten.
              </p>
            </div>
            
            <div className="space-y-6">
              <Button
                onClick={handleCTAClick}
                variant="primary"
                size="lg"
                icon={<ArrowRight size={20} />}
                iconPosition="right"
                className="cta-btn px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                aria-label="Start je gratis AI Style Report"
              >
                Ontvang jouw gratis AI Style Report
              </Button>
              
              <div className="flex items-center justify-center lg:justify-start space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Sparkles size={16} className="text-[#bfae9f]" />
                  <span>100% gratis</span>
                </div>
                <span>•</span>
                <span>Slechts 2 minuten</span>
                <span>•</span>
                <span>Direct resultaat</span>
              </div>
            </div>
          </div>
          
          {/* Visual */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg">
              {/* Main Image */}
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&dpr=2"
                  alt="Nova AI Style Analysis - Futuristische stijlanalyse interface"
                  className="w-full h-full object-cover"
                  componentName="Hero"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">Nova analyseert...</span>
                </div>
              </div>
              
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#bfae9f] mb-1">87%</div>
                  <div className="text-xs text-gray-600">Stijlmatch</div>
                </div>
              </div>
              
              <div className="absolute top-1/2 -right-8 transform -translate-y-1/2 bg-white rounded-xl p-3 shadow-lg border border-gray-100">
                <div className="text-xs text-gray-600 mb-1">Persoonlijkheid</div>
                <div className="text-sm font-medium text-gray-900">Minimalistisch</div>
                <div className="text-sm font-medium text-gray-900">Leider</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;