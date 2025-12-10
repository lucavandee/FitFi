import { Star, User, Sparkles } from 'lucide-react';
import { useTestimonials } from '@/hooks/useTestimonials';

const gradients = [
  'from-[var(--ff-color-primary-300)] to-[var(--ff-color-accent-400)]',
  'from-[var(--ff-color-accent-300)] to-[var(--ff-color-primary-500)]',
  'from-[var(--ff-cta-400)] to-[var(--ff-color-primary-600)]',
];

export function SocialProofV3() {
  const { testimonials, loading } = useTestimonials();

  // Show testimonials if we have at least 3 active ones
  const showTestimonials = testimonials.length >= 3;
  return (
    <section className="py-12 sm:py-20 lg:py-28 bg-[var(--color-surface)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10 sm:mb-14 lg:mb-18">
          <div className="flex items-center justify-center gap-1 mb-4 sm:mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 sm:w-7 sm:h-7 fill-[var(--ff-color-accent-500)] text-[var(--ff-color-accent-500)]" />
            ))}
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--color-text)] mb-4 sm:mb-6">
            Wat anderen zeggen
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-[var(--color-muted)] font-light">
            {showTestimonials ? 'Echte mensen, echte resultaten' : 'Binnenkort hier'}
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl border-2 border-[var(--color-border)] animate-pulse"
              >
                <div className="flex gap-1 mb-4 sm:mb-6">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="w-4 h-4 sm:w-5 sm:h-5 bg-[var(--color-border)] rounded" />
                  ))}
                </div>
                <div className="space-y-3 mb-6 sm:mb-8">
                  <div className="h-4 bg-[var(--color-border)] rounded w-full" />
                  <div className="h-4 bg-[var(--color-border)] rounded w-5/6" />
                  <div className="h-4 bg-[var(--color-border)] rounded w-4/6" />
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full bg-[var(--color-border)]" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-[var(--color-border)] rounded w-24" />
                    <div className="h-3 bg-[var(--color-border)] rounded w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Coming Soon State */}
        {!loading && !showTestimonials && (
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-bg)] rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 border-2 border-dashed border-[var(--color-border)] relative overflow-hidden"
              >
                {/* Subtle background pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-4 right-4">
                    <Sparkles className="w-16 h-16 text-[var(--ff-color-primary-500)]" />
                  </div>
                </div>

                <div className="relative">
                  {/* Stars placeholder */}
                  <div className="flex gap-1 mb-4 sm:mb-6">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-border)]" />
                    ))}
                  </div>

                  {/* Quote placeholder */}
                  <div className="mb-6 sm:mb-8 text-center py-8">
                    <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-[var(--ff-color-primary-500)] mx-auto mb-4 opacity-50" />
                    <p className="text-[var(--color-muted)] text-sm sm:text-base font-light italic">
                      Jouw ervaring komt hier binnenkort
                    </p>
                  </div>

                  {/* Author placeholder */}
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-[var(--ff-color-primary-200)] to-[var(--ff-color-accent-200)] flex items-center justify-center flex-shrink-0 opacity-30">
                      <User className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" strokeWidth={2} />
                    </div>
                    <div>
                      <div className="h-4 bg-[var(--color-border)] rounded w-20 mb-2" />
                      <div className="h-3 bg-[var(--color-border)] rounded w-14" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Real Testimonials */}
        {!loading && showTestimonials && (
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {testimonials.slice(0, 3).map((testimonial, index) => (
              <div
                key={testimonial.id}
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
                  {/* Avatar */}
                  {testimonial.author_avatar_url ? (
                    <img
                      src={testimonial.author_avatar_url}
                      alt={testimonial.author_name}
                      className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full object-cover shadow-lg flex-shrink-0"
                    />
                  ) : (
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center shadow-lg flex-shrink-0`}>
                      <User className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" strokeWidth={2} />
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-base sm:text-lg text-[var(--color-text)]">
                      {testimonial.author_name}
                    </div>
                    {testimonial.author_age && (
                      <div className="text-xs sm:text-sm text-[var(--color-muted)] font-medium">
                        {testimonial.author_age} jaar
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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
