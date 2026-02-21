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
  "bg-red-400",
  "bg-orange-400",
  "bg-yellow-400",
  "bg-green-400",
  "bg-emerald-500",
] as const;

const strengthTextColors = [
  "text-red-600",
  "text-orange-600",
  "text-yellow-600",
  "text-green-600",
  "text-emerald-600",
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
    <main className="min-h-screen bg-gradient-to-b from-[var(--color-bg)] to-[var(--ff-color-primary-50)] flex items-center justify-center px-4 py-8 sm:py-12">
      <Seo
        title="Account aanmaken — FitFi"
        description="Maak een gratis FitFi account aan en sla je stijlrapport op."
        path="/registreren"
      />

      <div className="w-full max-w-md">

        {/* Context banner — rapport opslaan */}
        <div className="mb-6 flex items-start gap-3 px-5 py-4 bg-[var(--ff-color-primary-50)] border border-[var(--ff-color-primary-200)] rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-[var(--ff-color-primary-100)] flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-[var(--ff-color-primary-700)]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--ff-color-primary-900)] leading-snug">
              {comingFromResults
                ? "Sla je stijlrapport op"
                : "Jouw stijlprofiel, altijd bij je"}
            </p>
            <p className="text-sm text-[var(--ff-color-primary-700)] mt-0.5 leading-snug">
              Maak een account zodat we je outfits en shoplinks kunnen bewaren.
            </p>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] mb-2">
            Account aanmaken
          </h1>
          <p className="text-base text-[var(--color-text-secondary)]">
            Alleen je e-mailadres en een wachtwoord — meer niet.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-[var(--color-border)] overflow-hidden">
          <form onSubmit={onSubmit} className="p-6 sm:p-8 space-y-5">

            {/* Server error with inline recovery */}
            {serverError && (
              <div>
                <ErrorAlert error={serverError} />
                {isEmailTaken && (
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <span className="text-[var(--color-text-secondary)]">Al een account?</span>
                    <NavLink
                      to="/login"
                      className="font-semibold text-[var(--ff-color-primary-700)] hover:text-[var(--ff-color-primary-600)] underline underline-offset-2 transition-colors"
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
                className="block text-sm font-semibold text-[var(--color-text)] mb-2"
              >
                E-mailadres
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="jij@voorbeeld.nl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched({ ...touched, email: true })}
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? "email-error" : undefined}
                  disabled={loading}
                  className={`w-full pl-11 pr-4 py-3.5 min-h-[48px] text-base rounded-xl border-2 transition-colors outline-none ${
                    emailError
                      ? "border-red-400 focus-visible:border-red-500 focus-visible:shadow-[0_0_0_3px_rgba(239,68,68,0.2)]"
                      : "border-gray-200 focus-visible:border-[var(--ff-color-primary-500)] focus-visible:shadow-[0_0_0_3px_rgba(var(--ff-color-primary-rgb,90,101,210),0.15)]"
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
                className="block text-sm font-semibold text-[var(--color-text)] mb-2"
              >
                Wachtwoord
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
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
                  className={`w-full pl-11 pr-12 py-3.5 min-h-[48px] text-base rounded-xl border-2 transition-colors outline-none ${
                    pwError
                      ? "border-red-400 focus-visible:border-red-500 focus-visible:shadow-[0_0_0_3px_rgba(239,68,68,0.2)]"
                      : "border-gray-200 focus-visible:border-[var(--ff-color-primary-500)] focus-visible:shadow-[0_0_0_3px_rgba(var(--ff-color-primary-rgb,90,101,210),0.15)]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-100 active:scale-95 transition-all min-w-[36px] min-h-[36px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)]"
                  aria-label={showPw ? "Verberg wachtwoord" : "Toon wachtwoord"}
                >
                  {showPw ? (
                    <EyeOff className="w-5 h-5 text-gray-500" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              </div>

              {/* Strength meter — token-safe colors */}
              {pwData && (
                <div className="mt-3" aria-live="polite">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ease-out rounded-full ${strengthColors[pwData.score]}`}
                      style={{ width: `${pwData.pct}%` }}
                    />
                  </div>
                  <p className={`text-xs font-semibold mt-1.5 ${strengthTextColors[pwData.score]}`}>
                    {pwData.label}
                  </p>
                </div>
              )}

              {/* Hint when field is empty/short */}
              {!pwData && (
                <p id="pw-hint" className="mt-1.5 text-xs text-[var(--color-text-secondary)]">
                  Gebruik minimaal 8 tekens. Een mix van letters en cijfers werkt het best.
                </p>
              )}

              <span id="pw-error">
                <InlineError error={pwError} />
              </span>
            </div>

            {/* Consent */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="w-5 h-5 mt-0.5 flex-shrink-0 rounded border-2 border-gray-300 text-[var(--ff-color-primary-600)] focus:ring-[var(--ff-color-primary-500)] cursor-pointer"
                />
                <span className="text-sm text-gray-700 leading-relaxed select-none">
                  Ik ga akkoord met de{" "}
                  <NavLink
                    to="/voorwaarden"
                    className="font-semibold text-[var(--ff-color-primary-700)] hover:text-[var(--ff-color-primary-600)] underline underline-offset-2"
                  >
                    voorwaarden
                  </NavLink>{" "}
                  en het{" "}
                  <NavLink
                    to="/privacy"
                    className="font-semibold text-[var(--ff-color-primary-700)] hover:text-[var(--ff-color-primary-600)] underline underline-offset-2"
                  >
                    privacybeleid
                  </NavLink>
                  .
                </span>
              </label>
              <ul className="mt-3 space-y-1.5 pl-8">
                <li className="flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                  Geen spam. Alleen updates die jij aanzet.
                </li>
                <li className="flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                  We vragen alleen wat nodig is voor je rapport.
                </li>
                <li className="flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                  Je kunt je account altijd verwijderen.
                </li>
              </ul>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] active:scale-[0.98] text-white py-4 min-h-[52px] rounded-xl font-bold text-base shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2"
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
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  Al een account?
                </span>
              </div>
            </div>

            {/* Login CTA */}
            <NavLink
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[52px] w-full border-2 border-[var(--color-border)] hover:border-[var(--ff-color-primary-400)] text-[var(--color-text)] font-semibold text-base rounded-xl hover:bg-[var(--ff-color-primary-50)] active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2"
            >
              Ik heb al een account
              <ArrowRight className="w-5 h-5" />
            </NavLink>

            {/* Microcopy */}
            <p className="text-center text-xs text-[var(--color-text-secondary)] leading-relaxed">
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
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[var(--color-text-secondary)]">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
            <span>GDPR-compliant</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
            <span>Veilige opslag</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
            <span>Geen spam</span>
          </div>
        </div>

        {/* Help */}
        <div className="mt-4 text-center">
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
