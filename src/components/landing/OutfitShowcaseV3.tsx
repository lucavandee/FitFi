import { useState } from 'react';
import { Sparkles, Briefcase, Coffee, Moon } from 'lucide-react';

interface OutfitCard {
  id: string;
  title: string;
  context: string;
  icon: typeof Briefcase;
  gradient: string;
  why: string[];
}

const outfits: OutfitCard[] = [
  {
    id: 'work',
    title: 'Werk',
    context: 'Professioneel & zelfverzekerd',
    icon: Briefcase,
    gradient: 'from-slate-800 via-slate-700 to-slate-900',
    why: [
      'Donkerblauw flatteert zonder te domineren',
      'Slim fit benadrukt schouders subtiel',
      'Smalle revers balanceert gezichtsvorm'
    ]
  },
  {
    id: 'weekend',
    title: 'Weekend',
    context: 'Relaxed & toegankelijk',
    icon: Coffee,
    gradient: 'from-amber-700 via-orange-600 to-red-700',
    why: [
      'Warme tinten creëren vriendelijke uitstraling',
      'Relaxed fit geeft bewegingsvrijheid',
      'Gelaagd effect voegt visuele diepte toe'
    ]
  },
  {
    id: 'evening',
    title: 'Avond',
    context: 'Verfijnd, niet overdreven',
    icon: Moon,
    gradient: 'from-indigo-900 via-purple-800 to-indigo-950',
    why: [
      'Gedempte tinten stralen rust uit',
      'Regular fit combineert comfort met stijl',
      'Contrast kraag trekt focus naar gezicht'
    ]
  }
];

export function OutfitShowcaseV3() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section className="py-32 bg-gradient-to-b from-[var(--color-bg)] to-[var(--color-surface)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--ff-color-primary-50)] border-2 border-[var(--ff-color-primary-200)] rounded-full text-[var(--ff-color-primary-700)] text-sm font-bold mb-8 shadow-md">
            <Sparkles className="w-5 h-5" />
            Zie direct wat je krijgt
          </div>
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[var(--color-text)] mb-8 leading-tight">
            Outfits voor<br />elk moment
          </h2>
          <p className="text-2xl text-[var(--color-muted)] max-w-3xl mx-auto font-light">
            Elke look komt met uitleg waarom hij werkt — geen giswerk, wel vertrouwen
          </p>
        </div>

        {/* Outfit Grid */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
          {outfits.map((outfit) => (
            <div
              key={outfit.id}
              className="group relative overflow-hidden rounded-3xl cursor-pointer shadow-2xl"
              onMouseEnter={() => setHoveredId(outfit.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Gradient Background */}
              <div className={`aspect-[3/4] bg-gradient-to-br ${outfit.gradient} transition-transform duration-700 group-hover:scale-110`}>

                {/* Pattern overlay */}
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px),
                                   radial-gradient(circle at 80% 80%, white 1px, transparent 1px)`,
                  backgroundSize: '40px 40px'
                }}></div>

                {/* Icon in center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-40 h-40 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-white/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
                    <outfit.icon className="w-20 h-20 text-white/80" />
                  </div>
                </div>

                {/* Gradient overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>

                {/* Hover overlay */}
                <div
                  className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-500 ${
                    hoveredId === outfit.id ? 'opacity-100' : 'opacity-0'
                  }`}
                ></div>
              </div>

              {/* Content - Always visible */}
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <outfit.icon className="w-6 h-6" />
                  <h3 className="text-3xl font-bold">{outfit.title}</h3>
                </div>
                <p className="text-white/90 text-lg mb-6">{outfit.context}</p>

                {/* Why it works - Show on hover */}
                <div
                  className={`space-y-3 transition-all duration-500 ${
                    hoveredId === outfit.id
                      ? 'opacity-100 translate-y-0 max-h-96'
                      : 'opacity-0 translate-y-4 max-h-0 overflow-hidden'
                  }`}
                >
                  <div className="text-sm font-bold text-[var(--ff-color-accent-300)] mb-4 uppercase tracking-wider">
                    Waarom dit werkt:
                  </div>
                  {outfit.why.map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-base text-white/95">
                      <div className="w-2 h-2 rounded-full bg-[var(--ff-color-accent-400)] mt-2 flex-shrink-0"></div>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hover sparkle */}
              <div
                className={`absolute top-6 right-6 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-500 ${
                  hoveredId === outfit.id
                    ? 'opacity-100 scale-100 rotate-180'
                    : 'opacity-0 scale-75'
                }`}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
