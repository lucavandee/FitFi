import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import { Eye, EyeOff, CircleCheck as CheckCircle2, Shield, Lock, ArrowRight, Loader as Loader2, FileText, Sparkles, Mail, Palette, Star } from "lucide-react";
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

const TRUST_ITEMS = [
  { icon: Shield, label: "GDPR-compliant", sub: "Je data blijft van jou" },
  { icon: Lock, label: "256-bit encryptie", sub: "Veilig opgeslagen" },
  { icon: Star, label: "2.400+ gebruikers", sub: "Actief in NL & BE" },
];

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
        {/* ── Hero banner ── */}
        <section
          className="relative overflow-hidden"
          style={{
            background: "linear-gradient(160deg, var(--ff-color-primary-900) 0%, var(--ff-color-primary-700) 100%)",
            paddingTop: "clamp(2.5rem, 6vw, 4.5rem)",
            paddingBottom: "clamp(2.5rem, 6vw, 4.5rem)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "url(/hero/hero-style-report-lg.webp)",
              backgroundSize: "cover",
              backgroundPosition: "center 25%",
              opacity: 0.12,
            }}
          />
          <div className="ff-container relative z-10 text-center">
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase mb-5"
              style={{
                background: "rgba(247,243,236,0.12)",
                color: "rgba(247,243,236,0.90)",
                border: "1px solid rgba(247,243,236,0.20)",
              }}
            >
              <Sparkles className="w-3 h-3" aria-hidden="true" />
              Persoonlijk stijladvies
            </span>
            <h1
              className="font-heading font-bold tracking-tight text-white mb-3"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.08 }}
            >
              {comingFromResults ? "Log in om je outfits te zien" : "Welkom terug"}
            </h1>
            <p
              className="text-base sm:text-lg font-light mb-0 max-w-lg mx-auto leading-relaxed"
              style={{ color: "rgba(247,243,236,0.72)" }}
            >
              {comingFromResults
                ? "Jouw outfits, combinaties en shoplinks wachten op je."
                : "Jouw stijlprofiel en outfits wachten op je."}
            </p>
          </div>
        </section>

        {/* ── Form + trust grid ── */}
        <section className="ff-section">
          <div className="ff-container">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_460px] gap-8 lg:gap-12 xl:gap-16 items-start max-w-5xl mx-auto">

              {/* Left — trust / context */}
              <div className="order-2 lg:order-1">
                {comingFromResults && (
                  <div
                    className="flex items-start gap-3.5 px-5 py-4 rounded-2xl mb-6"
                    style={{
                      background: "var(--ff-color-primary-50)",
                      border: "1px solid var(--ff-color-primary-200)",
                    }}
                  >
                    <FileText className="w-5 h-5 mt-0.5 flex-shrink-0 text-[var(--ff-color-primary-700)]" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-semibold text-[var(--ff-color-primary-900)] leading-snug mb-0.5">Je stijlrapport is klaar</p>
                      <p className="text-xs text-[var(--ff-color-primary-700)]">Log in om je outfits, shoplinks en kleurprofiel te bekijken.</p>
                    </div>
                  </div>
                )}

                <h2
                  className="font-heading font-bold text-[var(--color-text)] tracking-tight mb-4"
                  style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", lineHeight: 1.12 }}
                >
                  Wat je terugvindt
                </h2>
                <div className="space-y-4 mb-8">
                  {[
                    { icon: Palette, title: "Jouw kleurprofiel", desc: "Seizoen, temperatuur en aanbevolen kleuren op basis van jouw huidtoon." },
                    { icon: Sparkles, title: "Gepersonaliseerde outfits", desc: "6–12 complete looks samengesteld op jouw stijltype en lichaamsvorm." },
                    { icon: ArrowRight, title: "Directe shoplinks", desc: "Elk item direct shopbaar bij Nederlandse webshops." },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="flex items-start gap-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "var(--ff-color-primary-100)",
                          color: "var(--ff-color-primary-700)",
                        }}
                      >
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--color-text)] mb-0.5">{title}</p>
                        <p className="text-sm text-[var(--color-muted)] leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Trust row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {TRUST_ITEMS.map(({ icon: Icon, label, sub }) => (
                    <div
                      key={label}
                      className="flex flex-col items-center text-center gap-2 px-4 py-4 rounded-2xl border border-[var(--color-border)]"
                      style={{ background: "var(--color-surface)" }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: "var(--ff-color-primary-100)", color: "var(--ff-color-primary-700)" }}
                      >
                        <Icon className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <p className="text-xs font-bold text-[var(--color-text)]">{label}</p>
                      <p className="text-[11px] text-[var(--color-muted)] leading-snug">{sub}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — form */}
              <div className="order-1 lg:order-2">
                <form
                  onSubmit={onSubmit}
                  noValidate
                  aria-label="Inlogformulier"
                  className="rounded-2xl border border-[var(--color-border)] p-6 sm:p-8 space-y-5"
                  style={{
                    background: "var(--color-surface)",
                    boxShadow: "0 4px 32px rgba(30,35,51,0.08)",
                  }}
                >
                  <div>
                    <h2 className="font-heading font-bold text-[var(--color-text)] text-xl mb-1">Inloggen</h2>
                    <p className="text-sm text-[var(--color-muted)]">Of <NavLink to="/registreren" className="font-semibold text-[var(--ff-color-primary-700)] hover:text-[var(--ff-color-primary-600)] underline underline-offset-2">maak een gratis account aan</NavLink></p>
                  </div>

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
                    <label htmlFor="login-email" className="block text-sm font-semibold text-[var(--color-text)]">
                      E-mailadres
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)] pointer-events-none" aria-hidden="true" />
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
                      <p id="login-email-error" role="alert" className="text-xs font-medium text-[var(--ff-color-danger-600)] flex items-center gap-1.5 mt-1">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>
                        <InlineError error={emailError} />
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="login-password" className="block text-sm font-semibold text-[var(--color-text)]">
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
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)] pointer-events-none" aria-hidden="true" />
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
                      <p id="login-pw-error" role="alert" className="text-xs font-medium text-[var(--ff-color-danger-600)] flex items-center gap-1.5 mt-1">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>
                        <InlineError error={pwError} />
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="w-full flex items-center justify-center gap-2 py-4 min-h-[56px] rounded-xl font-bold text-base transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2"
                    style={{
                      background: "var(--ff-color-primary-700)",
                      color: "var(--color-bg)",
                      boxShadow: "0 8px 40px rgba(166,136,106,0.35)",
                    }}
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /><span>Bezig…</span></>
                    ) : (
                      <><span>Inloggen</span><ArrowRight className="w-5 h-5" aria-hidden="true" /></>
                    )}
                  </button>

                  <NavLink
                    to="/registreren"
                    className="w-full flex items-center justify-center gap-2 py-3.5 min-h-[52px] rounded-xl font-semibold text-base border-2 border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--ff-color-primary-400)] hover:bg-[var(--ff-color-primary-50)] active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2"
                  >
                    Maak gratis account aan
                    <ArrowRight className="w-5 h-5" aria-hidden="true" />
                  </NavLink>
                </form>

                <div className="mt-4 rounded-xl p-4" style={{ background: "var(--ff-color-primary-50)", border: "1px solid var(--ff-color-primary-200)" }}>
                  <p className="text-sm font-semibold text-[var(--ff-color-primary-900)] mb-0.5 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                    Nog geen account nodig?
                  </p>
                  <p className="text-xs text-[var(--ff-color-primary-700)] mb-3">Doe de stijlquiz direct — geen registratie vereist.</p>
                  <NavLink
                    to="/onboarding"
                    className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white border border-[var(--ff-color-primary-300)] text-[var(--ff-color-primary-700)] font-semibold text-sm hover:bg-[var(--ff-color-primary-100)] transition-colors"
                  >
                    Start de quiz zonder account
                    <ArrowRight className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  </NavLink>
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
          </div>
        </section>

      </div>
    </>
  );
}
