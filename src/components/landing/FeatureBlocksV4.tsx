import { Palette, Zap } from 'lucide-react';
import SmartImage from '@/components/ui/SmartImage';

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
    title: 'Resultaat ',
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
    <section className="py-32 sm:py-40 lg:py-48 bg-[var(--color-bg)] relative overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, var(--color-text) 1px, transparent 0)`
      }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">

        {features.map((feature, index) => (
          <div
            key={index}
            className={`grid lg:grid-cols-2 gap-12 lg:gap-20 xl:gap-28 items-center ${
              index < features.length - 1 ? 'mb-32 sm:mb-40 lg:mb-48' : ''
            } ${feature.reversed ? 'lg:grid-flow-dense' : ''}`}
          >
            {/* Visual Element */}
            <div className={`relative ${feature.reversed ? 'lg:col-start-2' : ''}`}>

              {/* Main visual block */}
              <div className="relative aspect-[4/3] rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] hover:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.3)] transition-shadow duration-700 ease-out">
                {/* Use specific images for each feature */}
                {index === 0 ? (
                  <SmartImage
                    src="/images/f0d15c22-1ffb-46cd-9df4-904d03748413.webp"
                    alt="Minimalistisch design met zachte kleuren en vinkjes"
                    className="w-full h-full object-cover"
                  />
                ) : index === 1 ? (
                  <SmartImage
                    src="/images/0b7da518-a822-4b0b-aa3c-2bb819a78d1e.webp"
                    alt="FitFi app op iPhone met outfit voorbeelden"
                    className="w-full h-full object-cover"
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
                <div className="absolute -bottom-6 sm:-bottom-8 -right-6 sm:-right-8 bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] p-6 sm:p-8 border border-[var(--color-border)]/30 hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] transition-shadow duration-500">
                  <div className="flex gap-6 sm:gap-10">
                    {feature.stats.map((stat, idx) => (
                      <div key={idx}>
                        <div className="text-3xl sm:text-4xl font-bold text-[var(--ff-color-primary-700)] mb-1 sm:mb-2">
                          {stat.value}
                        </div>
                        <div className="text-xs sm:text-sm text-[var(--color-muted)] font-medium tracking-wide uppercase">
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
              <div className={`inline-flex w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${feature.iconBg} rounded-2xl sm:rounded-3xl items-center justify-center mb-6 sm:mb-8 shadow-lg hover:shadow-xl transition-shadow duration-500`}>
                <feature.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={2} />
              </div>

              {/* Title */}
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--color-text)] mb-6 sm:mb-8 leading-[1.1] tracking-tight">
                {feature.title}
              </h2>

              {/* Description */}
              <p className="text-lg sm:text-xl lg:text-2xl text-[var(--color-muted)] leading-[1.7] mb-8 sm:mb-10 font-light max-w-xl">
                {feature.description}
              </p>

              {/* Feature bullets */}
              <div className="space-y-4 sm:space-y-5">
                {feature.bullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-3 sm:gap-4 group">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[var(--ff-color-primary-100)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-[var(--ff-color-primary-200)] transition-colors duration-300">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--ff-color-primary-700)]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-base sm:text-lg lg:text-xl text-[var(--color-text)] font-medium leading-relaxed">{bullet}</span>
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
