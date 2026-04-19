import React from "react";
import { Helmet } from "react-helmet-async";
import { Target, Shield, Sparkles } from "lucide-react";
import { canonicalUrl } from "@/utils/urls";

export default function AboutPage() {
  return (
    <main id="main" className="bg-[#FAFAF8]">
      <Helmet>
        <title>Over ons — FitFi</title>
        <meta
          name="description"
          content="Wij bouwen een stijltool die eerlijk, rustig en effectief is. Leer meer over onze aanpak, principes en hoe FitFi werkt."
        />
        <link rel="canonical" href={canonicalUrl('/over-ons')} />
        <meta property="og:title" content="Over ons — FitFi" />
        <meta property="og:description" content="Wij bouwen een stijltool die eerlijk, rustig en effectief is." />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Page header */}
      <section className="bg-[#F5F0EB] pt-44 md:pt-52 pb-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-[#E5E5E5] rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-[#C2654A]" aria-hidden />
            <span className="text-sm font-medium text-[#4A4A4A]">Over FitFi</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">
            Stijl zonder gedoe
          </h1>
          <p className="text-base text-[#4A4A4A] mt-4 max-w-lg mx-auto leading-relaxed">
            FitFi helpt je betere kledingkeuzes te maken. Rustig, persoonlijk en gericht.
          </p>
        </div>
      </section>

      {/* Missie & Principes */}
      <section className="py-16 md:py-24 bg-[#FAFAF8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 hover:shadow-md transition-shadow duration-200">
              <div className="w-11 h-11 rounded-xl bg-[#F4E8E3] flex items-center justify-center mb-5">
                <Target className="w-5 h-5 text-[#C2654A]" aria-hidden />
              </div>
              <h2 className="text-xl font-semibold text-[#1A1A1A] mb-3">Onze missie</h2>
              <p className="text-[#4A4A4A] text-base leading-relaxed">
                We maken stijl eenvoudig en persoonlijk. Met privacy-vriendelijke technologie en duidelijke keuzes,
                zodat jij met minder moeite beter voor de dag komt.
              </p>
            </div>

            <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 hover:shadow-md transition-shadow duration-200">
              <div className="w-11 h-11 rounded-xl bg-[#F4E8E3] flex items-center justify-center mb-5">
                <Sparkles className="w-5 h-5 text-[#C2654A]" aria-hidden />
              </div>
              <h2 className="text-xl font-semibold text-[#1A1A1A] mb-3">Onze principes</h2>
              <div className="space-y-3 text-[#4A4A4A] text-base leading-relaxed">
                <p>Rustig, precies en feitelijk. Wij schrijven en ontwerpen zonder overdrijving.</p>
                <p>Toegankelijk op elk scherm. Mobile-first, keyboard-navigeerbaar en leesbaar voor iedereen.</p>
                <p>Geen verborgen kosten of misleidende keuzes. Transparante prijzen, duidelijke opt-outs.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wat ons onderscheidt */}
      <section className="py-16 md:py-24 bg-[#F5F0EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">
              Wat ons onderscheidt
            </h2>
            <p className="text-base text-[#4A4A4A] mt-4 leading-relaxed">
              Transparantie, privacy en focus op resultaat staan centraal in alles wat we doen.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                Icon: Shield,
                title: "EU-privacy",
                body: "Data-minimalistisch en helder over wat we doen. Jouw privacy staat voorop.",
              },
              {
                Icon: Sparkles,
                title: "Consistente ervaring",
                body: "Elke pagina ziet er hetzelfde uit, laadt snel en werkt op elk scherm.",
              },
              {
                Icon: Target,
                title: "Focus op resultaat",
                body: "Direct bruikbare outfits en keuzes. Binnen 2 minuten bruikbaar advies.",
              },
            ].map(({ Icon, title, body }) => (
              <div
                key={title}
                className="bg-white border border-[#E5E5E5] rounded-2xl p-6 hover:shadow-md transition-shadow duration-200 flex flex-col"
              >
                <div className="w-11 h-11 rounded-xl bg-[#F4E8E3] flex items-center justify-center mb-4 flex-shrink-0">
                  <Icon className="w-5 h-5 text-[#C2654A]" aria-hidden />
                </div>
                <h3 className="text-base font-semibold text-[#1A1A1A] mb-2">{title}</h3>
                <p className="text-[#4A4A4A] text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
