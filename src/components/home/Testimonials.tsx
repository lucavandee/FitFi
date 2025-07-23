import React from 'react';
import { Quote, Star } from 'lucide-react';
import ImageWithFallback from '../ui/ImageWithFallback';

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  avatar: string;
  rating: number;
}

interface TestimonialsProps {
  className?: string;
}

const Testimonials: React.FC<TestimonialsProps> = ({ className = '' }) => {
  const testimonials: Testimonial[] = [
    {
      id: 'lisa',
      quote: "Nova begrijpt precies wie ik ben. Geweldig!",
      author: "Lisa",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      rating: 5
    },
    {
      id: 'sem',
      quote: "Voor het eerst weet ik écht wat bij mij past!",
      author: "Sem",
      avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      rating: 5
    }
  ];

  return (
    <section className={`py-16 bg-white ${className}`} aria-labelledby="testimonials-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 id="testimonials-heading" className="text-2xl md:text-3xl font-light text-gray-900 mb-4">
            Wat onze gebruikers zeggen
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center mb-6">
                <Quote className="text-[#bfae9f] mr-3" size={24} />
                <div className="flex">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-current" size={16} />
                  ))}
                </div>
              </div>
              
              <blockquote className="text-lg text-gray-700 leading-relaxed mb-6 italic">
                "{testimonial.quote}"
              </blockquote>
              
              <div className="flex items-center">
                <ImageWithFallback
                  src={testimonial.avatar}
                  alt={`${testimonial.author} - Tevreden gebruiker`}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                  componentName="Testimonials"
                />
                <div>
                  <div className="font-medium text-gray-900">{testimonial.author}</div>
                  <div className="text-sm text-gray-500">Geverifieerde gebruiker</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Trust Indicators */}
        <div className="mt-12 text-center">
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