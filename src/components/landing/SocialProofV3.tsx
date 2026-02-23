import { useState } from 'react';
import { Star, User, ChevronLeft, ChevronRight } from 'lucide-react';
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

interface ReviewItem {
  name: string;
  meta?: string;
  quote: string;
  rating?: number;
  avatarUrl?: string;
  age?: number;
  gradient: string;
}

function TestimonialCard({ review, gradient }: { review: ReviewItem; gradient: string }) {
  const rating = review.rating ?? 5;
  return (
    <article
      className="bg-[var(--color-surface)] rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[var(--color-border)] shadow-sm h-full flex flex-col"
      aria-label={`Gebruikerservaring van ${review.name}`}
    >
      <div className="flex gap-1 mb-4 sm:mb-5" role="img" aria-label={`${rating} van 5 sterren`}>
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-[var(--ff-color-accent-500)] text-[var(--ff-color-accent-500)]" aria-hidden="true" />
        ))}
      </div>

      <blockquote className="text-[var(--color-text)] leading-[1.7] mb-6 text-base sm:text-lg font-light flex-1">
        "{review.quote}"
      </blockquote>

      <footer className="flex items-center gap-3 mt-auto">
        {review.avatarUrl ? (
          <img
            src={review.avatarUrl}
            alt={`${review.name} profiel foto`}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}
            role="img"
            aria-label={`${review.name} avatar`}
          >
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2} aria-hidden="true" />
          </div>
        )}
        <div>
          <cite className="font-bold text-sm sm:text-base text-[var(--color-text)] not-italic block">
            {review.name}
          </cite>
          <div className="text-xs text-[var(--color-muted)] font-medium">
            {review.meta ?? (review.age ? `${review.age} jaar` : '')}
          </div>
        </div>
      </footer>
    </article>
  );
}

export function SocialProofV3() {
  const { testimonials, loading } = useTestimonials();
  const [activeIndex, setActiveIndex] = useState(0);

  const showTestimonials = testimonials.length >= 3;

  const reviews: ReviewItem[] = showTestimonials
    ? testimonials.slice(0, 3).map((t, i) => ({
        name: t.author_name,
        age: t.author_age ?? undefined,
        quote: t.quote,
        rating: t.rating,
        avatarUrl: t.author_avatar_url ?? undefined,
        gradient: gradients[i % gradients.length],
      }))
    : PLACEHOLDER_REVIEWS.map((r, i) => ({
        ...r,
        gradient: gradients[i % gradients.length],
      }));

  function prev() {
    setActiveIndex(i => (i - 1 + reviews.length) % reviews.length);
  }
  function next() {
    setActiveIndex(i => (i + 1) % reviews.length);
  }

  return (
    <section
      className="py-12 sm:py-20 lg:py-28 bg-[var(--color-surface)]"
      aria-labelledby="social-proof-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <div
            className="flex items-center justify-center gap-1 mb-4 sm:mb-5"
            role="img"
            aria-label="5 van 5 sterren beoordeling"
          >
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 sm:w-6 sm:h-6 fill-[var(--ff-color-accent-500)] text-[var(--ff-color-accent-500)]" aria-hidden="true" />
            ))}
          </div>
          <h2 id="social-proof-heading" className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--color-text)] mb-3 sm:mb-4">
            Wat anderen zeggen
          </h2>
          <p className="text-base sm:text-lg text-[var(--color-muted)] font-light">
            {showTestimonials ? 'Echte mensen, echte resultaten' : 'Binnenkort hier'}
          </p>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="hidden md:grid md:grid-cols-3 gap-6 lg:gap-8" role="status" aria-label="Testimonials worden geladen">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl p-6 border border-[var(--color-border)] animate-pulse space-y-4" aria-hidden="true">
                <div className="flex gap-1">{[...Array(5)].map((_, j) => <div key={j} className="w-4 h-4 bg-[var(--color-border)] rounded" />)}</div>
                <div className="space-y-2">
                  <div className="h-4 bg-[var(--color-border)] rounded w-full" />
                  <div className="h-4 bg-[var(--color-border)] rounded w-5/6" />
                  <div className="h-4 bg-[var(--color-border)] rounded w-4/6" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[var(--color-border)]" />
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

        {/* Testimonials — mobile: single card carousel; md+: 3-column grid */}
        {!loading && (
          <>
            {/* ── MOBILE: single-card swipe carousel ── */}
            <div className="md:hidden">
              <div className="relative">
                <TestimonialCard review={reviews[activeIndex]} gradient={reviews[activeIndex].gradient} />

                {/* Prev / Next arrows */}
                <button
                  type="button"
                  onClick={prev}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-9 h-9 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] shadow-md flex items-center justify-center hover:border-[var(--ff-color-primary-400)] transition-colors"
                  aria-label="Vorige testimonial"
                >
                  <ChevronLeft className="w-4 h-4 text-[var(--color-text)]" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-9 h-9 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] shadow-md flex items-center justify-center hover:border-[var(--ff-color-primary-400)] transition-colors"
                  aria-label="Volgende testimonial"
                >
                  <ChevronRight className="w-4 h-4 text-[var(--color-text)]" />
                </button>
              </div>

              {/* Dot indicators */}
              <div className="flex items-center justify-center gap-2 mt-5" aria-label="Testimonialpagina's">
                {reviews.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`rounded-full transition-all duration-300 ${
                      idx === activeIndex
                        ? 'w-7 h-2 bg-[var(--ff-color-primary-600)]'
                        : 'w-2 h-2 bg-[var(--color-border)] hover:bg-[var(--ff-color-primary-300)]'
                    }`}
                    aria-label={`Testimonial ${idx + 1}`}
                    aria-current={idx === activeIndex ? 'true' : undefined}
                  />
                ))}
              </div>

              {/* Swipe hint */}
              <p className="text-center text-xs text-[var(--color-muted)] mt-3">
                {activeIndex + 1} van {reviews.length}
              </p>
            </div>

            {/* ── DESKTOP: 3-column grid ── */}
            <div className="hidden md:grid md:grid-cols-3 gap-6 lg:gap-8">
              {reviews.map((review, i) => (
                <TestimonialCard key={i} review={review} gradient={review.gradient} />
              ))}
            </div>
          </>
        )}

        {/* Stats bar */}
        <dl className="mt-14 sm:mt-20 grid grid-cols-2 md:grid-cols-4 max-w-5xl mx-auto border border-[var(--color-border)] rounded-2xl overflow-hidden divide-y md:divide-y-0 md:divide-x divide-[var(--color-border)]">
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
    <div className="flex flex-col items-center justify-center py-5 px-3 sm:py-7 bg-[var(--color-surface)]">
      <dt className="sr-only">{label}</dt>
      <dd>
        <div className="text-2xl sm:text-3xl font-bold text-[var(--ff-color-primary-700)] mb-1 tabular-nums leading-none">
          {value}
        </div>
        <div className="text-xs text-[var(--color-muted)] font-medium text-center leading-snug">
          {label}
        </div>
      </dd>
    </div>
  );
}
