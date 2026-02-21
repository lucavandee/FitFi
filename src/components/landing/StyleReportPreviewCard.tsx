import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * StyleReportPreviewCard - Shows what users get
 *
 * Displays a teaser/preview of the style report with:
 * - Blurred example content
 * - Clear CTA to see full example
 * - Builds confidence that there's real value
 */
export function StyleReportPreviewCard() {
  const navigate = useNavigate();

  return (
    <section
      className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-[var(--color-bg)] to-[var(--color-surface)]"
      aria-labelledby="preview-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--ff-color-accent-100)] rounded-full text-sm font-semibold text-[var(--ff-color-accent-700)] mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Jouw persoonlijke stijlrapport</span>
          </div>
          <h2 id="preview-heading" className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--color-text)] mb-4">
            Dit krijg je na de quiz
          </h2>
          <p className="text-lg sm:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            Een compleet overzicht met outfits, shoplinks en stijladvies specifiek voor jou.
          </p>
        </div>

        {/* Preview Card */}
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-[var(--color-border)]">

            {/* Mock Report Content - Blurred */}
            <div className="relative">
              <div className="p-8 sm:p-12">

                {/* Header */}
                <div className="mb-8">
                  <div className="h-8 w-3/4 bg-gradient-to-r from-[var(--ff-color-beige-300)] to-[var(--ff-color-beige-200)] rounded-lg mb-4"></div>
                  <div className="h-4 w-1/2 bg-[var(--ff-color-beige-200)] rounded"></div>
                </div>

                {/* Style DNA */}
                <div className="mb-8">
                  <div className="h-6 w-40 bg-[var(--ff-color-beige-300)] rounded mb-4"></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-24 bg-gradient-to-br from-[var(--ff-color-primary-200)] to-[var(--ff-color-primary-100)] rounded-xl"></div>
                    <div className="h-24 bg-gradient-to-br from-[var(--ff-color-accent-200)] to-[var(--ff-color-accent-100)] rounded-xl"></div>
                    <div className="h-24 bg-gradient-to-br from-[var(--ff-color-beige-300)] to-[var(--ff-color-beige-200)] rounded-xl"></div>
                  </div>
                </div>

                {/* Outfits Grid */}
                <div className="mb-8">
                  <div className="h-6 w-48 bg-[var(--ff-color-beige-300)] rounded mb-4"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="aspect-[3/4] bg-gradient-to-b from-[var(--ff-color-beige-200)] to-[var(--ff-color-beige-100)] rounded-xl"></div>
                    <div className="aspect-[3/4] bg-gradient-to-b from-[var(--ff-color-beige-200)] to-[var(--ff-color-beige-100)] rounded-xl"></div>
                  </div>
                </div>

                {/* Color Palette */}
                <div>
                  <div className="h-6 w-56 bg-[var(--ff-color-beige-300)] rounded mb-4"></div>
                  <div className="flex gap-3">
                    <div className="w-16 h-16 bg-[var(--ff-color-primary-400)] rounded-lg"></div>
                    <div className="w-16 h-16 bg-[var(--ff-color-accent-400)] rounded-lg"></div>
                    <div className="w-16 h-16 bg-[var(--ff-color-beige-400)] rounded-lg"></div>
                    <div className="w-16 h-16 bg-[var(--color-text-secondary)] rounded-lg"></div>
                  </div>
                </div>

              </div>

              {/* Blur Overlay */}
              <div className="absolute inset-0 backdrop-blur-sm bg-white/40"></div>

              {/* "Unlock" CTA Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center px-6">
                  <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-2xl max-w-md mx-auto border border-[var(--color-border)]">
                    <h3 className="text-2xl font-bold text-[var(--color-text)] mb-3">
                      Nieuwsgierig hoe het eruitziet?
                    </h3>
                    <p className="text-[var(--color-text-secondary)] mb-6">
                      Bekijk een echt voorbeeld van een stijlrapport voordat je start.
                    </p>
                    <button
                      onClick={() => navigate('/results/preview')}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      Bekijk voorbeeld
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* What's Included - Clear benefits */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-6">

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-[var(--color-text)] mb-2">10-15 outfits</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Combinaties voor verschillende gelegenheden
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="font-semibold text-[var(--color-text)] mb-2">Direct shoplinks</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Klik door naar webshops om items te bekijken
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="font-semibold text-[var(--color-text)] mb-2">Stijladvies</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Persoonlijke tips voor jouw stijl
              </p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
