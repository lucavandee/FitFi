// src/pages/ContactPage.tsx
import React from "react";
import { CheckCircle, AlertTriangle } from "lucide-react";

type FormData = { name: string; email: string; message: string };
type Errors = Partial<Record<keyof FormData, string>>;

const emailOk = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

const ContactPage: React.FC = () => {
  const [data, setData] = React.useState<FormData>({ name: "", email: "", message: "" });
  const [errors, setErrors] = React.useState<Errors>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const setField = (k: keyof FormData, v: string) => {
    setData((d) => ({ ...d, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined })); // clear field error on change
  };

  const validate = (): boolean => {
    const e: Errors = {};
    if (!data.name.trim()) e.name = "Vul je naam in.";
    if (!data.email.trim()) e.email = "Vul je e-mail in.";
    else if (!emailOk(data.email)) e.email = "Gebruik een geldig e-mailadres.";
    if (!data.message.trim()) e.message = "Schrijf kort je vraag of verzoek.";
    else if (data.message.trim().length < 10) e.message = "Geef minimaal 10 tekens context.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    // Simulatie van submit; vervang later met echte API-call.
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
    }, 800);
  };

  if (success) {
    return (
      <main className="bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
        <section className="section" aria-labelledby="contact-done-title">
          <div className="container max-w-3xl">
            <div className="card card--elevated">
              <div className="card__inner">
                <div className="alert alert--success">
                  <CheckCircle className="w-5 h-5" aria-hidden="true" />
                  <div>
                    <h1 id="contact-done-title" className="hero__title text-[clamp(1.6rem,4.5vw,2.2rem)]">
                      Bericht verzonden — dank je!
                    </h1>
                    <p className="lead mt-2">
                      We reageren snel via <strong>{data.email.trim()}</strong>. Je kunt dit venster sluiten
                      of terug naar de veelgestelde vragen.
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a href="/veelgestelde-vragen" className="btn btn-ghost">Naar FAQ</a>
                  <button className="btn btn-primary" onClick={() => setSuccess(false)}>
                    Nieuw bericht
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
      <section className="section" aria-labelledby="contact-title">
        <div className="container grid lg:grid-cols-3 gap-8 items-start">
          <header className="lg:col-span-1">
            <h1 id="contact-title" className="hero__title text-[clamp(2rem,5vw,2.6rem)]">Contact</h1>
            <p className="lead mt-3">Vragen, ideeën of zakelijk samenwerken? Stuur een bericht — we reageren snel.</p>
            <div className="mt-6 subcard">
              <div className="subcard__inner">
                <div className="text-sm">
                  <strong>Support</strong><br/>
                  <span className="muted">Binnen 24 uur reactie</span>
                </div>
                <div className="mt-3 text-sm">
                  <strong>Zakelijk</strong><br/>
                  <span className="muted">Partnerships & affiliates</span>
                </div>
              </div>
            </div>
          </header>

          <form className="lg:col-span-2 card" aria-describedby="contact-help" onSubmit={onSubmit} noValidate>
            <div className="card__inner grid sm:grid-cols-2 gap-4">
              {/* Live error region (summary) */}
              {Object.keys(errors).length > 0 && (
                <div className="sm:col-span-2 alert alert--danger" role="alert" aria-live="assertive">
                  <AlertTriangle className="w-5 h-5" aria-hidden="true" />
                  <div>
                    <strong>Even checken:</strong> corrigeer de gemarkeerde velden en probeer opnieuw.
                  </div>
                </div>
              )}

              {/* Naam */}
              <div>
                <label className="block">
                  <span className="text-sm">Naam</span>
                  <input
                    className={`input mt-2 ${errors.name ? "input--error" : ""}`}
                    placeholder="Jouw naam"
                    aria-label="Naam"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "err-name" : undefined}
                    value={data.name}
                    onChange={(e) => setField("name", e.target.value)}
                  />
                </label>
                {errors.name && (
                  <p id="err-name" className="help-error" role="status" aria-live="polite">{errors.name}</p>
                )}
              </div>

              {/* E-mail */}
              <div>
                <label className="block">
                  <span className="text-sm">E-mail</span>
                  <input
                    type="email"
                    className={`input mt-2 ${errors.email ? "input--error" : ""}`}
                    placeholder="naam@voorbeeld.nl"
                    aria-label="E-mail"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "err-email" : undefined}
                    value={data.email}
                    onChange={(e) => setField("email", e.target.value)}
                  />
                </label>
                {errors.email && (
                  <p id="err-email" className="help-error" role="status" aria-live="polite">{errors.email}</p>
                )}
              </div>

              {/* Bericht */}
              <div className="sm:col-span-2">
                <label className="block">
                  <span className="text-sm">Bericht</span>
                  <textarea
                    className={`textarea mt-2 ${errors.message ? "textarea--error" : ""}`}
                    placeholder="Waarmee kunnen we je helpen?"
                    aria-label="Bericht"
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? "err-message" : undefined}
                    value={data.message}
                    onChange={(e) => setField("message", e.target.value)}
                  />
                </label>
                {errors.message && (
                  <p id="err-message" className="help-error" role="status" aria-live="polite">{errors.message}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <button type="submit" className="btn btn-primary" disabled={submitting} aria-busy={submitting}>
                  {submitting ? "Versturen…" : "Verstuur"}
                </button>
              </div>
            </div>

            <p id="contact-help" className="text-xs muted px-6 pb-6">
              We gebruiken je gegevens uitsluitend om op je bericht te reageren.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
};

export default ContactPage;