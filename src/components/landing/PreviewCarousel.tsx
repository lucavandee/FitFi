import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import SmartImage from '@/components/media/SmartImage';

interface PreviewItem {
  id: string;
  title: string;
  description: string;
  image: string;
  quote: string;
}

interface PreviewCarouselProps {
  className?: string;
}

const PreviewCarousel: React.FC<PreviewCarouselProps> = ({ className = '' }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const previews: PreviewItem[] = [
    {
      id: 'personality',
      title: "Persoonlijkheidsanalyse",
      description: "Wat is jouw stijlkeuzes vertellen over jouw karakter",
      image: "https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2",
      quote: "Jouw voorkeur voor minimalisme toont leiderschapspotentieel."
    },
    {
      id: 'insights',
      title: "Kritische Stijl-insights",
      description: "De top 3 verbeterpunten voor jouw stijl",
      image: "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2",
      quote: "Draag vaker contrastkleuren om autoriteit uit te stralen."
    },
    {
      id: 'recommendations',
      title: "Nova's Aanbevelingen",
      description: "Gepersonaliseerde outfit-tips en voorbeelden",
      image: "https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2",
      quote: "Deze combinatie past goed bij jouw kleurtype en lichaamsvorm."
    },
    {
      id: 'wishlist',
      title: "Persoonlijke Wishlist",
      description: "Perfect passende producten geselecteerd door Nova",
      image: "https://images.pexels.com/photos/1280064/pexels-photo-1280064.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2",
      quote: "Deze items passen perfect bij jouw levensstijl en doelen."
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % previews.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + previews.length) % previews.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section className={`py-20 bg-gray-50 ${className}`} aria-labelledby="preview-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 id="preview-heading" className="text-3xl md:text-4xl font-light text-gray-900 mb-6">
            Visuele Preview van jouw AI Style Report
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Krijg een voorproefje van de diepgaande inzichten die Nova voor jou heeft
          </p>
        </div>
        
        <div className="relative max-w-4xl mx-auto">
          {/* Main Carousel */}
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {previews.map((preview) => (
                <div key={preview.id} className="w-full flex-shrink-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
                    {/* Image */}
                    <div className="relative aspect-[4/5] lg:aspect-auto">
                      <SmartImage
                        src={preview.image}
                        alt={`Preview van ${preview.title} sectie`}
                        id={preview.id}
                        kind="generic"
                        aspect="4/5"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent lg:hidden"></div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-8 lg:p-12 flex flex-col justify-center">
                      <div className="mb-6">
                        <div className="inline-flex items-center space-x-2 text-sm text-[var(--ff-color-beige-400)] font-medium mb-4">
                          <Eye size={16} />
                          <span>Preview</span>
                        </div>
                        
                        <h3 className="text-2xl lg:text-3xl font-medium text-gray-900 mb-4">
                          {preview.title}
                        </h3>
                        
                        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                          {preview.description}
                        </p>
                      </div>
                      
                      {/* Quote */}
                      <div className="bg-[var(--ff-color-beige-400)]/10 rounded-xl p-6 border-l-4 border-[var(--ff-color-beige-400)]">
                        <p className="text-lg italic text-gray-700 leading-relaxed">
                          "{preview.quote}"
                        </p>
                        <div className="mt-3 text-sm text-[var(--ff-color-beige-400)] font-medium">
                          — Nova AI
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-14 h-14 min-w-[56px] min-h-[56px] bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
            aria-label="Vorige preview"
          >
            <ChevronLeft size={24} className="text-gray-600" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-14 h-14 min-w-[56px] min-h-[56px] bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
            aria-label="Volgende preview"
          >
            <ChevronRight size={24} className="text-gray-600" />
          </button>
          
          {/* Dots */}
          <div className="flex justify-center space-x-3 mt-8">
            {previews.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-[var(--ff-color-beige-400)]' : 'bg-gray-300'
                }`}
                aria-label={`Ga naar preview ${index + 1}`}
              />
            ))}
          </div>
        </div>
        
        {/* Bottom Text */}
        <div className="text-center mt-12">
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Dit is slechts een voorproefje. Jouw volledige AI Style Report bevat nog veel meer 
            inzichten en aanbevelingen.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PreviewCarousel;