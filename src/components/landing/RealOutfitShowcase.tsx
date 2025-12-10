import { useState } from 'react';
import { Briefcase, Coffee, Moon, ShoppingBag } from 'lucide-react';
import { OutfitModal } from './OutfitModal';

interface OutfitItem {
  type: 'top' | 'bottom' | 'shoes' | 'accessory';
  color: string;
  label: string;
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
      { type: 'top', color: 'bg-slate-800', label: 'Navy blazer' },
      { type: 'top', color: 'bg-white', label: 'Wit overhemd' },
      { type: 'bottom', color: 'bg-slate-700', label: 'Grijze pantalon' },
      { type: 'shoes', color: 'bg-slate-900', label: 'Zwarte schoenen' }
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
      { type: 'top', color: 'bg-amber-700', label: 'Cognac trui' },
      { type: 'bottom', color: 'bg-blue-800', label: 'Denim' },
      { type: 'shoes', color: 'bg-amber-900', label: 'Bruine sneakers' },
      { type: 'accessory', color: 'bg-amber-600', label: 'Canvas tas' }
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
      { type: 'top', color: 'bg-slate-800', label: 'Zwart overhemd' },
      { type: 'bottom', color: 'bg-slate-900', label: 'Donkerblauwe jeans' },
      { type: 'shoes', color: 'bg-slate-950', label: 'Zwarte loafers' },
      { type: 'accessory', color: 'bg-slate-700', label: 'Zilveren ketting' }
    ],
    completeImage: '/images/gemini_generated_image_nsvlp1nsvlp1nsvl.webp',
    productImages: [
      {
        name: 'Zwart overhemd',
        image: '/images/gemini_generated_image_sqvymvsqvymvsqvy.webp',
        category: 'Bovenstuk'
      },
      {
        name: 'Donkerblauwe jeans',
        image: '/images/gemini_generated_image_vzbawovzbawovzba.webp',
        category: 'Onderstuk'
      },
      {
        name: 'Zwarte loafers',
        image: '/images/gemini_generated_image_8xaa2w8xaa2w8xaa.webp',
        category: 'Schoenen'
      },
      {
        name: 'Zilveren ketting',
        image: '/images/gemini_generated_image_xlj3okxlj3okxlj3.webp',
        category: 'Accessoire'
      }
    ]
  }
];

export function RealOutfitShowcase() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);

  return (
    <section className="py-16 sm:py-24 lg:py-32 bg-gradient-to-b from-[var(--color-bg)] to-[var(--color-surface)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-[var(--ff-color-primary-50)] border-2 border-[var(--ff-color-primary-200)] rounded-full text-[var(--ff-color-primary-700)] text-xs sm:text-sm font-bold mb-6 sm:mb-8 shadow-md">
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            Complete looks, shopbaar
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-[var(--color-text)] mb-4 sm:mb-6 lg:mb-8 leading-tight">
            Voor elk moment
          </h2>
          <p className="text-base sm:text-xl lg:text-2xl text-[var(--color-muted)] max-w-3xl mx-auto font-light px-4">
            Echte outfits met items die je kunt kopen — geen abstracte moodboards
          </p>
        </div>

        {/* Outfit Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {outfits.map((outfit) => (
            <div
              key={outfit.id}
              className="group relative overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 active:scale-[0.98]"
              onMouseEnter={() => setHoveredId(outfit.id)}
              onMouseLeave={() => setHoveredId(null)}
              onTouchStart={() => setHoveredId(outfit.id)}
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
                      className="flex items-center gap-2.5 sm:gap-3 lg:gap-4 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-md hover:shadow-lg transition-shadow"
                    >
                      {/* Color swatch */}
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 ${item.color} rounded-lg sm:rounded-xl shadow-inner border-2 border-white flex-shrink-0`}></div>

                      {/* Item details */}
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] sm:text-xs uppercase tracking-wider text-[var(--color-muted)] font-bold mb-0.5 sm:mb-1">
                          {item.type === 'top' && 'Bovenstuk'}
                          {item.type === 'bottom' && 'Onderstuk'}
                          {item.type === 'shoes' && 'Schoenen'}
                          {item.type === 'accessory' && 'Accessoire'}
                        </div>
                        <div className="text-xs sm:text-sm font-semibold text-[var(--color-text)] truncate">
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
                        <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--ff-color-primary-600)]" />
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

        {/* Trust note */}
        <div className="mt-10 sm:mt-14 lg:mt-16 text-center px-4">
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
