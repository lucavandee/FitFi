import React from "react";
import { Link } from "react-router-dom";
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

type Topic = "algemeen" | "pers" | "partners" | "feedback" | "bug";
type FormState = "idle" | "submitting" | "success" | "error";

const INFO_CARDS = [
  {
    icon: Mail,
    title: "E-mail",
    body: "info@fitfi.ai",
    cta: "Stuur een mail",
    href: "mailto:info@fitfi.ai",
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

const inputBase =
  "w-full bg-white border border-solid rounded-xl py-3 px-4 text-base text-[#1A1A1A] placeholder:text-[#8A8A8A] focus:outline-none focus:ring-2 transition-colors duration-200";
const inputOk =
  `${inputBase} border-[#E5E5E5] focus:ring-[#C2654A]/20 focus:border-[#C2654A]`;
const inputErr =
  `${inputBase} border-[#C24A4A] focus:ring-[#C24A4A]/20 focus:border-[#C24A4A]`;

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
      <label
        htmlFor={id}
        className="block text-xs font-semibold text-[#8A8A8A] uppercase tracking-wide mb-2"
      >
        {label}
      </label>
      {children}
      {touched && error && (
        <p
          id={`err-${id}`}
          role="alert"
          className="text-sm text-[#C24A4A] mt-1.5 flex items-center gap-1.5"
        >
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-[#C24A4A]" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}

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
    email: !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
      ? "Vul een geldig e-mailadres in."
      : "",
    message:
      message.trim().length < 10 ? "Schrijf minimaal 10 tekens." : "",
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
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
      const res = await fetch(`${supabaseUrl}/functions/v1/send-contact-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          topic,
          message: message.trim(),
        }),
      });
      if (!res.ok) throw new Error("edge function failed");
      setFormState("success");
      setName("");
      setEmail("");
      setTopic("algemeen");
      setMessage("");
      setTouched({});
    } catch {
      setFormState("error");
      setErrorMsg(
        "Er ging iets mis. Stuur ons een e-mail via info@fitfi.ai."
      );
    }
  }

  return (
    <>
      <Seo
        title="Contact — FitFi"
        description="Heb je een vraag, feedback of wil je samenwerken? Neem contact op met het FitFi team. We reageren binnen 24 uur op werkdagen."
        path="/contact"
        ogImage="/images/hf_20260221_210750_e12efd50-544c-4e35-986d-bfff9999542b.webp"
      />

      <div
        className="bg-[#FAFAF8] text-[#1A1A1A]"
        style={{ minHeight: 'calc(100vh - 64px)' }}
      >

        {/* ── HERO ── */}
        <section className="bg-[#F5F0EB] pt-44 pb-16 md:pt-52 md:pb-24 text-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-3 mb-10">
              <span className="w-8 h-px bg-[#C2654A]" aria-hidden="true" />
              <span className="text-xs font-semibold tracking-[2.5px] uppercase text-[#C2654A]">
                Contact
              </span>
              <span className="w-8 h-px bg-[#C2654A]" aria-hidden="true" />
            </div>

            <h1 className="text-[32px] md:text-[64px] text-[#1A1A1A] leading-[1.05] max-w-[760px] mx-auto mb-6">
              <span className="font-serif italic">We horen </span>
              <span className="font-sans font-bold" style={{ letterSpacing: "-2px" }}>graag van je</span>
            </h1>

            <p className="text-[17px] text-[#4A4A4A] leading-[1.7] max-w-[480px] mx-auto mb-12 text-center">
              Vragen over stijl, partnerships of een idee?
              We reageren binnen 24 uur op werkdagen.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-medium text-[#4A4A4A]">
              {["Binnen 24 uur reactie", "Geen callcenter", "Direct antwoord"].map((tag) => (
                <div key={tag} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#C2654A] flex-shrink-0" aria-hidden="true" />
                  <span>{tag}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MAIN: form (left) + sidebar (right) ── */}
        <section className="bg-[#FAFAF8] py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 xl:gap-16 items-start">

              {/* ── LEFT: form card ── */}
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <AnimatePresence>
                  {formState === "success" && (
                    <motion.div
                      key="ok"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      role="alert"
                      aria-live="polite"
                      className="mb-6 rounded-2xl bg-[#3D8B5E]/10 border border-[#3D8B5E]/20 px-6 py-5 flex items-start gap-4"
                    >
                      <CheckCircle className="w-5 h-5 text-[#3D8B5E] flex-shrink-0 mt-0.5" aria-hidden />
                      <div>
                        <p className="text-sm font-semibold text-[#1A1A1A]">Bericht ontvangen!</p>
                        <p className="text-xs text-[#4A4A4A] mt-0.5 leading-relaxed">
                          We reageren binnen 24 uur op werkdagen.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {formState === "error" && (
                    <motion.div
                      key="err"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      role="alert"
                      aria-live="polite"
                      className="mb-6 rounded-2xl bg-[#C24A4A]/10 border border-[#C24A4A]/20 px-6 py-5 flex items-start gap-4"
                    >
                      <AlertCircle className="w-5 h-5 text-[#C24A4A] flex-shrink-0 mt-0.5" aria-hidden />
                      <p className="text-sm text-[#C24A4A]">{errorMsg}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="bg-white border border-[#E5E5E5] rounded-2xl shadow-sm overflow-hidden">
                  {/* Form header strip */}
                  <div className="px-8 pt-8 pb-6 border-b border-[#E5E5E5]">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-xl bg-[#F4E8E3] flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-4 h-4 text-[#C2654A]" aria-hidden />
                      </div>
                      <h2 className="text-xl font-sans font-semibold text-[#1A1A1A]">
                        Stuur een bericht
                      </h2>
                    </div>
                    <p className="text-sm text-[#8A8A8A] leading-relaxed">
                      Direct in ons systeem — geen e-mailapp nodig.
                    </p>
                  </div>

                  {/* Form body */}
                  <form
                    className="px-8 py-8 space-y-6"
                    onSubmit={handleSubmit}
                    noValidate
                    aria-label="Contactformulier"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Field id="name" label="Naam" error={errors.name} touched={touched.name}>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          className={touched.name && errors.name ? inputErr : inputOk}
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
                          inputMode="email"
                          className={touched.email && errors.email ? inputErr : inputOk}
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
                          className={`${inputOk} appearance-none pr-10`}
                          value={topic}
                          onChange={(e) => setTopic(e.target.value as Topic)}
                        >
                          <option value="algemeen">Algemene vraag</option>
                          <option value="pers">Pers & Media</option>
                          <option value="partners">Partnership & Samenwerking</option>
                          <option value="feedback">Feedback & Suggesties</option>
                          <option value="bug">Bug of technisch probleem</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center" aria-hidden>
                          <svg className="w-4 h-4 text-[#8A8A8A]" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 11L2 5h12z" />
                          </svg>
                        </div>
                      </div>
                    </Field>

                    <Field id="message" label="Bericht" error={errors.message} touched={touched.message}>
                      <textarea
                        id="message"
                        name="message"
                        rows={6}
                        className={`${touched.message && errors.message ? inputErr : inputOk} min-h-[160px] resize-y`}
                        placeholder="Waar kunnen we je mee helpen?"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onBlur={() => touch("message")}
                        aria-invalid={touched.message ? !!errors.message : undefined}
                        aria-describedby={errors.message ? "err-message" : undefined}
                        required
                      />
                    </Field>

                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4">
                      <button
                        type="submit"
                        disabled={formState === "submitting" || formState === "success"}
                        className="bg-[#C2654A] hover:bg-[#A8513A] text-white font-semibold text-base py-3 px-8 rounded-xl transition-colors duration-200 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {formState === "submitting" ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
                              <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" style={{ opacity: 0.75 }} />
                            </svg>
                            Versturen…
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" aria-hidden />
                            Verstuur bericht
                          </>
                        )}
                      </button>

                      <p className="text-sm text-[#8A8A8A] inline-flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 flex-shrink-0 text-[#3D8B5E]" aria-hidden />
                        Veilig opgeslagen.{" "}
                        <Link
                          to="/privacy"
                          className="text-[#C2654A] hover:text-[#A8513A] underline underline-offset-2 transition-colors duration-200"
                        >
                          Privacyverklaring
                        </Link>
                      </p>
                    </div>
                  </form>
                </div>
              </motion.div>

              {/* ── RIGHT: info sidebar ── */}
              <motion.aside
                aria-label="Contactinformatie"
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col gap-4"
              >
                {INFO_CARDS.map((card, i) => {
                  const Icon = card.icon;

                  const inner = (
                    <div className="group bg-white border border-[#E5E5E5] rounded-2xl p-6 hover:shadow-md hover:border-[#C2654A]/40 transition-all duration-200">
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-xl bg-[#F4E8E3] flex items-center justify-center flex-shrink-0 group-hover:bg-[#C2654A]/15 transition-colors duration-200">
                          <Icon className="w-5 h-5 text-[#C2654A]" aria-hidden />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[#1A1A1A] leading-snug">
                            {card.title}
                          </p>
                          <p className="text-sm text-[#8A8A8A] mt-1 leading-relaxed">
                            {card.body}
                          </p>
                          {card.cta && (
                            <span className="text-sm font-medium text-[#C2654A] group-hover:text-[#A8513A] mt-2.5 inline-flex items-center gap-1.5 transition-colors duration-200">
                              {card.cta}
                              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200" aria-hidden />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );

                  if (card.href && card.internal) {
                    return (
                      <Link key={i} to={card.href} className="block focus-visible:ring-2 focus-visible:ring-[#C2654A] focus-visible:ring-offset-2 rounded-2xl">
                        {inner}
                      </Link>
                    );
                  }
                  if (card.href) {
                    return (
                      <a key={i} href={card.href} rel="noopener noreferrer" className="block focus-visible:ring-2 focus-visible:ring-[#C2654A] focus-visible:ring-offset-2 rounded-2xl">
                        {inner}
                      </a>
                    );
                  }
                  return <div key={i}>{inner}</div>;
                })}

                {/* Response promise card */}
                <div className="bg-[#F5F0EB] rounded-2xl p-6 border border-[#E5E5E5]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-[#3D8B5E]" aria-hidden="true" />
                    <span className="text-xs font-semibold uppercase tracking-[2px] text-[#3D8B5E]">Onze belofte</span>
                  </div>
                  <p className="text-sm text-[#4A4A4A] leading-relaxed">
                    We lezen elk bericht persoonlijk. Geen chatbot, geen formuliermail.
                  </p>
                </div>
              </motion.aside>

            </div>
          </div>
        </section>

      </div>
    </>
  );
}
