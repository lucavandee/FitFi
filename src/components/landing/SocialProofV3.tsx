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
    <section className="py-32 bg-[var(--color-surface)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-7 h-7 fill-[var(--ff-color-accent-500)] text-[var(--ff-color-accent-500)]" />
            ))}
          </div>
          <h2 className="text-5xl sm:text-6xl font-bold text-[var(--color-text)] mb-6">
            Wat anderen zeggen
          </h2>
          <p className="text-2xl text-[var(--color-muted)] font-light">
            Echte mensen, echte resultaten
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group bg-white rounded-3xl p-10 shadow-xl border-2 border-[var(--color-border)] hover:shadow-2xl hover:border-[var(--ff-color-primary-200)] transition-all duration-300 hover:-translate-y-2"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[var(--ff-color-accent-500)] text-[var(--ff-color-accent-500)]" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-[var(--color-text)] leading-relaxed mb-8 text-xl font-light">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                {/* Gradient avatar with icon */}
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center shadow-lg`}>
                  <User className="w-8 h-8 text-white" strokeWidth={2} />
                </div>
                <div>
                  <div className="font-bold text-lg text-[var(--color-text)]">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-[var(--color-muted)] font-medium">
                    {testimonial.age} jaar
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-10 max-w-5xl mx-auto">
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
      <div className="text-4xl sm:text-5xl font-bold text-[var(--ff-color-primary-700)] mb-3">
        {value}
      </div>
      <div className="text-base text-[var(--color-muted)] font-medium">
        {label}
      </div>
    </div>
  );
}
