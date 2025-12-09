import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Check,
  Sparkles,
  Target,
  Zap,
  Clock,
  Shield,
  ArrowRight,
  Brain,
  Heart,
  Shirt,
  TrendingUp,
  Users,
  MessageCircle
} from "lucide-react";

export default function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Helmet>
        <title>Hoe het werkt - Jouw stijlgids in 5 minuten | FitFi</title>
        <meta
          name="description"
          content="Jouw stijlgids in 5 minuten. Quiz → AI analyse → Outfits die je direct kunt shoppen. Simpel, snel, persoonlijk."
        />
      </Helmet>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--ff-color-primary-50)] via-white to-[var(--ff-color-accent-50)] py-12 sm:py-16 md:py-24 lg:py-32 xl:py-40">
        <div className="ff-container relative">
          <div className="max-w-5xl mx-auto text-center px-4 sm:px-6">

            {/* Social Proof Badge */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 bg-white/95 backdrop-blur-sm border border-[var(--color-border)] rounded-full mb-6 sm:mb-8 shadow-lg">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--ff-color-primary-600)]" />
              <span className="text-xs sm:text-sm font-bold text-[var(--color-text)]">
                <span className="hidden xs:inline">2.500+ mensen ontdekten hun stijl</span><span className="xs:hidden">2500+ gebruikers</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-[var(--color-text)] mb-6 sm:mb-8 leading-[1.1] tracking-tight">
              Jouw <span className="bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-700)] bg-clip-text text-transparent">stijlgids</span><br />
              in <span className="bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-700)] bg-clip-text text-transparent">5 minuten</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-[var(--color-muted)] mb-8 sm:mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              Ontdek outfits die bij je passen en shop ze direct. Geen eindeloos scrollen, geen dure stylisten.
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-10">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[var(--ff-color-primary-100)] rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--ff-color-primary-700)]" />
                </div>
                <span className="text-sm sm:text-base md:text-lg font-semibold text-[var(--color-text)]">5 minuten</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-700" />
                </div>
                <span className="text-sm sm:text-base md:text-lg font-semibold text-[var(--color-text)]"><span className="hidden xs:inline">Geen foto's nodig</span><span className="xs:hidden">Geen foto's</span></span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[var(--ff-color-accent-100)] rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--ff-color-accent-700)]" />
                </div>
                <span className="text-sm sm:text-base md:text-lg font-semibold text-[var(--color-text)]">Direct resultaat</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Process */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 bg-white">
        <div className="ff-container">
          <div className="max-w-7xl mx-auto">

            <div className="text-center mb-10 sm:mb-12 md:mb-16 lg:mb-20 px-4 sm:px-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 tracking-tight">
                Zo simpel werkt het
              </h2>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-[var(--color-muted)] font-light">
                3 stappen, 5 minuten, lifetime resultaat
              </p>
            </div>

            {/* Interactive Timeline */}
            <div className="grid md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 mb-12 sm:mb-16">
              {/* Step 1 */}
              <motion.div
                onHoverStart={() => setActiveStep(1)}
                className={`relative bg-[var(--color-surface)] rounded-2xl sm:rounded-[2rem] border-2 p-6 sm:p-7 md:p-8 lg:p-10 transition-all duration-500 cursor-pointer ${
                  activeStep === 1
                    ? 'border-[var(--ff-color-primary-600)] shadow-2xl scale-105'
                    : 'border-[var(--color-border)] shadow-lg hover:shadow-xl'
                }`}
              >
                <div className="absolute -top-3 sm:-top-4 left-6 sm:left-8 px-4 sm:px-5 py-1.5 sm:py-2 bg-[var(--ff-color-primary-600)] text-white rounded-full text-xs sm:text-sm font-bold shadow-lg">
                  Stap 1
                </div>

                <div className="mb-5 sm:mb-6 mt-2">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center shadow-xl mb-5 sm:mb-6">
                    <MessageCircle className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-white" strokeWidth={2} />
                  </div>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 leading-tight">8 slimme vragen</h3>
                  <p className="text-[var(--color-muted)] text-sm sm:text-base lg:text-lg leading-relaxed mb-5 sm:mb-6">
                    Over je lifestyle, voorkeuren en persoonlijkheid. Geen foto's, geen gedoe.
                  </p>
                </div>

                <div className="space-y-2.5 sm:space-y-3">
                  <div className="flex items-center gap-2.5 sm:gap-3 group">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 bg-[var(--ff-color-primary-100)] rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--ff-color-primary-200)] transition-colors">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--ff-color-primary-700)]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-xs sm:text-sm lg:text-base font-medium">Privacy-vriendelijk</span>
                  </div>
                  <div className="flex items-center gap-2.5 sm:gap-3 group">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 bg-[var(--ff-color-primary-100)] rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--ff-color-primary-200)] transition-colors">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--ff-color-primary-700)]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-xs sm:text-sm lg:text-base font-medium">2 minuten</span>
                  </div>
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 bg-[var(--ff-color-accent-100)] rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--ff-color-accent-700)]" />
                    </div>
                    <span className="text-xs sm:text-sm lg:text-base font-medium text-[var(--color-muted)]">Start nu</span>
                  </div>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                onHoverStart={() => setActiveStep(2)}
                className={`relative bg-[var(--color-surface)] rounded-2xl sm:rounded-[2rem] border-2 p-6 sm:p-7 md:p-8 lg:p-10 transition-all duration-500 cursor-pointer ${
                  activeStep === 2
                    ? 'border-[var(--ff-color-primary-600)] shadow-2xl scale-105'
                    : 'border-[var(--color-border)] shadow-lg hover:shadow-xl'
                }`}
              >
                <div className="absolute -top-3 sm:-top-4 left-6 sm:left-8 px-4 sm:px-5 py-1.5 sm:py-2 bg-[var(--ff-color-primary-600)] text-white rounded-full text-xs sm:text-sm font-bold shadow-lg">
                  Stap 2
                </div>

                <div className="mb-5 sm:mb-6 mt-2">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center shadow-xl mb-5 sm:mb-6">
                    <Brain className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-white" strokeWidth={2} />
                  </div>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 leading-tight">AI doet het werk</h3>
                  <p className="text-[var(--color-muted)] text-sm sm:text-base lg:text-lg leading-relaxed mb-5 sm:mb-6">
                    Matcht je profiel met duizenden producten. Vindt kleurcombinaties die werken. Bouwt outfits.
                  </p>
                </div>

                <div className="space-y-2.5 sm:space-y-3">
                  <div className="flex items-center gap-2.5 sm:gap-3 group">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 bg-[var(--ff-color-primary-100)] rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--ff-color-primary-200)] transition-colors">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--ff-color-primary-700)]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-xs sm:text-sm lg:text-base font-medium">Slimme afstemming</span>
                  </div>
                  <div className="flex items-center gap-2.5 sm:gap-3 group">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 bg-[var(--ff-color-primary-100)] rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--ff-color-primary-200)] transition-colors">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--ff-color-primary-700)]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-xs sm:text-sm lg:text-base font-medium">30 seconden</span>
                  </div>
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 bg-[var(--ff-color-accent-100)] rounded-full flex items-center justify-center flex-shrink-0">
                      <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--ff-color-accent-700)]" />
                    </div>
                    <span className="text-xs sm:text-sm lg:text-base font-medium text-[var(--color-muted)]">Gebeurt automatisch</span>
                  </div>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                onHoverStart={() => setActiveStep(3)}
                className={`relative bg-[var(--color-surface)] rounded-2xl sm:rounded-[2rem] border-2 p-6 sm:p-7 md:p-8 lg:p-10 transition-all duration-500 cursor-pointer ${
                  activeStep === 3
                    ? 'border-[var(--ff-color-primary-600)] shadow-2xl scale-105'
                    : 'border-[var(--color-border)] shadow-lg hover:shadow-xl'
                }`}
              >
                <div className="absolute -top-3 sm:-top-4 left-6 sm:left-8 px-4 sm:px-5 py-1.5 sm:py-2 bg-[var(--ff-color-primary-600)] text-white rounded-full text-xs sm:text-sm font-bold shadow-lg">
                  Stap 3
                </div>

                <div className="mb-5 sm:mb-6 mt-2">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center shadow-xl mb-5 sm:mb-6">
                    <Shirt className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-white" strokeWidth={2} />
                  </div>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 leading-tight">Jouw outfits</h3>
                  <p className="text-[var(--color-muted)] text-sm sm:text-base lg:text-lg leading-relaxed mb-5 sm:mb-6">
                    Complete looks, direct shopbaar. Plus: waarom elk item bij je past.
                  </p>
                </div>

                <div className="space-y-2.5 sm:space-y-3">
                  <div className="flex items-center gap-2.5 sm:gap-3 group">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 bg-[var(--ff-color-primary-100)] rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--ff-color-primary-200)] transition-colors">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--ff-color-primary-700)]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-xs sm:text-sm lg:text-base font-medium">6-12 outfits</span>
                  </div>
                  <div className="flex items-center gap-2.5 sm:gap-3 group">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 bg-[var(--ff-color-primary-100)] rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--ff-color-primary-200)] transition-colors">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--ff-color-primary-700)]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-xs sm:text-sm lg:text-base font-medium">Directe shoplinks</span>
                  </div>
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-700" />
                    </div>
                    <span className="text-xs sm:text-sm lg:text-base font-medium text-[var(--color-muted)]">Voor altijd bewaren</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Total Time */}
            <div className="text-center p-6 sm:p-8 lg:p-10 bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] rounded-xl sm:rounded-[2rem] border-2 border-[var(--ff-color-primary-200)] shadow-lg">
              <div className="flex items-center justify-center gap-3 sm:gap-4 mb-2 sm:mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--ff-color-primary-600)] rounded-xl sm:rounded-2xl flex items-center justify-center">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--ff-color-primary-700)]">5 minuten</span>
              </div>
              <p className="text-sm sm:text-base lg:text-lg text-[var(--color-muted)] font-medium">
                Van eerste vraag tot complete garderobe-advies
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes It Work Section */}
      <section className="py-24 md:py-32 bg-[var(--color-bg)]">
        <div className="ff-container">
          <div className="max-w-7xl mx-auto">

            <div className="text-center mb-16 md:mb-20">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                Waarom het werkt
              </h2>
              <p className="text-xl md:text-2xl text-[var(--color-muted)] font-light">
                Geen giswerk. Geen trends. Gewoon: jouw stijl, data-backed.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">

              {/* Trust Factor 1 */}
              <div className="group bg-[var(--color-surface)] rounded-2xl sm:rounded-[2rem] border-2 border-[var(--color-border)] p-6 sm:p-8 lg:p-10 shadow-lg hover:shadow-2xl hover:border-[var(--ff-color-primary-300)] transition-all duration-500">
                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center shadow-xl mb-5 sm:mb-6">
                  <Target className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" strokeWidth={2} />
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">8 stijlarchetypes</h3>
                <p className="text-[var(--color-muted)] text-sm sm:text-base lg:text-lg leading-relaxed mb-5 sm:mb-6">
                  Niet "casual" of "formeel". Denk: Modern Minimalist, Urban Explorer, Classic Elegance.
                  We categoriseren op persoonlijkheid, niet op trends.
                </p>
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm lg:text-base text-[var(--ff-color-primary-600)] font-semibold group-hover:gap-3 transition-all">
                  <span>Gebaseerd op psychologisch onderzoek</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                </div>
              </div>

              {/* Trust Factor 2 */}
              <div className="group bg-[var(--color-surface)] rounded-2xl sm:rounded-[2rem] border-2 border-[var(--color-border)] p-6 sm:p-8 lg:p-10 shadow-lg hover:shadow-2xl hover:border-[var(--ff-color-primary-300)] transition-all duration-500">
                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center shadow-xl mb-5 sm:mb-6">
                  <Zap className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" strokeWidth={2} />
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">12.000+ producten</h3>
                <p className="text-[var(--color-muted)] text-sm sm:text-base lg:text-lg leading-relaxed mb-5 sm:mb-6">
                  We analyseren duizenden producten op kleur, stijl, seizoen en gelegenheid.
                  Matchen gebeurt direct met jouw profiel.
                </p>
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm lg:text-base text-[var(--ff-color-primary-600)] font-semibold group-hover:gap-3 transition-all">
                  <span>Productselectie groeit elke week</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                </div>
              </div>

              {/* Trust Factor 3 */}
              <div className="group bg-[var(--color-surface)] rounded-2xl sm:rounded-[2rem] border-2 border-[var(--color-border)] p-6 sm:p-8 lg:p-10 shadow-lg hover:shadow-2xl hover:border-[var(--ff-color-primary-300)] transition-all duration-500">
                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center shadow-xl mb-5 sm:mb-6">
                  <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" strokeWidth={2} />
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">Leert van feedback</h3>
                <p className="text-[var(--color-muted)] text-sm sm:text-base lg:text-lg leading-relaxed mb-5 sm:mb-6">
                  Premium-leden kunnen outfits liken en disliken. Elke reactie verfijnt je profiel.
                  Hoe vaker je FitFi gebruikt, hoe beter de match.
                </p>
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm lg:text-base text-[var(--ff-color-primary-600)] font-semibold group-hover:gap-3 transition-all">
                  <span>Jouw profiel verbetert automatisch</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                </div>
              </div>

              {/* Trust Factor 4 */}
              <div className="group bg-[var(--color-surface)] rounded-2xl sm:rounded-[2rem] border-2 border-[var(--color-border)] p-6 sm:p-8 lg:p-10 shadow-lg hover:shadow-2xl hover:border-[var(--ff-color-primary-300)] transition-all duration-500">
                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center shadow-xl mb-5 sm:mb-6">
                  <Shield className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" strokeWidth={2} />
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">Privacy by design</h3>
                <p className="text-[var(--color-muted)] text-sm sm:text-base lg:text-lg leading-relaxed mb-5 sm:mb-6">
                  Geen foto's uploaden. Geen body scans. Geen persoonlijke data verkopen.
                  Alleen je stijlvoorkeuren → alleen betere aanbevelingen.
                </p>
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm lg:text-base text-[var(--ff-color-primary-600)] font-semibold group-hover:gap-3 transition-all">
                  <span>GDPR-compliant, altijd</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 md:py-32 bg-white">
        <div className="ff-container">
          <div className="max-w-6xl mx-auto">

            <div className="text-center mb-16 md:mb-20">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                FitFi vs de oude manier
              </h2>
              <p className="text-xl md:text-2xl text-[var(--color-muted)] font-light">
                Waarom duizenden overstappen
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">

              {/* Old Way 1 */}
              <div className="bg-[var(--color-bg)] rounded-[2rem] border-2 border-[var(--color-border)] p-6 lg:p-8 shadow-lg">
                <div className="text-center mb-6">
                  <h3 className="font-bold text-xl lg:text-2xl">Trial & Error</h3>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <span className="text-sm lg:text-base text-[var(--color-muted)]">3+ uur per winkel sessie</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <span className="text-sm lg:text-base text-[var(--color-muted)]">€200+ foute aankopen/jaar</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <span className="text-sm lg:text-base text-[var(--color-muted)]">Geen objectief advies</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <span className="text-sm lg:text-base text-[var(--color-muted)]">Kast vol "draag ik nooit"</span>
                  </div>
                </div>
                <div className="text-center text-sm lg:text-base font-bold text-red-600 bg-red-50 rounded-xl py-3">
                  Kost: €200+ tijd + geld
                </div>
              </div>

              {/* Old Way 2 */}
              <div className="bg-[var(--color-bg)] rounded-[2rem] border-2 border-[var(--color-border)] p-6 lg:p-8 shadow-lg">
                <div className="text-center mb-6">
                  <h3 className="font-bold text-xl lg:text-2xl">Personal Stylist</h3>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <span className="text-sm lg:text-base text-[var(--color-muted)]">€150-€500 per sessie</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <span className="text-sm lg:text-base text-[var(--color-muted)]">Afspraak maken = weken wachten</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <span className="text-sm lg:text-base text-[var(--color-muted)]">Beperkt tot hun smaak</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <span className="text-sm lg:text-base text-[var(--color-muted)]">Geen 24/7 beschikbaar</span>
                  </div>
                </div>
                <div className="text-center text-sm lg:text-base font-bold text-red-600 bg-red-50 rounded-xl py-3">
                  Kost: €150-€500/sessie
                </div>
              </div>

              {/* FitFi Way */}
              <div className="relative bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-700)] rounded-[2rem] border-2 border-[var(--ff-color-primary-400)] p-6 lg:p-8 text-white shadow-2xl transform md:scale-105">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-2 bg-[var(--ff-color-accent-500)] text-white rounded-full text-xs font-bold shadow-lg">
                  BESTE KEUZE
                </div>
                <div className="text-center mb-6 mt-2">
                  <h3 className="font-bold text-xl lg:text-2xl">FitFi</h3>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm lg:text-base font-medium">5 minuten, direct resultaat</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm lg:text-base font-medium">€9,99/maand (of €149 lifetime)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm lg:text-base font-medium">Data-driven matches</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm lg:text-base font-medium">Onbeperkt nieuwe outfits</span>
                  </div>
                </div>
                <div className="text-center text-sm lg:text-base font-bold bg-white/20 backdrop-blur-sm rounded-xl py-3">
                  Kost: €9,99/maand
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 md:py-32 bg-[var(--color-bg)]">
        <div className="ff-container">
          <div className="max-w-4xl mx-auto">

            <div className="text-center mb-16 md:mb-20">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                Veelgestelde vragen
              </h2>
            </div>

            <div className="space-y-5">
              <details className="bg-[var(--color-surface)] rounded-[2rem] border-2 border-[var(--color-border)] p-6 lg:p-8 group hover:border-[var(--ff-color-primary-300)] transition-all shadow-lg">
                <summary className="font-bold text-lg cursor-pointer flex items-center justify-between">
                  <span>Moet ik foto's uploaden?</span>
                  <ArrowRight className="w-5 h-5 text-[var(--color-muted)] group-open:rotate-90 transition-transform duration-300" />
                </summary>
                <p className="mt-6 text-[var(--color-muted)] text-base lg:text-lg leading-relaxed">
                  Nee! De quiz werkt zonder foto's. Premium gebruikers kunnen later foto's uploaden voor kleuranalyse, maar dat is optioneel.
                </p>
              </details>

              <details className="bg-[var(--color-surface)] rounded-[2rem] border-2 border-[var(--color-border)] p-6 lg:p-8 group hover:border-[var(--ff-color-primary-300)] transition-all shadow-lg">
                <summary className="font-bold text-lg cursor-pointer flex items-center justify-between">
                  <span>Wat als de quiz het mis heeft?</span>
                  <ArrowRight className="w-5 h-5 text-[var(--color-muted)] group-open:rotate-90 transition-transform duration-300" />
                </summary>
                <p className="mt-6 text-[var(--color-muted)] text-base lg:text-lg leading-relaxed">
                  Je kunt de quiz opnieuw doen. Premium gebruikers krijgen Nova AI: chat gewoon "deze outfit vind ik niks" en het systeem past zich aan.
                </p>
              </details>

              <details className="bg-[var(--color-surface)] rounded-[2rem] border-2 border-[var(--color-border)] p-6 lg:p-8 group hover:border-[var(--ff-color-primary-300)] transition-all shadow-lg">
                <summary className="font-bold text-lg cursor-pointer flex items-center justify-between">
                  <span>Moet ik alles kopen wat jullie voorstellen?</span>
                  <ArrowRight className="w-5 h-5 text-[var(--color-muted)] group-open:rotate-90 transition-transform duration-300" />
                </summary>
                <p className="mt-6 text-[var(--color-muted)] text-base lg:text-lg leading-relaxed">
                  Nee. We geven suggesties, jij beslist. Gebruik FitFi als inspiratie of als complete shopping guide — het is jouw keuze.
                </p>
              </details>

              <details className="bg-[var(--color-surface)] rounded-[2rem] border-2 border-[var(--color-border)] p-6 lg:p-8 group hover:border-[var(--ff-color-primary-300)] transition-all shadow-lg">
                <summary className="font-bold text-lg cursor-pointer flex items-center justify-between">
                  <span>Hoe nauwkeurig is de AI?</span>
                  <ArrowRight className="w-5 h-5 text-[var(--color-muted)] group-open:rotate-90 transition-transform duration-300" />
                </summary>
                <p className="mt-6 text-[var(--color-muted)] text-base lg:text-lg leading-relaxed">
                  2.500+ gebruikers gaven gemiddeld 4.8/5 sterren. De AI leert van elke interactie. Hoe meer je gebruikt, hoe beter het wordt.
                </p>
              </details>

              <details className="bg-[var(--color-surface)] rounded-[2rem] border-2 border-[var(--color-border)] p-6 lg:p-8 group hover:border-[var(--ff-color-primary-300)] transition-all shadow-lg">
                <summary className="font-bold text-lg cursor-pointer flex items-center justify-between">
                  <span>Werkt het voor mannen én vrouwen?</span>
                  <ArrowRight className="w-5 h-5 text-[var(--color-muted)] group-open:rotate-90 transition-transform duration-300" />
                </summary>
                <p className="mt-6 text-[var(--color-muted)] text-base lg:text-lg leading-relaxed">
                  Ja! De quiz vraagt je gendervoorkeur en past het assortiment daarop aan. Beide catalogi hebben 5.000+ producten.
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy & Data Section */}
      <section className="py-16 sm:py-20 md:py-24 lg:py-28 bg-white">
        <div className="ff-container">
          <div className="max-w-5xl mx-auto">

            {/* Header */}
            <div className="text-center mb-10 sm:mb-12 md:mb-14 px-4 sm:px-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full mb-6 font-semibold text-sm">
                <Shield className="w-4 h-4" />
                Privacy & Data
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 tracking-tight">
                Jouw data, jouw controle
              </h2>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-[var(--color-muted)] font-light">
                Transparantie over wat we opslaan, waarom, en hoe je controle behoudt
              </p>
            </div>

            {/* Data Grid */}
            <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-10 md:mb-12">

              {/* What we store */}
              <div className="bg-[var(--color-surface)] rounded-2xl border-2 border-[var(--color-border)] p-6 lg:p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-[var(--ff-color-primary-100)] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Brain className="w-6 h-6 text-[var(--ff-color-primary-700)]" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2">Wat we opslaan</h3>
                    <ul className="space-y-2 text-[var(--color-muted)] text-sm sm:text-base">
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Je quizantwoorden (stijlvoorkeuren, gelegenheden)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Je likes/dislikes (welke outfits je mooi vindt)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Optioneel: kleuranalyse (uit je selfie)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Je opgeslagen outfits en favorieten</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* What we DON'T store */}
              <div className="bg-[var(--color-surface)] rounded-2xl border-2 border-[var(--color-border)] p-6 lg:p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-red-700" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2">Wat we NIET doen</h3>
                    <ul className="space-y-2 text-[var(--color-muted)] text-sm sm:text-base">
                      <li className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span><strong>Geen</strong> verkoop van je data aan derden</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span><strong>Geen</strong> gezichtsherkenning of biometrie</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span><strong>Geen</strong> tracking buiten FitFi</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span><strong>Geen</strong> permanente opslag van foto's</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Why we need it */}
              <div className="bg-[var(--color-surface)] rounded-2xl border-2 border-[var(--color-border)] p-6 lg:p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Target className="w-6 h-6 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2">Waarvoor we het gebruiken</h3>
                    <ul className="space-y-2 text-[var(--color-muted)] text-sm sm:text-base">
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>Je stijlprofiel samenstellen</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>Outfits matchen met je voorkeuren</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>Aanbevelingen verbeteren over tijd</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>Je dashboard personaliseren</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Your control */}
              <div className="bg-[var(--color-surface)] rounded-2xl border-2 border-[var(--color-border)] p-6 lg:p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-purple-700" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2">Jouw controle</h3>
                    <ul className="space-y-2 text-[var(--color-muted)] text-sm sm:text-base">
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span>Bekijk je data via je profiel</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span>Download je data op elk moment</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span>Verwijder je account (incl. alle data)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span>We bewaren data zolang je account actief is</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

            </div>

            {/* Privacy Policy Link */}
            <div className="bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] rounded-2xl border-2 border-[var(--ff-color-primary-200)] p-6 lg:p-8 text-center">
              <p className="text-base sm:text-lg text-[var(--color-text)] mb-4">
                Meer weten over hoe we je privacy beschermen?
              </p>
              <NavLink
                to="/privacy"
                className="inline-flex items-center gap-2 text-[var(--ff-color-primary-700)] font-bold hover:underline text-base sm:text-lg"
              >
                Lees onze volledige privacy policy
                <ArrowRight className="w-5 h-5" />
              </NavLink>
            </div>

          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 md:py-32 bg-gradient-to-br from-[var(--color-bg)] via-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] overflow-hidden">

        {/* Decorative background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--ff-color-primary-200)] rounded-full blur-3xl opacity-30"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--ff-color-accent-200)] rounded-full blur-3xl opacity-30"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-[var(--ff-color-primary-100)] rounded-full blur-3xl opacity-20"></div>
        </div>

        <div className="relative ff-container">
          <div className="max-w-5xl mx-auto bg-gradient-to-br from-[var(--ff-color-primary-700)] to-[var(--ff-color-primary-500)] rounded-[2.5rem] p-12 md:p-16 text-center shadow-2xl border border-[var(--ff-color-primary-600)] overflow-hidden">

            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl opacity-10"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl opacity-10"></div>

            {/* Content */}
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-bold mb-8 shadow-lg">
                <Sparkles className="w-4 h-4" />
                Gratis starten
              </div>

              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight tracking-tight">
                Klaar om rust in je
                <br />
                garderobe te brengen?
              </h2>

              <p className="text-xl sm:text-2xl text-white/95 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
                Begin met de stijlquiz en ontvang direct je persoonlijke Style Report met 6–12 outfits die bij je passen
              </p>

              {/* CTA Button */}
              <NavLink
                to="/onboarding"
                className="group inline-flex items-center justify-center gap-2 sm:gap-3 px-8 sm:px-10 py-4 sm:py-6 min-h-[52px] bg-white hover:bg-gray-50 text-[var(--ff-color-primary-700)] rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg md:text-xl shadow-2xl transition-all hover:scale-105 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] mb-6 sm:mb-8 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ff-color-primary-600)] active:scale-[0.98]"
                data-event="cta_start_free_how_it_works"
              >
                Begin je stijlreis
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:translate-x-1" />
              </NavLink>

              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center items-center gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm font-medium">~2 minuten</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-white/50"></div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm font-medium">Privacy-first</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-white/50"></div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Geen creditcard nodig</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
