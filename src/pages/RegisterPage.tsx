import React, { useState } from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Shield, Lock, ArrowRight, Loader as Loader2, CircleCheck as CheckCircle2, Sparkles } from "lucide-react";
import Seo from "@/components/seo/Seo";
import { useUser } from "@/context/UserContext";
import toast from "react-hot-toast";
import {
  emailErrors, passwordErrors, getSupabaseAuthError,
  type ErrorMessage,
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

const strengthBarColors = [
  "bg-[var(--ff-color-danger-500)]",
  "bg-[var(--ff-color-danger-500)]",
  "bg-[var(--ff-color-warning-600)]",
  "bg-[var(--ff-color-success-600)]",
  "bg-[var(--ff-color-success-600)]",
] as const;

const strengthTextColors = [
  "text-[var(--ff-color-danger-600)]",
  "text-[var(--ff-color-danger-600)]",
  "text-[var(--ff-color-warning-600)]",
  "text-[var(--ff-color-success-600)]",
  "text-[var(--ff-color-success-600)]",
] as const;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useUser();
  const fromPath = (location.state as { from?: string })?.from;

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

  const isEmailTaken = serverError?.title === "E-mailadres al in gebruik";

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
    <>
      <Seo
        title="Account aanmaken — FitFi"
        description="Maak een gratis FitFi account aan en sla je stijlrapport op."
        path="/registreren"
      />

      <div
        className="w-full"
        style={{
          minHeight: "calc(100vh - 64px)",
          background: "var(--color-bg)",
        }}
      >
        <div
          className="w-full border-b border-[var(--color-border)]"
          style={{
            background: "linear-gradient(160deg, var(--ff-color-primary-50) 0%, var(--color-bg) 100%)",
          }}
        >
          <div className="max-w-[400px] mx-auto px-4 pt-10 pb-7 text-center">
            <span
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase mb-4"
              style={{
                background: "var(--ff-color-primary-100)",
                color: "var(--ff-color-primary-700)",
                border: "1px solid var(--ff-color-primary-200)",
              }}
            >
              <Sparkles className="w-3 h-3" aria-hidden="true" />
              Gratis starten
            </span>
            <h1
              className="font-heading font-bold tracking-tight text-[var(--color-text)] mb-2"
              style={{ fontSize: "clamp(1.6rem, 5vw, 2.25rem)", lineHeight: 1.1 }}
            >
              {comingFromResults ? "Sla je resultaten op" : "Account aanmaken"}
            </h1>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">
              {comingFromResults
                ? "Bewaar je outfits en shoplinks voor later."
                : "We vragen alleen wat echt nodig is."}
            </p>
          </div>
        </div>

        <div className="max-w-[400px] mx-auto px-4 pt-6 pb-12">
          <form
            onSubmit={onSubmit}
            noValidate
            aria-label="Registratieformulier"
            className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-soft)] border border-[var(--color-border)] p-6 space-y-5"
          >
            {serverError && (
              <div>
                <ErrorAlert error={serverError} />
                {isEmailTaken && (
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <span className="text-[var(--color-muted)]">Al een account?</span>
                    <NavLink
                      to="/inloggen"
                      className="font-semibold text-[var(--ff-color-primary-700)] underline underline-offset-2 hover:text-[var(--ff-color-primary-600)]"
                    >
                      Inloggen
                    </NavLink>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="reg-email" className="block text-sm font-semibold text-[var(--color-text)]">
                E-mailadres
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)] pointer-events-none" aria-hidden="true" />
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  enterKeyHint="next"
                  placeholder="jij@voorbeeld.nl"
                  value={email}
                  autoFocus
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? "reg-email-error" : undefined}
                  disabled={loading}
                  className={`w-full pl-10 pr-4 py-3.5 min-h-[52px] text-base rounded-xl border-2 transition-colors bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-muted)] placeholder:opacity-60 outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:opacity-50 ${
                    emailError
                      ? "border-[var(--ff-color-danger-500)] focus-visible:ring-[var(--ff-color-danger-200)]"
                      : "border-[var(--color-border)] focus-visible:border-[var(--ff-color-primary-500)] focus-visible:ring-[var(--ff-color-primary-200)]"
                  }`}
                />
              </div>
              {touched.email && emailError && (
                <p id="reg-email-error" role="alert" className="text-xs font-medium text-[var(--ff-color-danger-600)] flex items-center gap-1.5 mt-1">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                  </svg>
                  <InlineError error={emailError} />
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-password" className="block text-sm font-semibold text-[var(--color-text)]">
                Wachtwoord
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)] pointer-events-none" aria-hidden="true" />
                <input
                  id="reg-password"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  enterKeyHint="done"
                  placeholder="Minimaal 8 tekens"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  aria-invalid={!!pwError}
                  aria-describedby="reg-pw-hint"
                  disabled={loading}
                  className={`w-full pl-10 pr-12 py-3.5 min-h-[52px] text-base rounded-xl border-2 transition-colors bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-muted)] placeholder:opacity-60 outline-none focus-visible:ring-2 focus-visible:ring-offset-0 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden disabled:opacity-50 ${
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
                  <div className="h-1 bg-[var(--ff-color-primary-100)] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ease-out rounded-full ${strengthBarColors[pwData.score]}`}
                      style={{ width: `${pwData.pct}%` }}
                    />
                  </div>
                  <p className={`text-xs font-medium mt-1 ${strengthTextColors[pwData.score]}`}>
                    {pwData.label}
                  </p>
                </div>
              ) : (
                <p id="reg-pw-hint" className="text-xs text-[var(--color-muted)] mt-1">
                  Minimaal 8 tekens, mix van letters en cijfers.
                </p>
              )}

              {touched.password && pwError && (
                <p role="alert" className="text-xs font-medium text-[var(--ff-color-danger-600)] flex items-center gap-1.5 mt-1">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                  </svg>
                  <InlineError error={pwError} />
                </p>
              )}
            </div>

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
                      <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--ff-color-success-600)] flex-shrink-0" aria-hidden="true" />
                    <span className="text-xs text-[var(--color-muted)]">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 min-h-[54px] rounded-xl font-semibold text-base transition-all bg-[var(--ff-color-primary-700)] text-white hover:bg-[var(--ff-color-primary-600)] active:scale-[0.98] shadow-sm disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                  <span>Account aanmaken...</span>
                </>
              ) : (
                <>
                  <span>Account aanmaken</span>
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </>
              )}
            </button>

            <div className="relative flex items-center gap-3">
              <div className="flex-1 border-t border-[var(--color-border)]" />
              <span className="text-xs text-[var(--color-muted)] font-medium whitespace-nowrap">Al een account?</span>
              <div className="flex-1 border-t border-[var(--color-border)]" />
            </div>

            <NavLink
              to="/inloggen"
              className="w-full flex items-center justify-center gap-2 py-3.5 min-h-[52px] rounded-xl font-semibold text-base border-2 border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--ff-color-primary-400)] hover:bg-[var(--ff-color-primary-50)] active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2"
            >
              Ik heb al een account
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </NavLink>
          </form>

          <div className="mt-4 rounded-xl bg-[var(--ff-color-primary-50)] border border-[var(--ff-color-primary-200)] p-4">
            <p className="text-sm font-semibold text-[var(--ff-color-primary-900)] mb-0.5 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
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
              <ArrowRight className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            </NavLink>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-[var(--color-muted)]">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[var(--ff-color-success-600)] flex-shrink-0" aria-hidden="true" />
              <span>GDPR-compliant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[var(--ff-color-success-600)] flex-shrink-0" aria-hidden="true" />
              <span>Veilige opslag</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--ff-color-success-600)] flex-shrink-0" aria-hidden="true" />
              <span>Geen spam</span>
            </div>
          </div>

          <div className="mt-3 text-center">
            <NavLink
              to="/contact"
              className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] underline transition-colors"
            >
              Vragen? Neem contact op
            </NavLink>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
