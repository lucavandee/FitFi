import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import Button from "@/components/ui/Button";
import Seo from "@/components/seo/Seo";
import {
  Eye, EyeOff, AlertCircle, CheckCircle2, Mail,
  Shield, Lock, ArrowRight, Loader2, FileText
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import toast from "react-hot-toast";
import { SecurityLogger } from "@/services/security/securityLogger";
import {
  emailErrors, passwordErrors, getSupabaseAuthError,
  type ErrorMessage
} from "@/utils/formErrors";
import { InlineError, ErrorAlert } from "@/components/ui/ErrorAlert";

function isEmail(v: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
}

export default function LoginPage() {
  const nav = useNavigate();
  const location = useLocation();
  const { login } = useUser();
  const fromPath = (location.state as any)?.from as string | undefined;

  const comingFromResults =
    typeof fromPath === "string" && fromPath.startsWith("/results");

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [remember, setRemember] = React.useState(true);
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

  const showForgotPasswordHint =
    serverError?.icon === "AlertCircle" &&
    (serverError.title.toLowerCase().includes("onjuist") ||
      serverError.title.toLowerCase().includes("ongeldig"));

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
    <main className="min-h-screen bg-gradient-to-b from-[var(--color-bg)] to-[var(--ff-color-primary-50)] flex items-center justify-center px-4 py-8 sm:py-12">
      <Seo
        title="Inloggen — FitFi"
        description="Log in om je stijlrapport en outfits terug te zien."
        path="/inloggen"
      />

      <div className="w-full max-w-md">

        {/* Gate-context banner — only shown when navigated from /results */}
        {comingFromResults && (
          <div className="mb-6 flex items-start gap-3 px-5 py-4 bg-[var(--ff-color-primary-50)] border border-[var(--ff-color-primary-200)] rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-[var(--ff-color-primary-100)] flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-[var(--ff-color-primary-700)]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--ff-color-primary-900)] leading-snug">
                Je stijlrapport wacht op je
              </p>
              <p className="text-sm text-[var(--ff-color-primary-700)] mt-0.5 leading-snug">
                Log in om je outfits, combinaties en shoplinks te bekijken.
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] mb-2">
            Inloggen
          </h1>
          <p className="text-base text-[var(--color-text-secondary)]">
            Log in om je stijladvies en outfits terug te zien.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-[var(--color-border)] overflow-hidden">
          <div className="p-6 sm:p-8 space-y-5">

            {/* Server Error — with inline reset-link action when credentials wrong */}
            {serverError && (
              <div>
                <ErrorAlert error={serverError} />
                {showForgotPasswordHint && (
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <span className="text-[var(--color-text-secondary)]">Wachtwoord kwijt?</span>
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

            {/* Social Login */}
            <SocialLoginButtons
              mode="login"
              onSuccess={() => {
                toast.success("Welkom terug!");
                nav(fromPath || "/dashboard");
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
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-[var(--color-text)]"
                >
                  Wachtwoord
                </label>
                <NavLink
                  to="/wachtwoord-vergeten"
                  className="text-sm font-semibold text-[var(--ff-color-primary-700)] hover:text-[var(--ff-color-primary-600)] transition-colors underline-offset-2 hover:underline min-h-[44px] inline-flex items-center"
                >
                  Wachtwoord vergeten?
                </NavLink>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched({ ...touched, password: true })}
                  aria-invalid={!!pwError}
                  aria-describedby={pwError ? "pw-error" : undefined}
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
              <span id="pw-error">
                <InlineError error={pwError} />
              </span>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer min-h-[44px] w-fit">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-[var(--ff-color-primary-600)] focus:ring-[var(--ff-color-primary-500)] cursor-pointer"
              />
              <span className="text-sm text-gray-700 font-medium select-none">
                Onthoud mij
              </span>
            </label>

            {/* Submit */}
            <Button
              type="submit"
              onClick={onSubmit as any}
              disabled={!canSubmit}
              className="w-full bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] active:scale-[0.98] text-white py-4 min-h-[52px] rounded-xl font-bold text-base shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Inloggen...</span>
                </>
              ) : (
                <>
                  <span>Inloggen</span>
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
                  Nog geen account?
                </span>
              </div>
            </div>

            {/* Signup CTA */}
            <NavLink
              to="/registreren"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[52px] w-full border-2 border-[var(--color-border)] hover:border-[var(--ff-color-primary-400)] text-[var(--color-text)] font-semibold text-base rounded-xl hover:bg-[var(--ff-color-primary-50)] active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2"
            >
              Maak account aan
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
          </div>
        </div>

        {/* Trust Strip */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[var(--color-text-secondary)]">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
            <span>GDPR-compliant</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
            <span>256-bit encryptie</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
            <span>Je data blijft van jou</span>
          </div>
        </div>

        {/* Help */}
        <div className="mt-4 text-center">
          <NavLink
            to="/contact"
            className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] underline transition-colors"
          >
            Hulp nodig bij inloggen?
          </NavLink>
        </div>

      </div>
    </main>
  );
}
