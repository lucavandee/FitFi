import React from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import ImageWithFallback from '../ui/ImageWithFallback';

interface UGCItem {
  id: string;
  image: string;
  caption: string;
  author: string;
  likes: number;
  comments: number;
}

interface UGCGalleryProps {
  className?: string;
}

const UGCGallery: React.FC<UGCGalleryProps> = ({ className = '' }) => {
  const ugcItems: UGCItem[] = [
    {
      id: 'yasmin',
      image: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2",
      caption: "Sinds het rapport begrijp ik hoe ik zakelijker overkom. Topadvies!",
      author: "Yasmin",
      likes: 127,
      comments: 23
    },
    {
      id: 'mike',
      image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2",
      caption: "Nova's aanbevelingen hebben mijn dating game compleet veranderd 🔥",
      author: "Mike",
      likes: 89,
      comments: 15
    },
    {
      id: 'lisa',
      image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2",
      caption: "Eindelijk weet ik waarom ik me zo goed voel in bepaalde outfits!",
      author: "Lisa",
      likes: 156,
      comments: 31
    }
  ];

  return (
    <section className={`py-20 bg-white ${className}`} aria-labelledby="ugc-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 id="ugc-heading" className="text-3xl md:text-4xl font-light text-gray-900 mb-6">
            Echte verhalen van onze community
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ontdek hoe anderen hun AI Style Report hebben gebruikt om hun stijl en zelfvertrouwen te transformeren
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {ugcItems.map((item) => (
            <div 
              key={item.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all hover:transform hover:scale-105 group"
            >
              {/* Image */}
              <div className="relative aspect-[4/5] overflow-hidden">
                <ImageWithFallback
                  src={item.image}
                  alt={`${item.author}'s stijltransformatie`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  componentName="UGCGallery"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between text-white text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Heart size={16} />
                          <span>{item.likes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle size={16} />
                          <span>{item.comments}</span>
                        </div>
                      </div>
                      <div className="text-xs bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                        #NovaKnows
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <blockquote className="text-gray-700 leading-relaxed mb-4 italic">
                  "{item.caption}"
                </blockquote>
                
                <div className="flex items-center justify-between">
                  <div className="font-medium text-gray-900">
                    — {item.author}
                  </div>
                  
                  <div className="flex items-center space-x-3 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Heart size={14} />
                      <span>{item.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle size={14} />
                      <span>{item.comments}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-[#bfae9f]/10 to-purple-50 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-medium text-gray-900 mb-3">
              Deel jouw verhaal
            </h3>
            <p className="text-gray-600 mb-4">
              Laat zien hoe Nova jouw stijl heeft getransformeerd en inspireer anderen
            </p>
            <div className="text-sm text-gray-500">
              Gebruik <span className="font-medium text-[#bfae9f]">#NovaKnows</span> en tag <span className="font-medium">@fitfi</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UGCGallery;