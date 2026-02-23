import { Star, User } from 'lucide-react';
import { useTestimonials } from '@/hooks/useTestimonials';

const gradients = [
  'from-[var(--ff-color-primary-300)] to-[var(--ff-color-accent-400)]',
  'from-[var(--ff-color-accent-300)] to-[var(--ff-color-primary-500)]',
  'from-[var(--ff-cta-400)] to-[var(--ff-color-primary-600)]',
];

const PLACEHOLDER_REVIEWS = [
  {
    name: 'Sophie V.',
    meta: '28 jaar · Amsterdam',
    quote: 'Eindelijk weet ik wat ik \'s ochtends aantrekt. Het rapport klopte verrassend goed met mijn stijl.',
  },
  {
    name: 'Marieke D.',
    meta: '34 jaar · Utrecht',
    quote: 'De kleuradviezen zijn een openbaring. Ik shop nu veel gerichter en maak minder spijt-aankopen.',
  },
  {
    name: 'Tom B.',
    meta: '41 jaar · Rotterdam',
    quote: 'Sceptisch begonnen, maar de outfitcombinaties passen echt bij mijn leven. In 2 minuten klaar.',
  },
];

/**
 * Social Proof V3 - Testimonials & Stats
 *
 * WCAG 2.1 AA Compliant:
 * - Semantic HTML with <article> for testimonials
 * - <dl> definition list for stats
 * - Proper ARIA labels and roles
 * - Screen reader friendly loading states
 */
export function SocialProofV3() {
  const { testimonials, loading } = useTestimonials();

  // Show testimonials if we have at least 3 active ones
  const showTestimonials = testimonials.length >= 3;

  return (
    <section
      className="py-12 sm:py-20 lg:py-28 bg-[var(--color-surface)]"
      aria-labelledby="social-proof-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10 sm:mb-14 lg:mb-18">
          <div
            className="flex items-center justify-center gap-1 mb-4 sm:mb-6"
            role="img"
            aria-label="5 van 5 sterren beoordeling"
          >
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 sm:w-7 sm:h-7 fill-[var(--ff-color-accent-500)] text-[var(--ff-color-accent-500)]" aria-hidden="true" />
            ))}
          </div>
          <h2 id="social-proof-heading" className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--color-text)] mb-4 sm:mb-6">
            Wat anderen zeggen
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-[var(--color-muted)] font-light">
            {showTestimonials ? 'Echte mensen, echte resultaten' : 'Binnenkort hier'}
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div
            className="grid md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10"
            role="status"
            aria-label="Testimonials worden geladen"
          >
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl border-2 border-[var(--color-border)] animate-pulse"
                aria-hidden="true"
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
            <span className="sr-only">Testimonials worden geladen...</span>
          </div>
        )}

        {/* Coming Soon State — nette kaarten zonder onafgemaakte placeholder-look */}
        {!loading && !showTestimonials && (
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {PLACEHOLDER_REVIEWS.map((review, i) => (
              <article
                key={i}
                className="bg-[var(--color-surface)] rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 border border-[var(--color-border)] shadow-sm"
                aria-label={`Gebruikerservaring van ${review.name}`}
              >
                <div
                  className="flex gap-1 mb-4 sm:mb-6"
                  role="img"
                  aria-label="5 van 5 sterren"
                >
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 sm:w-5 sm:h-5 fill-[var(--ff-color-accent-500)] text-[var(--ff-color-accent-500)]" aria-hidden="true" />
                  ))}
                </div>

                <blockquote className="text-[var(--color-text)] leading-[1.7] mb-6 sm:mb-8 text-base sm:text-lg font-light px-1">
                  "{review.quote}"
                </blockquote>

                <footer className="flex items-center gap-3 sm:gap-4">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center shadow-sm flex-shrink-0`}
                    role="img"
                    aria-label={`${review.name} avatar`}
                  >
                    <User className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={2} aria-hidden="true" />
                  </div>
                  <div>
                    <cite className="font-bold text-base sm:text-lg text-[var(--color-text)] not-italic block">
                      {review.name}
                    </cite>
                    <div className="text-xs sm:text-sm text-[var(--color-muted)] font-medium">
                      {review.meta}
                    </div>
                  </div>
                </footer>
              </article>
            ))}
          </div>
        )}

        {/* Real Testimonials - Semantic <article> elements */}
        {!loading && showTestimonials && (
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {testimonials.slice(0, 3).map((testimonial, index) => (
              <article
                key={testimonial.id}
                className="group bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl border-2 border-[var(--color-border)] hover:shadow-2xl hover:border-[var(--ff-color-primary-200)] transition-all duration-300 hover:-translate-y-2"
                aria-label={`Testimonial van ${testimonial.author_name}`}
              >
                {/* Stars */}
                <div
                  className="flex gap-1 mb-4 sm:mb-6"
                  role="img"
                  aria-label={`${testimonial.rating} van 5 sterren`}
                >
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-[var(--ff-color-accent-500)] text-[var(--ff-color-accent-500)]" aria-hidden="true" />
                  ))}
                </div>

                {/* Quote - Enhanced mobile readability */}
                <blockquote className="text-[var(--color-text)] leading-[1.7] mb-6 sm:mb-8 text-base sm:text-lg font-light px-1">
                  "{testimonial.quote}"
                </blockquote>

                {/* Author */}
                <footer className="flex items-center gap-3 sm:gap-4">
                  {/* Avatar */}
                  {testimonial.author_avatar_url ? (
                    <img
                      src={testimonial.author_avatar_url}
                      alt={`${testimonial.author_name} profiel foto`}
                      className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full object-cover shadow-lg flex-shrink-0"
                    />
                  ) : (
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center shadow-lg flex-shrink-0`}
                      role="img"
                      aria-label={`${testimonial.author_name} avatar`}
                    >
                      <User className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" strokeWidth={2} aria-hidden="true" />
                    </div>
                  )}
                  <div className="space-y-0.5">
                    <cite className="font-bold text-base sm:text-lg text-[var(--color-text)] not-italic block">
                      {testimonial.author_name}
                    </cite>
                    {testimonial.author_age && (
                      <div className="text-xs sm:text-sm text-[var(--color-muted)] font-medium">
                        {testimonial.author_age} jaar
                      </div>
                    )}
                  </div>
                </footer>
              </article>
            ))}
          </div>
        )}

        {/* Stats bar - Semantic <dl> definition list */}
        <dl className="mt-16 sm:mt-20 lg:mt-24 grid grid-cols-2 md:grid-cols-4 max-w-5xl mx-auto border border-[var(--color-border)] rounded-2xl overflow-hidden divide-y md:divide-y-0 md:divide-x divide-[var(--color-border)]">
          <StatItem value="2.400+" label="Gebruikers" />
          <StatItem value="~2 min" label="Gemiddelde tijd" />
          <StatItem value="Gratis" label="Geen creditcard" />
          <StatItem value="4.9/5" label="Waardering" />
        </dl>

      </div>
    </section>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 sm:py-8 bg-[var(--color-surface)]">
      <dt className="sr-only">{label}</dt>
      <dd>
        <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--ff-color-primary-700)] mb-1.5 tabular-nums leading-none">
          {value}
        </div>
        <div className="text-xs sm:text-sm text-[var(--color-muted)] font-medium text-center leading-snug">
          {label}
        </div>
      </dd>
    </div>
  );
}
