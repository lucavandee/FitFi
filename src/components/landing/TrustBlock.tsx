import { Shield, Lock, AlertCircle } from 'lucide-react';

/**
 * TrustBlock - Privacy & Transparency
 *
 * Shows users:
 * - Privacy commitment
 * - Data retention policy
 * - What we don't claim (no medical/fitness)
 */
export function TrustBlock() {
  return (
    <section
      className="py-16 sm:py-20 bg-[var(--color-surface)] border-y border-[var(--color-border)]"
      aria-labelledby="trust-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="text-center mb-12">
          <h2 id="trust-heading" className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] mb-4">
            Jouw gegevens, jouw controle
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            We zijn transparant over wat we wel en niet doen met je informatie.
          </p>
        </div>

        {/* Trust Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">

          {/* Privacy */}
          <div className="bg-[var(--color-bg)] rounded-2xl p-6 border border-[var(--color-border)] hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--color-text)]">Privacy first</h3>
            </div>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">
              Je antwoorden blijven privé. We delen nooit je data met derden en je kunt je account op elk moment verwijderen.
            </p>
          </div>

          {/* Data Retention */}
          <div className="bg-[var(--color-bg)] rounded-2xl p-6 border border-[var(--color-border)] hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--color-text)]">Jouw data, jouw keuze</h3>
            </div>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">
              We bewaren alleen wat nodig is voor je stijladvies. Verwijder je profiel en al je gegevens worden binnen 30 dagen gewist.
            </p>
          </div>

          {/* No Medical Claims */}
          <div className="bg-[var(--color-bg)] rounded-2xl p-6 border border-[var(--color-border)] hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--color-text)]">Kleding, geen claims</h3>
            </div>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">
              FitFi geeft stijladvies voor kleding. We doen geen medische of fitness-gerelateerde claims over je lichaam.
            </p>
          </div>

        </div>

        {/* Transparency Note */}
        <div className="mt-12 max-w-3xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h4 className="font-semibold text-[var(--color-text)] mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Wat we wel en niet weten
            </h4>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              <strong>Zonder foto:</strong> We geven algemene stijladvies op basis van je voorkeuren en antwoorden.<br />
              <strong>Met Premium + foto:</strong> We analyseren kleurtonen voor seizoensadvies (lente, zomer, herfst, winter). Dit is geen medisch advies.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
