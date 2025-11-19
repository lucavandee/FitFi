import React from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { Mail, MessageCircle, Users, Clock, Send, MapPin, Sparkles, CheckCircle } from "lucide-react";

type Topic = "algemeen" | "pers" | "partners" | "feedback" | "bug";
const EMAIL = import.meta.env.VITE_CONTACT_EMAIL as string | undefined;

function encode(str: string) {
  return encodeURIComponent(str).replace(/%20/g, "+");
}

function TrustBadge({ icon, text, delay }: { icon: React.ReactNode; text: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-[var(--color-border)] shadow-sm hover-scale"
    >
      <div className="text-[var(--ff-color-primary-600)]">{icon}</div>
      <span className="font-semibold text-[var(--color-text)] text-sm">{text}</span>
    </motion.div>
  );
}

export default function ContactPage() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [topic, setTopic] = React.useState<Topic>("algemeen");
  const [message, setMessage] = React.useState("");
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const errors = {
    name: name.trim().length < 2 ? "Vul je naam in." : "",
    email: !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? "Vul een geldig e-mailadres in." : "",
    message: message.trim().length < 10 ? "Schrijf minimaal 10 tekens." : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ name: true, email: true, message: true });
    if (hasErrors) return;

    const to = EMAIL || "mailto:hello@fitfi.ai";
    const subject = `[FitFi] ${topic.toUpperCase()} — ${name.trim()}`;
    const body =
      `${message.trim()}\n\n—\nVan: ${name.trim()} <${email.trim()}>\n` +
      `Onderwerp: ${topic}\nPagina: https://www.fitfi.ai/contact`;

    window.location.href = `${to}?subject=${encode(subject)}&body=${encode(body)}`;
  }

  return (
    <main id="main" className="bg-[var(--color-bg)]">
      <Breadcrumbs />

      {/* Hero Section - Premium with animations */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--ff-color-primary-50)] via-white to-[var(--ff-color-accent-50)] py-24 md:py-32 lg:py-40 border-b-2 border-[var(--color-border)]">
        {/* Animated decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.3 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-20 -right-32 w-[600px] h-[600px] bg-gradient-to-br from-[var(--ff-color-primary-300)] to-[var(--ff-color-accent-300)] rounded-full blur-3xl"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.2 }}
            transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
            className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-gradient-to-tr from-[var(--ff-color-accent-300)] to-[var(--ff-color-primary-300)] rounded-full blur-3xl"
          />
        </div>

        <div className="ff-container relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Animated badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2.5 px-6 py-3 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-[var(--ff-color-primary-700)] mb-8 shadow-lg border-2 border-[var(--ff-color-primary-200)] hover-lift"
            >
              <MessageCircle className="w-4 h-4" />
              Contact
            </motion.div>

            {/* Large, animated heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl sm:text-6xl md:text-7xl font-bold text-[var(--color-text)] leading-[1.1] tracking-tight mb-8"
            >
              We horen graag{' '}
              <span className="bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] bg-clip-text text-transparent">van je</span>
            </motion.h1>

            {/* Animated subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-[var(--color-text)]/70 leading-relaxed max-w-2xl mx-auto mb-12"
            >
              Vragen over stijl, partnerships, of gewoon een idee? We reageren binnen 24 uur.
            </motion.p>

            {/* Trust badges - animated */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-6 md:gap-8"
            >
              <TrustBadge icon={<Clock className="w-5 h-5" />} text="Reactie binnen 24u" delay={0.4} />
              <TrustBadge icon={<Users className="w-5 h-5" />} text="Persoonlijk team" delay={0.5} />
              <TrustBadge icon={<CheckCircle className="w-5 h-5" />} text="Privacy first" delay={0.6} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content Section - Clean two-column */}
      <section className="ff-container py-20 md:py-28">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-20 max-w-7xl mx-auto">

          {/* Form Column - 60% */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-7"
          >
            <div className="rounded-3xl bg-white/90 backdrop-blur-sm shadow-2xl border-2 border-[var(--color-border)] p-8 md:p-10 hover-lift">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center shadow-lg">
                  <Send className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-[var(--color-text)]">Stuur een bericht</h2>
                  <p className="text-sm text-[var(--color-text)]/60">Privacy first, geen tracking</p>
                </div>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-[var(--color-text)] mb-2.5">
                      Naam
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      className="w-full rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-bg)] px-5 py-3.5 text-[var(--color-text)] placeholder:text-[var(--color-text)]/40 focus:border-[var(--ff-color-primary-500)] focus:outline-none focus:ring-4 focus:ring-[var(--ff-color-primary-500)]/10 transition-all"
                      placeholder="Jouw naam"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "err-name" : undefined}
                      required
                    />
                    {touched.name && errors.name && (
                      <p id="err-name" className="mt-2 text-sm text-red-600">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-[var(--color-text)] mb-2.5">
                      E-mail
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      className="w-full rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-bg)] px-5 py-3.5 text-[var(--color-text)] placeholder:text-[var(--color-text)]/40 focus:border-[var(--ff-color-primary-500)] focus:outline-none focus:ring-4 focus:ring-[var(--ff-color-primary-500)]/10 transition-all"
                      placeholder="je@email.nl"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "err-email" : undefined}
                      required
                    />
                    {touched.email && errors.email && (
                      <p id="err-email" className="mt-2 text-sm text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="topic" className="block text-sm font-semibold text-[var(--color-text)] mb-2.5">
                    Onderwerp
                  </label>
                  <select
                    id="topic"
                    name="topic"
                    className="w-full rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-bg)] px-5 py-3.5 text-[var(--color-text)] focus:border-[var(--ff-color-primary-500)] focus:outline-none focus:ring-4 focus:ring-[var(--ff-color-primary-500)]/10 transition-all"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value as Topic)}
                  >
                    <option value="algemeen">Algemene vraag</option>
                    <option value="pers">Pers & Media</option>
                    <option value="partners">Partnership & Samenwerking</option>
                    <option value="feedback">Feedback & Suggesties</option>
                    <option value="bug">Bug of technisch probleem</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-[var(--color-text)] mb-2.5">
                    Bericht
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    className="w-full rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-bg)] px-5 py-3.5 text-[var(--color-text)] placeholder:text-[var(--color-text)]/40 focus:border-[var(--ff-color-primary-500)] focus:outline-none focus:ring-4 focus:ring-[var(--ff-color-primary-500)]/10 transition-all resize-none"
                    placeholder="Waar kunnen we je mee helpen?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, message: true }))}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? "err-message" : undefined}
                    required
                  />
                  {touched.message && errors.message && (
                    <p id="err-message" className="mt-2 text-sm text-red-600">
                      {errors.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <motion.button
                    type="submit"
                    disabled={hasErrors && Object.keys(touched).length > 0}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-[var(--ff-color-primary-700)] to-[var(--ff-color-accent-700)] hover:from-[var(--ff-color-primary-600)] hover:to-[var(--ff-color-accent-600)] text-white rounded-2xl font-bold text-base shadow-xl hover:shadow-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-5 w-5" />
                    Verstuur bericht
                  </motion.button>
                  <NavLink
                    to="/veelgestelde-vragen"
                    className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-[var(--color-bg)] border-2 border-[var(--color-border)] text-[var(--color-text)] rounded-2xl font-semibold text-base transition-all duration-200 hover-lift"
                  >
                    Bekijk FAQ
                  </NavLink>
                </div>

                <p className="text-sm text-[var(--color-text)]/50 flex items-start gap-2 pt-2">
                  <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Je mailapp opent automatisch met jouw bericht. Wij ontvangen geen data via deze website.</span>
                </p>
              </form>
            </div>
          </motion.div>

          {/* Info Column - 40% */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-5 space-y-6"
          >

            {/* Contact Info Card */}
            <div className="rounded-3xl bg-gradient-to-br from-[var(--ff-color-primary-50)] to-white p-8 border-2 border-[var(--color-border)] shadow-xl hover-lift">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[var(--color-text)]">Direct contact</h3>
              </div>
              <div className="space-y-5">
                {EMAIL && (
                  <motion.a
                    href={`mailto:${EMAIL}`}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-start gap-4 p-4 bg-white/90 backdrop-blur-sm rounded-2xl hover:bg-white transition-all group border-2 border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)] shadow-md hover:shadow-lg"
                  >
                    <Mail className="w-5 h-5 flex-shrink-0 mt-1 text-[var(--ff-color-primary-600)] group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="font-semibold text-[var(--color-text)] mb-0.5 text-sm">Email</div>
                      <div className="text-[var(--color-text)]/70 text-sm">{EMAIL}</div>
                    </div>
                  </motion.a>
                )}

                <div className="flex items-start gap-4 p-4 bg-white/80 rounded-2xl border-2 border-[var(--color-border)]">
                  <MapPin className="w-5 h-5 flex-shrink-0 mt-1 text-[var(--ff-color-primary-600)]" />
                  <div>
                    <div className="font-semibold text-[var(--color-text)] mb-0.5 text-sm">Adres</div>
                    <div className="text-[var(--color-text)]/70 text-sm leading-relaxed">
                      Keizersgracht 520 H<br />
                      1017 EK Amsterdam<br />
                      Nederland
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white/80 rounded-2xl border-2 border-[var(--color-border)]">
                  <Clock className="w-5 h-5 flex-shrink-0 mt-1 text-[var(--ff-color-primary-600)]" />
                  <div>
                    <div className="font-semibold text-[var(--color-text)] mb-0.5 text-sm">Reactietijd</div>
                    <div className="text-[var(--color-text)]/70 text-sm">
                      Binnen 24 uur op werkdagen
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <NavLink
                  to="/veelgestelde-vragen"
                  className="group block p-6 rounded-2xl bg-white border-2 border-[var(--color-border)] hover:border-[var(--ff-color-primary-400)] hover:shadow-xl transition-all hover-lift"
                >
                  <div className="flex items-center justify-between mb-3">
                    <MessageCircle className="w-7 h-7 text-[var(--ff-color-primary-600)]" />
                    <span className="text-xl text-[var(--color-text)]/30 group-hover:text-[var(--ff-color-primary-600)] group-hover:translate-x-1 transition-all">→</span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--color-text)] mb-2">Veelgestelde vragen</h3>
                  <p className="text-sm text-[var(--color-text)]/60 leading-relaxed">
                    Vind snel antwoorden op de meest gestelde vragen over FitFi.
                  </p>
                </NavLink>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <NavLink
                  to="/over-ons"
                  className="group block p-6 rounded-2xl bg-white border-2 border-[var(--color-border)] hover:border-[var(--ff-color-primary-400)] hover:shadow-xl transition-all hover-lift"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Users className="w-7 h-7 text-[var(--ff-color-primary-600)]" />
                    <span className="text-xl text-[var(--color-text)]/30 group-hover:text-[var(--ff-color-primary-600)] group-hover:translate-x-1 transition-all">→</span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--color-text)] mb-2">Over ons</h3>
                  <p className="text-sm text-[var(--color-text)]/60 leading-relaxed">
                    Leer meer over het team achter FitFi en onze missie.
                  </p>
                </NavLink>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <NavLink
                  to="/results"
                  className="group block p-6 rounded-2xl bg-gradient-to-br from-[var(--ff-color-primary-50)] via-white to-[var(--ff-color-accent-50)] border-2 border-[var(--ff-color-primary-300)] hover:border-[var(--ff-color-primary-400)] hover:shadow-xl transition-all hover-lift"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Sparkles className="w-7 h-7 text-[var(--ff-color-primary-600)]" />
                    <span className="text-xl text-[var(--color-text)]/30 group-hover:text-[var(--ff-color-primary-600)] group-hover:translate-x-1 transition-all">→</span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--color-text)] mb-2">Probeer gratis</h3>
                  <p className="text-sm text-[var(--color-text)]/60 leading-relaxed">
                    Nog geen stijlprofiel? Start nu en zie jouw outfits.
                  </p>
                </NavLink>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </section>
    </main>
  );
}
