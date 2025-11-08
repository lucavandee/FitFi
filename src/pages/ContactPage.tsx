import React from "react";
import { NavLink } from "react-router-dom";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { Mail, MessageCircle, Users, Clock, Send, MapPin, Sparkles, CheckCircle } from "lucide-react";

type Topic = "algemeen" | "pers" | "partners" | "feedback" | "bug";
const EMAIL = import.meta.env.VITE_CONTACT_EMAIL as string | undefined;

function encode(str: string) {
  return encodeURIComponent(str).replace(/%20/g, "+");
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

      {/* Hero Section - Light & Airy */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[var(--ff-color-primary-25)] to-white py-24 md:py-32 lg:py-40">
        {/* Subtle decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
          <div className="absolute top-40 -right-20 w-96 h-96 bg-[var(--ff-color-primary-200)] rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-[var(--ff-color-accent-200)] rounded-full blur-3xl"></div>
        </div>

        <div className="ff-container relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Simple badge */}
            <div className="inline-flex items-center gap-2.5 px-6 py-3 bg-white rounded-full text-sm font-semibold text-[var(--ff-color-primary-700)] mb-8 shadow-sm border border-[var(--color-border)]">
              <MessageCircle className="w-4 h-4" />
              Contact
            </div>

            {/* Large, clean heading */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-[var(--color-text)] leading-[1.1] tracking-tight mb-8">
              We horen graag{' '}
              <span className="text-[var(--ff-color-primary-600)]">van je</span>
            </h1>

            {/* Clean subtitle */}
            <p className="text-xl md:text-2xl text-[var(--color-text)]/70 leading-relaxed max-w-2xl mx-auto mb-12">
              Vragen over stijl, partnerships, of gewoon een idee? We reageren persoonlijk binnen 24 uur.
            </p>

            {/* Trust badges - minimal */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-[var(--color-text)]/60 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                <span className="font-medium">Reactie binnen 24u</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                <span className="font-medium">Persoonlijk team</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                <span className="font-medium">Privacy first</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section - Clean two-column */}
      <section className="ff-container py-20 md:py-28">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-20 max-w-7xl mx-auto">

          {/* Form Column - 60% */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-white shadow-sm border border-[var(--color-border)] p-8 md:p-10">
              <h2 className="text-3xl font-bold text-[var(--color-text)] mb-3">Stuur een bericht</h2>
              <p className="text-[var(--color-text)]/60 mb-8">We openen je mailapp — privacy first, geen tracking.</p>

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
                      className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] px-5 py-3.5 text-[var(--color-text)] placeholder:text-[var(--color-text)]/40 focus:border-[var(--ff-color-primary-500)] focus:outline-none focus:ring-4 focus:ring-[var(--ff-color-primary-500)]/10 transition-all"
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
                      className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] px-5 py-3.5 text-[var(--color-text)] placeholder:text-[var(--color-text)]/40 focus:border-[var(--ff-color-primary-500)] focus:outline-none focus:ring-4 focus:ring-[var(--ff-color-primary-500)]/10 transition-all"
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
                    className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] px-5 py-3.5 text-[var(--color-text)] focus:border-[var(--ff-color-primary-500)] focus:outline-none focus:ring-4 focus:ring-[var(--ff-color-primary-500)]/10 transition-all"
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
                    className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] px-5 py-3.5 text-[var(--color-text)] placeholder:text-[var(--color-text)]/40 focus:border-[var(--ff-color-primary-500)] focus:outline-none focus:ring-4 focus:ring-[var(--ff-color-primary-500)]/10 transition-all resize-none"
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
                  <button
                    type="submit"
                    disabled={hasErrors && Object.keys(touched).length > 0}
                    className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] text-white rounded-2xl font-bold text-base shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-5 w-5" />
                    Verstuur bericht
                  </button>
                  <NavLink
                    to="/veelgestelde-vragen"
                    className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] rounded-2xl font-semibold text-base transition-all duration-200"
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
          </div>

          {/* Info Column - 40% */}
          <div className="lg:col-span-5 space-y-6">

            {/* Contact Info Card */}
            <div className="rounded-3xl bg-gradient-to-br from-[var(--ff-color-primary-50)] to-white p-8 border border-[var(--color-border)]">
              <h3 className="text-xl font-bold text-[var(--color-text)] mb-6">Direct contact</h3>
              <div className="space-y-5">
                {EMAIL && (
                  <a
                    href={`mailto:${EMAIL}`}
                    className="flex items-start gap-4 p-4 bg-white/80 rounded-2xl hover:bg-white transition-all group border border-[var(--color-border)]"
                  >
                    <Mail className="w-5 h-5 flex-shrink-0 mt-1 text-[var(--ff-color-primary-600)] group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="font-semibold text-[var(--color-text)] mb-0.5 text-sm">Email</div>
                      <div className="text-[var(--color-text)]/70 text-sm">{EMAIL}</div>
                    </div>
                  </a>
                )}

                <div className="flex items-start gap-4 p-4 bg-white/80 rounded-2xl border border-[var(--color-border)]">
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

                <div className="flex items-start gap-4 p-4 bg-white/80 rounded-2xl border border-[var(--color-border)]">
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
              <NavLink
                to="/veelgestelde-vragen"
                className="group block p-6 rounded-2xl bg-white border border-[var(--color-border)] hover:border-[var(--ff-color-primary-400)] hover:shadow-md transition-all"
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

              <NavLink
                to="/over-ons"
                className="group block p-6 rounded-2xl bg-white border border-[var(--color-border)] hover:border-[var(--ff-color-primary-400)] hover:shadow-md transition-all"
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

              <NavLink
                to="/results"
                className="group block p-6 rounded-2xl bg-gradient-to-br from-[var(--ff-color-primary-50)] to-white border border-[var(--ff-color-primary-200)] hover:border-[var(--ff-color-primary-400)] hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <Sparkles className="w-7 h-7 text-[var(--ff-color-primary-600)]" />
                  <span className="text-xl text-[var(--color-text)]/30 group-hover:text-[var(--ff-color-primary-600)] group-hover:translate-x-1 transition-all">→</span>
                </div>
                <h3 className="text-base font-bold text-[var(--color-text)] mb-2">Probeer gratis</h3>
                <p className="text-sm text-[var(--color-text)]/60 leading-relaxed">
                  Nog geen stijlprofiel? Start nu en ontdek jouw perfecte outfits.
                </p>
              </NavLink>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
