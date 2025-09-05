import React from "react";

const QUIZ_PATH = "/quiz"; // Pas aan als de quiz-route anders is (bv. /onboarding)
const CTA_PRIMARY_ATTRS = { "data-cta": "hero_primary", "data-section": "hero" } as const;
const CTA_SECONDARY_ATTRS = { "data-cta": "hero_secondary", "data-section": "hero" } as const;

export default function HomeHero() {
  const handleScrollToExample = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById('voorbeeldrapport');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <section className="relative isolate overflow-hidden">
      {/* Background with subtle gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#0D1B2A] via-[#0D1B2A] to-[#0a1520]" aria-hidden="true" />
      
      {/* Ambient light effect */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 -z-10 opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(137,207,240,0.4), transparent 70%)" }}
        aria-hidden="true" 
      />
      
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* Copy */}
          <div>
            <div className="mb-4">
              <span className="inline-flex items-center rounded-full bg-[#89CFF0]/10 px-3 py-1 text-xs font-medium text-[#89CFF0] ring-1 ring-[#89CFF0]/20">
                ✨ Nieuw: AI-gedreven stijlanalyse
              </span>
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
              Ontdek jouw stijl.
              <br />
              <span className="text-[#89CFF0] relative">
                Slim. Persoonlijk. Vandaag.
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#89CFF0] to-transparent opacity-60 rounded-full" />
              </span>
            </h1>
            
            <p className="mt-6 max-w-xl text-lg/8 text-white/90 font-medium">
              Wij zijn <strong className="text-[#89CFF0]">Nova</strong> — jouw AI-stylist. In 2 minuten ontvang je je{" "}
              <strong className="text-white">stijlcode</strong>, passende{" "}
              <strong className="text-white">outfits</strong> en een heldere{" "}
              <strong className="text-white">uitleg waarom</strong> het bij je past.
            </p>

            {/* Social proof mini */}
            <div className="mt-4 flex items-center gap-2 text-sm text-white/70">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#89CFF0] to-[#7fc2e3] ring-2 ring-white/20" />
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7fc2e3] to-[#89CFF0] ring-2 ring-white/20" />
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#89CFF0] to-[#6bb8d6] ring-2 ring-white/20" />
              </div>
              <span>Al <strong className="text-white">2.500+</strong> mensen ontdekten hun stijl</span>
            </div>

            {/* CTA's */}
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
              <a
                {/* placeholder removed */CTA_PRIMARY_ATTRS}
                href={QUIZ_PATH}
                className="group inline-flex items-center justify-center rounded-2xl px-8 py-4 font-bold text-slate-900 bg-[#89CFF0] hover:bg-[#7fc2e3] transition-all duration-300 shadow-[0_10px_30px_rgba(137,207,240,0.35)] hover:shadow-[0_15px_40px_rgba(137,207,240,0.45)] hover:scale-105 transform"
              >
                <span>Doe de stijltest</span>
                <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <a
                {/* placeholder removed */CTA_SECONDARY_ATTRS}
                href="#voorbeeldrapport"
                onClick={handleScrollToExample}
                className="group inline-flex items-center justify-center rounded-2xl px-6 py-4 font-semibold text-white/90 ring-1 ring-white/25 hover:bg-white/10 hover:ring-white/40 transition-all duration-300"
              >
                <span>Bekijk voorbeeldrapport</span>
                <svg className="ml-2 w-4 h-4 group-hover:translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </a>
            </div>

            {/* Enhanced trust pills */}
            <ul className="mt-6 flex flex-wrap gap-3 text-xs text-white/70">
              <li className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 ring-1 ring-white/10 hover:bg-white/10 transition-colors">
                <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Snel: ±2 minuten
              </li>
              <li className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 ring-1 ring-white/10 hover:bg-white/10 transition-colors">
                <svg className="w-3 h-3 text-[#89CFF0]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
                Voor vrouwen én mannen
              </li>
              <li className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 ring-1 ring-white/10 hover:bg-white/10 transition-colors">
                <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Privacy-vriendelijk
              </li>
            </ul>
          </div>

          {/* Enhanced visual card */}
          <div className="relative">
            <div className="mx-auto max-w-lg rounded-3xl bg-white shadow-[0_25px_70px_rgba(13,27,42,0.35)] p-6 hover:shadow-[0_30px_80px_rgba(13,27,42,0.4)] transition-all duration-500 hover:scale-105 transform">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#89CFF0] to-[#7fc2e3] flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  N
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-slate-600">Nova AI</p>
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" title="Online" />
                  </div>
                  <p className="text-sm font-semibold text-slate-900">Voorbeeld van je style report</p>
                </div>
              </div>
              
              <div className="mt-5 rounded-2xl border border-slate-100 p-4 bg-gradient-to-br from-slate-50 to-white relative overflow-hidden" id="voorbeeldrapport">
                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 opacity-5" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }} />
                
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Stijlcode</p>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-[#89CFF0]" />
                      <div className="w-2 h-2 rounded-full bg-[#7fc2e3]" />
                      <div className="w-2 h-2 rounded-full bg-[#6bb8d6]" />
                    </div>
                  </div>
                  
                  <p className="mt-2 text-xl font-bold text-slate-900 bg-gradient-to-r from-[#0D1B2A] to-[#1a2b3d] bg-clip-text text-transparent">
                    Smart Casual — Italiaans
                  </p>
                  
                  <ul className="mt-4 space-y-2.5 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#89CFF0] mt-2 flex-shrink-0" />
                      Net-casual laagjes, scherpe fits, lichte stoffen
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#89CFF0] mt-2 flex-shrink-0" />
                      Palet: navy, off-white, zand, lichtblauw
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#89CFF0] mt-2 flex-shrink-0" />
                      Uitleg: flatterende verhoudingen + effortless klasse
                    </li>
                  </ul>
                  
                  <a
                    href={QUIZ_PATH}
                    className="group mt-5 inline-flex items-center rounded-xl px-4 py-2.5 bg-[#0D1B2A] text-white text-sm font-semibold hover:bg-[#0b1622] transition-all duration-300 shadow-lg hover:shadow-xl"
                    data-cta="hero_card_cta"
                  >
                    <span>Krijg jouw persoonlijke uitleg</span>
                    <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Enhanced glow effects */}
            <div className="pointer-events-none absolute -inset-x-10 -bottom-10 h-40 blur-3xl animate-pulse"
                 style={{ background: "radial-gradient(60% 50% at 50% 50%, rgba(137,207,240,0.35), transparent)" }}
                 aria-hidden="true" />
            
            {/* Additional floating elements for depth */}
            <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-[#89CFF0]/20 blur-sm animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3s' }} />
            <div className="absolute -bottom-6 -left-6 w-6 h-6 rounded-full bg-[#7fc2e3]/30 blur-sm animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }} />
          </div>
        </div>
      </div>
    </section>
  );
}