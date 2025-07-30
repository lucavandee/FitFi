import React from 'react';
import TestimonialCarousel from './TestimonialCarousel';

interface TestimonialsProps {
  className?: string;
}

const Testimonials: React.FC<TestimonialsProps> = ({ className = '' }) => {
  return (
    <section id="community" className={`py-12 md:py-20 bg-white ${className}`} aria-labelledby="testimonials-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 id="testimonials-heading" className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Echte verhalen van onze community
          </h2>
        </div>
        
        <TestimonialCarousel />
        
        {/* Trust Indicators */}
        <div className="mt-8 md:mt-12 text-center">
          <div className="flex flex-wrap justify-center items-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>10.000+ rapporten gegenereerd</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>4.8/5 gemiddelde beoordeling</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>95% nauwkeurigheid</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;