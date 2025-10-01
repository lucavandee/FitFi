// /src/pages/LoginPage.tsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import PageHero from "@/components/marketing/PageHero";
import Button from "@/components/ui/Button";
import { Eye, EyeOff, CircleAlert as AlertCircle, CircleCheck as CheckCircle2, Mail, Link as LinkIcon, X, ShieldCheck } from "lucide-react";

/** Basale e-mailvalidatie (client-side) */
function isEmail(v: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
}

/** Password strength: score 0–4 + label + tips (alleen UI) */
function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  score = Math.min(score, 4);
  const labels = ["Zeer zwak", "Zwak", "Oké", "Sterk", "Zeer sterk"] as const;

  const tips: string[] = [];
  if (pw.length < 12) tips.push("Gebruik ≥ 12 tekens");
  if (!/[A-Z]/.test(pw) || !/[a-z]/.test(pw)) tips.push("Mix hoofd-/kleine letters");
  if (!/\d/.test(pw)) tips.push("Voeg een cijfer toe");
  if (!/[^A-Za-z0-9]/.test(pw)) tips.push("Voeg een symbool toe");

  return { score, label: labels[score], tips };
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

  // Forgot password modal
  const [forgotOpen, setForgotOpen] = React.useState(false);
  const [forgotEmail, setForgotEmail] = React.useState("");
  const [forgotSent, setForgotSent] = React.useState(false);

  // Inline errors
  const emailError =
    !email ? "E-mail is verplicht." : !isEmail(email) ? "Voer een geldig e-mailadres in." : null;

  const pwError =
    mode === "password"
      ? !password
        ? "Wachtwoord is verplicht."
        : password.length < 8
        ? "Minimaal 8 tekens."
        : null
      : null;

  const hasErrors = Boolean(emailError || pwError);
  const pwStrength = passwordStrength(password);

  /** Submit */
  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setTouched({ email: true, password: true });
    if (hasErrors) return;

    if (mode === "password") {
      // Demo-auth: markeer als ingelogd en ga door
      try {
        window.localStorage.setItem("ff_auth", "1");
        const init = (email[0] || "U").toUpperCase();
        window.localStorage.setItem("ff_user_initial", init);
      } catch {}
      nav("/results");
    } else {
      // Magic-link demo: toon succes en disable primair
      setMagicSent(true);
      try {
        localStorage.setItem("ff_magic_pending", email);
      } catch {}
    }
  }

  /** Forgot password open */
  function openForgot() {
    setForgotEmail(email);
    setForgotSent(false);
    setForgotOpen(true);
  }

  // Helpers: velden 'touched' markeren
  const touch = (key: string) => setTouched((t) => (t[key] ? t : { ...t, [key]: true }));

  // Primair disablen tot geldig
  const canSubmit =
    mode === "password"
      ? isEmail(email) && password.length >= 8
      : isEmail(email) && !magicSent;

  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* HERO — luchtig, links uitgelijnd, tokens-first */}
      <PageHero
        id="page-login"
        eyebrow="ACCOUNT"
        title="Inloggen"
        subtitle="Snel en rustig — zoals het hoort."
        align="left"
        as="h1"
        size="sm"
        ctas={[{ label: "Nog geen account? Registreren", to: "/registreren", variant: "secondary" }]}
        note={
          <span className="inline-flex items-center gap-2 text-[var(--color-text)]/70">
            <ShieldCheck className="w-4 h-4" />
            Privacy-vriendelijk. We verkopen je data niet.
          </span>
        }
      />

      {/* FORM-CARD — extra top-padding t.o.v. hero voor lucht */}
      <section className="ff-container pt-8 sm:pt-10 md:pt-12 pb-14">
        <div
          className={[
            "mx-auto max-w-[640px]",
            "rounded-[var(--radius-2xl)] border border-[var(--color-border)]",
            "bg-[var(--color-surface)] shadow-[var(--shadow-soft)]",
            "transition-transform duration-200 ease-out transform-gpu hover:-translate-y-0.5",
          ].join(" ")}
          aria-label="Login formulier"
        >
          {/* Tabs / mode switch — segment control zonder globale CSS */}
          <div className="px-5 pt-5">
            <div
              className="inline-flex items-center gap-2 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] p-1"
              role="tablist"
              aria-label="Inlogmethode"
            >
              <button
                role="tab"
                aria-selected={mode === "password"}
                className={[
                  "px-3 py-1.5 rounded-lg text-sm transition-colors",
                  mode === "password"
                    ? "bg-[var(--color-surface)] shadow-[var(--shadow-soft)]"
                    : "hover:bg-[color-mix(in oklab,var(--color-primary) 8%,transparent)]",
                ].join(" ")}
                onClick={() => setMode("password")}
              >
                Wachtwoord
              </button>
              <button
                role="tab"
                aria-selected={mode === "magic"}
                className={[
                  "px-3 py-1.5 rounded-lg text-sm transition-colors",
                  mode === "magic"
                    ? "bg-[var(--color-surface)] shadow-[var(--shadow-soft)]"
                    : "hover:bg-[color-mix(in oklab,var(--color-primary) 8%,transparent)]",
                ].join(" ")}
                onClick={() => setMode("magic")}
              >
                Magic-link
              </button>
            </div>
          </div>

          <form onSubmit={onSubmit} noValidate className="grid gap-5 p-5 md:p-6" aria-live="polite">
            {/* E-mail */}
            <div className="grid gap-1.5">
              <label htmlFor="email" className="block text-sm font-medium">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="jij@voorbeeld.nl"
                className={[
                  "w-full rounded-[var(--radius-xl)] border bg-[var(--color-bg)] px-3 py-2",
                  "border-[var(--color-border)] focus:outline-none focus:shadow-[var(--shadow-ring)]",
                ].join(" ")}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  touch("email");
                }}
                onBlur={() => touch("email")}
                aria-invalid={!!(touched.email && emailError)}
                aria-describedby={touched.email && emailError ? "err-email" : undefined}
                required
              />
              {touched.email && emailError && (
                <p id="err-email" className="mt-1 text-sm inline-flex items-center gap-1 text-[var(--color-primary)]">
                  <AlertCircle className="h-4 w-4" aria-hidden /> {emailError}
                </p>
              )}
            </div>

            {/* Wachtwoord vs Magic-link */}
            {mode === "password" ? (
              <>
                <div className="grid gap-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium">
                      Wachtwoord
                    </label>
                    <button type="button" onClick={openForgot} className="text-sm underline hover:no-underline">
                      Wachtwoord vergeten?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPw ? "text" : "password"}
                      autoComplete="current-password"
                      className={[
                        "w-full rounded-[var(--radius-xl)] border bg-[var(--color-bg)] px-3 py-2 pr-10",
                        "border-[var(--color-border)] focus:outline-none focus:shadow-[var(--shadow-ring)]",
                      ].join(" ")}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        touch("password");
                      }}
                      onBlur={() => touch("password")}
                      aria-invalid={!!(touched.password && pwError)}
                      aria-describedby={touched.password && pwError ? "err-password" : undefined}
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
                  {touched.password && pwError && (
                    <p id="err-password" className="mt-1 text-sm inline-flex items-center gap-1 text-[var(--color-primary)]">
                      <AlertCircle className="h-4 w-4" aria-hidden /> {pwError}
                    </p>
                  )}

                  {/* Strength meter — volledig inline, tokens-first */}
                  <div className="mt-2">
                    <div
                      className="h-2 w-full rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden"
                      aria-hidden="true"
                    >
                      <div
                        className="h-full"
                        style={{
                          width: [8, 25, 55, 85, 100][pwStrength.score] + "%",
                          background: "var(--color-primary)",
                          opacity: [0.35, 0.6, 0.8, 0.95, 1][pwStrength.score],
                          filter: ["saturate(.6)","saturate(.7)","saturate(.85)","saturate(1)","saturate(1.05)"][pwStrength.score],
                          transition: "width .25s cubic-bezier(.2,0,0,1), opacity .18s, filter .18s",
                        }}
                      />
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-[12px] text-[var(--color-text)]/70">Sterkte: {pwStrength.label}</span>
                      {password && pwStrength.score < 3 ? (
                        <span className="text-[12px] text-[var(--color-text)]/70">{pwStrength.tips[0]}</span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <label className="flex items-center gap-2 select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <span className="text-sm">Ingelogd blijven</span>
                </label>
              </>
            ) : (
              <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
                <div className="inline-flex items-center gap-2 text-[var(--color-text)]/80 text-sm">
                  <LinkIcon className="w-4 h-4" />
                  We sturen je een eenmalige login-link. Geen wachtwoord nodig.
                </div>
                {magicSent && (
                  <p className="mt-2 text-sm inline-flex items-center gap-2 text-[var(--color-primary)]">
                    <CheckCircle2 className="h-4 w-4" aria-hidden /> Als dit je e-mail is, staat er zo een link in je inbox.
                  </p>
                )}
              </div>
            )}

            {/* Acties — via ons Button component (tokens-first) */}
            <div className="mt-2 flex flex-wrap gap-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={!canSubmit}
                aria-disabled={!canSubmit}
              >
                {mode === "password" ? "Inloggen" : magicSent ? "Verzonden" : "Stuur magic-link"}
              </Button>

              {mode === "password" ? (
                <Button as={NavLink} to="/registreren" variant="secondary" size="lg">
                  Account aanmaken
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={() => {
                    setMode("password");
                    setMagicSent(false);
                  }}
                >
                  Inloggen met wachtwoord
                </Button>
              )}
            </div>

            {/* Hulptekst na submit met fouten */}
            {submitted && hasErrors ? (
              <p className="text-[12px] text-[var(--color-text)]/70">
                Tip: vul een geldig e-mailadres
                {mode === "password" ? " en een wachtwoord van ≥ 8 tekens" : ""} in om door te gaan.
              </p>
            ) : null}

            {/* Juridisch / reassurance */}
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[var(--color-text)]/70">
              <NavLink to="/algemene-voorwaarden" className="underline hover:no-underline">
                Voorwaarden
              </NavLink>
              <span>•</span>
              <NavLink to="/disclosure" className="underline hover:no-underline">
                Disclosure
              </NavLink>
              <span>•</span>
              <NavLink to="/veelgestelde-vragen" className="underline hover:no-underline">
                FAQ
              </NavLink>
            </div>
          </form>
        </div>
      </section>

      {/* Forgot password modal — volledig lokaal gestyled */}
      {forgotOpen && (
        <ResetPasswordModal
          initialEmail={forgotEmail}
          onClose={() => setForgotOpen(false)}
          onSend={(mail) => {
            setForgotEmail(mail);
            setForgotSent(true);
            setTimeout(() => setForgotOpen(false), 1200);
          }}
          sent={forgotSent}
        />
      )}
    </main>
  );
}

