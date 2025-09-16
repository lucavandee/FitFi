import React from "react";
import Seo from "@/components/Seo";
import { CheckCircle, AlertTriangle } from "lucide-react";

type FormData = { name: string; email: string; message: string };
type Errors = Partial<Record<keyof FormData, string>>;

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

const ContactPage: React.FC = () => {
  const [data, setData] = React.useState<FormData>({ name: "", email: "", message: "" });
  const [errors, setErrors] = React.useState<Errors>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

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
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
    }, 800);
  };

  if (success) {
    return (
      <>
        <Seo title="Contact — Bedankt" description="We hebben je bericht ontvangen en reageren snel." canonical="https://www.fitfi.ai/contact" />
        <main className="bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
          <section className="section">
            <div className="container max-w-3xl">
              <div className="card card--elevated">
                <div className="card__inner">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[color:var(--color-success)]" aria-hidden="true" />
                    <div>
                      <h1 className="hero__title text-[clamp(1.6rem,4.5vw,2.2rem)]">Bericht verzonden — dank je!</h1>
                      <p className="lead mt-2">
                        We reageren snel via <strong>{data.email.trim()}</strong>. Je kunt dit venster sluiten
                        of terug naar de veelgestelde vragen.
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a href="/veelgestelde-vragen" className="btn btn-ghost">Naar FAQ</a>
                    <button className="btn btn-primary" onClick={() => setSuccess(false)}>Nieuw bericht</button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <Seo title="Contact — FitFi" description="Stel je vraag of vraag een demo aan." canonical="https://www.fitfi.ai/contact" />
      <main>
        <section className="section">
          <div className="container max-w-3xl">
            <h1 className="hero__title">Contact</h1>
            <p className="lead mt-2">We helpen je graag — gemiddeld binnen 1 werkdag reactie.</p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4" aria-label="Contactformulier">
              <div className="input">
                <label htmlFor="name" className="input__label">Naam</label>
                <input 
                  id="name" 
                  className="input__field" 
                  value={data.name} 
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  aria-invalid={!!errors.name}
                />
                {errors.name && (
                  <div id="name-error" className="input__error" role="alert">
                    <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                    {errors.name}
                  </div>
                )}
              </div>
              
              <div className="input">
                <label htmlFor="email" className="input__label">E-mail</label>
                <input 
                  id="email" 
                  type="email"
                  inputMode="email" 
                  className="input__field" 
                  value={data.email} 
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <div id="email-error" className="input__error" role="alert">
                    <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                    {errors.email}
                  </div>
                )}
              </div>
              
              <div className="input">
                <label htmlFor="message" className="input__label">Bericht</label>
                <textarea 
                  id="message" 
                  rows={5} 
                  className="input__field" 
                  value={data.message} 
                  onChange={(e) => setData({ ...data, message: e.target.value })}
                  aria-describedby={errors.message ? "message-error" : undefined}
                  aria-invalid={!!errors.message}
                />
                {errors.message && (
                  <div id="message-error" className="input__error" role="alert">
                    <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                    {errors.message}
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  className="btn btn-primary btn-lg" 
                  disabled={submitting} 
                  aria-busy={submitting}
                >
                  {submitting ? "Verzenden…" : "Verstuur bericht"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </>
  );
};

export default ContactPage;