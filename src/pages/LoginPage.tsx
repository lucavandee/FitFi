import React from "react";
import { useNavigate, NavLink } from "react-router-dom";
import PageHero from "@/components/marketing/PageHero";
import { Eye, EyeOff, CircleAlert as AlertCircle, CircleCheck as CheckCircle2, Mail, Link as LinkIcon } from "lucide-react";

function isEmail(v: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
}

type Mode = "password" | "magic";

export default function LoginPage() {
  const nav = useNavigate();

  // Gedeelde state
  const [email, setEmail] = React.useState("");
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = React.useState(false);

  // Wachtwoord-mode
  const [password, setPassword] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [remember, setRemember] = React.useState(true);

  // Magic-link-mode
  const [magicSent, setMagicSent] = React.useState(false);

  // Mode toggle
  const [mode, setMode] = React.useState<Mode>("password");

  const errors: Record<string, string | null> = {
    email: !email ? "E-mail is verplicht." : !isEmail(email) ? "Voer een geldig e-mailadres in." : null,
    password: mode === "password" ? (!password ? "Wachtwoord is verplicht." : password.length < 8 ? "Minimaal 8 tekens." : null) : null,
  };
  const hasErrors = Object.values(errors).some(Boolean);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setTouched({ email: true, password: true });
    if (hasErrors) return;

    if (mode === "password") {
      // Demo: navigeer door bij geldige input
      nav("/results");
    } else {
      // Magic-link demo: toon succes en "disable" knoppen
      setMagicSent(true);
      try {
        localStorage.setItem("ff_magic_pending", email);
      } catch {}
    }
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
        ctas={[{ label: "Nog geen account? Registreren", to: "/register", variant: "secondary" }]}
      />

      <section className="ff-container pb-12">
        <div className="mx-auto max-w-[560px] rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
          {/* Mode toggle */}
          <div className="inline-flex rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-1 mb-5" role="tablist" aria-label="Inlogmethode">
            <button
              role="tab"
              aria-selected={mode === "password"}
              className={`px-3 py-1.5 rounded-lg ${mode === "password" ? "bg-[var(--color-surface)]" : ""}`}
              onClick={() => setMode("password")}
            >
              Wachtwoord
            </button>
            <button
              role="tab"
              aria-selected={mode === "magic"}
              className={`px-3 py-1.5 rounded-lg ${mode === "magic" ? "bg-[var(--color-surface)]" : ""}`}
              onClick={() => setMode("magic")}
            >
              Magic-link
            </button>
          </div>

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

            {/* Conditievelds op basis van mode */}
            {mode === "password" ? (
              <>
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
                      className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] focus-visible:shadow-[var(--shadow-ring)]"
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
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <span className="text-sm">Ingelogd blijven</span>
                </label>
              </>
            ) : (
              <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
                <p className="text-sm text-[var(--color-text)]/80">
                  We sturen je een eenmalige login-link. Geen wachtwoord nodig.
                </p>
                {magicSent && (
                  <p className="mt-2 text-sm inline-flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="h-4 w-4" aria-hidden /> Als dit je e-mail is, staat er zo een link in je inbox.
                  </p>
                )}
              </div>
            )}

            {/* Acties */}
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="ff-btn ff-btn-primary h-10 min-w-[140px]"
                disabled={mode === "magic" && magicSent}
              >
                {mode === "password" ? "Inloggen" : magicSent ? "Verzonden" : "Stuur magic-link"}
              </button>
              {mode === "password" ? (
                <NavLink to="/register" className="ff-btn ff-btn-secondary h-10">Account aanmaken</NavLink>
              ) : (
                <button
                  type="button"
                  className="ff-btn ff-btn-secondary h-10"
                  onClick={() => {
                    setMode("password");
                    setMagicSent(false);
                  }}
                >
                  Inloggen met wachtwoord
                </button>
              )}
            </div>

            {/* Demo-notitie (alleen zichtbaar na submit met fouten) */}
            {submitted && hasErrors && (
              <p className="text-sm text-[var(--color-text)]/60">
                Tip: dit is een demo zonder backend. Vul een geldig e-mailadres
                {mode === "password" ? " en een wachtwoord van ≥ 8 tekens" : ""} in om door te gaan.
              </p>
            )}
          </form>

          {/* Foot links */}
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