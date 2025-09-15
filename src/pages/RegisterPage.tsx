import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import Seo from "@/components/Seo";
import Button from "@/components/ui/Button";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [agree, setAgree] = React.useState(false);

  const [form, setForm] = React.useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);

  const onChange =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((s) => ({ ...s, [key]: e.target.value }));
      setErrors((e2) => ({ ...e2, [key]: "" }));
    };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Vul je naam in.";
    if (!form.email.includes("@")) e.email = "Vul een geldig e-mailadres in.";
    if (form.password.length < 8) e.password = "Minimaal 8 tekens.";
    if (form.password !== form.confirm) e.confirm = "Wachtwoorden komen niet overeen.";
    if (!agree) e.agree = "Je moet akkoord gaan met de voorwaarden.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    // UI-first flow: laat de gebruiker direct starten met de stijltest.
    // Auth-koppeling kan later, maar dit is functioneel en breekt niets.
    try {
      navigate("/onboarding");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Seo title="Registreren — FitFi" description="Maak je FitFi-account aan en start met je AI-stijlrapport." />
      <section className="bg-[color:var(--color-bg)]">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="ff-heading text-[color:var(--color-text)] text-3xl sm:text-4xl font-extrabold">Maak je account aan</h1>
            <p className="text-[color:var(--color-muted)] mt-3">Start gratis. Ontvang je AI Style Report in 2 minuten.</p>
            <ul className="mt-4 flex items-center justify-center gap-4 text-sm text-[color:var(--color-text)]">
              <li className="inline-flex items-center gap-2">
                <CheckCircle2 className="text-[color:var(--color-success)]" /> Snel & eenvoudig
              </li>
              <li className="inline-flex items-center gap-2">
                <CheckCircle2 className="text-[color:var(--color-success)]" /> Privacy gegarandeerd
              </li>
            </ul>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Form card */}
            <form onSubmit={onSubmit} className="bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-soft)] p-6">
              {/* Name */}
              <div className="mb-5">
                <label htmlFor="name" className="block text-sm font-medium text-[color:var(--color-text)] mb-2">
                  Naam
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={onChange("name")}
                  className={`block w-full px-3 py-3 rounded-[var(--radius-md)] border bg-[color:var(--color-surface)] text-[color:var(--color-text)] placeholder:text-[color:var(--color-muted)] transition-colors
                              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-surface)] ${
                                errors.name ? "border-[color:var(--color-danger)]" : "border-[color:var(--color-border)]"
                              }`}
                  placeholder="Voornaam en achternaam"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-[color:var(--color-danger)]" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="mb-5">
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
                    className={`block w-full rounded-[var(--radius-md)] border bg-[color:var(--color-surface)] pl-10 pr-3 py-3 text-[color:var(--color-text)] placeholder:text-[color:var(--color-muted)] transition-colors
                                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-surface)] ${
                                  errors.email ? "border-[color:var(--color-danger)]" : "border-[color:var(--color-border)]"
                                }`}
                    placeholder="je@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-[color:var(--color-danger)]" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="mb-5">
                <label htmlFor="password" className="block text-sm font-medium text-[color:var(--color-text)] mb-2">
                  Wachtwoord
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-[color:var(--color-muted)]" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={onChange("password")}
                    className={`block w-full rounded-[var(--radius-md)] border bg-[color:var(--color-surface)] pl-10 pr-10 py-3 text-[color:var(--color-text)] placeholder:text-[color:var(--color-muted)] transition-colors
                                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-surface)] ${
                                  errors.password ? "border-[color:var(--color-danger)]" : "border-[color:var(--color-border)]"
                                }`}
                    placeholder="Minimaal 8 tekens"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Verberg wachtwoord" : "Toon wachtwoord"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5 text-[color:var(--color-muted)]" /> : <Eye className="h-5 w-5 text-[color:var(--color-muted)]" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-[color:var(--color-danger)]" role="alert">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm */}
              <div className="mb-5">
                <label htmlFor="confirm" className="block text-sm font-medium text-[color:var(--color-text)] mb-2">
                  Bevestig wachtwoord
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-[color:var(--color-muted)]" />
                  </div>
                  <input
                    id="confirm"
                    name="confirm"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    value={form.confirm}
                    onChange={onChange("confirm")}
                    className={`block w-full rounded-[var(--radius-md)] border bg-[color:var(--color-surface)] pl-10 pr-10 py-3 text-[color:var(--color-text)] placeholder:text-[color:var(--color-muted)] transition-colors
                                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-surface)] ${
                                  errors.confirm ? "border-[color:var(--color-danger)]" : "border-[color:var(--color-border)]"
                                }`}
                    placeholder="Herhaal je wachtwoord"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowConfirm((s) => !s)}
                    aria-label={showConfirm ? "Verberg wachtwoord" : "Toon wachtwoord"}
                  >
                    {showConfirm ? <EyeOff className="h-5 w-5 text-[color:var(--color-muted)]" /> : <Eye className="h-5 w-5 text-[color:var(--color-muted)]" />}
                  </button>
                </div>
                {errors.confirm && (
                  <p className="mt-1 text-sm text-[color:var(--color-danger)]" role="alert">
                    {errors.confirm}
                  </p>
                )}
              </div>

              {/* Terms */}
              <div className="mb-6">
                <label className="inline-flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-[color:var(--color-border)] text-[color:var(--ff-color-primary-700)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-surface)]"
                    aria-invalid={!!errors.agree}
                  />
                  <span className="text-sm text-[color:var(--color-text)]">
                    Ik ga akkoord met de{" "}
                    <Link to="/voorwaarden" className="text-[color:var(--color-primary)] hover:underline">
                      algemene voorwaarden
                    </Link>{" "}
                    en{" "}
                    <Link to="/privacy" className="text-[color:var(--color-primary)] hover:underline">
                      privacyverklaring
                    </Link>
                    .
                  </span>
                </label>
                {errors.agree && (
                  <p className="mt-1 text-sm text-[color:var(--color-danger)]" role="alert">
                    {errors.agree}
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button type="submit" variant="primary" size="lg" disabled={submitting} className="w-full">
                {submitting ? "Bezig…" : "Account aanmaken"}
              </Button>

              {/* Alt */}
              <p className="mt-4 text-sm text-[color:var(--color-muted)] text-center">
                Heb je al een account?{" "}
                <Link to="/inloggen" className="text-[color:var(--color-primary)] hover:underline">
                  Inloggen
                </Link>
              </p>
            </form>

            {/* Side blurb */}
            <div className="bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-soft)] p-6">
              <h2 className="ff-heading text-[color:var(--color-text)] text-2xl font-semibold">Waarom FitFi?</h2>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-[color:var(--color-success)] mt-1" />
                  <p className="text-[color:var(--color-text)]">
                    Persoonlijke outfits op basis van jouw silhouet, voorkeuren en seizoenscontext.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-[color:var(--color-success)] mt-1" />
                  <p className="text-[color:var(--color-text)]">
                    Uitleg bij elke aanbeveling (waarom dit past: materiaal, kleurtemperatuur, archetype, seizoen).
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-[color:var(--color-success)] mt-1" />
                  <p className="text-[color:var(--color-text)]">Geen gedoe — start gratis, upgrade als je klaar bent.</p>
                </li>
              </ul>

              {/* Error sample slot */}
              {"general" in errors && errors.general && (
                <div className="mt-6 bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-[var(--radius-md)] p-3 flex items-start gap-2">
                  <AlertCircle className="text-[color:var(--color-danger)] flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-[color:var(--color-text)] text-sm">{errors.general}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default RegisterPage;