import { useState } from 'react';
import { Briefcase, Coffee, Moon, ShoppingBag } from 'lucide-react';

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
}

const outfits: Outfit[] = [
  {
    id: 'work',
    title: 'Werk',
    context: 'Professioneel & zelfverzekerd',
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
    title: 'Weekend',
    context: 'Relaxed & toegankelijk',
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
    id: 'evening',
    title: 'Avond',
    context: 'Verfijnd, niet overdreven',
    icon: Moon,
    gradient: 'from-indigo-50 to-purple-50',
    border: 'border-indigo-300',
    items: [
      { type: 'top', color: 'bg-slate-800', label: 'Donkerblauwe trui' },
      { type: 'bottom', color: 'bg-slate-900', label: 'Zwarte chino' },
      { type: 'shoes', color: 'bg-slate-950', label: 'Chelsea boots' },
      { type: 'accessory', color: 'bg-slate-700', label: 'Leren riem' }
    ]
  }
];

export function RealOutfitShowcase() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section className="py-32 bg-gradient-to-b from-[var(--color-bg)] to-[var(--color-surface)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--ff-color-primary-50)] border-2 border-[var(--ff-color-primary-200)] rounded-full text-[var(--ff-color-primary-700)] text-sm font-bold mb-8 shadow-md">
            <ShoppingBag className="w-5 h-5" />
            Complete looks, shopbaar
          </div>
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[var(--color-text)] mb-8 leading-tight">
            Voor elk moment
          </h2>
          <p className="text-2xl text-[var(--color-muted)] max-w-3xl mx-auto font-light">
            Echte outfits met items die je kunt kopen — geen abstracte moodboards
          </p>
        </div>

        {/* Outfit Grid */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
          {outfits.map((outfit) => (
            <div
              key={outfit.id}
              className="group relative overflow-hidden rounded-3xl cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              onMouseEnter={() => setHoveredId(outfit.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Card Background */}
              <div className={`bg-gradient-to-br ${outfit.gradient} border-2 ${outfit.border} p-8 aspect-[3/4] flex flex-col`}>

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                    <outfit.icon className="w-6 h-6 text-[var(--ff-color-primary-700)]" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[var(--color-text)]">{outfit.title}</h3>
                    <p className="text-sm text-[var(--color-muted)]">{outfit.context}</p>
                  </div>
                </div>

                {/* Outfit Items - Visual representation */}
                <div className="flex-1 flex flex-col justify-center gap-4">
                  {outfit.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow"
                    >
                      {/* Color swatch */}
                      <div className={`w-16 h-16 ${item.color} rounded-xl shadow-inner border-2 border-white`}></div>

                      {/* Item details */}
                      <div className="flex-1">
                        <div className="text-xs uppercase tracking-wider text-[var(--color-muted)] font-bold mb-1">
                          {item.type === 'top' && 'Bovenstuk'}
                          {item.type === 'bottom' && 'Onderstuk'}
                          {item.type === 'shoes' && 'Schoenen'}
                          {item.type === 'accessory' && 'Accessoire'}
                        </div>
                        <div className="text-sm font-semibold text-[var(--color-text)]">
                          {item.label}
                        </div>
                      </div>

                      {/* Shop indicator */}
                      <div
                        className={`transition-all duration-300 ${
                          hoveredId === outfit.id
                            ? 'opacity-100 scale-100'
                            : 'opacity-0 scale-75'
                        }`}
                      >
                        <ShoppingBag className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer - Shop CTA */}
                <div className="mt-6 pt-6 border-t-2 border-white/50">
                  <button
                    className={`w-full py-3 bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] text-white rounded-xl font-bold text-sm transition-all duration-300 shadow-lg hover:shadow-xl ${
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
        <div className="mt-16 text-center">
          <p className="text-lg text-[var(--color-muted)] max-w-2xl mx-auto">
            <span className="font-semibold text-[var(--color-text)]">Let op:</span> Dit zijn voorbeelden.
            Jouw persoonlijke Style Report bevat outfits gebaseerd op <span className="font-semibold">jouw voorkeuren en kleuren</span>.
          </p>
        </div>

      </div>
    </section>
  );
}
