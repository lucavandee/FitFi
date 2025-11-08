import React from "react";
import { NavLink } from "react-router-dom";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { Mail, MessageCircle, Users, Clock, Send, MapPin, Phone, Sparkles } from "lucide-react";

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
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Breadcrumbs />

      {/* Premium Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--ff-color-primary-50)] via-white to-[var(--ff-color-accent-50)] py-20 md:py-32">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-[var(--ff-color-primary-200)] rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-[var(--ff-color-accent-200)] rounded-full opacity-20 blur-3xl"></div>
        </div>

        <div className="ff-container relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-full text-sm font-bold text-[var(--ff-color-primary-700)] mb-8 shadow-lg">
              <MessageCircle className="w-4 h-4" />
              Neem contact op
            </div>

            {/* H1 */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-[var(--color-text)] leading-tight tracking-tight mb-6">
              We horen graag{' '}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] bg-clip-text text-transparent">
                  van je
                </span>
                <span className="absolute -bottom-2 left-0 right-0 h-3 bg-[var(--ff-color-accent-400)] opacity-30 blur-sm"></span>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl md:text-3xl text-[var(--color-text)]/80 leading-relaxed max-w-3xl mx-auto mb-10">
              Vragen over stijl, partnerships, of gewoon een idee? We reageren persoonlijk — geen chatbots, gewoon mensen.
            </p>

            {/* Quick stats */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-[var(--color-text)]/70">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                <span className="text-sm font-semibold">Binnen 24 uur</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                <span className="text-sm font-semibold">Persoonlijk contact</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                <span className="text-sm font-semibold">Premium support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two-column layout: Form + Contact Info */}
      <section className="ff-container py-16 md:py-24">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">

          {/* Left: Contact Form */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl bg-white shadow-xl border border-[var(--color-border)] overflow-hidden">
              <div className="bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-700)] p-8 text-white">
                <h2 className="text-3xl font-bold mb-2">Stuur een bericht</h2>
                <p className="text-white/90">We openen je mailapp — privacy first, geen tracking.</p>
              </div>

              <form className="p-8 space-y-6" onSubmit={handleSubmit} noValidate>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-[var(--color-text)] mb-2">
                      Naam *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      className="w-full rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] focus:border-[var(--ff-color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-500)]/20 transition-all"
                      placeholder="Jouw naam"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "err-name" : undefined}
                      required
                    />
                    {touched.name && errors.name && (
                      <p id="err-name" className="mt-2 text-sm text-[var(--ff-color-error-600)] flex items-center gap-1">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-[var(--color-text)] mb-2">
                      E-mail *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      className="w-full rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] focus:border-[var(--ff-color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-500)]/20 transition-all"
                      placeholder="je@email.nl"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "err-email" : undefined}
                      required
                    />
                    {touched.email && errors.email && (
                      <p id="err-email" className="mt-2 text-sm text-[var(--ff-color-error-600)]">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="topic" className="block text-sm font-semibold text-[var(--color-text)] mb-2">
                    Onderwerp
                  </label>
                  <select
                    id="topic"
                    name="topic"
                    className="w-full rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] focus:border-[var(--ff-color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-500)]/20 transition-all"
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
                  <label htmlFor="message" className="block text-sm font-semibold text-[var(--color-text)] mb-2">
                    Bericht *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    className="w-full rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] focus:border-[var(--ff-color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-500)]/20 transition-all resize-none"
                    placeholder="Waar kunnen we je mee helpen?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, message: true }))}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? "err-message" : undefined}
                    required
                  />
                  {touched.message && errors.message && (
                    <p id="err-message" className="mt-2 text-sm text-[var(--ff-color-error-600)]">
                      {errors.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="submit"
                    disabled={hasErrors && Object.keys(touched).length > 0}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    title="Verzend via je eigen mailapp"
                  >
                    <Send className="h-5 w-5" aria-hidden />
                    Verstuur bericht
                  </button>
                  <NavLink
                    to="/veelgestelde-vragen"
                    className="inline-flex items-center justify-center px-8 py-4 bg-[var(--color-surface)] hover:bg-[var(--color-bg)] border-2 border-[var(--color-border)] text-[var(--color-text)] rounded-xl font-bold text-lg transition-all duration-300 hover:border-[var(--ff-color-primary-500)]"
                  >
                    Bekijk FAQ
                  </NavLink>
                </div>

                <p className="text-sm text-[var(--color-text)]/60 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Je mailapp opent automatisch met jouw bericht. Wij ontvangen geen data via deze website.</span>
                </p>
              </form>
            </div>
          </div>

          {/* Right: Contact Info & Trust Signals */}
          <div className="lg:col-span-2 space-y-8">

            {/* Direct contact */}
            <div className="rounded-2xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-700)] p-8 text-white shadow-xl">
              <h3 className="text-2xl font-bold mb-6">Direct contact</h3>
              <div className="space-y-6">
                {EMAIL && (
                  <a
                    href={`mailto:${EMAIL}`}
                    className="flex items-start gap-4 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-all group"
                  >
                    <Mail className="w-6 h-6 flex-shrink-0 mt-1 group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="font-semibold mb-1">Email</div>
                      <div className="text-white/90 text-sm">{EMAIL}</div>
                    </div>
                  </a>
                )}

                <div className="flex items-start gap-4 p-4 bg-white/10 rounded-xl">
                  <MapPin className="w-6 h-6 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-semibold mb-1">Adres</div>
                    <div className="text-white/90 text-sm">
                      Keizersgracht 520 H<br />
                      1017 EK Amsterdam<br />
                      Nederland
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white/10 rounded-xl">
                  <Clock className="w-6 h-6 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-semibold mb-1">Reactietijd</div>
                    <div className="text-white/90 text-sm">
                      Binnen 24 uur op werkdagen
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick links cards */}
            <div className="space-y-4">
              <NavLink
                to="/veelgestelde-vragen"
                className="group block p-6 rounded-2xl bg-white border-2 border-[var(--color-border)] hover:border-[var(--ff-color-primary-500)] hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <MessageCircle className="w-8 h-8 text-[var(--ff-color-primary-600)]" />
                  <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
                </div>
                <h3 className="text-lg font-bold text-[var(--color-text)] mb-2">Veelgestelde vragen</h3>
                <p className="text-sm text-[var(--color-text)]/70">
                  Vind snel antwoorden op de meest gestelde vragen over FitFi.
                </p>
              </NavLink>

              <NavLink
                to="/over-ons"
                className="group block p-6 rounded-2xl bg-white border-2 border-[var(--color-border)] hover:border-[var(--ff-color-primary-500)] hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <Users className="w-8 h-8 text-[var(--ff-color-primary-600)]" />
                  <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
                </div>
                <h3 className="text-lg font-bold text-[var(--color-text)] mb-2">Over ons</h3>
                <p className="text-sm text-[var(--color-text)]/70">
                  Leer meer over het team achter FitFi en onze missie.
                </p>
              </NavLink>

              <NavLink
                to="/results"
                className="group block p-6 rounded-2xl bg-gradient-to-br from-[var(--ff-color-accent-50)] to-[var(--ff-color-primary-50)] border-2 border-[var(--ff-color-primary-200)] hover:border-[var(--ff-color-primary-500)] hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <Sparkles className="w-8 h-8 text-[var(--ff-color-primary-600)]" />
                  <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
                </div>
                <h3 className="text-lg font-bold text-[var(--color-text)] mb-2">Probeer gratis</h3>
                <p className="text-sm text-[var(--color-text)]/70">
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
