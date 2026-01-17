import { useState } from 'react';
import { Briefcase, Coffee, Moon, ShoppingBag } from 'lucide-react';
import { OutfitModal } from './OutfitModal';

interface OutfitItem {
  type: 'top' | 'bottom' | 'shoes' | 'accessory';
  color: string;
  label: string;
  image?: string;
}

interface Outfit {
  id: string;
  title: string;
  context: string;
  icon: typeof Briefcase;
  items: OutfitItem[];
  gradient: string;
  border: string;
  completeImage?: string;
  productImages?: Array<{ name: string; image: string; category: string }>;
}

const outfits: Outfit[] = [
  {
    id: 'work',
    title: 'Kantoor',
    context: 'Zakelijke meeting of werkdag',
    icon: Briefcase,
    gradient: 'from-slate-50 to-slate-100',
    border: 'border-slate-300',
    items: [
      { type: 'top', color: 'bg-slate-800', label: 'Navy blazer', image: '/images/kantoor/68c7f668-08b6-4183-a4ba-e63a89858eb2 copy copy.webp' },
      { type: 'top', color: 'bg-white', label: 'Wit overhemd', image: '/images/kantoor/7bb820f7-1c79-45d6-ab9a-2f179aad8e47 copy copy.webp' },
      { type: 'bottom', color: 'bg-slate-700', label: 'Grijze pantalon', image: '/images/kantoor/36e92469-6f72-4b27-bdc1-df1a89edf31b_(1) copy copy.webp' },
      { type: 'shoes', color: 'bg-slate-900', label: 'Zwarte schoenen', image: '/images/kantoor/dedac5c1-3dd7-417f-93ec-44b09121f537_(1) copy copy.webp' }
    ],
    completeImage: '/images/kantoor/47c38a6c-a3a2-4de7-a666-329ca7e3d231_(1) copy copy.webp',
    productImages: [
      {
        name: 'Navy blazer',
        image: '/images/kantoor/68c7f668-08b6-4183-a4ba-e63a89858eb2 copy copy.webp',
        category: 'BOVENSTUK'
      },
      {
        name: 'Wit overhemd',
        image: '/images/kantoor/7bb820f7-1c79-45d6-ab9a-2f179aad8e47 copy copy.webp',
        category: 'BOVENSTUK'
      },
      {
        name: 'Grijze pantalon',
        image: '/images/kantoor/36e92469-6f72-4b27-bdc1-df1a89edf31b_(1) copy copy.webp',
        category: 'ONDERSTUK'
      },
      {
        name: 'Zwarte schoenen',
        image: '/images/kantoor/dedac5c1-3dd7-417f-93ec-44b09121f537_(1) copy copy.webp',
        category: 'SCHOENEN'
      }
    ]
  },
  {
    id: 'weekend',
    title: 'Casual dag uit',
    context: 'Lunch, koffie, boodschappen',
    icon: Coffee,
    gradient: 'from-amber-50 to-orange-50',
    border: 'border-orange-300',
    items: [
      { type: 'top', color: 'bg-slate-100', label: 'Gestreepte trui', image: '/images/casual-dag-uit/130aa0a3-d37a-49b4-ad48-ac400044d562.webp' },
      { type: 'bottom', color: 'bg-blue-400', label: 'Lichte jeans', image: '/images/casual-dag-uit/046de5c0-c4a0-43c9-b1fc-fab3995f613a.webp' },
      { type: 'shoes', color: 'bg-stone-100', label: 'Witte sneakers', image: '/images/casual-dag-uit/0dccb686-5656-4b4b-872f-f132a6c17d98.webp' },
      { type: 'accessory', color: 'bg-stone-300', label: 'Canvas tas', image: '/images/casual-dag-uit/cabef3fa-fe8f-467c-a8a9-ba2e732e2ee0.webp' }
    ],
    completeImage: '/images/f4a277d2-5a24-42ba-a286-279cdf1aca74 copy copy.webp',
    productImages: [
      {
        name: 'Gestreepte trui',
        image: '/images/casual-dag-uit/130aa0a3-d37a-49b4-ad48-ac400044d562.webp',
        category: 'BOVENSTUK'
      },
      {
        name: 'Lichte jeans',
        image: '/images/casual-dag-uit/046de5c0-c4a0-43c9-b1fc-fab3995f613a.webp',
        category: 'ONDERSTUK'
      },
      {
        name: 'Witte sneakers',
        image: '/images/casual-dag-uit/0dccb686-5656-4b4b-872f-f132a6c17d98.webp',
        category: 'SCHOENEN'
      },
      {
        name: 'Canvas tas',
        image: '/images/casual-dag-uit/cabef3fa-fe8f-467c-a8a9-ba2e732e2ee0.webp',
        category: 'ACCESSOIRE'
      }
    ]
  },
  {
    id: 'date',
    title: 'Avondje uit',
    context: 'Restaurant, borrel of diner',
    icon: Moon,
    gradient: 'from-slate-50 to-blue-50',
    border: 'border-slate-300',
    items: [
      { type: 'top', color: 'bg-slate-800', label: 'Zwart overhemd', image: '/images/gemini_generated_image_sqvymvsqvymvsqvy copy copy.webp' },
      { type: 'bottom', color: 'bg-slate-900', label: 'Donkerblauwe jeans', image: '/images/gemini_generated_image_vzbawovzbawovzba copy copy.webp' },
      { type: 'shoes', color: 'bg-slate-950', label: 'Zwarte loafers', image: '/images/gemini_generated_image_8xaa2w8xaa2w8xaa copy copy.webp' },
      { type: 'accessory', color: 'bg-slate-700', label: 'Zilveren ketting', image: '/images/gemini_generated_image_xlj3okxlj3okxlj3 copy copy.webp' }
    ],
    completeImage: '/images/28115420-679f-4b0a-aac3-fca84c0a4fd2.webp',
    productImages: [
      {
        name: 'Zwart overhemd',
        image: '/images/gemini_generated_image_sqvymvsqvymvsqvy copy copy.webp',
        category: 'BOVENSTUK'
      },
      {
        name: 'Donkerblauwe jeans',
        image: '/images/gemini_generated_image_vzbawovzbawovzba copy copy.webp',
        category: 'ONDERSTUK'
      },
      {
        name: 'Zwarte loafers',
        image: '/images/gemini_generated_image_8xaa2w8xaa2w8xaa copy copy.webp',
        category: 'SCHOENEN'
      },
      {
        name: 'Zilveren ketting',
        image: '/images/gemini_generated_image_xlj3okxlj3okxlj3 copy copy.webp',
        category: 'ACCESSOIRE'
      }
    ]
  }
];

