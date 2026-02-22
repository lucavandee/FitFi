import React from "react";
import { Helmet } from "react-helmet-async";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Target, Shield, Sparkles } from "lucide-react";
import { canonicalUrl } from "@/utils/urls";

export default function AboutPage() {
  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
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

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--ff-color-primary-50)] via-white to-[var(--ff-color-accent-50)] py-24 md:py-32 border-b-2 border-[var(--color-border)]">
        {/* Animated gradient blobs */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              x: [0, 50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[var(--ff-color-primary-400)] to-[var(--ff-color-accent-400)] rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
              x: [0, -30, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[var(--ff-color-accent-400)] to-[var(--ff-color-primary-400)] rounded-full blur-3xl"
          />
        </div>

        <div className="ff-container relative">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--color-text)] mb-8 leading-tight"
            >
              Over
              <span className="block bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] bg-clip-text text-transparent">FitFi</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl md:text-2xl text-[var(--color-muted)] mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              FitFi helpt je betere kledingkeuzes te maken met AI. Geen hype, wel helderheid en rust in je stijl.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Missie & Principes */}
      <section className="py-20">
        <div className="ff-container">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -4 }}
              className="bg-white/80 backdrop-blur-sm border-2 border-[var(--color-border)] rounded-[var(--radius-2xl)] p-8 shadow-[var(--shadow-lifted)] hover:shadow-[var(--shadow-elevated)] transition-shadow"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center shadow-lg mb-6"
              >
                <Target className="w-6 h-6 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-4 text-[var(--color-text)]">Onze missie</h2>
              <p className="text-[var(--color-muted)] text-lg leading-relaxed">
                We maken stijl eenvoudig en persoonlijk. Met privacy-vriendelijke technologie en duidelijke keuzes,
                zodat jij met minder moeite beter voor de dag komt.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-white/80 backdrop-blur-sm border-2 border-[var(--color-border)] rounded-[var(--radius-2xl)] p-8 shadow-[var(--shadow-lifted)] hover:shadow-[var(--shadow-elevated)] transition-shadow"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center shadow-lg mb-6"
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-4 text-[var(--color-text)]">Onze principes</h2>
              <div className="space-y-4 text-[var(--color-muted)] text-lg leading-relaxed">
                <p>Rustig, precies en feitelijk. Wij schrijven en ontwerpen zonder overdrijving.</p>
                <p>Toegankelijk op elk scherm. Mobile-first, keyboard-navigeerbaar en leesbaar voor iedereen.</p>
                <p>Geen verborgen kosten of misleidende keuzes. Transparante prijzen, duidelijke opt-outs.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Wat ons onderscheidt */}
      <section className="py-20 bg-[var(--color-bg)]">
        <div className="ff-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16 max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--color-text)]">
              Wat ons <span className="bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] bg-clip-text text-transparent">onderscheidt</span>
            </h2>
            <p className="text-xl text-[var(--color-muted)]">
              Transparantie, privacy en focus op resultaat staan centraal in alles wat we doen
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0 }}
              whileHover={{ y: -4 }}
              className="bg-white/80 backdrop-blur-sm border-2 border-[var(--color-border)] rounded-[var(--radius-2xl)] p-8 shadow-[var(--shadow-lifted)] hover:shadow-[var(--shadow-elevated)] transition-shadow"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center shadow-lg mb-6"
              >
                <Shield className="w-6 h-6 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold mb-3 text-[var(--color-text)]">EU-privacy</h3>
              <p className="text-[var(--color-muted)]">
                Data-minimalistisch en helder over wat we doen. Jouw privacy staat voorop.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-white/80 backdrop-blur-sm border-2 border-[var(--color-border)] rounded-[var(--radius-2xl)] p-8 shadow-[var(--shadow-lifted)] hover:shadow-[var(--shadow-elevated)] transition-shadow"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center shadow-lg mb-6"
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold mb-3 text-[var(--color-text)]">Consistente ervaring</h3>
              <p className="text-[var(--color-muted)]">
                Elke pagina ziet er hetzelfde uit, laadt snel en werkt op elk scherm. Rustig en overzichtelijk.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -4 }}
              className="bg-white/80 backdrop-blur-sm border-2 border-[var(--color-border)] rounded-[var(--radius-2xl)] p-8 shadow-[var(--shadow-lifted)] hover:shadow-[var(--shadow-elevated)] transition-shadow"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center shadow-lg mb-6"
              >
                <Target className="w-6 h-6 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold mb-3 text-[var(--color-text)]">Focus op resultaat</h3>
              <p className="text-[var(--color-muted)]">
                Direct bruikbare outfits en keuzes, geen ruis. Binnen 2 minuten bruikbaar advies.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[var(--color-bg)]">
        <div className="ff-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto bg-gradient-to-br from-[var(--ff-color-primary-50)] via-white to-[var(--ff-color-accent-50)] rounded-[var(--radius-2xl)] p-12 text-center border-2 border-[var(--color-border)] shadow-[var(--shadow-elevated)] relative overflow-hidden"
          >
            {/* Decorative gradient blob */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--ff-color-primary-400)] to-[var(--ff-color-accent-400)] rounded-full blur-3xl opacity-20" />

            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--color-text)]">
                Probeer FitFi <span className="bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] bg-clip-text text-transparent">vandaag</span>
              </h2>
              <p className="text-xl text-[var(--color-muted)] mb-8">
                Beantwoord een paar vragen en zie welke outfits bij je passen. Geen account nodig om te starten.
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <NavLink
                  to="/onboarding"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--ff-color-primary-700)] text-white rounded-[var(--radius-xl)] font-semibold hover:bg-[var(--ff-color-primary-600)] transition-colors shadow-lg focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)] focus-visible:ring-offset-2"
                  data-event="cta_start_free_about"
                >
                  <Sparkles className="w-5 h-5" />
                  Start gratis
                </NavLink>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
