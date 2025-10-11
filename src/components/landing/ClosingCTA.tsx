import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ClosingCTA() {
  return (
    <section className="relative py-24 bg-gradient-to-br from-[var(--ff-color-primary-600)] via-[var(--ff-color-accent-600)] to-[var(--ff-color-secondary-600)] overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-8">
          <Sparkles className="w-4 h-4 text-white" />
          <span className="text-sm font-medium text-white">Begin vandaag</span>
        </div>

        {/* Headline - Properly centered */}
        <div className="space-y-6 mb-12">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Ontdek wat jouw stijl is
          </h2>
          
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            8 vragen, 2 minuten. Direct je rapport met kleuren, stijl en concrete outfits die je kunt samenstellen.
          </p>
        </div>

        {/* CTA Buttons - Centered */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            className="bg-white text-[var(--ff-color-primary-700)] hover:bg-white/90 px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Start nu
            <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="lg"
            className="border border-white/30 hover:border-white/50 text-white hover:bg-white/10 px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
          >
            Zie voorbeeldrapport
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-8 mt-12 text-white/80">
          <div className="text-sm">✓ Gratis</div>
          <div className="text-sm">✓ Geen account nodig</div>
          <div className="text-sm">✓ Direct resultaat</div>
        </div>
      </div>
    </section>
  );
}