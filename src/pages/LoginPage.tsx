import React from "react";
import { useNavigate, NavLink } from "react-router-dom";
import PageHero from "@/components/marketing/PageHero";
import {
  Eye,
  EyeOff,
  CircleAlert as AlertCircle,
  CheckCircle2,
  Mail,
  Link as LinkIcon,
  X,
  ShieldCheck,
} from "lucide-react";

/** E-mail validatie (basic, client-side) */
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

  // Forgot password modal
  const [forgotOpen, setForgotOpen] = React.useState(false);
  const [forgotEmail, setForgotEmail] = React.useState("");
  const [forgotSent, setForgotSent] = React.useState(false);

  // Fouten
  const errors: Record<string, string | null> = {
    email: !email ? "E-mail is verplicht." : !isEmail(email) ? "Voer een geldig e-mailadres in." : null,
    password:
      mode === "password"
        ? !password
          ? "Wachtwoord is verplicht."
          : password.length < 8
          ? "Minimaal 8 tekens."
          : null
        : null,
  };
  const hasErrors = Object.values(errors).some(Boolean);

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
      // Magic-link demo: toon succesbericht en disable
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
        // Kleine reassurance onder CTA's
        note={
          <span className="inline-flex items-center gap-2 text-[var(--color-text)]/70">
            <ShieldCheck className="w-4 h-4" />
            Privacy-vriendelijk. We verkopen je data niet.
          </span>
        }
      />

      {/* FORM-CARD */}
      <section className="ff-container pb-14">
        <div
          className={[
            "mx-auto max-w-[640px]",
            "rounded-[var(--radius-2xl)] border border-[var(--color-border)]",
            "bg-[var(--color-surface)] shadow-[var(--shadow-soft)]",
          ].join(" ")}
        >
          {/* Tabs / mode switch */}
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

          <form onSubmit={onSubmit} noValidate className="grid gap-5 p-5 md:p-6">
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
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "err-email" : undefined}
                required
              />
              {touched.email && errors.email && (
                <p id="err-email" className="mt-1 text-sm inline-flex items-center gap-1 text-[var(--color-danger)]">
                  <AlertCircle className="h-4 w-4" aria-hidden /> {errors.email}
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
                    <p id="err-password" className="mt-1 text-sm inline-flex items-center gap-1 text-[var(--color-danger)]">
                      <AlertCircle className="h-4 w-4" aria-hidden /> {errors.password}
                    </p>
                  )}
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

            {/* Acties */}
            <div className="mt-2 flex flex-wrap gap-3">
              <button
                type="submit"
                className="ff-btn ff-btn-primary h-10 min-w-[160px]"
                disabled={mode === "magic" && magicSent}
              >
                {mode === "password" ? "Inloggen" : magicSent ? "Verzonden" : "Stuur magic-link"}
              </button>
              {mode === "password" ? (
                <NavLink to="/registreren" className="ff-btn ff-btn-secondary h-10">
                  Account aanmaken
                </NavLink>
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

      {/* Forgot password modal */}
      {forgotOpen && (
        <ResetPasswordModal
          initialEmail={forgotEmail}
          onClose={() => setForgotOpen(false)}
          onSend={(mail) => {
            setForgotEmail(mail);
            setForgotSent(true);
            // Sluit zacht na bevestiging
            setTimeout(() => setForgotOpen(false), 1200);
          }}
          sent={forgotSent}
        />
      )}
    </main>
  );
}

/** Wachtwoord reset modal — client-only feedback, tokens-first */
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
      <div className="w-full max-w-md rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-medium text-[var(--color-text)]">Wachtwoord resetten</h2>
          <button aria-label="Sluiten" className="opacity-70 hover:opacity-100" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <p className="text-sm text-[var(--color-text)]/80 mb-3">
            Vul je e-mail in. Je ontvangt een link om je wachtwoord te resetten.
          </p>
          <label htmlFor="reset-email" className="block text-sm font-medium">
            E-mail
          </label>
          <input
            id="reset-email"
            type="email"
            className="mt-1 w-full rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2"
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
            <button className="ff-btn ff-btn-secondary h-10" onClick={onClose}>
              Annuleren
            </button>
            <button
              className="ff-btn ff-btn-primary h-10"
              disabled={!valid}
              onClick={() => onSend(mail)}
            >
              Stuur resetlink
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}