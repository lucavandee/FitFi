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
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-[var(--color-bg)] relative overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, var(--color-text) 1px, transparent 0)`
      }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">

        {features.map((feature, index) => (
          <div
            key={index}
            className={`grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 xl:gap-24 items-center ${
              index < features.length - 1 ? 'mb-16 sm:mb-24 lg:mb-32 xl:mb-40' : ''
            } ${feature.reversed ? 'lg:grid-flow-dense' : ''}`}
          >
            {/* Visual Element */}
            <div className={`relative ${feature.reversed ? 'lg:col-start-2' : ''}`}>

              {/* Main visual block */}
              <div className="relative aspect-[4/3] rounded-2xl sm:rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] hover:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.3)] transition-shadow duration-700 ease-out mb-8 sm:mb-10 lg:mb-0">
                {/* Use specific images for each feature */}
                {index === 0 ? (
                  <SmartImage
                    src="/images/3afbe258-11f3-4a98-b82e-a2939fd1de19.webp"
                    alt="Kleurenpalet met persoonlijke kleuren die flatteren"
                    className="w-full h-full object-cover"
                  />
                ) : index === 1 ? (
                  <SmartImage
                    src="/images/caa9958f-d96f-4d6c-8dff-b192665376c8.webp"
                    alt="FitFi app met persoonlijke outfit resultaten"
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

                {/* Floating stats card - Hidden on mobile, positioned below on tablet, floating on desktop */}
                <div className="hidden sm:block absolute sm:-bottom-6 lg:-bottom-8 sm:-right-4 lg:-right-8 bg-white/95 backdrop-blur-xl rounded-2xl lg:rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] p-5 sm:p-6 lg:p-8 border border-[var(--color-border)]/30 hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] transition-shadow duration-500">
                  <div className="flex gap-4 sm:gap-6 lg:gap-10">
                    {feature.stats.map((stat, idx) => (
                      <div key={idx}>
                        <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--ff-color-primary-700)] mb-1 lg:mb-2">
                          {stat.value}
                        </div>
                        <div className="text-xs lg:text-sm text-[var(--color-muted)] font-medium tracking-wide uppercase">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile stats - Below image on mobile */}
                <div className="sm:hidden flex gap-4 justify-center mt-4">
                  {feature.stats.map((stat, idx) => (
                    <div key={idx} className="text-center">
                      <div className="text-2xl font-bold text-[var(--ff-color-primary-700)] mb-1">
                        {stat.value}
                      </div>
                      <div className="text-xs text-[var(--color-muted)] font-medium uppercase">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className={feature.reversed ? 'lg:col-start-1 lg:row-start-1' : ''}>
              {/* Icon badge */}
              <div className={`inline-flex w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br ${feature.iconBg} rounded-2xl lg:rounded-3xl items-center justify-center mb-5 sm:mb-6 lg:mb-8 shadow-lg hover:shadow-xl transition-shadow duration-500`}>
                <feature.icon className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" strokeWidth={2} />
              </div>

              {/* Title */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-[var(--color-text)] mb-4 sm:mb-6 lg:mb-8 leading-[1.1] tracking-tight">
                {feature.title}
              </h2>

              {/* Description */}
              <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-[var(--color-muted)] leading-[1.6] sm:leading-[1.7] mb-6 sm:mb-8 lg:mb-10 font-light max-w-xl">
                {feature.description}
              </p>

              {/* Feature bullets */}
              <div className="space-y-3 sm:space-y-4 lg:space-y-5">
                {feature.bullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-3 lg:gap-4 group">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-[var(--ff-color-primary-100)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-[var(--ff-color-primary-200)] transition-colors duration-300">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-[var(--ff-color-primary-700)]" fill="currentColor" viewBox="0 0 20 20">
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
