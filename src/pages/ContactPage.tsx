// src/pages/ContactPage.tsx
import React from "react";

/**
 * ContactPage — tokens-first + ff-utilities
 * - Toegankelijk formulier met labels, beschrijvingen en foutmeldingen.
 * - Geen externe deps; client-side validatie en success state.
 * - Honeypot veld voor eenvoudige spamreductie.
 */

type FormState = {
  name: string;
  email: string;
  topic: "support" | "pricing" | "feedback" | "other";
  message: string;
  consent: boolean;
  honey: string; // honeypot
};

type Errors = Partial<Record<keyof FormState, string>>;

export default function ContactPage() {
  const [state, setState] = React.useState<FormState>({
    name: "",
    email: "",
    topic: "support",
    message: "",
    consent: false,
    honey: "",
  });
  const [errors, setErrors] = React.useState<Errors>({});
  const [submitted, setSubmitted] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  function validate(s: FormState): Errors {
    const e: Errors = {};
    if (!s.name.trim()) e.name = "Vul je naam in.";
    if (!/^\S+@\S+\.\S+$/.test(s.email)) e.email = "Vul een geldig e-mailadres in.";
    if (!s.message.trim() || s.message.trim().length < 10) e.message = "Schrijf minimaal 10 tekens.";
    if (!s.consent) e.consent = "Geef toestemming om te reageren op je bericht.";
    if (s.honey) e.honey = "Spam gedetecteerd.";
    return e;
  }
  function onChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate(state);
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    setSubmitted(true);
    formRef.current?.reset();
  }

  if (submitted) {
    return (
      <main id="main" className="bg-surface text-text">
        <section className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="ff-card p-6 text-center ff-fade-in">
            <p className="font-heading text-xl">Bedankt voor je bericht!</p>
            <p className="mt-2 text-text/80">
              We reageren meestal binnen 1–2 werkdagen. Wil je intussen verder?
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <a href="/hoe-het-werkt" className="ff-btn ff-btn-secondary h-10">Hoe het werkt</a>
              <a href="/prijzen" className="ff-btn ff-btn-primary h-10">Bekijk plannen</a>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main id="main" className="bg-surface text-text">
      <section aria-labelledby="contact-title" className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <header className="mb-6 sm:mb-8">
          <p className="text-sm text-text/70">We helpen je graag</p>
          <h1 id="contact-title" className="font-heading text-2xl sm:text-3xl ff-text-balance">
            Neem contact op
          </h1>
          <p className="mt-2 text-text/80">
            Stel je vraag of geef feedback. We antwoorden zo snel mogelijk.
          </p>
        </header>

        <form ref={formRef} noValidate onSubmit={onSubmit} className="ff-card p-5 sm:p-6">
          <div aria-hidden="true" className="hidden">
            <label>
              Laat dit veld leeg
              <input type="text" tabIndex={-1} autoComplete="off" onChange={(e) => onChange("honey", e.target.value)} />
            </label>
          </div>

          <div className="grid gap-1">
            <label htmlFor="name" className="font-medium">Naam</label>
            <input id="name" name="name" type="text" className="w-full rounded-md border border-border bg-surface px-3 py-2 focus:outline-none ff-focus-ring"
              onChange={(e) => onChange("name", e.target.value)} aria-invalid={Boolean(errors.name) || undefined}
              aria-describedby={errors.name ? "name-error" : undefined} required />
            {errors.name && <p id="name-error" className="text-sm text-text/80">{errors.name}</p>}
          </div>

          <div className="grid gap-1 mt-4">
            <label htmlFor="email" className="font-medium">E-mail</label>
            <input id="email" name="email" type="email" className="w-full rounded-md border border-border bg-surface px-3 py-2 focus:outline-none ff-focus-ring"
              onChange={(e) => onChange("email", e.target.value)} aria-invalid={Boolean(errors.email) || undefined}
              aria-describedby={errors.email ? "email-error" : undefined} required />
            {errors.email && <p id="email-error" className="text-sm text-text/80">{errors.email}</p>}
          </div>

          <div className="grid gap-1 mt-4">
            <label htmlFor="topic" className="font-medium">Onderwerp</label>
            <select id="topic" name="topic" className="w-full rounded-md border border-border bg-surface px-3 py-2 focus:outline-none ff-focus-ring"
              defaultValue={state.topic} onChange={(e) => onChange("topic", e.target.value as FormState["topic"])}>
              <option value="support">Support</option>
              <option value="pricing">Prijzen/abonnement</option>
              <option value="feedback">Feedback/idee</option>
              <option value="other">Overig</option>
            </select>
          </div>

          <div className="grid gap-1 mt-4">
            <div className="flex items-center justify-between">
              <label htmlFor="message" className="font-medium">Bericht</label>
              <span className="text-xs text-text/70">Minimaal 10 tekens</span>
            </div>
            <textarea id="message" name="message" rows={5} className="w-full rounded-md border border-border bg-surface px-3 py-2 resize-y focus:outline-none ff-focus-ring"
              onChange={(e) => onChange("message", e.target.value)} aria-invalid={Boolean(errors.message) || undefined}
              aria-describedby={errors.message ? "message-error" : undefined} required />
            {errors.message && <p id="message-error" className="text-sm text-text/80">{errors.message}</p>}
          </div>

          <div className="mt-4 flex items-start gap-2">
            <input id="consent" name="consent" type="checkbox" className="mt-1 h-4 w-4 rounded border-border bg-surface focus:outline-none ff-focus-ring"
              onChange={(e) => onChange("consent", e.target.checked)} aria-invalid={Boolean(errors.consent) || undefined}
              aria-describedby={errors.consent ? "consent-error" : undefined} required />
            <label htmlFor="consent" className="text-sm">
              Ik geef toestemming om te reageren op mijn bericht en mijn gegevens te gebruiken volgens de privacyverklaring.
            </label>
          </div>
          {errors.consent && <p id="consent-error" className="mt-1 text-sm text-text/80">{errors.consent}</p>}

          <div className="mt-5 flex gap-2">
            <button type="submit" className="ff-btn ff-btn-primary h-10">Versturen</button>
            <a href="/veelgestelde-vragen" className="ff-btn ff-btn-secondary h-10">Naar FAQ</a>
          </div>
        </form>
      </section>
    </main>
  );
}