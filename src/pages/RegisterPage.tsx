import React, { useState } from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import {
  Eye, EyeOff, CheckCircle2, Mail,
  Shield, Lock, ArrowRight, Loader2, FileText
} from "lucide-react";
import Button from "@/components/ui/Button";
import Seo from "@/components/seo/Seo";
import { useUser } from "@/context/UserContext";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
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

  const canSubmit = isEmail(email) && password.length >= 8 && accepted && !loading;

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
      const success = await register(email, password, displayName);

      if (success) {
        toast.success("Account aangemaakt! Je bent nu ingelogd.");
        setTimeout(() => navigate("/onboarding"), 400);
      } else {
        setServerError(emailErrors.alreadyExists());
      }
    } catch (err) {
      setServerError(getSupabaseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center px-4 pt-6 pb-10">
      <Seo
        title="Account aanmaken — FitFi"
        description="Maak een gratis FitFi account aan en sla je stijlrapport op."
        path="/registreren"
      />

      <div className="w-full max-w-[420px]">

        {/* Page heading */}
        <div className="text-center mb-5">
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-1">
            Account aanmaken
          </h1>
          <p className="text-sm text-[var(--color-muted)]">
            {comingFromResults
              ? "Sla je outfits en shoplinks op."
              : "We vragen alleen wat nodig is."}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-soft)] border border-[var(--color-border)]">
          <form onSubmit={onSubmit} className="p-5 space-y-4">

            {/* Server error */}
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

            {/* Social login */}
            <SocialLoginButtons
              mode="register"
              onSuccess={() => {
                toast.success("Account succesvol aangemaakt!");
                navigate("/onboarding");
              }}
            />

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-[var(--color-text)] mb-1.5"
              >
                E-mailadres
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)] pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="jij@voorbeeld.nl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched({ ...touched, email: true })}
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? "email-error" : undefined}
                  disabled={loading}
                  className={`w-full pl-10 pr-4 py-3 min-h-[48px] text-base rounded-xl border transition-colors bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-muted)] outline-none focus-visible:ring-2 focus-visible:ring-offset-0 ${
                    emailError
                      ? "border-[var(--ff-color-danger-500)] focus-visible:ring-[var(--ff-color-danger-200)]"
                      : "border-[var(--color-border)] focus-visible:border-[var(--ff-color-primary-500)] focus-visible:ring-[var(--ff-color-primary-200)]"
                  }`}
                />
              </div>
              <span id="email-error">
                <InlineError error={emailError} />
              </span>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-[var(--color-text)] mb-1.5"
              >
                Wachtwoord
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)] pointer-events-none" />
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Minimaal 8 tekens"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched({ ...touched, password: true })}
                  aria-invalid={!!pwError}
                  aria-describedby="pw-hint pw-error"
                  disabled={loading}
                  className={`w-full pl-10 pr-11 py-3 min-h-[48px] text-base rounded-xl border transition-colors bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-muted)] outline-none focus-visible:ring-2 focus-visible:ring-offset-0 ${
                    pwError
                      ? "border-[var(--ff-color-danger-500)] focus-visible:ring-[var(--ff-color-danger-200)]"
                      : "border-[var(--color-border)] focus-visible:border-[var(--ff-color-primary-500)] focus-visible:ring-[var(--ff-color-primary-200)]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-2.5 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--ff-color-primary-50)] active:scale-95 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-400)]"
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
                <p id="pw-hint" className="mt-1.5 text-xs text-[var(--color-text-secondary)]">
                  Gebruik minimaal 8 tekens. Een mix van letters en cijfers werkt het best.
                </p>
              )}

              <span id="pw-error">
                <InlineError error={pwError} />
              </span>
            </div>

            {/* Consent block */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <div className="flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                    className="w-5 h-5 rounded border-2 border-gray-300 accent-[var(--ff-color-primary-600)] cursor-pointer"
                  />
                </div>
                <span className="text-sm text-[var(--color-text)] leading-relaxed select-none">
                  Ik ga akkoord met de{" "}
                  <NavLink
                    to="/algemene-voorwaarden"
                    className="font-semibold text-[var(--ff-color-primary-700)] underline underline-offset-2"
                  >
                    algemene voorwaarden
                  </NavLink>{" "}
                  en het{" "}
                  <NavLink
                    to="/privacy"
                    className="font-semibold text-[var(--ff-color-primary-700)] underline underline-offset-2"
                  >
                    privacybeleid
                  </NavLink>
                  .
                </span>
              </label>

              <ul className="mt-3 space-y-2 pl-8">
                {[
                  "Geen spam. Alleen updates die jij aanzet.",
                  "We vragen alleen wat nodig is voor je rapport.",
                  "Je kunt je account altijd verwijderen.",
                ].map((text) => (
                  <li key={text} className="flex items-start gap-2 text-xs text-[var(--color-muted)]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--ff-color-success-600)] flex-shrink-0 mt-0.5" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full flex items-center justify-center gap-2 py-3.5 min-h-[52px] rounded-xl font-semibold text-base transition-all bg-[var(--ff-color-primary-700)] text-white hover:bg-[var(--ff-color-primary-600)] active:scale-[0.98] shadow-sm disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2"
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
            <div className="relative flex items-center gap-3 py-1">
              <div className="flex-1 border-t border-[var(--color-border)]" />
              <span className="text-xs text-[var(--color-muted)] font-medium whitespace-nowrap">Al een account?</span>
              <div className="flex-1 border-t border-[var(--color-border)]" />
            </div>

            {/* Login CTA */}
            <NavLink
              to="/inloggen"
              className="w-full flex items-center justify-center gap-2 py-3.5 min-h-[52px] rounded-xl font-semibold text-base border-2 border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--ff-color-primary-400)] hover:bg-[var(--ff-color-primary-50)] active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2"
            >
              Ik heb al een account
              <ArrowRight className="w-5 h-5" />
            </NavLink>

            {/* Microcopy */}
            <p className="text-center text-xs text-[var(--color-text-secondary)] leading-relaxed pt-1">
              Geen account nodig om de quiz te doen.{" "}
              <NavLink
                to="/"
                className="font-medium text-[var(--ff-color-primary-700)] hover:underline"
              >
                Terug naar start
              </NavLink>
            </p>
          </form>
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

        {/* Help */}
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
