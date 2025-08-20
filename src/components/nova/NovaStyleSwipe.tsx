import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export type OutfitItem = {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  matchScore?: number;   // 0..100
  season?: 'SS' | 'FW' | 'ALL';
  tags?: string[];
  ctaHref?: string;
  source?: string;       // brand or affiliate source
};

function cx(...a: (string|false|undefined)[]) { return a.filter(Boolean).join(' '); }

export default function NovaStyleSwipe({ items = [], className = '' }:{
  items: OutfitItem[];
  className?: string;
}) {
  const scroller = useRef<HTMLDivElement | null>(null);

  const scrollByCards = (dir: -1|1) => {
    const el = scroller.current;
    if (!el) return;
    const card = el.querySelector<HTMLDivElement>('[data-card]');
    const step = card ? card.clientWidth + 16 : el.clientWidth * 0.85;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  if (!items.length) {
    return (
      <section aria-label="AI Style Preview" className={className}>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-[#89CFF0]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-[#89CFF0]" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Style Preview laden...</h3>
          <p className="text-gray-600">Nova bereidt je persoonlijke outfits voor.</p>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="AI Style Preview" className={className}>
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-6 h-6 bg-[#89CFF0] rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <p className="text-sm font-medium text-[#89CFF0]">Nova AI Style Preview</p>
          </div>
          <h2 className="text-2xl md:text-3xl font-light text-[#0D1B2A]">
            Swipe door outfits die bij je passen
          </h2>
        </div>
        <div className="hidden md:flex gap-2">
          <button 
            onClick={() => scrollByCards(-1)} 
            className="w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center transition-colors shadow-sm" 
            aria-label="Vorige outfits"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button 
            onClick={() => scrollByCards(1)} 
            className="w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center transition-colors shadow-sm" 
            aria-label="Volgende outfits"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div
        ref={scroller}
        className="overflow-x-auto scroll-smooth snap-x snap-mandatory flex gap-4 pb-2 scrollbar-hide"
        style={{ scrollPaddingInline: 16 }}
        role="region"
        aria-label="Outfit carousel"
      >
        {items.map((it, index) => (
          <article
            key={it.id}
            data-card
            className="min-w-[75%] sm:min-w-[48%] md:min-w-[32%] lg:min-w-[24%] snap-start bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="aspect-[4/5] bg-gray-100 overflow-hidden relative">
              <img
                src={it.image}
                alt={it.title}
                loading="lazy"
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                onError={(e: any) => { 
                  e.currentTarget.src = 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&dpr=2'; 
                }}
              />
              {typeof it.matchScore === 'number' && (
                <div className="absolute top-3 right-3">
                  <span className={cx(
                    'text-xs font-semibold rounded-full px-2 py-1 shadow-sm',
                    it.matchScore >= 80 ? 'bg-green-500 text-white'
                    : it.matchScore >= 60 ? 'bg-yellow-500 text-white'
                    : 'bg-gray-500 text-white'
                  )}>
                    {it.matchScore}%
                  </span>
                </div>
              )}
            </div>
            
            <div className="p-4">
              <div className="mb-3">
                <h3 className="font-medium text-[#0D1B2A] line-clamp-1 mb-1">{it.title}</h3>
                {it.subtitle && (
                  <p className="text-sm text-gray-600 line-clamp-2">{it.subtitle}</p>
                )}
              </div>
              
              {!!it.tags?.length && (
                <div className="mb-3 flex flex-wrap gap-1">
                  {it.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs text-gray-600 bg-gray-100 rounded-full px-2 py-1">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <Link
                  to={it.ctaHref ?? '/quiz'}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[#0D1B2A] bg-[#89CFF0] hover:bg-[#89CFF0]/90 transition-colors shadow-sm"
                  data-analytics="style_preview_card_cta"
                >
                  Bekijk outfit
                </Link>
                
                {it.source && (
                  <span className="text-xs text-gray-500">{it.source}</span>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
      
      {/* Mobile scroll hint */}
      <div className="md:hidden text-center mt-4">
        <p className="text-xs text-gray-500">← Swipe voor meer outfits →</p>
      </div>
    </section>
  );
}