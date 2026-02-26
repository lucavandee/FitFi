import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import {
  Eye,
  EyeOff,
  CheckCircle2,
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

  const canSubmit = !loading;

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
    <main className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center px-3 sm:px-4 py-8 sm:py-12">
      <Seo
        title="Inloggen — FitFi"
        description="Log in om je stijlrapport en outfits terug te zien."
        path="/inloggen"
      />

      <div className="w-full max-w-[400px]">

        {/* Results context banner */}
        {comingFromResults && (
          <div className="mb-5 flex items-start gap-3 px-4 py-3.5 bg-[var(--ff-color-primary-50)] border border-[var(--ff-color-primary-200)] rounded-2xl">
            <div className="w-8 h-8 rounded-lg bg-[var(--ff-color-primary-100)] flex items-center justify-center flex-shrink-0 mt-0.5">
              <FileText className="w-4 h-4 text-[var(--ff-color-primary-700)]" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--ff-color-primary-900)] leading-snug">
                Log in om je stijlrapport terug te zien.
              </p>
              <p className="text-xs text-[var(--ff-color-primary-700)] mt-0.5 leading-relaxed">
                Je outfits, combinaties en shoplinks wachten op je.
              </p>
            </div>
          </div>
        )}

        {/* Heading — compact on mobile */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight mb-1.5">
            Je bent bijna binnen.
          </h1>
          <p className="text-sm text-[var(--color-muted)]">
            Log in om je stijladvies en outfits terug te zien.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-soft)] border border-[var(--color-border)]">
          <form
            onSubmit={onSubmit}
            noValidate
            className="p-5 sm:p-6 space-y-4 sm:space-y-5"
            aria-label="Inlogformulier"
          >

            {/* Server error */}
            {serverError && (
              <div>
                <ErrorAlert error={serverError} />
                {isCredentialError && (
                  <div className="mt-2.5 flex items-center gap-2 text-sm">
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
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="block text-sm font-semibold text-[var(--color-text)]"
              >
                E-mailadres
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                inputMode="email"
                enterKeyHint="next"
                placeholder="jij@voorbeeld.nl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                aria-invalid={!!emailError}
                aria-describedby={emailError ? "login-email-error" : undefined}
                disabled={loading}
                className={`w-full px-4 py-3.5 min-h-[52px] text-base rounded-xl border-2 transition-colors outline-none bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-muted)] placeholder:opacity-60 ${
                  emailError
                    ? "border-[var(--ff-color-danger-500)] focus:border-[var(--ff-color-danger-600)] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]"
                    : "border-[var(--color-border)] focus:border-[var(--ff-color-primary-500)] focus:shadow-[0_0_0_3px_var(--overlay-primary-12a)]"
                } disabled:opacity-50`}
              />
              {touched.email && emailError && (
                <p id="login-email-error" role="alert" className="text-xs font-medium text-[var(--ff-color-danger-600)] flex items-center gap-1.5 mt-1">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>
                  <InlineError error={emailError} />
                </p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-password"
                className="block text-sm font-semibold text-[var(--color-text)]"
              >
                Wachtwoord
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)] pointer-events-none" />
                <input
                  id="login-password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  enterKeyHint="done"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  aria-invalid={!!pwError}
                  aria-describedby={pwError ? "login-pw-error" : undefined}
                  disabled={loading}
                  className={`w-full pl-10 pr-12 py-3.5 min-h-[52px] text-base rounded-xl border-2 transition-colors outline-none bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-muted)] placeholder:opacity-60 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden ${
                    pwError
                      ? "border-[var(--ff-color-danger-500)] focus:border-[var(--ff-color-danger-600)] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]"
                      : "border-[var(--color-border)] focus:border-[var(--ff-color-primary-500)] focus:shadow-[0_0_0_3px_var(--overlay-primary-12a)]"
                  } disabled:opacity-50`}
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
              {touched.password && pwError && (
                <p id="login-pw-error" role="alert" className="text-xs font-medium text-[var(--ff-color-danger-600)] flex items-center gap-1.5 mt-1">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>
                  <InlineError error={pwError} />
                </p>
              )}
              {/* Forgot password — below the field, not colliding with label */}
              <div className="flex justify-end pt-0.5">
                <NavLink
                  to="/wachtwoord-vergeten"
                  className="text-xs font-medium text-[var(--ff-color-primary-700)] hover:text-[var(--ff-color-primary-600)] transition-colors underline underline-offset-2"
                >
                  Wachtwoord vergeten?
                </NavLink>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full flex items-center justify-center gap-2 bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white py-3.5 min-h-[52px] rounded-xl font-semibold text-sm tracking-wide shadow-sm hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" aria-hidden="true" />
                  <span>Bezig...</span>
                </>
              ) : (
                <>
                  <span>Inloggen</span>
                  <ArrowRight className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                </>
              )}
            </button>

            {/* Register CTA — prominent, not hidden behind a divider */}
            <div className="pt-1 border-t border-[var(--color-border)]">
              <p className="text-xs text-center text-[var(--color-muted)] mb-3 mt-3">
                Nog geen account?
              </p>
              <NavLink
                to="/registreren"
                className="flex items-center justify-center gap-2 w-full px-5 py-3.5 min-h-[52px] border-2 border-[var(--color-border)] hover:border-[var(--ff-color-primary-500)] text-[var(--color-text)] hover:text-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-50)] font-semibold text-sm rounded-xl active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2"
              >
                <span>Maak gratis account aan</span>
                <ArrowRight className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              </NavLink>
            </div>

            {/* Quiz CTA */}
            <div className="rounded-xl bg-[var(--ff-color-primary-50)] border border-[var(--ff-color-primary-200)] p-4 flex flex-col gap-2">
              <p className="text-xs font-semibold text-[var(--ff-color-primary-900)]">
                Nog geen account nodig?
              </p>
              <p className="text-xs text-[var(--ff-color-primary-700)] leading-relaxed">
                Doe de stijlquiz direct — geen registratie vereist.
              </p>
              <NavLink
                to="/onboarding"
                className="mt-1 inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white border border-[var(--ff-color-primary-300)] text-[var(--ff-color-primary-700)] font-semibold text-sm hover:bg-[var(--ff-color-primary-100)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2"
              >
                Start de quiz zonder account
                <ArrowRight className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              </NavLink>
            </div>

          </form>
        </div>

        {/* Trust badges */}
        <div className="mt-5 flex items-center justify-center gap-4 text-xs text-[var(--color-muted)]">
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
