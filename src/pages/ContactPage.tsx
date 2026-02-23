import React from "react";
import { Helmet } from "react-helmet-async";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  MessageCircle,
  Users,
  Clock,
  Send,
  Sparkles,
  CheckCircle,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Topic = "algemeen" | "pers" | "partners" | "feedback" | "bug";

type FormState = "idle" | "submitting" | "success" | "error";

export default function ContactPage() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [topic, setTopic] = React.useState<Topic>("algemeen");
  const [message, setMessage] = React.useState("");
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [formState, setFormState] = React.useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = React.useState("");

  const errors = {
    name: name.trim().length < 2 ? "Vul je naam in." : "",
    email: !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? "Vul een geldig e-mailadres in." : "",
    message: message.trim().length < 10 ? "Schrijf minimaal 10 tekens." : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ name: true, email: true, message: true });
    if (hasErrors) return;

    setFormState("submitting");
    setErrorMsg("");

    try {
      const { error } = await supabase.from("contact_messages").insert({
        name: name.trim(),
        email: email.trim(),
        topic,
        message: message.trim(),
      });

      if (error) throw error;

      setFormState("success");
      setName("");
      setEmail("");
      setTopic("algemeen");
      setMessage("");
      setTouched({});
    } catch {
      setFormState("error");
      setErrorMsg("Er ging iets mis. Stuur ons een e-mail op contact@fitfi.ai.");
    }
  }

  const infoCards = [
    {
      icon: Mail,
      title: "E-mail",
      body: "contact@fitfi.ai",
      href: "mailto:contact@fitfi.ai",
    },
    {
      icon: Clock,
      title: "Reactietijd",
      body: "Binnen 24 uur op werkdagen",
      href: null,
    },
    {
      icon: HelpCircle,
      title: "Veelgestelde vragen",
      body: "Zoek snel in onze FAQ",
      href: "/veelgestelde-vragen",
      internal: true,
    },
    {
      icon: Users,
      title: "Over ons",
      body: "Leer het team kennen",
      href: "/over-ons",
      internal: true,
    },
  ];

  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Helmet>
        <title>Contact — FitFi</title>
        <meta name="description" content="Heb je een vraag, feedback of wil je samenwerken? Neem contact op met het FitFi team. We reageren binnen 24 uur op werkdagen." />
        <link rel="canonical" href="/contact" />
        <meta property="og:title" content="Contact — FitFi" />
        <meta property="og:description" content="Neem contact op met het FitFi team. We reageren binnen 24 uur op werkdagen." />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--ff-color-primary-50)] via-white to-[var(--ff-color-accent-50)] py-14 sm:py-18 border-b border-[var(--color-border)]">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 -right-24 w-96 h-96 bg-[var(--ff-color-primary-100)] rounded-full blur-3xl opacity-40" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[var(--ff-color-accent-100)] rounded-full blur-3xl opacity-30" />
        </div>
        <div className="ff-container relative">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-xs font-semibold text-[var(--ff-color-primary-700)] mb-5 border border-[var(--ff-color-primary-200)] shadow-sm">
              <MessageCircle className="w-4 h-4" />
              Contact
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--color-text)] leading-tight tracking-tight mb-4">
              We horen graag van je
            </h1>
            <p className="text-base sm:text-lg text-[var(--color-muted)] leading-relaxed max-w-md">
              Vragen over stijl, partnerships of een idee? We reageren binnen 24 uur.
            </p>
          </div>
        </div>
      </section>

      {/* ── FORM ── */}
      <section className="ff-container py-12 sm:py-16">
        <div className="max-w-lg mx-auto">

          {/* Success state */}
          <AnimatePresence>
            {formState === "success" && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="mb-8 rounded-2xl bg-emerald-50 border border-emerald-200 p-6 flex items-start gap-4"
                role="alert"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-emerald-900 mb-1">Bericht ontvangen!</h2>
                  <p className="text-sm text-emerald-700 leading-relaxed">
                    Bedankt voor je bericht. We reageren binnen 24 uur op werkdagen.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error banner */}
          <AnimatePresence>
            {formState === "error" && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 flex items-start gap-3"
                role="alert"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{errorMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-lifted)] p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-7">
              <div className="w-10 h-10 rounded-xl bg-[var(--ff-color-primary-700)] flex items-center justify-center shadow-sm">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--color-text)]">Stuur een bericht</h2>
                <p className="text-xs text-[var(--color-muted)]">Privacy first, geen tracking</p>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit} noValidate>

              {/* Naam — full width */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-[var(--color-text)] mb-1.5">
                  Naam
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:border-[var(--ff-color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-500)]/20 transition-all"
                  placeholder="Jouw naam"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                  aria-invalid={touched.name ? !!errors.name : undefined}
                  aria-describedby={errors.name ? "err-name" : undefined}
                  required
                />
                {touched.name && errors.name && (
                  <p id="err-name" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* E-mail — full width */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-[var(--color-text)] mb-1.5">
                  E-mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:border-[var(--ff-color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-500)]/20 transition-all"
                  placeholder="je@email.nl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  aria-invalid={touched.email ? !!errors.email : undefined}
                  aria-describedby={errors.email ? "err-email" : undefined}
                  required
                />
                {touched.email && errors.email && (
                  <p id="err-email" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Onderwerp — full width */}
              <div>
                <label htmlFor="topic" className="block text-sm font-semibold text-[var(--color-text)] mb-1.5">
                  Onderwerp
                </label>
                <div className="relative">
                  <select
                    id="topic"
                    name="topic"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] pl-4 pr-10 py-3 text-sm text-[var(--color-text)] focus:border-[var(--ff-color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-500)]/20 transition-all appearance-none"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value as Topic)}
                  >
                    <option value="algemeen">Algemene vraag</option>
                    <option value="pers">Pers & Media</option>
                    <option value="partners">Partnership & Samenwerking</option>
                    <option value="feedback">Feedback & Suggesties</option>
                    <option value="bug">Bug of technisch probleem</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center" aria-hidden="true">
                    <svg className="w-4 h-4 text-[var(--color-muted)]" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 11L2 5h12z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Bericht — full width */}
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-[var(--color-text)] mb-1.5">
                  Bericht
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:border-[var(--ff-color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-500)]/20 transition-all resize-none"
                  placeholder="Waar kunnen we je mee helpen?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, message: true }))}
                  aria-invalid={touched.message ? !!errors.message : undefined}
                  aria-describedby={errors.message ? "err-message" : undefined}
                  required
                />
                {touched.message && errors.message && (
                  <p id="err-message" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {errors.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                  type="submit"
                  disabled={formState === "submitting" || formState === "success"}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] text-white rounded-xl font-semibold text-sm shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)] focus-visible:ring-offset-2"
                >
                  {formState === "submitting" ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Versturen...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Verstuur bericht
                    </>
                  )}
                </button>
                <NavLink
                  to="/veelgestelde-vragen"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 bg-[var(--color-bg)] hover:bg-[var(--ff-color-primary-50)] border border-[var(--color-border)] text-[var(--color-text)] rounded-xl font-semibold text-sm transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)] focus-visible:ring-offset-2"
                >
                  Bekijk FAQ
                </NavLink>
              </div>

              <p className="text-xs text-[var(--color-muted)] flex items-start gap-1.5 pt-1">
                <Sparkles className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" aria-hidden />
                Je bericht wordt opgeslagen in onze beveiligde database. Zie onze{" "}
                <NavLink to="/privacy" className="underline underline-offset-2 hover:text-[var(--color-text)] transition-colors">
                  privacyverklaring
                </NavLink>
                .
              </p>
            </form>
          </div>

          {/* ── INFO CARDS (onder formulier, 2×2 grid) ── */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            {infoCards.map((card, i) => {
              const Icon = card.icon;
              const inner = (
                <div className="flex flex-col gap-2">
                  <div className="w-9 h-9 rounded-lg bg-[var(--ff-color-primary-100)] flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[var(--ff-color-primary-700)]" aria-hidden />
                  </div>
                  <p className="text-sm font-semibold text-[var(--color-text)]">{card.title}</p>
                  <p className="text-xs text-[var(--color-muted)] leading-snug">{card.body}</p>
                </div>
              );

              const baseClass =
                "p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lifted)]";

              if (card.href && card.internal) {
                return (
                  <NavLink key={i} to={card.href} className={`${baseClass} block focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)] focus-visible:ring-offset-2`}>
                    {inner}
                  </NavLink>
                );
              }
              if (card.href) {
                return (
                  <a key={i} href={card.href} className={`${baseClass} block focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)] focus-visible:ring-offset-2`}>
                    {inner}
                  </a>
                );
              }
              return (
                <div key={i} className={baseClass}>
                  {inner}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
