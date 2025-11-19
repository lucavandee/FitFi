import React from "react";
import { Helmet } from "react-helmet-async";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { CircleCheck as CheckCircle, Sparkles, Target, Zap, Clock, Shield } from "lucide-react";

export default function HowItWorksPage() {
  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Helmet>
        <title>Hoe het werkt - AI Style Report in 3 stappen | FitFi</title>
        <meta
          name="description"
          content="Hoe FitFi in 3 stappen jouw AI Style Report maakt. Van quiz tot outfits ."
        />
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
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-sm rounded-full text-sm font-bold text-[var(--ff-color-primary-700)] mb-8 shadow-lg border border-[var(--color-border)]"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
              Zo werkt het
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--color-text)] mb-8 leading-tight"
            >
              Van{' '}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] bg-clip-text text-transparent">
                  quiz naar outfits
                </span>
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-[var(--color-muted)] mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              In 3 stappen van quiz naar outfits.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 bg-[var(--color-bg)]">
        <div className="ff-container">
          <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-3">

            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0 }}
              whileHover={{ y: -8 }}
              className="bg-white/80 backdrop-blur-sm rounded-[var(--radius-2xl)] border-2 border-[var(--color-border)] p-8 shadow-[var(--shadow-lifted)] hover:shadow-[var(--shadow-elevated)] transition-shadow"
            >
              <div className="flex items-center gap-4 mb-6">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center shadow-lg"
                >
                  <Target className="w-7 h-7 text-white" />
                </motion.div>
                <div className="text-4xl font-bold bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] bg-clip-text text-transparent">01</div>
              </div>

              <h3 className="text-2xl font-bold mb-3 text-[var(--color-text)]">Persoonlijkheidsquiz</h3>
              <p className="text-[var(--color-muted)] mb-6">
                Beantwoord 8-12 vragen over je lifestyle, voorkeuren en persoonlijkheid.
                Onze AI analyseert je antwoorden om je unieke stijlprofiel te bepalen.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-[var(--ff-color-success-600)]" />
                  <span className="text-[var(--color-text)]">Geen foto's nodig</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-[var(--ff-color-success-600)]" />
                  <span className="text-[var(--color-text)]">Privacy-vriendelijk</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-[var(--ff-color-success-600)]" />
                  <span className="text-[var(--color-text)]">Binnen 2 min</span>
                </div>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -8 }}
              className="bg-white/80 backdrop-blur-sm rounded-[var(--radius-2xl)] border-2 border-[var(--color-border)] p-8 shadow-[var(--shadow-lifted)] hover:shadow-[var(--shadow-elevated)] transition-shadow"
            >
              <div className="flex items-center gap-4 mb-6">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center shadow-lg"
                >
                  <Zap className="w-7 h-7 text-white" />
                </motion.div>
                <div className="text-4xl font-bold bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] bg-clip-text text-transparent">02</div>
              </div>

              <h3 className="text-2xl font-bold mb-3 text-[var(--color-text)]">AI Analyse</h3>
              <p className="text-[var(--color-muted)] mb-6">
                Onze AI combineert je antwoorden met stijldata
                om jouw stijlarchetype en kleurenpalet te bepalen.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-[var(--ff-color-success-600)]" />
                  <span>Smart matching</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-[var(--ff-color-success-600)]" />
                  <span>Direct verwerkt</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-[var(--ff-color-success-600)]" />
                  <span>Helder resultaat</span>
                </div>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -8 }}
              className="bg-white/80 backdrop-blur-sm rounded-[var(--radius-2xl)] border-2 border-[var(--color-border)] p-8 shadow-[var(--shadow-lifted)] hover:shadow-[var(--shadow-elevated)] transition-shadow"
            >
              <div className="flex items-center gap-4 mb-6">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center shadow-lg"
                >
                  <Sparkles className="w-7 h-7 text-white" />
                </motion.div>
                <div className="text-4xl font-bold bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] bg-clip-text text-transparent">03</div>
              </div>

              <h3 className="text-2xl font-bold mb-3 text-[var(--color-text)]">Jouw Style Report</h3>
              <p className="text-[var(--color-muted)] mb-6">
                Ontvang direct je persoonlijke rapport met stijlarchetype, kleurenpalet,
                6-12 complete outfits en uitleg waarom elk item bij je past.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-[var(--ff-color-success-600)]" />
                  <span>6-12 complete outfits</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-[var(--ff-color-success-600)]" />
                  <span>Directe shoplinks</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-[var(--ff-color-success-600)]" />
                  <span>Uitleg per item</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="py-20 bg-[var(--color-bg)]">
        <div className="ff-container">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--color-text)]">
              Wat krijg je in je <span className="bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] bg-clip-text text-transparent">Style Report</span>?
            </h2>
            <p className="text-xl text-[var(--color-muted)]">
              Een compleet overzicht van jouw unieke stijl en hoe je die kunt toepassen
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0 }}
              whileHover={{ y: -4 }}
              className="bg-white/80 backdrop-blur-sm rounded-[var(--radius-2xl)] border-2 border-[var(--color-border)] p-6 shadow-[var(--shadow-lifted)] hover:shadow-[var(--shadow-elevated)] transition-shadow"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center shadow-lg mb-4"
              >
                <Target className="w-6 h-6 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2 text-[var(--color-text)]">Stijlarchetype</h3>
              <p className="text-[var(--color-muted)]">
                Je unieke stijlpersoonlijkheid met uitgebreide uitleg over wat dit betekent voor je kledingkeuzes.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-white/80 backdrop-blur-sm rounded-[var(--radius-2xl)] border-2 border-[var(--color-border)] p-6 shadow-[var(--shadow-lifted)] hover:shadow-[var(--shadow-elevated)] transition-shadow"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] shadow-lg mb-4"
              />
              <h3 className="text-xl font-bold mb-2 text-[var(--color-text)]">Kleurenpalet</h3>
              <p className="text-[var(--color-muted)]">
                Jouw perfecte kleuren die je huid laten stralen en je persoonlijkheid versterken.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -4 }}
              className="bg-white/80 backdrop-blur-sm rounded-[var(--radius-2xl)] border-2 border-[var(--color-border)] p-6 shadow-[var(--shadow-lifted)] hover:shadow-[var(--shadow-elevated)] transition-shadow"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center shadow-lg mb-4"
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2 text-[var(--color-text)]">Complete Outfits</h3>
              <p className="text-[var(--color-muted)]">
                6-12 volledige looks voor verschillende gelegenheden, van casual tot formeel.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -4 }}
              className="bg-white/80 backdrop-blur-sm rounded-[var(--radius-2xl)] border-2 border-[var(--color-border)] p-6 shadow-[var(--shadow-lifted)] hover:shadow-[var(--shadow-elevated)] transition-shadow"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center shadow-lg mb-4"
              >
                <CheckCircle className="w-6 h-6 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2 text-[var(--color-text)]">Shoplinks</h3>
              <p className="text-[var(--color-muted)]">
                Directe links naar alle items zodat je meteen kunt shoppen wat bij je past.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ y: -4 }}
              className="bg-white/80 backdrop-blur-sm rounded-[var(--radius-2xl)] border-2 border-[var(--color-border)] p-6 shadow-[var(--shadow-lifted)] hover:shadow-[var(--shadow-elevated)] transition-shadow"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center shadow-lg mb-4"
              >
                <Zap className="w-6 h-6 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2 text-[var(--color-text)]">Styling Tips</h3>
              <p className="text-[var(--color-muted)]">
                Praktische tips over hoe je items combineert en je stijl verder ontwikkelt.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ y: -4 }}
              className="bg-white/80 backdrop-blur-sm rounded-[var(--radius-2xl)] border-2 border-[var(--color-border)] p-6 shadow-[var(--shadow-lifted)] hover:shadow-[var(--shadow-elevated)] transition-shadow"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center shadow-lg mb-4"
              >
                <Shield className="w-6 h-6 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2 text-[var(--color-text)]">Privacy-First</h3>
              <p className="text-[var(--color-muted)]">
                Geen foto's nodig, geen persoonlijke data opgeslagen. Jouw privacy staat voorop.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[var(--color-bg)]">
        <div className="ff-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto bg-gradient-to-br from-[var(--ff-color-primary-50)] via-white to-[var(--ff-color-accent-50)] rounded-[var(--radius-2xl)] p-12 text-center shadow-[var(--shadow-elevated)] border-2 border-[var(--color-border)] relative overflow-hidden"
          >
            {/* Decorative gradient blob */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--ff-color-primary-400)] to-[var(--ff-color-accent-400)] rounded-full blur-3xl opacity-20" />

            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--color-text)]">
                Klaar voor jouw <span className="bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] bg-clip-text text-transparent">Style Report</span>?
              </h2>
              <p className="text-xl text-[var(--color-muted)] mb-8">
                Start nu en zie welke stijl bij je past.
              </p>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <NavLink
                  to="/onboarding"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--ff-color-primary-700)] text-white rounded-[var(--radius-xl)] font-semibold hover:bg-[var(--ff-color-primary-600)] transition-all shadow-lg focus-ring-premium mb-8"
                  data-event="cta_start_free_how_it_works"
                >
                  <Sparkles className="w-5 h-5" />
                  Start gratis Style Report
                </NavLink>
              </motion.div>

              <div className="flex flex-wrap justify-center gap-6 text-sm text-[var(--color-muted)]">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[var(--ff-color-success-600)]" />
                  <span>Gratis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[var(--ff-color-success-600)]" />
                  <span>Direct resultaat</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
