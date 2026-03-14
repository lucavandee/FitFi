import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import { Eye, EyeOff, ArrowRight, Loader as Loader2, Palette, Shirt, Shield, AlertCircle } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import toast from "react-hot-toast";
import track from "@/utils/telemetry";
import { SecurityLogger } from "@/services/security/securityLogger";
import Logo from "@/components/ui/Logo";
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

const TRUST_ITEMS = [
  { icon: Palette, title: "Persoonlijk kleurpalet", desc: "Afgestemd op jouw kenmerken" },
  { icon: Shirt, title: "50+ outfitcombinaties", desc: "Voor elke gelegenheid" },
  { icon: Shield, title: "Veilig en privé", desc: "GDPR-compliant, data blijft van jou" },
];

export default function LoginPage() {
  const nav = useNavigate();
  const location = useLocation();
  const { login, user, status } = useUser();
  const fromPath = (location.state as { from?: string })?.from;

  React.useEffect(() => {
    if (status === 'authenticated' && user) {
      nav(fromPath || '/dashboard', { replace: true });
    }
  }, [status, user, fromPath, nav]);

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
        track("login_success", { source: fromPath || "direct" });
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

      <div className="min-h-screen bg-[#FAFAF8] grid grid-cols-1 lg:grid-cols-2">
        {/* ── Left — Visual block (desktop only) ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="hidden lg:flex bg-[#F5F0EB] flex-col justify-center items-center p-16 relative overflow-hidden"
        >
          <div className="max-w-[400px] w-full flex flex-col items-center">
            <div className="mb-16">
              <Logo size="lg" />
            </div>

            <h2 className="font-serif italic text-[44px] text-[#1A1A1A] leading-[1.1] text-center mb-6">
              {comingFromResults ? "Je outfits wachten" : "Welkom terug"}
            </h2>
            <p className="text-base text-[#4A4A4A] text-center leading-[1.7] mb-12">
              Jouw stijlprofiel en outfits wachten op je.
            </p>

            <div className="flex flex-col gap-5 w-full max-w-[320px]">
              {TRUST_ITEMS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-[#C2654A]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A1A]">{title}</p>
                    <p className="text-xs text-[#8A8A8A]">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Decorative watermark */}
          <span className="absolute bottom-8 right-8 font-serif italic text-[200px] text-[#E5E5E5]/30 leading-none select-none pointer-events-none">
            Fi
          </span>
        </motion.div>

        {/* ── Right — Form ── */}
        <div className="flex flex-col justify-center items-center p-6 pt-32 md:p-16 min-h-screen lg:min-h-0">
          <div className="w-full max-w-[420px]">
            {/* Mobile logo */}
            <div className="lg:hidden mb-12 text-center">
              <Logo size="lg" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0 }}
            >
              <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">Inloggen</h1>
              <p className="text-sm text-[#4A4A4A] mb-10">
                Of{" "}
                <NavLink
                  to="/registreren"
                  className="text-[#C2654A] hover:text-[#A8513A] underline underline-offset-4 transition-colors duration-200"
                >
                  maak een gratis account aan
                </NavLink>
              </p>
            </motion.div>

            <form onSubmit={onSubmit} noValidate aria-label="Inlogformulier">
              {/* Global error */}
              {serverError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#C24A4A]/5 border border-[#C24A4A]/20 rounded-2xl p-4 mb-6 text-sm text-[#C24A4A] flex items-center gap-3"
                  role="alert"
                >
                  <AlertCircle className="w-5 h-5 text-[#C24A4A] flex-shrink-0" />
                  <div>
                    <p className="font-semibold">{serverError.title}</p>
                    {serverError.message && <p className="mt-0.5 opacity-90">{serverError.message}</p>}
                  </div>
                </motion.div>
              )}
              {serverError && isCredentialError && (
                <div className="mb-6 flex items-center gap-2 text-sm">
                  <span className="text-[#8A8A8A]">Wachtwoord vergeten?</span>
                  <NavLink
                    to="/wachtwoord-vergeten"
                    className="font-semibold text-[#C2654A] underline underline-offset-2 hover:text-[#A8513A]"
                  >
                    Stuur resetlink
                  </NavLink>
                </div>
              )}

              <SocialLoginButtons
                mode="login"
                onSuccess={() => {
                  toast.success("Welkom terug!");
                  nav(fromPath || "/dashboard");
                }}
              />

              <div className="space-y-5">
                {/* Email field */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.08 }}
                  className="space-y-2"
                >
                  <label htmlFor="login-email" className="block text-sm font-medium text-[#1A1A1A]">
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
                    autoFocus
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    aria-invalid={!!emailError}
                    aria-describedby={emailError ? "login-email-error" : undefined}
                    disabled={loading}
                    className={`w-full bg-white border rounded-2xl py-4 px-5 text-base text-[#1A1A1A] placeholder:text-[#8A8A8A] focus:outline-none focus:ring-2 focus:ring-[#C2654A]/20 focus:border-[#C2654A] transition-all duration-200 disabled:opacity-50 ${
                      emailError
                        ? "border-[#C24A4A] focus:ring-[#C24A4A]/20"
                        : "border-[#E5E5E5]"
                    }`}
                  />
                  {touched.email && emailError && (
                    <p id="login-email-error" role="alert" className="text-sm text-[#C24A4A] mt-2 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-[#C24A4A]" />
                      <InlineError error={emailError} />
                    </p>
                  )}
                </motion.div>

                {/* Password field */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.16 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="login-password" className="block text-sm font-medium text-[#1A1A1A]">
                      Wachtwoord
                    </label>
                    <NavLink
                      to="/wachtwoord-vergeten"
                      className="text-sm font-medium text-[#C2654A] hover:text-[#A8513A] transition-colors duration-200"
                    >
                      Vergeten?
                    </NavLink>
                  </div>
                  <div className="relative">
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
                      className={`w-full bg-white border rounded-2xl py-4 px-5 pr-14 text-base text-[#1A1A1A] placeholder:text-[#8A8A8A] focus:outline-none focus:ring-2 focus:ring-[#C2654A]/20 focus:border-[#C2654A] transition-all duration-200 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden disabled:opacity-50 ${
                        pwError
                          ? "border-[#C24A4A] focus:ring-[#C24A4A]/20"
                          : "border-[#E5E5E5]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      tabIndex={-1}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-[#4A4A4A] transition-colors duration-200"
                      aria-label={showPw ? "Verberg wachtwoord" : "Toon wachtwoord"}
                    >
                      {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {touched.password && pwError && (
                    <p id="login-pw-error" role="alert" className="text-sm text-[#C24A4A] mt-2 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-[#C24A4A]" />
                      <InlineError error={pwError} />
                    </p>
                  )}
                </motion.div>
              </div>

              {/* Submit button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.24 }}
              >
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full bg-[#C2654A] hover:bg-[#A8513A] text-white font-semibold text-base py-4 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(194,101,74,0.2)] mt-8 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /><span>Bezig...</span></>
                  ) : (
                    <><span>Inloggen</span><ArrowRight className="w-4 h-4" aria-hidden="true" /></>
                  )}
                </button>
              </motion.div>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-[#E5E5E5]" />
                <span className="text-xs text-[#8A8A8A] font-medium">of</span>
                <div className="flex-1 h-px bg-[#E5E5E5]" />
              </div>

              {/* Google login placeholder — SocialLoginButtons handles this */}
              {/* Already rendered above, but keeping divider for visual flow */}
            </form>

            {/* Start quiz without account */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.32 }}
              className="mt-10 pt-8 border-t border-[#E5E5E5]"
            >
              <div className="bg-[#F5F0EB] rounded-2xl p-6 text-center">
                <p className="text-sm font-semibold text-[#1A1A1A] mb-1">Nog geen account nodig?</p>
                <p className="text-xs text-[#8A8A8A] mb-4">Doe de stijlquiz direct, zonder registratie.</p>
                <NavLink
                  to="/onboarding"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#C2654A] hover:text-[#A8513A] transition-colors duration-200"
                >
                  Start de quiz
                  <ArrowRight className="w-4 h-4" />
                </NavLink>
              </div>
            </motion.div>

            {/* Help link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center mt-6"
            >
              <NavLink
                to="/contact"
                className="text-sm text-[#8A8A8A] hover:text-[#4A4A4A] transition-colors duration-200"
              >
                Hulp nodig bij inloggen?
              </NavLink>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
