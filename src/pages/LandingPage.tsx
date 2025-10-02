import React from "react";
import { Helmet } from "react-helmet-async";
import { NavLink } from "react-router-dom";
import PageHero from "@/components/marketing/PageHero";

export default function LandingPage() {
  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)] overflow-hidden">
      <Helmet>
        <title>AI Style Report in 2 minuten – Persoonlijk stijladvies | FitFi</title>
        <meta name="description" content="Krijg in 2:00 een persoonlijk AI Style Report met uitleg, kleuren en 6–12 outfits. Privacy-first, EU-gericht en nuchter. Start gratis." />
        <meta property="og:image" content="/hero/style-report%20copy.webp" />
        <script type="application/ld+json">
          {JSON.stringify({
        <meta property="og:image" content="/hero/style-report%20copy.webp" />
            "@type": "WebApplication",
            "name": "FitFi",
            "description": "AI Style Report in 2 minuten – Persoonlijk stijladvies",
            "url": "https://fitfi.nl",
            "applicationCategory": "LifestyleApplication",
            "operatingSystem": "Web"
          })}
        </script>
      </Helmet>

      {/* HERO SECTION — Fantastische integratie */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-bg)] via-[var(--overlay-surface-8)] to-[var(--color-bg)] opacity-60" />
        
        {/* Floating orbs for ambient effect */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-400)] rounded-full opacity-20 blur-xl animate-pulse" />
        <div className="absolute bottom-32 right-16 w-24 h-24 bg-gradient-to-r from-[var(--ff-color-turquoise)] to-[var(--ff-color-primary-500)] rounded-full opacity-15 blur-lg animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="ff-container--home relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            
            {/* Left: Hero Content */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full text-sm font-medium text-[var(--ff-color-primary-700)] shadow-sm">
                <span className="w-2 h-2 bg-[var(--ff-color-primary-600)] rounded-full animate-pulse" />
                GRATIS AI STYLE REPORT
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-[var(--color-text)] leading-tight">
                Ontdek wat jouw
                <span className="block bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-turquoise)] bg-clip-text text-transparent">
                  stijl over je zegt
                </span>
              </h1>
              
              <p className="text-lg lg:text-xl text-[var(--color-muted)] max-w-2xl leading-relaxed">
                Binnen 2 minuten krijg je een persoonlijk rapport met uitleg, kleuren en 6–12 outfits. 
                <strong className="text-[var(--color-text)]"> Rustig, duidelijk en zonder gedoe.</strong>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <NavLink
                  to="/onboarding"
                  data-event="cta_start_free_home_hero"
                  className="group relative px-8 py-4 bg-[var(--ff-color-primary-700)] text-white font-semibold rounded-2xl shadow-lg hover:bg-[var(--ff-color-primary-600)] transition-all duration-300 hover:shadow-xl hover:scale-105 overflow-hidden"
                >
                  <span className="relative z-10">Start gratis</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-turquoise)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </NavLink>
                
                <NavLink
                  to="/results"
                  data-event="cta_view_example_hero"
                  className="px-8 py-4 bg-transparent text-[var(--color-text)] font-semibold border-2 border-[var(--color-border)] rounded-2xl hover:border-[var(--ff-color-primary-600)] hover:text-[var(--ff-color-primary-600)] transition-all duration-300 hover:shadow-lg"
                >
                  Bekijk voorbeeldrapport
                </NavLink>
              </div>
              
              {/* Trust indicators */}
              <div className="flex items-center justify-center lg:justify-start gap-6 pt-4">
                <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  100% Gratis
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Privacy-first
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                  <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  2 min setup
                </div>
              </div>
            </div>
            
            {/* Right: Hero Image with fantastic integration */}
            <div className="relative flex justify-center lg:justify-end">
              {/* Main device frame with premium styling */}
              <div className="relative group">
                {/* Ambient glow background */}
                <div className="absolute -inset-8 bg-gradient-to-r from-[var(--ff-color-primary-600)] via-[var(--ff-color-turquoise)] to-[var(--ff-color-primary-400)] rounded-3xl opacity-20 blur-2xl group-hover:opacity-30 transition-opacity duration-700" />
                
                {/* Device shadow */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-3/4 h-8 bg-[var(--color-text)] opacity-10 rounded-full blur-xl" />
                
                {/* Device frame */}
                <figure className="relative bg-[var(--color-surface)] rounded-3xl p-2 shadow-2xl border border-[var(--color-border)] group-hover:scale-105 transition-transform duration-500 max-w-sm mx-auto">
            <img
              src="/hero/style-report%20copy.webp"
              alt="Voorbeeld van het FitFi Style Report op mobiel"
              loading="eager"
              fetchPriority="high"
              fetchPriority="high"
              decoding="async"
              className="w-full h-auto rounded-2xl shadow-lg"
              sizes="(max-width: 1024px) 90vw, 400px"
            />
                  
                  {/* Floating feature cards */}
                  <div className="absolute -left-4 top-1/4 transform -translate-y-1/2 hidden lg:block">
                    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/20 animate-float">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-turquoise)] rounded-xl flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-gray-800">Archetype</div>
                          <div className="text-xs text-gray-600">Modern Minimal</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute -right-4 top-2/3 transform -translate-y-1/2 hidden lg:block">
                    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/20 animate-float" style={{ animationDelay: '1s' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-[var(--ff-color-turquoise)] to-[var(--ff-color-primary-500)] rounded-xl flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-gray-800">Outfits</div>
                          <div className="text-xs text-gray-600">6-12 looks</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute -left-8 bottom-1/4 transform translate-y-1/2 hidden lg:block">
                    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/20 animate-float" style={{ animationDelay: '2s' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-[var(--ff-color-primary-500)] to-[var(--ff-color-primary-700)] rounded-xl flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-gray-800">AI Powered</div>
                          <div className="text-xs text-gray-600">Smart matching</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </figure>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === DIFFERENTIATIE === */}
      <section className="ff-section">
        <div className="ff-container--home">
          <div className="ff-section-card">
            <div className="ff-section-card-head">
              <span className="ff-kicker">Waarom FitFi</span>
              <h2 className="ff-section-title">Nuchter, helder en zonder gedoe</h2>
            </div>
            <div className="ff-section-card-body">
              <div className="ff-grid cols-2">
                <div className="ff-tile">
                  <h3>2 minuten, klaar</h3>
                  <p className="ff-oneliner">Geen eindeloze vragenlijsten. Gewoon de basics en je krijgt direct resultaat.</p>
                  <details className="ff-more">
                    <summary>Meer</summary>
                    <div className="ff-more-body">
                      We vragen alleen wat echt nodig is: lichaamsbouw, voorkeuren en gelegenheid. De AI doet de rest.
                    </div>
                  </details>
                </div>
                <div className="ff-tile">
                  <h3>Uitleg erbij</h3>
                  <p className="ff-oneliner">Elk outfit komt met reden waarom het bij je past. Leer over je eigen stijl.</p>
                  <details className="ff-more">
                    <summary>Meer</summary>
                    <div className="ff-more-body">
                      Geen willekeurige suggesties. Je krijgt uitleg over kleuren, silhouetten en waarom iets werkt voor jouw lichaamsbouw.
                    </div>
                  </details>
                </div>
                <div className="ff-tile">
                  <h3>Direct shopbaar</h3>
                  <p className="ff-oneliner">Alle items zijn beschikbaar bij bekende Nederlandse webshops.</p>
                  <details className="ff-more">
                    <summary>Meer</summary>
                    <div className="ff-more-body">
                      Links naar Zalando, ASOS, H&M en andere shops die je kent. Geen obscure merken of uitverkochte items.
                    </div>
                  </details>
                </div>
                <div className="ff-tile">
                  <h3>Privacy-first (EU)</h3>
                  <p className="ff-oneliner">Alleen wat nodig is, geen doorverkoop van data.</p>
                  <details className="ff-more">
                    <summary>Meer</summary>
                    <div className="ff-more-body">
                      We zijn helder over data: minimaal verzamelen, geen doorverkoop, EU-toon & beleid. <NavLink to="/privacy" className="ff-link">Privacy</NavLink>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === TRUST & TESTIMONIALS === */}
      <section className="ff-section">
        <div className="ff-container--home">
          <div className="ff-trust">
            <div>
              <h2 className="ff-section-title">Wat anderen zeggen</h2>
              <div className="ff-badges">
                <span className="ff-badge">⭐ 4.8/5 gemiddeld</span>
                <span className="ff-badge">🇳🇱 Nederlandse focus</span>
                <span className="ff-badge">🔒 GDPR compliant</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="ff-testimonial">
                <div className="ff-avatar">M</div>
                <div>
                  <p>"Eindelijk stijladvies dat niet overdreven is. Praktisch en echt bruikbaar."</p>
                  <small className="text-[var(--color-muted)]">— Marieke, 32</small>
                </div>
              </div>
              <div className="ff-testimonial">
                <div className="ff-avatar">T</div>
                <div>
                  <p>"De uitleg waarom iets bij me past was echt eye-opening. Geen giswerk meer."</p>
                  <small className="text-[var(--color-muted)]">— Thomas, 28</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === HOE HET WERKT === */}
      <section className="ff-section">
        <div className="ff-container--home">
          <div className="ff-section-card">
            <div className="ff-section-card-head">
              <span className="ff-kicker">Proces</span>
              <h2 className="ff-section-title">Hoe het werkt</h2>
            </div>
            <div className="ff-section-card-body">
              <ol className="ff-list ff-list--spine cols-2">
                <li className="ff-row">
                  <h3 className="ff-row-title" data-nr="1">Korte vragenlijst</h3>
                  <p className="ff-row-sub">Lichaamsbouw, voorkeuren en waar je de kleding draagt. 2 minuten max.</p>
                </li>
                <li className="ff-row">
                  <h3 className="ff-row-title" data-nr="2">AI analyseert</h3>
                  <p className="ff-row-sub">Onze AI bepaalt je stijlarchetype en matcht dit met beschikbare items.</p>
                </li>
                <li className="ff-row">
                  <h3 className="ff-row-title" data-nr="3">Persoonlijk rapport</h3>
                  <p className="ff-row-sub">Je krijgt 6-12 complete outfits met uitleg en directe shoplinks.</p>
                </li>
                <li className="ff-row">
                  <h3 className="ff-row-title" data-nr="4">Shop & draag</h3>
                  <p className="ff-row-sub">Klik door naar bekende webshops en bouw je garderobe stap voor stap op.</p>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* === FAQ === */}
      <section className="ff-section">
        <div className="ff-container--home">
          <div className="ff-section-card">
            <div className="ff-section-card-head">
              <span className="ff-kicker">Vragen</span>
              <h2 className="ff-section-title">Veelgestelde vragen</h2>
            </div>
            <div className="ff-section-card-body">
              <div className="ff-faq">
                <details>
                  <summary>Is het echt gratis?</summary>
                  <p>Ja, het basisrapport is volledig gratis. Je krijgt je stijlarchetype, kleurpalet en 6-8 outfits zonder kosten.</p>
                </details>
                <details>
                  <summary>Hoe accuraat is de AI?</summary>
                  <p>Onze AI is getraind op duizenden stijlcombinaties en houdt rekening met lichaamsbouw, kleurtype en persoonlijke voorkeuren. De meeste gebruikers zijn verrast door de accuratesse.</p>
                </details>
                <details>
                  <summary>Welke winkels worden gebruikt?</summary>
                  <p>We werken samen met bekende Nederlandse webshops zoals Zalando, ASOS, H&M, en anderen. Alle items zijn beschikbaar en leverbaar in Nederland.</p>
                </details>
                <details>
                  <summary>Wat gebeurt er met mijn data?</summary>
                  <p>We verzamelen alleen wat nodig is voor je stijladvies. Je data wordt niet doorverkocht en we houden ons aan alle EU privacy-regels. <NavLink to="/privacy" className="ff-link">Lees ons privacybeleid</NavLink>.</p>
                </details>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === FOOTER CTA === */}
      <section className="ff-section">
        <div className="ff-container--home">
          <div className="text-center space-y-6 py-8">
            <h2 className="ff-hero-title">Klaar om je stijl te ontdekken?</h2>
            <p className="ff-hero-sub">Start nu en krijg binnen 2 minuten je persoonlijke Style Report.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <NavLink 
      {/* Stats section */}
      <section className="py-16 bg-[var(--color-surface)] border-t border-[var(--color-border)]">
        <div className="ff-container--home">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-[var(--ff-color-primary-600)]">10K+</div>
              <div className="text-sm text-[var(--color-muted)] mt-1">Style Reports</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[var(--ff-color-primary-600)]">2 min</div>
              <div className="text-sm text-[var(--color-muted)] mt-1">Gemiddelde tijd</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[var(--ff-color-primary-600)]">95%</div>
              <div className="text-sm text-[var(--color-muted)] mt-1">Tevreden gebruikers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[var(--ff-color-primary-600)]">100%</div>
              <div className="text-sm text-[var(--color-muted)] mt-1">Privacy-first</div>
            </div>
          </div>
        </div>
      </section>
                data-event="cta_start_free_footer"
      {/* FAQ section */}
      <section className="ff-section pb-20" aria-label="FAQ link">
              >
                Start gratis Style Report
              </NavLink>
              <NavLink 
                to="/results" 
                className="ff-btn ff-btn-secondary"
                data-event="cta_view_example_footer"
              >
                Bekijk voorbeeldrapport
              </NavLink>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}