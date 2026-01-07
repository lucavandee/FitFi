import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import Button from "@/components/ui/Button";
import Seo from "@/components/seo/Seo";
import { Eye, EyeOff, AlertCircle, CheckCircle2, Mail, Sparkles, Shield, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import toast from "react-hot-toast";
import { SecurityLogger } from "@/services/security/securityLogger";

/** Email validation */
function isEmail(v: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
}

/** Password strength calculator */
function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  score = Math.min(score, 4);

  const labels = ["Zeer zwak", "Zwak", "Oké", "Sterk", "Zeer sterk"] as const;
  const colors = ["#ef4444", "#f59e0b", "#eab308", "#22c55e", "#10b981"] as const;
  const emojis = ["😟", "😐", "🙂", "😊", "🎉"] as const;

  return {
    score,
    label: labels[score],
    color: colors[score],
    emoji: emojis[score],
    percentage: [20, 40, 60, 80, 100][score]
  };
}

type Mode = "password" | "magic";

export default function LoginPage() {
  const nav = useNavigate();
  const location = useLocation();
  const { login } = useUser();
  const fromPath = (location.state as any)?.from;

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [remember, setRemember] = React.useState(true);
  const [mode, setMode] = React.useState<Mode>("password");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const pwStrength = password ? passwordStrength(password) : null;

  const emailError = touched.email && !email
    ? "E-mail is verplicht"
    : touched.email && !isEmail(email)
    ? "Voer een geldig e-mailadres in"
    : null;

  const pwError = touched.password && mode === "password" && password.length < 8
    ? "Minimaal 8 tekens"
    : null;

  const canSubmit = mode === "password"
    ? isEmail(email) && password.length >= 8 && !loading
    : isEmail(email) && !loading;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ email: true, password: true });

    if (!canSubmit) return;

    if (mode === "password") {
      setLoading(true);
      setError(null);

      try {
        const success = await login(email, password);

        if (success) {
          // Log successful login
          setTimeout(async () => {
            try {
              const { getSupabase } = await import('@/lib/supabase');
              const client = getSupabase();

              const { data: { user: authUser } } = await client.auth.getUser();
              if (!authUser) {
                nav(fromPath || "/dashboard");
                return;
              }

              // Security logging: successful login
              await SecurityLogger.logLoginSuccess(authUser.id);

              const { data: profile } = await client
                .from('profiles')
                .select('is_admin')
                .eq('id', authUser.id)
                .maybeSingle();

              if (profile?.is_admin === true) {
                nav("/admin");
              } else {
                nav(fromPath || "/dashboard");
              }
            } catch (navError) {
              console.error('Navigation error:', navError);
              nav(fromPath || "/dashboard");
            }
          }, 200);
        } else {
          // Security logging: failed login
          await SecurityLogger.logLoginFailure(email, 'invalid_credentials');
          setError("Login mislukt. Controleer je e-mail en wachtwoord.");
        }
      } catch (err) {
        // Security logging: login error
        await SecurityLogger.logLoginFailure(email, 'system_error');
        setError("Er ging iets mis. Probeer het later opnieuw.");
      } finally {
        setLoading(false);
      }
    } else {
      // Magic link placeholder
      setError("Magic link is momenteel niet beschikbaar.");
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[var(--color-bg)] to-[var(--ff-color-primary-50)] flex items-center justify-center px-4 py-8 sm:py-12">
      <Seo
        title="Inloggen — FitFi"
        description="Log in bij FitFi om je AI Style Report, outfits en shoplinks te bekijken."
        path="/inloggen"
      />

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-surface)] backdrop-blur-sm border border-[var(--color-border)] rounded-full text-xs sm:text-sm font-semibold text-[var(--ff-color-primary-600)] mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Welkom terug
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--ff-color-text)] mb-2 sm:mb-3">
            Log in
          </h1>
          <p className="text-base sm:text-lg text-[var(--color-text)]/70">
            Toegang tot je stijladvies
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-[var(--color-border)] overflow-hidden">
          {/* Tabs - 44px+ touch targets */}
          <div className="flex border-b border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => setMode("password")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 sm:px-6 min-h-[52px] font-semibold text-sm sm:text-base transition-all ${
                mode === "password"
                  ? "bg-white text-[var(--ff-color-primary-700)] border-b-2 border-[var(--ff-color-primary-700)]"
                  : "bg-gray-50 text-gray-500 hover:text-gray-700 hover:bg-gray-100 active:scale-[0.98]"
              }`}
            >
              <Lock className="w-4 h-4" />
              <span className="hidden xs:inline">Wachtwoord</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("magic")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 sm:px-6 min-h-[52px] font-semibold text-sm sm:text-base transition-all ${
                mode === "magic"
                  ? "bg-white text-[var(--ff-color-primary-700)] border-b-2 border-[var(--ff-color-primary-700)]"
                  : "bg-gray-50 text-gray-500 hover:text-gray-700 hover:bg-gray-100 active:scale-[0.98]"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden xs:inline">E-mail link</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="p-5 sm:p-6 md:p-8 space-y-5">
            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">{error}</p>
                </div>
              </div>
            )}

            {/* Social Login Buttons */}
            <SocialLoginButtons
              mode="login"
              onSuccess={() => {
                toast.success('Welkom terug!');
                nav(fromPath || '/dashboard');
              }}
            />

            {/* Email Field - 48px+ height for mobile */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[var(--ff-color-text)] mb-2">
                E-mailadres
              </label>
              <div className="relative">
                <Mail className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="jij@voorbeeld.nl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched({ ...touched, email: true })}
                  className={`w-full pl-10 sm:pl-11 pr-4 py-3.5 sm:py-3 min-h-[48px] text-base rounded-xl border-2 transition-all ${
                    emailError
                      ? "border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-100"
                      : "border-gray-200 focus:border-[var(--ff-color-primary-600)] focus:ring-4 focus:ring-[var(--ff-color-primary-100)]"
                  } outline-none`}
                />
              </div>
              {emailError && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {emailError}
                </p>
              )}
            </div>

            {/* Password Field (only in password mode) - 48px+ height for mobile */}
            {mode === "password" && (
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-[var(--ff-color-text)] mb-2">
                  Wachtwoord
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
                  <input
                    id="password"
                    type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched({ ...touched, password: true })}
                    className={`w-full pl-10 sm:pl-11 pr-12 sm:pr-13 py-3.5 sm:py-3 min-h-[48px] text-base rounded-xl border-2 transition-all ${
                      pwError
                        ? "border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-100"
                        : "border-gray-200 focus:border-[var(--ff-color-primary-600)] focus:ring-4 focus:ring-[var(--ff-color-primary-100)]"
                    } outline-none`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-1 rounded-lg hover:bg-gray-100 active:scale-[0.95] transition-all min-w-[36px] min-h-[36px] flex items-center justify-center"
                    aria-label={showPw ? "Verberg wachtwoord" : "Toon wachtwoord"}
                  >
                    {showPw ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {password && pwStrength && (
                  <div className="mt-3 animate-in fade-in slide-in-from-top-1 duration-300">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-500 ease-out"
                        style={{
                          width: `${pwStrength.percentage}%`,
                          backgroundColor: pwStrength.color,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-medium" style={{ color: pwStrength.color }}>
                        {pwStrength.label}
                      </span>
                      <span className="text-lg">{pwStrength.emoji}</span>
                    </div>
                  </div>
                )}

                {pwError && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {pwError}
                  </p>
                )}
              </div>
            )}

            {/* Magic Link Info */}
            {mode === "magic" && (
              <div className="bg-[var(--ff-color-primary-50)] border border-[var(--ff-color-primary-200)] rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-[var(--ff-color-primary-600)] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[var(--ff-color-primary-900)] mb-1">
                      Wachtwoord-vrij inloggen
                    </p>
                    <p className="text-sm text-[var(--ff-color-primary-700)]">
                      We sturen een veilige login link naar je inbox. Klik op de link om in te loggen.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Remember Me & Forgot Password - 44px+ touch targets */}
            {mode === "password" && (
              <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 xs:gap-4">
                <label className="flex items-center gap-2.5 cursor-pointer min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-5 h-5 sm:w-4 sm:h-4 rounded border-gray-300 text-[var(--ff-color-primary-600)] focus:ring-[var(--ff-color-primary-600)] cursor-pointer"
                  />
                  <span className="text-sm sm:text-sm text-gray-700 font-medium">Onthoud mij</span>
                </label>
                <NavLink
                  to="/wachtwoord-vergeten"
                  className="inline-flex items-center min-h-[44px] text-sm font-semibold text-[var(--ff-color-primary-700)] hover:text-[var(--ff-color-primary-600)] active:scale-[0.98] transition-all"
                >
                  Wachtwoord vergeten?
                </NavLink>
              </div>
            )}

            {/* Submit Button - 48px+ touch target */}
            <Button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] active:scale-[0.98] text-white py-4 sm:py-3.5 min-h-[52px] rounded-xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:active:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 sm:w-5 sm:h-5 animate-spin" />
                  <span className="text-base sm:text-lg">Inloggen...</span>
                </>
              ) : (
                <>
                  <span className="text-base sm:text-lg">{mode === "password" ? "Inloggen" : "Verstuur login link"}</span>
                  <ArrowRight className="w-5 h-5 sm:w-5 sm:h-5" />
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">of</span>
              </div>
            </div>

            {/* Register Link - 48px+ touch target */}
            <div className="text-center">
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                Nog geen account?
              </p>
              <NavLink
                to="/registreren"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-3 min-h-[48px] w-full sm:w-auto border-2 border-[var(--ff-color-primary-600)] text-[var(--ff-color-primary-700)] font-semibold text-base sm:text-base rounded-xl hover:bg-[var(--ff-color-primary-50)] active:scale-[0.98] transition-all"
              >
                Maak een gratis account
              </NavLink>
            </div>
          </form>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-600" />
            <span>GDPR-compliant</span>
          </div>
          <span className="text-gray-300">•</span>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-green-600" />
            <span>256-bit encryptie</span>
          </div>
          <span className="text-gray-300">•</span>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span></span>
          </div>
        </div>

        {/* Help Link - 44px+ touch target */}
        <div className="mt-6 sm:mt-8 text-center">
          <NavLink
            to="/contact"
            className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 text-sm sm:text-base text-gray-600 hover:text-gray-900 active:scale-[0.98] underline transition-all"
          >
            Hulp nodig bij inloggen?
          </NavLink>
        </div>
      </div>
    </main>
  );
}
