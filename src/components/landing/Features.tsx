import React from 'react';
import { User, Target, Sparkles, Heart } from 'lucide-react';
import Container from '../layout/Container';
interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface FeaturesProps {
  className?: string;
}

const Features: React.FC<FeaturesProps> = ({ className = '' }) => {
  const features: Feature[] = [
    {
      id: 'personality',
      title: "Persoonlijkheid & stijl",
      description: "Begrijp de verborgen boodschap achter jouw kledingkeuzes en wat dit zegt over jouw karakter.",
      icon: <User size={28} />,
      color: "bg-blue-50 text-blue-600"
    },
    {
      id: 'insights',
      title: "3 kritische stijl-insights",
      description: "De top 3 verbeterpunten die je nú kunt toepassen voor een krachtigere uitstraling.",
      icon: <Target size={28} />,
      color: "bg-orange-50 text-orange-600"
    },
    {
      id: 'recommendations',
      title: "Nova's aanbevelingen",
      description: "Direct toepasbare tips en voorbeeldoutfits met visuals, speciaal voor jouw stijl.",
      icon: <Sparkles size={28} />,
      color: "bg-purple-50 text-purple-600"
    },
    {
      id: 'wishlist',
      title: "Wishlist",
      description: "Perfect passende producten geselecteerd door Nova, klaar om te shoppen bij jouw favoriete retailers.",
      icon: <Heart size={28} />,
      color: "bg-pink-50 text-pink-600"
    }
  ];

  return (
    <section className={`py-20 bg-white ${className}`} aria-labelledby="features-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 id="features-heading" className="text-3xl md:text-4xl font-light text-gray-900 mb-6">
            Wat zit er in het AI Style Report?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Jouw persoonlijke stijlrapport bevat alles wat je nodig hebt om jouw stijl naar het volgende niveau te tillen
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div 
              key={feature.id}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:transform hover:scale-105 text-center group"
            >
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${feature.color} group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-medium text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        
        {/* Value Proposition */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-[#bfae9f]/10 to-purple-50 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-medium text-gray-900 mb-4">
              Meer dan alleen mode-advies
            </h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              Nova's AI Style Report geeft je niet alleen outfit-aanbevelingen, maar helpt je begrijpen 
              hoe jouw stijlkeuzes jouw persoonlijkheid weerspiegelen en hoe je dit kunt gebruiken 
              om jouw doelen te bereiken.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;