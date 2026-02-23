import { Palette, Zap } from 'lucide-react';
import SmartImage from '@/components/ui/SmartImage';

const features = [
  {
    icon: Palette,
    iconBg: 'from-[var(--ff-color-accent-400)] to-[var(--ff-color-accent-600)]',
    title: 'Kleuren die bij jou passen',
    description: 'Geen trends, maar tinten die jouw natuurlijke kenmerken aanvullen. De quiz analyseert je contrast, ondertoon en seizoenstype.',
    bullets: [
      'Contrast en ondertoon',
      'Seizoensgebonden kleurpalet',
      'Combinaties op maat'
    ],
    imageSrc: '/images/3afbe258-11f3-4a98-b82e-a2939fd1de19.webp',
    imageAlt: 'Persoonlijk kleurenpalet',
    reversed: false
  },
  {
    icon: Zap,
    iconBg: 'from-[var(--ff-color-primary-500)] to-[var(--ff-color-primary-700)]',
    title: 'Klaar in een paar minuten',
    description: 'Geen lange vragenlijsten. Beantwoord een paar vragen en ontvang direct je persoonlijk stijlrapport — compleet met outfits en shoplinks.',
    bullets: [
      'Gerichte vragen, geen ruis',
      'Direct resultaat, geen wachten',
      'Shopbare outfit-links'
    ],
    imageSrc: '/images/caa9958f-d96f-4d6c-8dff-b192665376c8.webp',
    imageAlt: 'FitFi persoonlijk stijlrapport',
    reversed: true
  }
];

export function FeatureBlocksV4() {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-[var(--color-bg)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {features.map((feature, index) => (
          <div
            key={index}
            className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${
              index < features.length - 1 ? 'mb-16 sm:mb-24 lg:mb-32' : ''
            } ${feature.reversed ? 'lg:grid-flow-dense' : ''}`}
          >
            {/* Visual */}
            <div className={feature.reversed ? 'lg:col-start-2' : ''}>
              <div className="aspect-[4/3] rounded-2xl lg:rounded-3xl overflow-hidden shadow-[0_16px_48px_-12px_rgba(0,0,0,0.22)]">
                <SmartImage
                  src={feature.imageSrc}
                  alt={feature.imageAlt}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Content */}
            <div className={`py-2 sm:py-4 min-w-0 ${feature.reversed ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
              <div className={`inline-flex w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${feature.iconBg} rounded-2xl items-center justify-center mb-6 shadow-md`}>
                <feature.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={2} />
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-text)] mb-4 sm:mb-5 leading-[1.1] tracking-tight">
                {feature.title}
              </h2>

              <p className="text-base sm:text-lg text-[var(--color-muted)] leading-[1.7] mb-7 font-light">
                {feature.description}
              </p>

              <ul className="space-y-4">
                {feature.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-[var(--ff-color-primary-100)] rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-[var(--ff-color-primary-700)]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-base sm:text-lg text-[var(--color-text)] font-medium leading-snug">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}

      </div>
    </section>
  );
}
