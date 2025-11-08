import { Palette, Zap } from 'lucide-react';

const features = [
  {
    icon: Palette,
    iconBg: 'from-pink-500 to-purple-600',
    title: 'Kleuren die flatteren',
    description: 'Geen trends, wel tinten die jouw natuurlijke kenmerken complementeren. Onze AI analyseert contrast, ondertoon en seizoen.',
    stats: [
      { label: 'Kleurpaletten', value: '12+' },
      { label: 'Match rate', value: '98%' }
    ],
    bullets: [
      'Contrast & ondertoon analyse',
      'Seizoensgebonden kleurpalet',
      'Complimentaire combinaties'
    ],
    visualGradient: 'from-pink-400 via-purple-400 to-indigo-400',
    reversed: false
  },
  {
    icon: Zap,
    iconBg: 'from-yellow-500 to-orange-600',
    title: 'Resultaat in 2 minuten',
    description: 'Geen eindeloze vragenlijsten. Beantwoord 6–12 vragen en krijg direct je persoonlijke Style Report met complete outfits.',
    stats: [
      { label: 'Gemiddelde tijd', value: '2 min' },
      { label: 'Outfits', value: '6-12' }
    ],
    bullets: [
      'Slimme vragenlijst (6-12 vragen)',
      'Direct resultaat, geen wachten',
      'Shopbare outfit links'
    ],
    visualGradient: 'from-yellow-400 via-orange-400 to-red-400',
    reversed: true
  }
];

export function FeatureBlocksV4() {
  return (
    <section className="py-40 bg-[var(--color-bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {features.map((feature, index) => (
          <div
            key={index}
            className={`grid lg:grid-cols-2 gap-16 lg:gap-24 items-center ${
              index < features.length - 1 ? 'mb-40' : ''
            } ${feature.reversed ? 'lg:grid-flow-dense' : ''}`}
          >
            {/* Visual Element */}
            <div className={`relative ${feature.reversed ? 'lg:col-start-2' : ''}`}>

              {/* Main visual block */}
              <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl">
                {/* Use specific images for each feature */}
                {index === 0 ? (
                  <img
                    src="/images/f0d15c22-1ffb-46cd-9df4-904d03748413.webp"
                    alt="Minimalistisch design met zachte kleuren en vinkjes"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : index === 1 ? (
                  <img
                    src="/images/0b7da518-a822-4b0b-aa3c-2bb819a78d1e.webp"
                    alt="FitFi app op iPhone met outfit voorbeelden"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <>
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.visualGradient}`}></div>

                    {/* Pattern overlay */}
                    <div className="absolute inset-0 opacity-20" style={{
                      backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)`
                    }}></div>

                    {/* Large icon in center */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-48 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center border-4 border-white/30 rotate-12 shadow-2xl">
                        <feature.icon className="w-24 h-24 text-white -rotate-12" strokeWidth={1.5} />
                      </div>
                    </div>
                  </>
                )}

                {/* Floating stats card */}
                <div className="absolute -bottom-8 -right-8 bg-white rounded-3xl shadow-2xl p-8 border-2 border-[var(--color-border)]">
                  <div className="flex gap-10">
                    {feature.stats.map((stat, idx) => (
                      <div key={idx}>
                        <div className="text-4xl font-bold text-[var(--ff-color-primary-700)] mb-2">
                          {stat.value}
                        </div>
                        <div className="text-sm text-[var(--color-muted)] font-medium">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className={feature.reversed ? 'lg:col-start-1 lg:row-start-1' : ''}>
              {/* Icon badge */}
              <div className={`inline-flex w-20 h-20 bg-gradient-to-br ${feature.iconBg} rounded-3xl items-center justify-center mb-8 shadow-xl`}>
                <feature.icon className="w-10 h-10 text-white" strokeWidth={2} />
              </div>

              {/* Title */}
              <h2 className="text-5xl sm:text-6xl font-bold text-[var(--color-text)] mb-8 leading-tight">
                {feature.title}
              </h2>

              {/* Description */}
              <p className="text-2xl text-[var(--color-muted)] leading-relaxed mb-10 font-light">
                {feature.description}
              </p>

              {/* Feature bullets */}
              <div className="space-y-5">
                {feature.bullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-[var(--ff-color-primary-100)] rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-[var(--ff-color-primary-700)]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-xl text-[var(--color-text)] font-medium">{bullet}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

      </div>
    </section>
  );
}
