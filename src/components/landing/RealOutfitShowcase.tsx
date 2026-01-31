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
    gradient: 'from-slate-50 to-slate-100',
    border: 'border-slate-300',
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
    gradient: 'from-slate-50 to-slate-100',
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

        {/* Section Header - Premium styling */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2.5 px-5 sm:px-6 py-2.5 sm:py-3 bg-[var(--ff-color-primary-50)] border border-[var(--ff-color-primary-200)] rounded-full text-[var(--ff-color-primary-700)] text-xs sm:text-sm font-bold mb-6 sm:mb-8 shadow-[0_4px_16px_rgba(0,0,0,0.08)] backdrop-blur-sm">
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
            <span className="tracking-wide">Complete looks, shopbaar</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-[var(--color-text)] mb-4 sm:mb-5 lg:mb-7 leading-[1.1] tracking-tight">
            Voor elk moment
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-[var(--color-muted)] max-w-3xl mx-auto font-light px-4 leading-relaxed tracking-wide">
            Echte outfits met items die je kunt kopen — geen abstracte moodboards
          </p>
        </div>

        {/* Mobile Swipe Indicator - Premium */}
        <div className="md:hidden text-center mb-6 text-xs text-[var(--color-muted)] flex items-center justify-center gap-2 font-medium tracking-wide">
          <span>Swipe voor meer</span>
          <svg className="w-4 h-4 animate-bounce-horizontal opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>

        {/* Outfit Grid/Carousel */}
        <div
          className="md:grid md:grid-cols-3 md:gap-6 lg:gap-8
                     flex md:block overflow-x-auto md:overflow-visible
                     snap-x snap-mandatory md:snap-none
                     -mx-4 px-4 md:mx-0 md:px-0
                     gap-6
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
              className="group relative overflow-hidden rounded-3xl cursor-pointer
                         shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.2)]
                         transition-all duration-700 md:hover:-translate-y-4 md:hover:scale-[1.02]
                         min-w-[85vw] sm:min-w-[75vw] md:min-w-0 flex-shrink-0 md:flex-shrink snap-center
                         border border-[var(--color-border)]/50 backdrop-blur-sm"
              onClick={() => outfit.completeImage && setSelectedOutfit(outfit)}
              onMouseEnter={() => setHoveredId(outfit.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Card met gradient achtergrond */}
              <div className={`bg-gradient-to-br ${outfit.gradient} p-6 sm:p-8 lg:p-10 aspect-[3/6] sm:aspect-[3/5.8] lg:aspect-[3/5.5] flex flex-col relative`}>

                {/* Icon badge - premium styling */}
                <div className="absolute top-6 left-6 w-14 h-14 sm:w-16 sm:h-16 bg-white/95 backdrop-blur-md rounded-[18px] flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.12)] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                  <outfit.icon className="w-7 h-7 sm:w-8 sm:h-8 text-[var(--ff-color-primary-700)]" strokeWidth={2.5} />
                </div>

                {/* Titel en context - premium typography */}
                <div className="mt-16 sm:mt-20 mb-6 sm:mb-8">
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--color-text)] mb-2 tracking-tight">
                    {outfit.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[var(--color-muted)] font-light tracking-wide">
                    {outfit.context}
                  </p>
                </div>

                {/* Premium product grid - 2x2 met verbeterde styling */}
                <div className="flex-1 grid grid-cols-2 gap-3 sm:gap-4">
                  {outfit.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-[20px] bg-white/80 backdrop-blur-sm shadow-[0_4px_16px_rgba(0,0,0,0.08)] overflow-hidden group/item transition-all duration-500 hover:shadow-[0_8px_30px_rgba(0,0,0,0.16)] hover:scale-[1.03]"
                    >
                      <div className="absolute inset-0 p-6 sm:p-8">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.label}
                            className="w-full h-full object-contain transition-all duration-700 group-hover/item:scale-110"
                            loading="lazy"
                          />
                        ) : (
                          <div className={`w-full h-full ${item.color} rounded-xl`} />
                        )}
                      </div>

                      {/* Premium label overlay met glassmorphism */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover/item:opacity-100 transition-all duration-500 flex items-end p-4 sm:p-5 rounded-[20px]">
                        <p className="text-white text-xs sm:text-sm font-semibold line-clamp-2 tracking-wide">
                          {item.label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Premium CTA Button */}
                <div className="mt-6 sm:mt-8 lg:mt-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      outfit.completeImage && setSelectedOutfit(outfit);
                    }}
                    disabled={!outfit.completeImage}
                    className="w-full py-4 sm:py-5 bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)]
                               text-white rounded-[18px] font-bold text-base sm:text-lg tracking-wide
                               transition-all duration-500
                               shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)]
                               disabled:opacity-50 disabled:cursor-not-allowed
                               group-hover:scale-[1.03] active:scale-[0.98]
                               relative overflow-hidden"
                  >
                    <span className="relative z-10">Bekijk complete look</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Premium Scroll Indicators (Mobile only) */}
        <div className="md:hidden flex items-center justify-center gap-2.5 mt-8">
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
              className={`rounded-full transition-all duration-500 ${
                idx === activeIndex
                  ? 'w-10 h-2.5 bg-[var(--ff-color-primary-600)] shadow-[0_2px_8px_rgba(0,0,0,0.15)]'
                  : 'w-2.5 h-2.5 bg-[var(--color-border)] hover:bg-[var(--ff-color-primary-300)] hover:scale-125'
              }`}
              aria-label={`Ga naar outfit ${idx + 1}`}
            />
          ))}
        </div>

        {/* Premium Trust note */}
        <div className="mt-12 sm:mt-14 lg:mt-16 text-center px-4">
          <p className="text-sm sm:text-base lg:text-lg text-[var(--color-muted)] max-w-2xl mx-auto leading-relaxed tracking-wide font-light">
            <span className="font-semibold text-[var(--color-text)]">Let op:</span> Dit zijn voorbeelden.
            Jouw persoonlijke Style Report bevat outfits gebaseerd op <span className="font-semibold text-[var(--color-text)]">jouw voorkeuren en kleuren</span>.
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
