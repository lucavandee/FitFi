import { Shield, Lock, AlertCircle } from 'lucide-react';

export function TrustBlock() {
  return (
    <section
      className="py-16 sm:py-20 bg-[var(--color-surface)] border-y border-[var(--color-border)]"
      aria-labelledby="trust-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-12">
          <h2 id="trust-heading" className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] mb-4">
            Jouw gegevens, jouw controle
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            We zijn transparant over wat we wel en niet doen met je informatie.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">

          <div className="bg-[var(--color-bg)] rounded-2xl p-5 sm:p-6 border border-[var(--color-border)] hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0" aria-hidden="true">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-[var(--color-text)]">Privacy first</h3>
            </div>
            <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed">
              Je antwoorden blijven privé. We delen nooit je data met derden en je kunt je account op elk moment verwijderen.
            </p>
          </div>

          <div className="bg-[var(--color-bg)] rounded-2xl p-5 sm:p-6 border border-[var(--color-border)] hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0" aria-hidden="true">
                <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-[var(--color-text)]">Jouw data, jouw keuze</h3>
            </div>
            <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed">
              We bewaren alleen wat nodig is voor je stijladvies. Verwijder je profiel en al je gegevens worden binnen 30 dagen gewist.
            </p>
          </div>

          <div className="bg-[var(--color-bg)] rounded-2xl p-5 sm:p-6 border border-[var(--color-border)] hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0" aria-hidden="true">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-[var(--color-text)]">Mode, geen fitness</h3>
            </div>
            <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed">
              FitFi is een stijl- en kledingadvies-tool. We maken geen uitspraken over gezondheid, lichaamsbouw of fitness.
            </p>
          </div>

        </div>

        <div className="mt-8 sm:mt-10 max-w-3xl mx-auto">
          <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-4 sm:p-6">
            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 flex-shrink-0 mt-0.5" aria-hidden="true">
                <svg className="w-7 h-7 text-[var(--ff-color-primary-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-[var(--color-text)] mb-1 text-sm sm:text-base">
                  Hoe eerlijk kleurenadvies werkt
                </h4>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  Standaard geven we stijladvies op basis van je voorkeuren en antwoorden. Kleurenanalyse op basis van ondertoon is optioneel — en werkt alleen goed als je zelf die informatie deelt of een foto uploadt. We schatten of claimen dit niet op eigen initiatief.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
