import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import {
  Eye,
  EyeOff,
  CheckCircle2,
  Mail,
  Shield,
  Lock,
  ArrowRight,
  Loader2,
  FileText,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import toast from "react-hot-toast";
import { SecurityLogger } from "@/services/security/securityLogger";
import {
  emailErrors,
  passwordErrors,
  getSupabaseAuthError,
  type ErrorMessage,
} from "@/utils/formErrors";
import { InlineError, ErrorAlert } from "@/components/ui/ErrorAlert";

function isEmail(v: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
}

export default function LoginPage() {
  const nav = useNavigate();
  const location = useLocation();
  const { login } = useUser();
  const fromPath = (location.state as { from?: string })?.from;

  const comingFromResults =
    typeof fromPath === "string" && fromPath.startsWith("/results");

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [remember, setRemember] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState<ErrorMessage | null>(null);
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

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

  const canSubmit = isEmail(email) && password.length >= 8 && !loading;

  const isCredentialError =
    serverError?.icon === "AlertCircle" &&
    (serverError.title.toLowerCase().includes("onjuist") ||
      serverError.title.toLowerCase().includes("ongeldig") ||
      serverError.title.toLowerCase().includes("incorrect") ||
      serverError.title.toLowerCase().includes("inloggegevens"));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!canSubmit) return;

    setLoading(true);
    setServerError(null);

    try {
      const success = await login(email, password);

      if (success) {
        setTimeout(async () => {
          try {
            const { getSupabase } = await import("@/lib/supabase");
            const client = getSupabase();
            const { data: { user: authUser } } = await client.auth.getUser();
            if (!authUser) {
              nav(fromPath || "/dashboard");
              return;
            }
            await SecurityLogger.logLoginSuccess(authUser.id);
            const { data: profile } = await client
              .from("profiles")
              .select("is_admin")
              .eq("id", authUser.id)
              .maybeSingle();
            if (profile?.is_admin === true) {
              nav("/admin");
            } else {
              nav(fromPath || "/dashboard");
            }
          } catch {
            nav(fromPath || "/dashboard");
          }
        }, 200);
      } else {
        await SecurityLogger.logLoginFailure(email, "invalid_credentials");
        setServerError(passwordErrors.incorrect());
      }
    } catch (err) {
      await SecurityLogger.logLoginFailure(email, "system_error");
      setServerError(getSupabaseAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4 py-10 sm:py-16">
      <Seo
        title="Inloggen — FitFi"
        description="Log in om je stijlrapport en outfits terug te zien."
        path="/inloggen"
      />

      <div className="w-full max-w-[420px]">

        {/* Results context banner */}
        {comingFromResults && (
          <div className="mb-6 flex items-start gap-3 px-4 py-4 bg-[var(--ff-color-primary-50)] border border-[var(--ff-color-primary-200)] rounded-2xl">
            <div className="w-9 h-9 rounded-xl bg-[var(--ff-color-primary-100)] flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-[var(--ff-color-primary-700)]" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--ff-color-primary-900)] leading-snug">
                Log in om je stijlrapport terug te zien.
              </p>
              <p className="text-sm text-[var(--ff-color-primary-700)] mt-0.5 leading-snug">
                Je outfits, combinaties en shoplinks wachten op je.
              </p>
            </div>
          </div>
        )}

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] tracking-tight mb-2">
            Je bent bijna binnen.
          </h1>
          <p className="text-base text-[var(--color-muted)]">
            Log in om je stijladvies en outfits terug te zien.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-soft)] border border-[var(--color-border)]">
          <form
            onSubmit={onSubmit}
            noValidate
            className="p-7 space-y-5"
            aria-label="Inlogformulier"
          >

            {/* Server error */}
            {serverError && (
              <div>
                <ErrorAlert error={serverError} />
                {isCredentialError && (
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <span className="text-[var(--color-muted)]">Wachtwoord vergeten?</span>
                    <NavLink
                      to="/wachtwoord-vergeten"
                      className="font-semibold text-[var(--ff-color-primary-700)] hover:text-[var(--ff-color-primary-600)] underline underline-offset-2 transition-colors"
                    >
                      Stuur resetlink
                    </NavLink>
                  </div>
                )}
              </div>
            )}

            <SocialLoginButtons
              mode="login"
              onSuccess={() => {
                toast.success("Welkom terug!");
                nav(fromPath || "/dashboard");
              }}
            />

            {/* Email field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-[var(--color-text)] mb-1.5"
              >
                E-mailadres
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)] pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="jij@voorbeeld.nl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? "email-error" : undefined}
                  disabled={loading}
                  className={`w-full pl-10 pr-4 py-3 min-h-[48px] text-base rounded-xl border transition-colors outline-none bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-muted)] placeholder:opacity-50 ${
                    emailError
                      ? "border-[var(--ff-color-danger-500)] focus:border-[var(--ff-color-danger-600)] focus:shadow-[0_0_0_3px_var(--ff-color-danger-100)]"
                      : "border-[var(--color-border)] focus:border-[var(--ff-color-primary-500)] focus:shadow-[0_0_0_3px_var(--overlay-primary-12a)]"
                  } disabled:opacity-50`}
                />
              </div>
              <span id="email-error">
                <InlineError error={emailError} />
              </span>
            </div>

            {/* Password field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-[var(--color-text)]"
                >
                  Wachtwoord
                </label>
                <NavLink
                  to="/wachtwoord-vergeten"
                  className="text-xs font-medium text-[var(--ff-color-primary-700)] hover:text-[var(--ff-color-primary-600)] transition-colors hover:underline underline-offset-2"
                >
                  Wachtwoord vergeten?
                </NavLink>
              </div>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)] pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  aria-invalid={!!pwError}
                  aria-describedby={pwError ? "pw-error" : undefined}
                  disabled={loading}
                  className={`w-full pl-10 pr-11 py-3 min-h-[48px] text-base rounded-xl border transition-colors outline-none bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-muted)] placeholder:opacity-50 ${
                    pwError
                      ? "border-[var(--ff-color-danger-500)] focus:border-[var(--ff-color-danger-600)] focus:shadow-[0_0_0_3px_var(--ff-color-danger-100)]"
                      : "border-[var(--color-border)] focus:border-[var(--ff-color-primary-500)] focus:shadow-[0_0_0_3px_var(--overlay-primary-12a)]"
                  } disabled:opacity-50`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--ff-color-primary-50)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-400)]"
                  aria-label={showPw ? "Verberg wachtwoord" : "Toon wachtwoord"}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span id="pw-error">
                <InlineError error={pwError} />
              </span>
            </div>

            {/* Remember me — custom styled */}
            <label className="flex items-center gap-3 cursor-pointer select-none w-fit group">
              <div className="relative flex-shrink-0">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                  remember
                    ? "bg-[var(--ff-color-primary-700)] border-[var(--ff-color-primary-700)]"
                    : "bg-[var(--color-surface)] border-[var(--color-border)] group-hover:border-[var(--ff-color-primary-400)]"
                }`}>
                  {remember && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 10" fill="none" aria-hidden="true">
                      <path d="M1 5l3.5 3.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm text-[var(--color-text)] font-medium">
                Onthoud mij
              </span>
            </label>

            {/* Submit button */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full flex items-center justify-center gap-2 bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold text-sm tracking-wide shadow-sm hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                  <span>Bezig...</span>
                </>
              ) : (
                <>
                  <span>Inloggen</span>
                  <ArrowRight className="w-4 h-4 flex-shrink-0" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative" aria-hidden="true">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--color-border)]" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-[var(--color-surface)] text-xs text-[var(--color-muted)] font-medium">
                  Geen account?
                </span>
              </div>
            </div>

            {/* Register CTA */}
            <NavLink
              to="/registreren"
              className="flex items-center justify-center gap-2 w-full px-5 py-3.5 border border-[var(--color-border)] hover:border-[var(--ff-color-primary-400)] text-[var(--color-text)] hover:text-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-50)] font-semibold text-sm rounded-xl active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2"
            >
              <span>Maak account aan en start direct</span>
              <ArrowRight className="w-4 h-4 flex-shrink-0" />
            </NavLink>

            <p className="text-center text-xs text-[var(--color-muted)]">
              Gewoon verkennen?{" "}
              <NavLink
                to="/onboarding"
                className="font-medium text-[var(--ff-color-primary-700)] hover:underline underline-offset-2"
              >
                Start de quiz zonder account
              </NavLink>
            </p>

          </form>
        </div>

        {/* Trust badges */}
        <div className="mt-6 flex items-center justify-center gap-5 text-xs text-[var(--color-muted)]">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[var(--ff-color-success-600)] flex-shrink-0" aria-hidden="true" />
            <span>GDPR-compliant</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[var(--ff-color-success-600)] flex-shrink-0" aria-hidden="true" />
            <span>256-bit encryptie</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--ff-color-success-600)] flex-shrink-0" aria-hidden="true" />
            <span>Jouw data</span>
          </div>
        </div>

        <div className="mt-4 text-center">
          <NavLink
            to="/contact"
            className="text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] underline underline-offset-2 transition-colors"
          >
            Hulp nodig bij inloggen?
          </NavLink>
        </div>

      </div>
    </main>
  );
}