/** Reset modal — geen globale CSS afhankelijkheden */
function ResetPasswordModal({
  initialEmail,
  onClose,
  onSend,
  sent,
}: {
  initialEmail: string;
  onClose: () => void;
  onSend: (email: string) => void;
  sent: boolean;
}) {
  const [mail, setMail] = React.useState(initialEmail || "");
  const valid = isEmail(mail);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
    >
      <div
        className={[
          "w-full max-w-md",
          "rounded-[var(--radius-2xl)] border border-[var(--color-border)]",
          "bg-[var(--color-surface)] shadow-[var(--shadow-soft)]",
        ].join(" ")}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-medium text-[var(--color-text)]">Wachtwoord resetten</h2>
          <button aria-label="Sluiten" className="opacity-70 hover:opacity-100" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <p className="text-[12px] text-[var(--color-text)]/70 mb-3">
            Vul je e-mail in. Je ontvangt een link om je wachtwoord te resetten.
          </p>
          <label htmlFor="reset-email" className="block text-sm font-medium">
            E-mail
          </label>
          <input
            id="reset-email"
            type="email"
            className="mt-1 w-full rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 focus:outline-none focus:shadow-[var(--shadow-ring)]"
            value={mail}
            onChange={(e) => setMail(e.target.value)}
            autoFocus
          />
          {sent ? (
            <p className="mt-3 text-sm inline-flex items-center gap-2 text-[var(--color-primary)]">
              <Mail className="h-4 w-4" aria-hidden /> Als dit je e-mail is, staat er zo een resetlink in je inbox.
            </p>
          ) : null}
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" size="lg" onClick={onClose}>
              Annuleren
            </Button>
            <Button variant="primary" size="lg" disabled={!valid} onClick={() => onSend(mail)}>
              Stuur resetlink
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}