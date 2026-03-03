import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import { Eye, EyeOff, CircleCheck as CheckCircle2, Shield, Lock, ArrowRight, Loader as Loader2, FileText, Sparkles, Mail } from "lucide-react";
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
            const {
              data: { user: authUser },
            } = await client.auth.getUser();
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
    <>
      <Seo
        title="Inloggen — FitFi"
        description="Log in om je stijlrapport en outfits terug te zien."
        path="/inloggen"
        noindex
      />

      <div
        className="w-full"
        style={{ minHeight: "calc(100vh - 64px)", background: "var(--color-bg)" }}
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
              Persoonlijk stijladvies
            </span>
            <h1
              className="font-heading font-bold tracking-tight text-[var(--color-text)] mb-2"
              style={{ fontSize: "clamp(1.6rem, 5vw, 2.25rem)", lineHeight: 1.1 }}
            >
              Welkom terug
            </h1>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">
              {comingFromResults
                ? "Log in om je outfits en shoplinks terug te zien."
                : "Jouw stijlrapport en outfits wachten op je."}
            </p>
          </div>
        </div>

        <div className="max-w-[400px] mx-auto px-4 pt-6 pb-12">
          <form
            onSubmit={onSubmit}
            noValidate
            aria-label="Inlogformulier"
            className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-soft)] border border-[var(--color-border)] p-6 space-y-5"
          >
            {comingFromResults && (
              <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-[var(--ff-color-primary-50)] border border-[var(--ff-color-primary-200)]">
                <FileText
                  className="w-4 h-4 mt-0.5 flex-shrink-0 text-[var(--ff-color-primary-700)]"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-semibold text-[var(--ff-color-primary-900)] leading-snug">
                    Log in om je stijlrapport terug te zien.
                  </p>
                  <p className="text-xs mt-0.5 text-[var(--ff-color-primary-700)]">
                    Je outfits, combinaties en shoplinks wachten op je.
                  </p>
                </div>
              </div>
            )}

            {serverError && (
              <div>
                <ErrorAlert error={serverError} />
                {isCredentialError && (
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <span className="text-[var(--color-muted)]">Wachtwoord vergeten?</span>
                    <NavLink
                      to="/wachtwoord-vergeten"
                      className="font-semibold text-[var(--ff-color-primary-700)] underline underline-offset-2 hover:text-[var(--ff-color-primary-600)]"
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

            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="block text-sm font-semibold text-[var(--color-text)]"
              >
                E-mailadres
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)] pointer-events-none" />
                <input
                  id="login-email"
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
                  aria-describedby={emailError ? "login-email-error" : undefined}
                  disabled={loading}
                  className={`w-full pl-10 pr-4 py-3.5 min-h-[52px] text-base rounded-xl border-2 transition-colors bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-muted)] placeholder:opacity-60 outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:opacity-50 ${
                    emailError
                      ? "border-[var(--ff-color-danger-500)] focus-visible:ring-[var(--ff-color-danger-200)]"
                      : "border-[var(--color-border)] focus-visible:border-[var(--ff-color-primary-500)] focus-visible:ring-[var(--ff-color-primary-200)]"
                  }`}
                />
              </div>
              {touched.email && emailError && (
                <p
                  id="login-email-error"
                  role="alert"
                  className="text-xs font-medium text-[var(--ff-color-danger-600)] flex items-center gap-1.5 mt-1"
                >
                  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                  </svg>
                  <InlineError error={emailError} />
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="block text-sm font-semibold text-[var(--color-text)]"
                >
                  Wachtwoord
                </label>
                <NavLink
                  to="/wachtwoord-vergeten"
                  className="inline-flex items-center min-h-[44px] px-2 text-xs font-medium text-[var(--ff-color-primary-700)] underline underline-offset-2 hover:text-[var(--ff-color-primary-600)] transition-colors"
                >
                  Vergeten?
                </NavLink>
              </div>
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
              {touched.password && pwError && (
                <p
                  id="login-pw-error"
                  role="alert"
                  className="text-xs font-medium text-[var(--ff-color-danger-600)] flex items-center gap-1.5 mt-1"
                >
                  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                  </svg>
                  <InlineError error={pwError} />
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full flex items-center justify-center gap-2 py-4 min-h-[54px] rounded-xl font-semibold text-base transition-all bg-[var(--ff-color-primary-700)] text-white hover:bg-[var(--ff-color-primary-600)] active:scale-[0.98] shadow-sm disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                  <span>Bezig…</span>
                </>
              ) : (
                <>
                  <span>Inloggen</span>
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </>
              )}
            </button>

            <div className="relative flex items-center gap-3">
              <div className="flex-1 border-t border-[var(--color-border)]" />
              <span className="text-xs text-[var(--color-muted)] font-medium whitespace-nowrap">Nog geen account?</span>
              <div className="flex-1 border-t border-[var(--color-border)]" />
            </div>

            <NavLink
              to="/registreren"
              className="w-full flex items-center justify-center gap-2 py-3.5 min-h-[52px] rounded-xl font-semibold text-base border-2 border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--ff-color-primary-400)] hover:bg-[var(--ff-color-primary-50)] active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2"
            >
              Maak gratis account aan
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
              <span>256-bit encryptie</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--ff-color-success-600)] flex-shrink-0" aria-hidden="true" />
              <span>Jouw data</span>
            </div>
          </div>

          <div className="mt-3 text-center">
            <NavLink
              to="/contact"
              className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] underline transition-colors"
            >
              Hulp nodig bij inloggen?
            </NavLink>
          </div>

        </div>
      </div>
    </>
  );
}
