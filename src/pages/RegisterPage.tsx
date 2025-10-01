import React from "react";
import { useNavigate, NavLink } from "react-router-dom";
import PageHero from "@/components/marketing/PageHero";
import { Eye, EyeOff, CircleAlert as AlertCircle, CircleCheck as CheckCircle2 } from "lucide-react";

function isEmail(v: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
}

function pwScore(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}

export default function RegisterPage() {
  const nav = useNavigate();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [agree, setAgree] = React.useState(true);
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = React.useState(false);

  const errors = {
    name: name.trim().length < 2 ? "Vul je naam in." : "",
    email: !isEmail(email) ? "Vul een geldig e-mailadres in." : "",
    password:
      password.length < 8 ? "Minimaal 8 tekens, bij voorkeur met hoofdletter, cijfer en symbool." : "",
    confirm: confirm !== password ? "Wachtwoorden komen niet overeen." : "",
    agree: !agree ? "Je moet akkoord gaan met de voorwaarden." : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const score = pwScore(password);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirm: true, agree: true });
    setSubmitted(true);
    if (hasErrors) return;
    // Demo-register: geen backend; door naar resultaten
    nav("/results");
  }

  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <PageHero
        id="page-register"
        eyebrow="ACCOUNT"
        title="Account aanmaken"
        subtitle="Start gratis. Later upgraden kan altijd."
        align="left"
        as="h1"
        size="sm"
        ctas={[
          { label: "Al een account? Inloggen", to: "/login", variant: "secondary" },
        ]}
      />

      <section className="ff-container pb-12">
        <div className="mx-auto max-w-[640px] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
          <form onSubmit={onSubmit} noValidate className="grid gap-5">
            {/* Naam */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium">Naam</label>
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
                <p id="err-name" className="mt-1 text-sm inline-flex items-center gap-1 text-red-600">
                  <AlertCircle className="h-4 w-4" aria-hidden /> {errors.name}
                </p>
              )}
            </div>

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
                  autoComplete="new-password"
                  className="w-full rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "err-password" : "pw-hints"}
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

              {/* Strength bar */}
              <div className="mt-2" id="pw-hints" aria-live="polite">
                <div className="h-1 w-full rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-primary)] transition-all"
                    style={{ width: `${(score / 4) * 100}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-[var(--color-text)]/70">
                  Min. 8 tekens. Extra sterk met hoofdletter, cijfer en symbool.
                </p>
              </div>

              {touched.password && errors.password && (
                <p id="err-password" className="mt-1 text-sm inline-flex items-center gap-1 text-red-600">
                  <AlertCircle className="h-4 w-4" aria-hidden /> {errors.password}
                </p>
              )}
            </div>

            {/* Bevestig wachtwoord */}
            <div>
              <label htmlFor="confirm" className="block text-sm font-medium">Bevestig wachtwoord</label>
              <input
                id="confirm"
                name="confirm"
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                className="mt-1 w-full rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
                aria-invalid={!!errors.confirm}
                aria-describedby={errors.confirm ? "err-confirm" : undefined}
                required
              />
              {touched.confirm && errors.confirm && (
                <p id="err-confirm" className="mt-1 text-sm inline-flex items-center gap-1 text-red-600">
                  <AlertCircle className="h-4 w-4" aria-hidden /> {errors.confirm}
                </p>
              )}
              {!errors.confirm && confirm.length > 0 && confirm === password && (
                <p className="mt-1 text-sm inline-flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" aria-hidden /> Wachtwoorden komen overeen
                </p>
              )}
            </div>

            {/* Akkoord */}
            <div>
              <label className="inline-flex items-start gap-2 text-sm select-none">
                <input
                  type="checkbox"
                  className="mt-[2px] h-4 w-4 rounded border-[var(--color-border)]"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                />
                <span>
                  Ik ga akkoord met de{" "}
                  <NavLink to="/terms" className="underline hover:no-underline">voorwaarden</NavLink>{" "}
                  en{" "}
                  <NavLink to="/disclosure" className="underline hover:no-underline">disclosure</NavLink>.
                </span>
              </label>
              {touched.agree && errors.agree && (
                <p className="mt-1 text-sm inline-flex items-center gap-1 text-red-600">
                  <AlertCircle className="h-4 w-4" aria-hidden /> {errors.agree}
                </p>
              )}
            </div>

            {/* CTA */}
            <div className="flex flex-wrap gap-3">
              <button type="submit" className="ff-btn ff-btn-primary h-10 min-w-[160px]">
                Account aanmaken
              </button>
              <NavLink to="/login" className="ff-btn ff-btn-secondary h-10">
                Inloggen
              </NavLink>
              <NavLink to="/results" className="ff-btn ff-btn-quiet h-10">
                Eerst gratis proberen
              </NavLink>
            </div>

            {submitted && hasErrors && (
              <p className="text-sm text-[var(--color-text)]/60">
                Tip: dit is een demo zonder backend. Corrigeer de velden en probeer opnieuw — je kunt ook eerst gratis starten.
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