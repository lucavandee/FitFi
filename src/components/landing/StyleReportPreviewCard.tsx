import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function StyleReportPreviewCard() {
  const navigate = useNavigate();

  return (
    <section
      className="py-16 sm:py-20 md:py-24 bg-[#FAFAF8]"
      aria-labelledby="preview-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FAF5F2] rounded-full text-sm font-semibold text-[#C2654A] mb-6">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            <span>Persoonlijk stijladvies voor kleding</span>
          </div>
          <h2 id="preview-heading" className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4">
            Dit krijg je na de quiz
          </h2>
          <p className="text-lg sm:text-xl text-[#4A4A4A] max-w-2xl mx-auto">
            3 outfit-combinaties, do&apos;s &amp; don&apos;ts en shoplinks — afgestemd op jouw stijl en gelegenheden.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#E5E5E5]">

            <div className="relative">
              <div className="p-8 sm:p-12">

                <div className="mb-8">
                  <div className="h-8 w-3/4 bg-[#F5F0EB] rounded-lg mb-4"></div>
                  <div className="h-4 w-1/2 bg-[#E5E5E5] rounded"></div>
                </div>

                <div className="mb-8">
                  <div className="h-6 w-40 bg-[#F5F0EB] rounded mb-4"></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-24 bg-[#F4E8E3] rounded-xl"></div>
                    <div className="h-24 bg-[#FAF5F2] rounded-xl"></div>
                    <div className="h-24 bg-[#F5F0EB] rounded-xl"></div>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="h-6 w-48 bg-[#F5F0EB] rounded mb-4"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="aspect-[3/4] bg-[#F5F0EB] rounded-xl"></div>
                    <div className="aspect-[3/4] bg-[#F5F0EB] rounded-xl"></div>
                  </div>
                </div>

                <div>
                  <div className="h-6 w-56 bg-[#F5F0EB] rounded mb-4"></div>
                  <div className="flex gap-3">
                    <div className="w-16 h-16 bg-[#C2654A] rounded-lg"></div>
                    <div className="w-16 h-16 bg-[#D4856E] rounded-lg"></div>
                    <div className="w-16 h-16 bg-[#F5F0EB] rounded-lg"></div>
                    <div className="w-16 h-16 bg-[#8A8A8A] rounded-lg"></div>
                  </div>
                </div>

              </div>

              <div className="absolute inset-0 backdrop-blur-sm bg-white/40"></div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center px-6">
                  <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-2xl max-w-md mx-auto border border-[#E5E5E5]">
                    <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3">
                      Nieuwsgierig hoe het eruitziet?
                    </h3>
                    <p className="text-[#4A4A4A] mb-6">
                      Bekijk een echt voorbeeld van een stijlrapport voordat je start.
                    </p>
                    <button
                      onClick={() => navigate('/results/preview')}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#C2654A] hover:bg-[#A8513A] text-white rounded-xl font-semibold text-base transition-colors duration-200"
                    >
                      Bekijk voorbeeld
                      <ArrowRight className="w-5 h-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

        <div className="mt-12 max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-6">

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3" aria-hidden="true">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-[#1A1A1A] mb-2">Outfit-combinaties</h3>
              <p className="text-sm text-[#4A4A4A]">
                Voor werk, weekend en uitgaan — inclusief do&apos;s &amp; don&apos;ts
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3" aria-hidden="true">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="font-semibold text-[#1A1A1A] mb-2">Directe shoplinks</h3>
              <p className="text-sm text-[#4A4A4A]">
                Klik door naar webshops — geen zoekwerk meer
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-[#FAF5F2] rounded-full flex items-center justify-center mx-auto mb-3" aria-hidden="true">
                <svg className="w-6 h-6 text-[#C2654A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="font-semibold text-[#1A1A1A] mb-2">Aanpasbaar rapport</h3>
              <p className="text-sm text-[#4A4A4A]">
                Verander je antwoorden en ontvang direct nieuwe aanbevelingen
              </p>
            </div>

          </div>

          <p className="mt-8 text-center text-xs sm:text-sm text-[#8A8A8A] max-w-xl mx-auto leading-relaxed">
            Kleurenanalyse op basis van ondertoon is optioneel en alleen beschikbaar als je die informatie met ons deelt. We maken geen claims over lichaam of gezondheid.
          </p>
        </div>

      </div>
    </section>
  );
}
