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
  CircleCheck as CheckCircle,
  CircleAlert as AlertCircle,
  CircleHelp as HelpCircle,
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
    cta: "Stuur een mail",
    href: "mailto:contact@fitfi.ai",
    internal: false,
  },
  {
    icon: Clock,
    title: "Reactietijd",
    body: "Binnen 24 uur op werkdagen",
    cta: null,
    href: null,
    internal: false,
  },
  {
    icon: HelpCircle,
    title: "Veelgestelde vragen",
    body: "Zoek snel in de FAQ",
    cta: "Bekijk FAQ",
    href: "/veelgestelde-vragen",
    internal: true,
  },
  {
    icon: Users,
    title: "Over ons",
    body: "Leer het team kennen",
    cta: "Over FitFi",
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
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-2">
        {label}
      </label>
      {children}
      {touched && error && (
        <p id={`err-${id}`} role="alert" className="mt-1.5 text-xs text-[var(--ff-color-danger-600)] flex items-center gap-1">
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
      <section className="ff-container pt-14 pb-12 md:pt-20 md:pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--ff-color-primary-50)] rounded-full text-xs font-semibold text-[var(--ff-color-primary-700)] mb-5 border border-[var(--ff-color-primary-200)]">
              <MessageCircle className="w-3.5 h-3.5" aria-hidden />
              Contact
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-[var(--color-text)] leading-[1.1] tracking-tight mb-4">
              We horen<br />graag van je
            </h1>
            <p className="text-[var(--color-muted)] text-base sm:text-lg leading-relaxed">
              Vragen over stijl, partnerships of een idee? We reageren binnen 24 uur op werkdagen.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2-COLUMN LAYOUT ── */}
      <section className="ff-container pb-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 lg:gap-12 items-start">

          {/* LEFT — contact form */}
          <div>
            <AnimatePresence>
              {formState === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="mb-6 rounded-2xl bg-[var(--ff-color-success-50)] border border-[var(--ff-color-success-200)] p-5 flex items-start gap-3"
                  role="alert"
                  aria-live="polite"
                >
                  <CheckCircle className="w-5 h-5 text-[var(--ff-color-success-600)] flex-shrink-0 mt-0.5" aria-hidden />
                  <div>
                    <p className="font-semibold text-[var(--ff-color-success-900)] text-sm">Bericht ontvangen!</p>
                    <p className="text-xs text-[var(--ff-color-success-700)] mt-0.5 leading-relaxed">
                      We reageren binnen 24 uur op werkdagen.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {formState === "error" && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="mb-6 rounded-2xl bg-[var(--ff-color-danger-50)] border border-[var(--ff-color-danger-200)] p-4 flex items-start gap-3"
                  role="alert"
                  aria-live="polite"
                >
                  <AlertCircle className="w-5 h-5 text-[var(--ff-color-danger-500)] flex-shrink-0 mt-0.5" aria-hidden />
                  <p className="text-sm text-[var(--ff-color-danger-700)]">{errorMsg}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div
              className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-8"
              style={{ boxShadow: "0 2px 20px rgba(30,35,51,0.07)" }}
            >
              <h2 className="text-xl font-bold text-[var(--color-text)] mb-1">Stuur een bericht</h2>
              <p className="text-sm text-[var(--color-muted)] mb-8">Direct in ons systeem, geen e-mailapp nodig.</p>

              <form className="space-y-6" onSubmit={handleSubmit} noValidate aria-label="Contactformulier">
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

                <Field id="message" label="Bericht" error={errors.message} touched={touched.message}>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
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

                <div className="flex items-center justify-between gap-4 pt-1">
                  <button
                    type="submit"
                    disabled={formState === "submitting" || formState === "success"}
                    className="inline-flex items-center gap-2 px-7 py-3 bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] text-white rounded-xl font-semibold text-sm shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)] focus-visible:ring-offset-2"
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

                  <p className="text-xs text-[var(--color-muted)] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 text-[var(--ff-color-primary-600)]" aria-hidden />
                    <span>
                      Veilig opgeslagen.{" "}
                      <NavLink to="/privacy" className="underline underline-offset-2 hover:text-[var(--color-text)] transition-colors">
                        Privacyverklaring
                      </NavLink>
                    </span>
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT — info sidebar */}
          <aside aria-label="Contactinformatie" className="flex flex-col gap-3 lg:pt-0">
            {INFO_CARDS.map((card, i) => {
              const Icon = card.icon;
              const content = (
                <div
                  className="flex flex-col gap-3 p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] group hover:border-[var(--ff-color-primary-200)] transition-colors"
                  style={{ boxShadow: "0 1px 6px rgba(30,35,51,0.05)" }}
                >
                  <div className="w-9 h-9 rounded-xl bg-[var(--ff-color-primary-50)] flex items-center justify-center group-hover:bg-[var(--ff-color-primary-100)] transition-colors">
                    <Icon className="w-4 h-4 text-[var(--ff-color-primary-700)]" aria-hidden />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text)] leading-snug">{card.title}</p>
                    <p className="text-xs text-[var(--color-muted)] mt-0.5 leading-relaxed">{card.body}</p>
                  </div>
                  {card.cta && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--ff-color-primary-700)] group-hover:underline underline-offset-2">
                      {card.cta} <ArrowRight className="w-3 h-3" aria-hidden />
                    </span>
                  )}
                </div>
              );

              if (card.href && card.internal) {
                return (
                  <NavLink key={i} to={card.href} className="focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)] focus-visible:ring-offset-2 rounded-2xl">
                    {content}
                  </NavLink>
                );
              }
              if (card.href) {
                return (
                  <a key={i} href={card.href} className="focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)] focus-visible:ring-offset-2 rounded-2xl">
                    {content}
                  </a>
                );
              }
              return <div key={i}>{content}</div>;
            })}
          </aside>

        </div>
      </section>
    </main>
  );
}
