import React from "react";
import { useNavigate, NavLink } from "react-router-dom";
import PageHero from "@/components/marketing/PageHero";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

function isEmail(v: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
}

export default function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [remember, setRemember] = React.useState(true);
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = React.useState(false);

  const errors = {
    email: !isEmail(email) ? "Vul een geldig e-mailadres in." : "",
    password: password.length < 8 ? "Je wachtwoord is minimaal 8 tekens." : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setSubmitted(true);
    if (hasErrors) return;
    // Demo-login: geen backend; we navigeren naar results
    nav("/results");
  }

  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <PageHero
        id="page-login"
        eyebrow="ACCOUNT"
        title="Inloggen"
        subtitle="Snel en rustig — zoals het hoort."
        align="left"
        as="h1"
        size="sm"
        ctas={[
          { label: "Nog geen account? Registreren", to: "/register", variant: "secondary" },
        ]}
      />

      <section className="ff-container pb-12">
        <div className="mx-auto max-w-[560px] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
          <form onSubmit={onSubmit} noValidate className="grid gap-5">
            {/* E-mail */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium">E-mail</label>
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
                <p id="err-email" className="mt-1 text-sm inline-flex items-center gap-1 text-red-600">
                  <AlertCircle className="h-4 w-4" aria-hidden /> {errors.email}
                </p>
              )}
            </div>

            {/* Wachtwoord */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium">Wachtwoord</label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  className="w-full rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "err-password" : undefined}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] focus-visible:shadow-[var(--shadow-ring)]"
                  aria-label={showPw ? "Verberg wachtwoord" : "Toon wachtwoord"}
                >
                  {showPw ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                </button>
              </div>
              {touched.password && errors.password && (
                <p id="err-password" className="mt-1 text-sm inline-flex items-center gap-1 text-red-600">
                  <AlertCircle className="h-4 w-4" aria-hidden /> {errors.password}
                </p>
              )}
              {!errors.password && password.length >= 8 && (
                <p className="mt-1 text-sm inline-flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" aria-hidden /> Klaar om in te loggen
                </p>
              )}
            </div>

            {/* Opties */}
            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm select-none">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-[var(--color-border)]"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Ingelogd blijven
              </label>
              <NavLink to="/contact" className="text-sm underline hover:no-underline">
                Wachtwoord vergeten?
              </NavLink>
            </div>

            {/* CTA */}
            <div className="flex flex-wrap gap-3">
              <button type="submit" className="ff-btn ff-btn-primary h-10 min-w-[140px]">Inloggen</button>
              <NavLink to="/register" className="ff-btn ff-btn-secondary h-10">Account aanmaken</NavLink>
            </div>

            {/* Demo-notitie (alleen zichtbaar na submit met fouten) */}
            {submitted && hasErrors && (
              <p className="text-sm text-[var(--color-text)]/60">
                Tip: dit is een demo zonder backend. Vul een geldig e-mailadres en een wachtwoord van ≥ 8 tekens in om door te gaan.
              </p>
            )}
          </form>

          {/* Onder */}
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-[var(--color-text)]/70">
            <NavLink to="/terms" className="underline hover:no-underline">Voorwaarden</NavLink>
            <span>•</span>
            <NavLink to="/disclosure" className="underline hover:no-underline">Disclosure</NavLink>
            <span>•</span>
            <NavLink to="/veelgestelde-vragen" className="underline hover:no-underline">FAQ</NavLink>
          </div>
        </div>
      </section>
    </main>
  );
}