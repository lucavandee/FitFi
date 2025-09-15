import React from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import Button from "@/components/ui/Button";
import { Mail, MessageSquare, User, CheckCircle2 } from "lucide-react";

const ContactPage: React.FC = () => {
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    topic: "vraag",
    message: "",
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [sent, setSent] = React.useState(false);
  const [sending, setSending] = React.useState(false);

  const onChange =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((s) => ({ ...s, [key]: e.target.value }));
      setErrors((e2) => ({ ...e2, [key]: "" }));
    };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Vul je naam in.";
    if (!form.email.includes("@")) e.email = "Vul een geldig e-mailadres in.";
    if (form.message.trim().length < 10) e.message = "Je bericht is te kort.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSending(true);
    // In deze fase geen backend-call; we tonen een nette bevestiging en sturen gebruikers verder de funnel in.
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 450);
  };

  return (
    <>
      <Seo
        title="Contact — FitFi"
        description="Neem contact op met FitFi. Heb je een vraag over je AI Style Report, je account of samenwerkingen? We helpen je graag."
      />

      <section className="bg-[color:var(--color-bg)]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="ff-heading text-[color:var(--color-text)] text-3xl sm:text-4xl font-extrabold">Contact</h1>
            <p className="text-[color:var(--color-muted)] mt-3">
              Stel je vraag of deel je idee. We reageren doorgaans binnen 1–2 werkdagen.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Form */}
            <form onSubmit={onSubmit} className="ff-card p-6" noValidate>
              {!sent ? (
                <>
                  <div className="grid gap-5">
                    {/* Naam */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-[color:var(--color-text)] mb-2">
                        Naam
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <User className="h-5 w-5 text-[color:var(--color-muted)]" />
                        </div>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          value={form.name}
                          onChange={onChange("name")}
                          className={`block w-full rounded-lg border bg-[color:var(--color-surface)] pl-10 pr-3 py-3 text-[color:var(--color-text)] placeholder:text-[color:var(--color-muted)] transition-colors
                            focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-surface)] ${
                              errors.name ? "border-[color:var(--color-danger)]" : "border-[color:var(--color-border)]"
                            }`}
                          placeholder="Jouw naam"
                          required
                        />
                      </div>
                      {errors.name && <p className="mt-1 text-sm text-[color:var(--color-danger)]">{errors.name}</p>}
                    </div>

                    {/* E-mail */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-[color:var(--color-text)] mb-2">
                        E-mail
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <Mail className="h-5 w-5 text-[color:var(--color-muted)]" />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          value={form.email}
                          onChange={onChange("email")}
                          className={`block w-full rounded-lg border bg-[color:var(--color-surface)] pl-10 pr-3 py-3 text-[color:var(--color-text)] placeholder:text-[color:var(--color-muted)] transition-colors
                            focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-surface)] ${
                              errors.email ? "border-[color:var(--color-danger)]" : "border-[color:var(--color-border)]"
                            }`}
                          placeholder="je@email.com"
                          required
                        />
                      </div>
                      {errors.email && <p className="mt-1 text-sm text-[color:var(--color-danger)]">{errors.email}</p>}
                    </div>

                    {/* Onderwerp */}
                    <div>
                      <label htmlFor="topic" className="block text-sm font-medium text-[color:var(--color-text)] mb-2">
                        Onderwerp
                      </label>
                      <select
                        id="topic"
                        name="topic"
                        value={form.topic}
                        onChange={onChange("topic")}
                        className="block w-full rounded-lg border bg-[color:var(--color-surface)] px-3 py-3 text-[color:var(--color-text)] placeholder:text-[color:var(--color-muted)] transition-colors focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-surface)] border-[color:var(--color-border)]"
                        aria-label="Kies onderwerp"
                      >
                        <option value="vraag">Vraag</option>
                        <option value="feedback">Feedback</option>
                        <option value="samenwerking">Samenwerking</option>
                        <option value="support">Support</option>
                      </select>
                    </div>

                    {/* Bericht */}
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-[color:var(--color-text)] mb-2">
                        Bericht
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute left-0 top-3 pl-3">
                          <MessageSquare className="h-5 w-5 text-[color:var(--color-muted)]" />
                        </div>
                        <textarea
                          id="message"
                          name="message"
                          rows={6}
                          value={form.message}
                          onChange={onChange("message")}
                          className={`block w-full rounded-lg border bg-[color:var(--color-surface)] pl-10 pr-3 py-3 text-[color:var(--color-text)] placeholder:text-[color:var(--color-muted)] transition-colors resize-y
                            focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-surface)] ${
                              errors.message ? "border-[color:var(--color-danger)]" : "border-[color:var(--color-border)]"
                            }`}
                          placeholder="Vertel kort waar we je mee kunnen helpen"
                          required
                        />
                      </div>
                      {errors.message && <p className="mt-1 text-sm text-[color:var(--color-danger)]">{errors.message}</p>}
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <Button type="submit" variant="primary" size="lg" disabled={sending}>
                        {sending ? "Verzenden…" : "Bericht verzenden"}
                      </Button>
                      <Button
                        as="a"
                        variant="ghost"
                        size="lg"
                        href="mailto:hi@fitfi.ai?subject=FitFi%20contact"
                      >
                        Of mail ons direct
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-10">
                  <CheckCircle2 style={{ color: "var(--color-success)" }} className="mx-auto h-10 w-10" />
                  <h2 className="ff-heading text-[color:var(--color-text)] text-2xl font-semibold mt-3">Bedankt voor je bericht!</h2>
                  <p className="text-[color:var(--color-muted)] mt-2">We komen bij je terug. Intussen kun je alvast starten met je stijltest.</p>
                  <div className="mt-6">
                    <Button as={Link} to="/onboarding" variant="primary" size="lg">
                      Start de stijltest
                    </Button>
                  </div>
                </div>
              )}
            </form>

            {/* Info card */}
            <div className="ff-card p-6 bg-[color:var(--color-surface)]">
              <h2 className="ff-heading text-[color:var(--color-text)] text-2xl font-semibold">Veelgestelde vragen</h2>
              <p className="text-[color:var(--color-muted)] mt-2">
                Misschien staat je antwoord al klaar. Bekijk onze FAQ of lees hoe FitFi werkt.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button as={Link} to="/veelgestelde-vragen" variant="ghost" size="md">
                  Naar FAQ
                </Button>
                <Button as={Link} to="/hoe-het-werkt" variant="ghost" size="md">
                  Hoe het werkt
                </Button>
              </div>

              <div className="mt-8">
                <h3 className="ff-heading text-[color:var(--color-text)] text-lg font-semibold">Snelle feiten</h3>
                <ul className="mt-3 space-y-2 text-[color:var(--color-text)]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 style={{ color: "var(--color-success)" }} className="mt-0.5" /> Privacy gegarandeerd
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 style={{ color: "var(--color-success)" }} className="mt-0.5" /> 10.000+ rapporten gegenereerd
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 style={{ color: "var(--color-success)" }} className="mt-0.5" /> Start gratis, upgrade wanneer je wilt
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactPage;