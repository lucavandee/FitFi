import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import { Eye, EyeOff, CircleCheck as CheckCircle2, Shield, Lock, ArrowRight, Loader as Loader2, FileText, Sparkles, Star } from "lucide-react";
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

const SOCIAL_PROOF = [
  { text: "Mijn stijl is eindelijk consistent.", author: "Lisa, 31" },
  { text: "In 5 minuten wist ik wat ik miste.", author: "Daan, 27" },
  { text: "Echt persoonlijk advies, geen template.", author: "Noor, 34" },
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
  const [quoteIndex] = React.useState(
    () => Math.floor(Math.random() * SOCIAL_PROOF.length)
  );

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

  const quote = SOCIAL_PROOF[quoteIndex];

  return (
    <>
      <Seo
        title="Inloggen — FitFi"
        description="Log in om je stijlrapport en outfits terug te zien."
        path="/inloggen"
        noindex
      />

      {/*
        Split-screen layout:
        - Navbar is sticky h-16 (64px) boven deze pagina
        - De twee panelen vullen de resterende viewport: calc(100vh - 64px)
        - Op mobiel: één kolom, geen hero-paneel
      */}
      <div className="flex flex-col lg:flex-row" style={{ minHeight: 'calc(100vh - 64px)' }}>

        {/* ── LEFT PANEL — editorial hero, alleen desktop ── */}
        <div
          className="hidden lg:block relative lg:w-[52%] xl:w-[55%] flex-shrink-0"
          aria-hidden="true"
          style={{ minHeight: 'calc(100vh - 64px)' }}
        >
          {/* Achtergrondafbeelding via CSS background zodat object-position maximaal werkt */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'url(/hero/hero-style-report-lg.webp)',
              backgroundSize: 'cover',
              backgroundPosition: 'center top',
            }}
          />

          {/* Gradient overlay: subtiel bovenaan, zwaar onderaan voor leesbaarheid */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(160deg, rgba(20,20,28,0.22) 0%, rgba(20,20,28,0.05) 30%, rgba(20,20,28,0.60) 68%, rgba(20,20,28,0.88) 100%)',
            }}
          />

          {/* Inhoud over het beeld */}
          <div className="relative z-10 flex flex-col justify-between h-full p-8 xl:p-12">

            {/* Eyebrow label linksboven */}
            <div>
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase px-3 py-1 rounded-full"
                style={{
                  background: 'rgba(166,136,106,0.25)',
                  border: '1px solid rgba(247,243,236,0.20)',
                  color: 'rgba(247,243,236,0.85)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                AI Stijladvies
              </span>
            </div>

            {/* Onderin: headline + quote + pills */}
            <div>
              {/* Headline */}
              <p
                className="text-[11px] font-semibold tracking-[0.18em] uppercase mb-4"
                style={{ color: 'rgba(166,136,106,0.85)' }}
              >
                Persoonlijk stijladvies
              </p>
              <h2
                className="font-heading font-bold tracking-tight leading-[1.12] mb-4"
                style={{ color: 'rgba(247,243,236,0.97)', fontSize: 'clamp(2rem, 3vw + 1rem, 2.75rem)' }}
              >
                Jouw stijl,<br />eindelijk op orde.
              </h2>
              <p
                className="text-base leading-relaxed mb-8 max-w-[380px]"
                style={{ color: 'rgba(247,243,236,0.65)' }}
              >
                AI analyseert jouw voorkeuren en bouwt een compleet stijlrapport — met outfits die bij jou passen.
              </p>

              {/* Testimonial kaart */}
              <div
                className="rounded-2xl p-5 mb-6 max-w-[380px]"
                style={{
                  background: 'rgba(247,243,236,0.09)',
                  border: '1px solid rgba(247,243,236,0.15)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                }}
              >
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5 fill-current flex-shrink-0"
                      style={{ color: 'rgba(166,136,106,0.95)' }}
                    />
                  ))}
                </div>
                <p
                  className="text-[15px] font-medium leading-snug mb-2.5"
                  style={{ color: 'rgba(247,243,236,0.92)' }}
                >
                  "{quote.text}"
                </p>
                <p
                  className="text-[12px] font-medium"
                  style={{ color: 'rgba(247,243,236,0.48)' }}
                >
                  — {quote.author}
                </p>
              </div>

              {/* Feature-pills onderaan */}
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Gratis te proberen" },
                  { label: "Geen creditcard" },
                  { label: "Privacy-first" },
                ].map(({ label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full"
                    style={{
                      background: 'rgba(247,243,236,0.09)',
                      border: '1px solid rgba(247,243,236,0.16)',
                      color: 'rgba(247,243,236,0.68)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL — formulier ── */}
        <div className="flex-1 flex flex-col items-center justify-center bg-[var(--color-bg)] px-4 sm:px-8 xl:px-16 py-10 lg:py-12">

          {/* Mobiel: logo (navbar is verborgen op fullscreen-pagina's, maar hier zichtbaar; logo dus alleen als fallback) */}
          <div className="lg:hidden w-full max-w-[400px] mb-8">
            <NavLink to="/" className="inline-flex items-center gap-2">
              <span className="text-xl font-bold text-[var(--color-text)] tracking-tight">FitFi</span>
            </NavLink>
          </div>

          <div className="w-full max-w-[420px]">

            {/* Context-banner vanuit /results */}
            {comingFromResults && (
              <div className="mb-5 flex items-start gap-3 px-4 py-3.5 bg-[var(--ff-color-primary-50)] border border-[var(--ff-color-primary-200)] rounded-2xl">
                <div className="w-8 h-8 rounded-lg bg-[var(--ff-color-primary-100)] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileText
                    className="w-4 h-4 text-[var(--ff-color-primary-700)]"
                    aria-hidden="true"
                  />
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

            {/* Heading */}
            <div className="mb-7">
              <h1 className="font-heading font-bold tracking-tight text-[var(--color-text)] mb-1.5"
                  style={{ fontSize: 'clamp(1.5rem, 2vw + 1rem, 1.875rem)', lineHeight: 1.15 }}>
                Welkom terug.
              </h1>
              <p className="text-sm text-[var(--color-muted)]">
                Log in om je stijladvies en outfits terug te zien.
              </p>
            </div>

            {/* Formulier-kaart */}
            <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-soft)] border border-[var(--color-border)]">
              <form
                onSubmit={onSubmit}
                noValidate
                className="p-6 space-y-5"
                aria-label="Inlogformulier"
              >

                {/* Server-fout */}
                {serverError && (
                  <div>
                    <ErrorAlert error={serverError} />
                    {isCredentialError && (
                      <div className="mt-2.5 flex items-center gap-2 text-sm">
                        <span className="text-[var(--color-muted)]">
                          Wachtwoord vergeten?
                        </span>
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

                {/* Social login */}
                <SocialLoginButtons
                  mode="login"
                  onSuccess={() => {
                    toast.success("Welkom terug!");
                    nav(fromPath || "/dashboard");
                  }}
                />

                {/* E-mailadres */}
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
                    <p
                      id="login-email-error"
                      role="alert"
                      className="text-xs font-medium text-[var(--ff-color-danger-600)] flex items-center gap-1.5 mt-1"
                    >
                      <svg
                        className="w-3.5 h-3.5 flex-shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <InlineError error={emailError} />
                    </p>
                  )}
                </div>

                {/* Wachtwoord */}
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
                    <p
                      id="login-pw-error"
                      role="alert"
                      className="text-xs font-medium text-[var(--ff-color-danger-600)] flex items-center gap-1.5 mt-1"
                    >
                      <svg
                        className="w-3.5 h-3.5 flex-shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <InlineError error={pwError} />
                    </p>
                  )}
                  <div className="flex justify-end pt-0.5">
                    <NavLink
                      to="/wachtwoord-vergeten"
                      className="text-xs font-medium text-[var(--ff-color-primary-700)] hover:text-[var(--ff-color-primary-600)] transition-colors underline underline-offset-2"
                    >
                      Wachtwoord vergeten?
                    </NavLink>
                  </div>
                </div>

                {/* Inloggen knop */}
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full flex items-center justify-center gap-2 bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white py-3.5 min-h-[52px] rounded-xl font-semibold text-sm tracking-wide shadow-sm hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2"
                >
                  {loading ? (
                    <>
                      <Loader2
                        className="w-4 h-4 animate-spin flex-shrink-0"
                        aria-hidden="true"
                      />
                      <span>Bezig…</span>
                    </>
                  ) : (
                    <>
                      <span>Inloggen</span>
                      <ArrowRight className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                    </>
                  )}
                </button>

                {/* Registreer-CTA */}
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

                {/* Quiz-CTA */}
                <div className="rounded-xl bg-[var(--ff-color-primary-50)] border border-[var(--ff-color-primary-200)] p-4 flex flex-col gap-2">
                  <p className="text-xs font-semibold text-[var(--ff-color-primary-900)] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                    Nog geen account nodig?
                  </p>
                  <p className="text-xs text-[var(--ff-color-primary-700)] leading-relaxed">
                    Doe de stijlquiz direct — geen registratie vereist.
                  </p>
                  <NavLink
                    to="/onboarding"
                    className="mt-1 inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--ff-color-primary-300)] text-[var(--ff-color-primary-700)] font-semibold text-sm hover:bg-[var(--ff-color-primary-100)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2"
                  >
                    Start de quiz zonder account
                    <ArrowRight className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  </NavLink>
                </div>

              </form>
            </div>

            {/* Trust-badges */}
            <div className="mt-5 flex items-center justify-center gap-4 text-xs text-[var(--color-muted)]">
              <div className="flex items-center gap-1.5">
                <Shield
                  className="w-3.5 h-3.5 text-[var(--ff-color-success-600)] flex-shrink-0"
                  aria-hidden="true"
                />
                <span>GDPR-compliant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock
                  className="w-3.5 h-3.5 text-[var(--ff-color-success-600)] flex-shrink-0"
                  aria-hidden="true"
                />
                <span>256-bit encryptie</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2
                  className="w-3.5 h-3.5 text-[var(--ff-color-success-600)] flex-shrink-0"
                  aria-hidden="true"
                />
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
        </div>

      </div>
    </>
  );
}
