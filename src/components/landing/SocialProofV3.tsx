import { Star, User } from 'lucide-react';

interface Testimonial {
  name: string;
  age: number;
  quote: string;
  gradient: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    name: 'Marieke',
    age: 32,
    quote: 'Eindelijk stijladvies dat niet overdreven is. Praktisch en echt bruikbaar. De uitleg waarom iets bij me past was eye-opening.',
    gradient: 'from-[var(--ff-color-primary-300)] to-[var(--ff-color-accent-400)]',
    rating: 5
  },
  {
    name: 'Thomas',
    age: 28,
    quote: 'De kleuren die FitFi voorstelde klopten meteen. Vrienden vroegen of ik een personal shopper had. Nope, gewoon 2 minuten quiz.',
    gradient: 'from-[var(--ff-color-accent-300)] to-[var(--ff-color-primary-500)]',
    rating: 5
  },
  {
    name: 'Lisa',
    age: 35,
    quote: 'Als moeder heb ik geen tijd voor urenlang shoppen. FitFi gaf me  een duidelijke richting. Outfits kloppen gewoon.',
    gradient: 'from-[var(--ff-cta-400)] to-[var(--ff-color-primary-600)]',
    rating: 5
  }
];

export function SocialProofV3() {
  return (
    <section className="py-16 sm:py-24 lg:py-32 bg-[var(--color-surface)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <div className="flex items-center justify-center gap-1 mb-4 sm:mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 sm:w-7 sm:h-7 fill-[var(--ff-color-accent-500)] text-[var(--ff-color-accent-500)]" />
            ))}
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--color-text)] mb-4 sm:mb-6">
            Wat anderen zeggen
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-[var(--color-muted)] font-light">
            Echte mensen, echte resultaten
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl border-2 border-[var(--color-border)] hover:shadow-2xl hover:border-[var(--ff-color-primary-200)] transition-all duration-300 hover:-translate-y-2"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4 sm:mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-[var(--ff-color-accent-500)] text-[var(--ff-color-accent-500)]" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-[var(--color-text)] leading-relaxed mb-6 sm:mb-8 text-base sm:text-lg lg:text-xl font-light">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Gradient avatar with icon */}
                <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                  <User className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" strokeWidth={2} />
                </div>
                <div>
                  <div className="font-bold text-base sm:text-lg text-[var(--color-text)]">
                    {testimonial.name}
                  </div>
                  <div className="text-xs sm:text-sm text-[var(--color-muted)] font-medium">
                    {testimonial.age} jaar
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <div className="mt-16 sm:mt-20 lg:mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 max-w-5xl mx-auto">
          <StatItem value="2.400+" label="Tevreden gebruikers" />
          <StatItem value="98%" label="Zou aanbevelen" />
          <StatItem value="~2 min" label="Gemiddelde tijd" />
          <StatItem value="4.9/5" label="Waardering" />
        </div>

      </div>
    </section>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--ff-color-primary-700)] mb-2 sm:mb-3">
        {value}
      </div>
      <div className="text-sm sm:text-base text-[var(--color-muted)] font-medium">
        {label}
      </div>
    </div>
  );
}
