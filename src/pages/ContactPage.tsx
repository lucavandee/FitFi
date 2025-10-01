import React from "react";
import { NavLink } from "react-router-dom";
import PageHero from "@/components/marketing/PageHero";
import { useFadeInOnVisible } from "@/hooks/useFadeInOnVisible";
import { Mail, HelpCircle, MessageSquare, ShieldCheck, Clock } from "lucide-react";

type Topic = "algemeen" | "pers" | "partners" | "feedback" | "bug";

const EMAIL = import.meta.env.VITE_CONTACT_EMAIL as string | undefined;

function encode(str: string) {
  return encodeURIComponent(str).replace(/%20/g, "+");
}

export default function ContactPage() {
  const fadeGrid = useFadeInOnVisible<HTMLDivElement>({ threshold: 0.15 });
  const fadeForm = useFadeInOnVisible<HTMLDivElement>({ threshold: 0.15 });

  // Simpele, client-only validatie
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

    // Bouw een privacy-first mailto — geen backend nodig
    const to = EMAIL ? `mailto:${EMAIL}` : "mailto:";
    const subject = `[FitFi] ${topic.toUpperCase()} — ${name.trim()}`;
    const body =
      `${message.trim()}\n\n—\nVan: ${name.trim()} <${email.trim()}>\n` +
      `Onderwerp: ${topic}\n` +
      `Pagina: https://www.fitfi.ai/contact`;

    window.location.href = `${to}?subject=${encode(subject)}&body=${encode(body)}`;
  }

  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <PageHero
        id="page-contact"
        eyebrow="CONTACT"
        title="Rustig. Helder. Persoonlijk."
        subtitle="Laat een bericht achter of bekijk eerst de FAQ. We houden het eenvoudig — zonder ruis."
        align="left"
        as="h1"
        size="sm"
        ctas={[
          { label: "Bekijk FAQ", to: "/veelgestelde-vragen", variant: "secondary" },
          { label: "Start gratis", to: "/results", variant: "primary" },
        ]}
      />

      {/* Contact opties / trust snapshot */}
      <section className="ff-container py-8">
        <div
          ref={fadeGrid.ref as any}
          style={{
            opacity: fadeGrid.visible ? 1 : 0,
            transform: fadeGrid.visible ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 600ms ease, transform 600ms ease",
          }}
          className="grid gap-6 md:grid-cols-3"
        >
          <article className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)] border border-[var(--color-border)]">
            <HelpCircle className="h-5 w-5 text-[var(--color-text)]/70" aria-hidden />
            <h3 className="font-heading text-lg mt-3">Snel antwoord? FAQ</h3>
            <p className="text-[var(--color-text)]/80 mt-2">
              De meeste vragen beantwoorden we kort in de FAQ.
            </p>
            <div className="mt-4">
              <NavLink to="/veelgestelde-vragen" className="ff-btn ff-btn-secondary">
                Naar FAQ
              </NavLink>
            </div>
          </article>

          <article className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)] border border-[var(--color-border)]">
            <ShieldCheck className="h-5 w-5 text-[var(--color-text)]/70" aria-hidden />
            <h3 className="font-heading text-lg mt-3">Privacy-first</h3>
            <p className="text-[var(--color-text)]/80 mt-2">
              Geen formulieren die data opslaan: je bericht opent je eigen mailapp.
            </p>
            {EMAIL && (
              <p className="mt-2 text-[var(--color-text)]/70 text-sm">
                Rechtstreeks mailen kan ook:{" "}
                <a className="underline hover:no-underline" href={`mailto:${EMAIL}`}>
                  {EMAIL}
                </a>
              </p>
            )}
          </article>

          <article className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)] border border-[var(--color-border)]">
            <Clock className="h-5 w-5 text-[var(--color-text)]/70" aria-hidden />
            <h3 className="font-heading text-lg mt-3">Rustig & duidelijk</h3>
            <p className="text-[var(--color-text)]/80 mt-2">
              We lezen alles en reageren zo snel mogelijk. Intussen kun je gewoon starten.
            </p>
            <div className="mt-4">
              <NavLink to="/results" className="ff-btn ff-btn-primary">
                Start gratis
              </NavLink>
            </div>
          </article>
        </div>
      </section>

      {/* Lichtgewicht formulier → opent mailclient (geen backend) */}
      <section className="ff-container pb-12">
        <div
          ref={fadeForm.ref as any}
          style={{
            opacity: fadeForm.visible ? 1 : 0,
            transform: fadeForm.visible ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 600ms ease, transform 600ms ease",
          }}
          className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)] border border-[var(--color-border)]"
        >
          <h2 className="font-heading text-2xl text-[var(--color-text)]">Stuur ons een bericht</h2>
          <p className="mt-2 text-[var(--color-text)]/80">
            Vul je gegevens in en klik op <em>Verstuur</em>. Je mailapp opent met je bericht.
          </p>

          <form className="mt-6 grid gap-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Naam
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                className="mt-1 w-full rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "err-name" : undefined}
                required
              />
              {touched.name && errors.name && (
                <p id="err-name" className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="mt-1 w-full rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "err-email" : undefined}
                required
              />
              {touched.email && errors.email && (
                <p id="err-email" className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="topic" className="block text-sm font-medium">
                Onderwerp
              </label>
              <select
                id="topic"
                name="topic"
                className="mt-1 w-full rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2"
                value={topic}
                onChange={(e) => setTopic(e.target.value as Topic)}
              >
                <option value="algemeen">Algemeen</option>
                <option value="pers">Pers</option>
                <option value="partners">Partners</option>
                <option value="feedback">Feedback</option>
                <option value="bug">Bug / probleem</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium">
                Bericht
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                className="mt-1 w-full rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, message: true }))}
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "err-message" : undefined}
                required
              />
              {touched.message && errors.message && (
                <p id="err-message" className="mt-1 text-sm text-red-600">{errors.message}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="ff-btn ff-btn-primary inline-flex items-center gap-2"
                title="Verzend via je eigen mailapp"
              >
                <Mail className="h-4 w-4" aria-hidden />
                Verstuur
              </button>

              <NavLink to="/veelgestelde-vragen" className="ff-btn ff-btn-secondary">
                Eerst FAQ bekijken
              </NavLink>
            </div>

            {!EMAIL && (
              <p className="mt-2 text-sm text-[var(--color-text)]/60">
                Tip voor livegang: stel <code>VITE_CONTACT_EMAIL</code> in je <code>.env</code> in om het
                e-mailadres zichtbaar te maken.
              </p>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}