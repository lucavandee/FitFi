import React from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  MessageCircle,
  Users,
  Clock,
  Send,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import Seo from "@/components/seo/Seo";
import { supabase } from "@/lib/supabaseClient";

type Topic = "algemeen" | "pers" | "partners" | "feedback" | "bug";
type FormState = "idle" | "submitting" | "success" | "error";

const INFO_CARDS = [
  {
    icon: Mail,
    title: "E-mail",
    body: "contact@fitfi.ai",
    href: "mailto:contact@fitfi.ai",
    internal: false,
  },
  {
    icon: Clock,
    title: "Reactietijd",
    body: "Binnen 24 uur op werkdagen",
    href: null,
    internal: false,
  },
  {
    icon: HelpCircle,
    title: "Veelgestelde vragen",
    body: "Zoek snel in de FAQ",
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

function Field({
  id,
  label,
  error,
  touched,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  touched?: boolean;
  children: React.ReactNode;
}) {
  const errId = `err-${id}`;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-[var(--color-text)] mb-1.5">
        {label}
      </label>
      {children}
      {touched && error && (
        <p id={errId} role="alert" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:border-[var(--ff-color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-500)]/20 transition-all";

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

  function touch(field: string) {
    setTouched((t) => ({ ...t, [field]: true }));
  }

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
      setErrorMsg("Er ging iets mis. Stuur ons een e-mail via contact@fitfi.ai.");
    }
  }

  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Seo
        title="Contact — FitFi"
        description="Heb je een vraag, feedback of wil je samenwerken? Neem contact op met het FitFi team. We reageren binnen 24 uur op werkdagen."
        path="/contact"
      />

      {/* ── HERO ── */}
      <section className="ff-container py-12 md:py-16">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--ff-color-primary-50)] rounded-full text-xs font-semibold text-[var(--ff-color-primary-700)] mb-4 border border-[var(--ff-color-primary-200)]">
            <MessageCircle className="w-3.5 h-3.5" aria-hidden />
            Contact
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] leading-tight mb-3">
            We horen graag van je
          </h1>
          <p className="text-[var(--color-muted)] text-base sm:text-lg leading-relaxed">
            Vragen over stijl, partnerships of een idee? We reageren binnen 24 uur op werkdagen.
          </p>
        </div>
      </section>

      {/* ── 2-COLUMN LAYOUT: Form (left) + Info cards (right) ── */}
      <section className="ff-container pb-16 sm:pb-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 lg:gap-12 items-start">

          {/* LEFT — contact form */}
          <div>

          {/* Success */}
          <AnimatePresence>
            {formState === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-5 flex items-start gap-3"
                role="alert"
                aria-live="polite"
              >
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" aria-hidden />
                <div>
                  <p className="font-semibold text-emerald-900 text-sm">Bericht ontvangen!</p>
                  <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
                    We reageren binnen 24 uur op werkdagen.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {formState === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 flex items-start gap-3"
                role="alert"
                aria-live="polite"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" aria-hidden />
                <p className="text-sm text-red-700">{errorMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-lifted)] p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[var(--ff-color-primary-700)] flex items-center justify-center flex-shrink-0">
                <Send className="w-5 h-5 text-white" aria-hidden />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--color-text)]">Stuur een bericht</h2>
                <p className="text-xs text-[var(--color-muted)] mt-0.5">Direct in ons systeem, geen e-mailapp nodig</p>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit} noValidate aria-label="Contactformulier">

              {/* Naam + E-mail op één rij (md+), gestapeld (sm) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field id="name" label="Naam" error={errors.name} touched={touched.name}>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    className={inputClass}
                    placeholder="Jouw naam"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => touch("name")}
                    aria-invalid={touched.name ? !!errors.name : undefined}
                    aria-describedby={errors.name ? "err-name" : undefined}
                    required
                  />
                </Field>

                <Field id="email" label="E-mail" error={errors.email} touched={touched.email}>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className={inputClass}
                    placeholder="je@email.nl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => touch("email")}
                    aria-invalid={touched.email ? !!errors.email : undefined}
                    aria-describedby={errors.email ? "err-email" : undefined}
                    required
                  />
                </Field>
              </div>

              {/* Onderwerp */}
              <Field id="topic" label="Onderwerp">
                <div className="relative">
                  <select
                    id="topic"
                    name="topic"
                    className={`${inputClass} appearance-none pr-10`}
                    value={topic}
                    onChange={(e) => setTopic(e.target.value as Topic)}
                    aria-label="Kies een onderwerp"
                  >
                    <option value="algemeen">Algemene vraag</option>
                    <option value="pers">Pers & Media</option>
                    <option value="partners">Partnership & Samenwerking</option>
                    <option value="feedback">Feedback & Suggesties</option>
                    <option value="bug">Bug of technisch probleem</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center" aria-hidden>
                    <svg className="w-4 h-4 text-[var(--color-muted)]" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 11L2 5h12z" />
                    </svg>
                  </div>
                </div>
              </Field>

              {/* Bericht */}
              <Field id="message" label="Bericht" error={errors.message} touched={touched.message}>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className={`${inputClass} resize-none`}
                  placeholder="Waar kunnen we je mee helpen?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onBlur={() => touch("message")}
                  aria-invalid={touched.message ? !!errors.message : undefined}
                  aria-describedby={errors.message ? "err-message" : undefined}
                  required
                />
              </Field>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                  type="submit"
                  disabled={formState === "submitting" || formState === "success"}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] text-white rounded-xl font-semibold text-sm shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)] focus-visible:ring-offset-2"
                >
                  {formState === "submitting" ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Versturen...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" aria-hidden />
                      Verstuur bericht
                    </>
                  )}
                </button>

                <NavLink
                  to="/veelgestelde-vragen"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3 bg-transparent hover:bg-[var(--ff-color-primary-50)] border border-[var(--color-border)] hover:border-[var(--ff-color-primary-400)] text-[var(--color-text)] rounded-xl font-semibold text-sm transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)] focus-visible:ring-offset-2"
                >
                  Bekijk FAQ
                </NavLink>
              </div>

              {/* Privacy note */}
              <p className="text-xs text-[var(--color-muted)] flex items-start gap-1.5 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-[var(--ff-color-primary-600)]" aria-hidden />
                Je bericht wordt veilig opgeslagen. Zie onze{" "}
                <NavLink to="/privacy" className="underline underline-offset-2 hover:text-[var(--color-text)] transition-colors">
                  privacyverklaring
                </NavLink>
                .
              </p>
            </form>
          </div>

          </div>{/* end LEFT column */}

          {/* RIGHT — info cards */}
          <aside aria-label="Contactinformatie" className="flex flex-col gap-3">
            {INFO_CARDS.map((card, i) => {
              const Icon = card.icon;
              const cardClass =
                "flex items-start gap-3 p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lifted)] transition-shadow group";
              const inner = (
                <>
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-[var(--ff-color-primary-100)] flex items-center justify-center group-hover:bg-[var(--ff-color-primary-200)] transition-colors">
                    <Icon className="w-4 h-4 text-[var(--ff-color-primary-700)]" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-text)] leading-snug">{card.title}</p>
                    <p className="text-xs text-[var(--color-muted)] leading-relaxed mt-0.5">{card.body}</p>
                    {(card.href) && (
                      <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold text-[var(--ff-color-primary-700)] group-hover:underline underline-offset-2">
                        Bekijken <ArrowRight className="w-3 h-3" aria-hidden />
                      </span>
                    )}
                  </div>
                </>
              );

              if (card.href && card.internal) {
                return (
                  <NavLink key={i} to={card.href} className={`${cardClass} focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)] focus-visible:ring-offset-2`}>
                    {inner}
                  </NavLink>
                );
              }
              if (card.href) {
                return (
                  <a key={i} href={card.href} className={`${cardClass} focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)] focus-visible:ring-offset-2`}>
                    {inner}
                  </a>
                );
              }
              return (
                <div key={i} className={cardClass}>
                  {inner}
                </div>
              );
            })}
          </aside>

        </div>
      </section>
    </main>
  );
}