export function RealOutfitShowcase() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-[var(--color-bg)] to-[var(--color-surface)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-[var(--ff-color-primary-50)] border-2 border-[var(--ff-color-primary-200)] rounded-full text-[var(--ff-color-primary-700)] text-xs sm:text-sm font-bold mb-4 sm:mb-6 shadow-md">
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            Complete looks, shopbaar
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-[var(--color-text)] mb-3 sm:mb-4 lg:mb-6 leading-tight">
            Voor elk moment
          </h2>
          <p className="text-sm sm:text-lg lg:text-xl text-[var(--color-muted)] max-w-3xl mx-auto font-light px-4">
            Echte outfits met items die je kunt kopen — geen abstracte moodboards
          </p>
        </div>

        {/* Mobile Swipe Indicator */}
        <div className="md:hidden text-center mb-4 text-xs text-[var(--color-muted)] flex items-center justify-center gap-2">
          <span>Swipe voor meer</span>
          <svg className="w-4 h-4 animate-bounce-horizontal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>

        {/* Outfit Grid/Carousel */}
        <div
          className="md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 lg:gap-8
                     flex md:block overflow-x-auto md:overflow-visible
                     snap-x snap-mandatory md:snap-none
                     -mx-4 px-4 md:mx-0 md:px-0
                     gap-4 md:gap-6 lg:gap-8
                     pb-4 md:pb-0 scrollbar-hide"
          onScroll={(e) => {
            const scrollLeft = e.currentTarget.scrollLeft;
            const cardWidth = e.currentTarget.scrollWidth / outfits.length;
            setActiveIndex(Math.round(scrollLeft / cardWidth));
          }}
        >
          {outfits.map((outfit) => (
            <div
              key={outfit.id}
              className="group relative overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-300 md:hover:-translate-y-2 active:scale-[0.98]
                         min-w-[85vw] sm:min-w-[70vw] md:min-w-0 flex-shrink-0 md:flex-shrink snap-center"
              onMouseEnter={() => setHoveredId(outfit.id)}
              onMouseLeave={() => setHoveredId(null)}
              onTouchStart={() => setHoveredId(outfit.id)}
              onTouchEnd={() => setHoveredId(null)}
            >
              {/* Card Background */}
              <div className={`bg-gradient-to-br ${outfit.gradient} border-2 ${outfit.border} p-5 sm:p-6 lg:p-8 aspect-[3/4] flex flex-col`}>

                {/* Header */}
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                    <outfit.icon className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--ff-color-primary-700)]" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--color-text)]">{outfit.title}</h3>
                    <p className="text-xs sm:text-sm text-[var(--color-muted)]">{outfit.context}</p>
                  </div>
                </div>

                {/* Outfit Items - Visual representation */}
                <div className="flex-1 flex flex-col justify-center gap-2.5 sm:gap-3 lg:gap-4">
                  {outfit.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 sm:gap-4 bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-md hover:shadow-lg transition-shadow"
                    >
                      {/* Product image or color swatch */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-xl sm:rounded-2xl shadow-md border-2 border-white flex-shrink-0 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.label}
                            className="w-full h-full object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <div className={`w-full h-full ${item.color}`}></div>
                        )}
                      </div>

                      {/* Item details */}
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] sm:text-xs uppercase tracking-wider text-[var(--color-muted)] font-bold mb-1">
                          {item.type === 'top' && 'BOVENSTUK'}
                          {item.type === 'bottom' && 'ONDERSTUK'}
                          {item.type === 'shoes' && 'SCHOENEN'}
                          {item.type === 'accessory' && 'ACCESSOIRE'}
                        </div>
                        <div className="text-sm sm:text-base font-bold text-[var(--color-text)] line-clamp-2">
                          {item.label}
                        </div>
                      </div>

                      {/* Shop indicator */}
                      <div
                        className={`transition-all duration-300 flex-shrink-0 ${
                          hoveredId === outfit.id
                            ? 'opacity-100 scale-100'
                            : 'opacity-0 scale-75'
                        }`}
                      >
                        <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--ff-color-primary-600)]" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer - Shop CTA */}
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t-2 border-white/50">
                  <button
                    onClick={() => outfit.completeImage && setSelectedOutfit(outfit)}
                    disabled={!outfit.completeImage}
                    className={`w-full py-2.5 sm:py-3 bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] active:scale-95 text-white rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                      hoveredId === outfit.id ? 'scale-105' : ''
                    }`}
                  >
                    Bekijk complete look
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Scroll Indicators (Mobile only) */}
        <div className="md:hidden flex items-center justify-center gap-2 mt-6">
          {outfits.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                const container = document.querySelector('.snap-x');
                if (container) {
                  const cardWidth = container.scrollWidth / outfits.length;
                  container.scrollTo({ left: cardWidth * idx, behavior: 'smooth' });
                }
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === activeIndex
                  ? 'w-8 bg-[var(--ff-color-primary-600)]'
                  : 'w-2 bg-[var(--color-border)] hover:bg-[var(--ff-color-primary-300)]'
              }`}
              aria-label={`Ga naar outfit ${idx + 1}`}
            />
          ))}
        </div>

        {/* Trust note */}
        <div className="mt-8 sm:mt-10 lg:mt-12 text-center px-4">
          <p className="text-sm sm:text-base lg:text-lg text-[var(--color-muted)] max-w-2xl mx-auto leading-relaxed">
            <span className="font-semibold text-[var(--color-text)]">Let op:</span> Dit zijn voorbeelden.
            Jouw persoonlijke Style Report bevat outfits gebaseerd op <span className="font-semibold">jouw voorkeuren en kleuren</span>.
          </p>
        </div>

      </div>

      {/* Outfit Modal */}
      {selectedOutfit && selectedOutfit.completeImage && selectedOutfit.productImages && (
        <OutfitModal
          isOpen={!!selectedOutfit}
          onClose={() => setSelectedOutfit(null)}
          title={selectedOutfit.title}
          completeImage={selectedOutfit.completeImage}
          products={selectedOutfit.productImages}
        />
      )}
    </section>
  );
}
