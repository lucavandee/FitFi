import React, { useState } from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import {
  Eye, EyeOff, Mail, Shield, Lock, ArrowRight, Loader2, CheckCircle2
} from "lucide-react";
import Seo from "@/components/seo/Seo";
import { useUser } from "@/context/UserContext";
import toast from "react-hot-toast";
import {
  emailErrors, passwordErrors, getSupabaseAuthError,
  type ErrorMessage
} from "@/utils/formErrors";
import { InlineError, ErrorAlert } from "@/components/ui/ErrorAlert";

function isEmail(v: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
}

function passwordStrength(pw: string): { score: number; label: string; pct: number } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  score = Math.min(score, 4);
  const labels = ["Zeer zwak", "Zwak", "Voldoende", "Sterk", "Zeer sterk"] as const;
  return { score, label: labels[score], pct: [20, 40, 60, 80, 100][score] };
}

const strengthColors = [
  "bg-[var(--ff-color-danger-400)]",
  "bg-[var(--ff-color-danger-300)]",
  "bg-[var(--ff-color-warning-600)]",
  "bg-[var(--ff-color-success-500)]",
  "bg-[var(--ff-color-success-600)]",
] as const;

const strengthTextColors = [
  "text-[var(--ff-color-danger-600)]",
  "text-[var(--ff-color-danger-500)]",
  "text-[var(--ff-color-warning-600)]",
  "text-[var(--ff-color-success-600)]",
  "text-[var(--ff-color-success-700)]",
] as const;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useUser();
  const fromPath = (location.state as any)?.from as string | undefined;

  const comingFromResults =
    typeof fromPath === "string" && fromPath.startsWith("/results");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<ErrorMessage | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const pwData = password ? passwordStrength(password) : null;

  const emailError: ErrorMessage | null =
    touched.email && !email
      ? emailErrors.required()
      : touched.email && !isEmail(email)
      ? emailErrors.invalid(email)
      : null;

  const pwError: ErrorMessage | null =
    touched.password && !password
      ? passwordErrors.required()
      : touched.password && password.length < 8
      ? passwordErrors.tooShort(8)
      : null;

  const isEmailTaken =
    serverError?.title === "E-mailadres al in gebruik";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setServerError(null);

    if (!isEmail(email)) {
      setServerError(emailErrors.invalid(email));
      return;
    }
    if (password.length < 8) {
      setServerError(passwordErrors.tooShort(8));
      return;
    }
    if (!accepted) {
      toast.error("Accepteer de voorwaarden om verder te gaan.");
      return;
    }

    setLoading(true);
    try {
      const displayName = email.split("@")[0];
      await register(email, password, displayName);
      toast.success("Account aangemaakt! Je bent nu ingelogd.");
      setTimeout(() => navigate("/onboarding"), 400);
    } catch (err: unknown) {
      const supaErr = err as { message?: string; status?: number } | null;
      if (
        supaErr?.message?.toLowerCase().includes("already registered") ||
        supaErr?.message?.toLowerCase().includes("user already registered") ||
        supaErr?.status === 422
      ) {
        setServerError(emailErrors.alreadyExists());
      } else {
        setServerError(getSupabaseAuthError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center px-4 pt-8 pb-12">
      <Seo
        title="Account aanmaken — FitFi"
        description="Maak een gratis FitFi account aan en sla je stijlrapport op."
        path="/registreren"
      />

      <div className="w-full max-w-[400px]">

        <div className="text-center mb-7">
          <h1 className="text-[1.75rem] font-bold tracking-tight text-[var(--color-text)] mb-1.5">
            Account aanmaken
          </h1>
          <p className="text-sm text-[var(--color-muted)]">
            {comingFromResults
              ? "Sla je outfits en shoplinks op."
              : "We vragen alleen wat nodig is."}
          </p>
        </div>

        <form onSubmit={onSubmit} className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-soft)] border border-[var(--color-border)] p-6 space-y-5">

          {serverError && (
            <div>
              <ErrorAlert error={serverError} />
              {isEmailTaken && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <span className="text-[var(--color-text-secondary)]">Al een account?</span>
                  <NavLink
                    to="/inloggen"
                    className="font-semibold text-[var(--ff-color-primary-700)] underline underline-offset-2"
                  >
                    Inloggen
                  </NavLink>
                </div>
              )}
            </div>
          )}

          {/* Email field */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-semibold text-[var(--color-text)]">
              E-mailadres
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)] pointer-events-none" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                enterKeyHint="next"
                placeholder="jij@voorbeeld.nl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                aria-invalid={!!emailError}
                aria-describedby={emailError ? "email-error" : undefined}
                disabled={loading}
                className={`w-full pl-10 pr-4 py-3.5 min-h-[52px] text-base rounded-xl border-2 transition-colors bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-muted)] placeholder:opacity-60 outline-none focus-visible:ring-2 focus-visible:ring-offset-0 ${
                  emailError
                    ? "border-[var(--ff-color-danger-500)] focus-visible:ring-[var(--ff-color-danger-200)]"
                    : "border-[var(--color-border)] focus-visible:border-[var(--ff-color-primary-500)] focus-visible:ring-[var(--ff-color-primary-200)]"
                }`}
              />
            </div>
            {touched.email && emailError && (
              <p id="email-error" className="text-xs font-medium text-[var(--ff-color-danger-600)] flex items-center gap-1.5 mt-1">
                <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>
                <InlineError error={emailError} />
              </p>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-semibold text-[var(--color-text)]">
              Wachtwoord
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)] pointer-events-none" />
              <input
                id="password"
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                enterKeyHint="done"
                placeholder="Minimaal 8 tekens"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                aria-invalid={!!pwError}
                aria-describedby="pw-hint"
                disabled={loading}
                className={`w-full pl-10 pr-12 py-3.5 min-h-[52px] text-base rounded-xl border-2 transition-colors bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-muted)] placeholder:opacity-60 outline-none focus-visible:ring-2 focus-visible:ring-offset-0 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden ${
                  pwError
                    ? "border-[var(--ff-color-danger-500)] focus-visible:ring-[var(--ff-color-danger-200)]"
                    : "border-[var(--color-border)] focus-visible:border-[var(--ff-color-primary-500)] focus-visible:ring-[var(--ff-color-primary-200)]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                tabIndex={-1}
                className="absolute right-0 top-0 h-full w-12 flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors focus-visible:outline-none"
                aria-label={showPw ? "Verberg wachtwoord" : "Toon wachtwoord"}
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {pwData ? (
              <div className="mt-2" aria-live="polite">
                <div className="h-1 bg-[var(--ff-color-neutral-200)] rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ease-out rounded-full ${strengthColors[pwData.score]}`}
                    style={{ width: `${pwData.pct}%` }}
                  />
                </div>
                <p className={`text-xs font-medium mt-1 ${strengthTextColors[pwData.score]}`}>
                  {pwData.label}
                </p>
              </div>
            ) : (
              <p id="pw-hint" className="text-xs text-[var(--color-muted)] mt-1">
                Minimaal 8 tekens, mix van letters en cijfers.
              </p>
            )}

            {touched.password && pwError && (
              <p className="text-xs font-medium text-[var(--ff-color-danger-600)] flex items-center gap-1.5 mt-1">
                <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>
                <InlineError error={pwError} />
              </p>
            )}
          </div>

          {/* Consent — custom checkbox, compact */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="flex-shrink-0 mt-0.5">
                <div
                  role="checkbox"
                  aria-checked={accepted}
                  tabIndex={0}
                  onClick={() => setAccepted(!accepted)}
                  onKeyDown={(e) => (e.key === " " || e.key === "Enter") && setAccepted(!accepted)}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[var(--ff-color-primary-400)] ${
                    accepted
                      ? "bg-[var(--ff-color-primary-700)] border-[var(--ff-color-primary-700)]"
                      : "bg-[var(--color-bg)] border-[var(--color-border)] group-hover:border-[var(--ff-color-primary-400)]"
                  }`}
                >
                  {accepted && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm text-[var(--color-text)] leading-relaxed select-none">
                Ik ga akkoord met de{" "}
                <a
                  href="/algemene-voorwaarden"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[var(--ff-color-primary-700)] underline underline-offset-2 hover:text-[var(--ff-color-primary-600)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  algemene voorwaarden
                </a>{" "}
                en het{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[var(--ff-color-primary-700)] underline underline-offset-2 hover:text-[var(--ff-color-primary-600)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  privacybeleid
                </a>
                .
              </span>
            </label>

            <div className="mt-3 space-y-1.5 pl-8">
              {[
                "Geen spam. Alleen updates die jij aanzet.",
                "We vragen alleen wat nodig is voor je rapport.",
                "Je kunt je account altijd verwijderen.",
              ].map((text) => (
                <div key={text} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--ff-color-success-600)] flex-shrink-0" />
                  <span className="text-xs text-[var(--color-muted)]">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 min-h-[54px] rounded-xl font-semibold text-base transition-all bg-[var(--ff-color-primary-700)] text-white hover:bg-[var(--ff-color-primary-600)] active:scale-[0.98] shadow-sm disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Account aanmaken...</span>
              </>
            ) : (
              <>
                <span>Account aanmaken</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative flex items-center gap-3">
            <div className="flex-1 border-t border-[var(--color-border)]" />
            <span className="text-xs text-[var(--color-muted)] font-medium whitespace-nowrap">Al een account?</span>
            <div className="flex-1 border-t border-[var(--color-border)]" />
          </div>

          {/* Login link */}
          <NavLink
            to="/inloggen"
            className="w-full flex items-center justify-center gap-2 py-3.5 min-h-[52px] rounded-xl font-semibold text-base border-2 border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--ff-color-primary-400)] hover:bg-[var(--ff-color-primary-50)] active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2"
          >
            Ik heb al een account
            <ArrowRight className="w-5 h-5" />
          </NavLink>
        </form>

        {/* Skip to quiz */}
        <div className="mt-4 rounded-xl bg-[var(--ff-color-primary-50)] border border-[var(--ff-color-primary-200)] p-4">
          <p className="text-sm font-semibold text-[var(--ff-color-primary-900)] mb-0.5">
            Nog geen account nodig?
          </p>
          <p className="text-xs text-[var(--ff-color-primary-700)] mb-3">
            Doe de stijlquiz direct — geen registratie vereist.
          </p>
          <NavLink
            to="/onboarding"
            className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white border border-[var(--ff-color-primary-300)] text-[var(--ff-color-primary-700)] font-semibold text-sm hover:bg-[var(--ff-color-primary-100)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2"
          >
            Start de quiz zonder account
            <ArrowRight className="w-4 h-4 flex-shrink-0" />
          </NavLink>
        </div>

        {/* Trust strip */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-[var(--color-text-secondary)]">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[var(--ff-color-success-600)] flex-shrink-0" />
            <span>GDPR-compliant</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[var(--ff-color-success-600)] flex-shrink-0" />
            <span>Veilige opslag</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--ff-color-success-600)] flex-shrink-0" />
            <span>Geen spam</span>
          </div>
        </div>

        <div className="mt-3 text-center">
          <NavLink
            to="/contact"
            className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] underline transition-colors"
          >
            Vragen? Neem contact op
          </NavLink>
        </div>

      </div>
    </main>
  );
};

export default RegisterPage;
