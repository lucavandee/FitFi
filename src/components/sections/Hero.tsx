import React from 'react';
import { Link } from 'react-router-dom';

// Inline analytics fallback (use existing @/utils/analytics if available)
let track = (event: string, props: any = {}) => {
  try {
    const w: any = window;
    if (typeof w.gtag === 'function') {
      w.gtag('event', event, props);
    } else if (typeof w.plausible === 'function') {
      w.plausible(event, { props });
    } else if (import.meta.env.DEV) {
      console.info('[analytics]', event, props);
    }
  } catch {}
};

export default function Hero() {
  const handlePrimaryCTA = () => {
    track('hero_primary_cta_clicked', {
      location: 'hero',
      section: 'homepage',
      cta_type: 'primary'
    });
  };

  const handleSecondaryCTA = () => {
    track('hero_secondary_cta_clicked', {
      location: 'hero',
      section: 'homepage',
      cta_type: 'secondary'
    });
  };

  return (
    <section id="hero" aria-labelledby="hero-heading" className="bg-white">
      {/* Sentinel for sticky CTA observer */}
      <div id="hero-sentinel" className="h-0 w-0" aria-hidden="true" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-[#89CFF0]/10 text-[#89CFF0] rounded-full text-sm font-medium">
                AI-Powered Personal Styling
              </span>
            </div>
            
            <h1 id="hero-heading" className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-[#0D1B2A] mb-6">
              Jouw persoonlijke stijl.{' '}
              <span className="text-[#89CFF0]">Aangedreven door AI.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-8 max-w-2xl mx-auto lg:mx-0">
              Doe de slimme stijltest en krijg direct een persoonlijk AI Style Report met outfits die écht bij je passen. 
              In 2 minuten weet je precies welke kleding jouw persoonlijkheid en lichaamsbouw flatteert.
            </p>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 mb-8 text-sm text-slate-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>100% Gratis</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>2 Minuten</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Direct Resultaat</span>
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/registreren"
                onClick={handlePrimaryCTA}
                className="inline-flex items-center justify-center rounded-2xl px-8 py-4 text-lg font-semibold text-white bg-[#89CFF0] hover:bg-[#89CFF0]/90 transition-all shadow-[0_8px_30px_rgba(137,207,240,0.35)] hover:shadow-[0_12px_40px_rgba(137,207,240,0.45)] transform hover:scale-105"
                data-analytics="hero_primary_cta"
              >
                Doe de stijltest
              </Link>
              
              <Link
                to="/hoe-het-werkt"
                onClick={handleSecondaryCTA}
                className="inline-flex items-center justify-center rounded-2xl px-8 py-4 text-lg font-semibold border-2 border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white transition-all"
                data-analytics="hero_secondary_cta"
              >
                Meer uitleg
              </Link>
            </div>
            
            {/* Disclaimer */}
            <p className="mt-6 text-sm text-slate-500 max-w-2xl mx-auto lg:mx-0">
              Geen creditcard vereist • Privacy gegarandeerd • 10.000+ rapporten gegenereerd
            </p>
          </div>

          {/* Visual */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative">
              {/* Main hero visual */}
              <div className="aspect-[3/4] w-[320px] md:w-[380px] rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-[0_8px_30px_rgba(13,27,42,0.06)] overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&dpr=2"
                  alt="Vrouw die haar perfecte stijl heeft ontdekt met FitFi"
                  className="h-full w-full object-cover"
                  onError={(e: any) => {
                    e.currentTarget.src = 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&dpr=2';
                  }}
                  loading="eager"
                />
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center animate-bounce-gentle">
                <div className="text-center">
                  <div className="text-xl font-bold text-[#89CFF0]">95%</div>
                  <div className="text-xs text-slate-600">Match</div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-[#89CFF0] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">N</span>
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 text-sm">Nova AI</div>
                    <div className="text-xs text-slate-600">Jouw stylist</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}