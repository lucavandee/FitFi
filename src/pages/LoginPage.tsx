import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import {
  Eye,
  EyeOff,
  CircleCheck as CheckCircle2,
  Shield,
  Lock,
  ArrowRight,
  Loader as Loader2,
  FileText,
  Sparkles,
  Star,
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

      {/* Full-viewport hero met formulier gecentreerd */}
      <div
        className="relative w-full overflow-hidden bg-[var(--ff-color-primary-900)]"
        style={{ minHeight: "calc(100vh - 64px)" }}
      >
        {/* ── Achtergrondafbeelding — mobiel en desktop aparte crops ── */}
        <img
          src="/images/hf_20260221_211319_a32928c5-35c0-46c6-be6e-cfa9d8747078.webp"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover sm:hidden"
          style={{ objectPosition: "50% 22%" }}
          loading="eager"
        />
        <img
          src="/images/hf_20260221_210750_e12efd50-544c-4e35-986d-bfff9999542b.webp"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover hidden sm:block"
          style={{ objectPosition: "center 20%" }}
          loading="eager"
        />

        {/* ── Gradient overlay — desktop: links donkerder, rechts open ── */}
        <div
          className="absolute inset-0 hidden sm:block"
          style={{
            background:
              "linear-gradient(100deg, rgba(62,49,37,0.92) 0%, rgba(62,49,37,0.72) 38%, rgba(62,49,37,0.55) 65%, rgba(62,49,37,0.42) 100%)",
          }}
          aria-hidden="true"
        />
        {/* ── Gradient overlay — mobiel: zwaar voor leesbaarheid ── */}
        <div
          className="absolute inset-0 sm:hidden"
          style={{
            background:
              "linear-gradient(to bottom, rgba(62,49,37,0.72) 0%, rgba(62,49,37,0.45) 30%, rgba(62,49,37,0.55) 60%, rgba(62,49,37,0.90) 100%)",
          }}
          aria-hidden="true"
        />

        {/* ── AI badge — linksboven ── */}
        <div
          className="absolute top-5 left-4 sm:top-8 sm:left-8 z-20 inline-flex items-center gap-2 px-3.5 py-2 rounded-full"
          style={{
            background: "rgba(250,248,245,0.12)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(250,248,245,0.22)",
            boxShadow: "0 2px 16px rgba(0,0,0,0.18)",
          }}
        >
          <Sparkles
            className="w-3 h-3 text-[var(--ff-color-primary-200)]"
            aria-hidden="true"
          />
          <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-[var(--color-bg)]">
            AI Stijladvies
          </span>
        </div>

        {/* ── Hoofd-layout: op desktop zij-aan-zij, op mobiel gestapeld ── */}
        <div
          className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-14 flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-between gap-10 sm:gap-16"
          style={{ minHeight: "calc(100vh - 64px)" }}
        >

          {/* ── Linkse tekstkolom — verborgen op mobiel ── */}
          <div className="hidden sm:flex flex-col max-w-lg lg:max-w-xl py-20 flex-1">

            <h1
              className="font-heading font-bold leading-[1.05] tracking-tight mb-5 text-[var(--color-bg)]"
              style={{ fontSize: "clamp(2.8rem, 5vw, 5rem)" }}
            >
              Welkom<br />
              <em className="not-italic text-[var(--ff-color-primary-300)]">terug.</em>
            </h1>

            <p
              className="text-lg leading-relaxed mb-8 font-light max-w-md"
              style={{ color: "rgba(247,243,236,0.75)" }}
            >
              Jouw outfits, combinaties en stijlrapport wachten op je.
            </p>

            {/* Testimonial kaart */}
            <div
              className="rounded-2xl p-5 max-w-sm"
              style={{
                background: "rgba(247,243,236,0.09)",
                border: "1px solid rgba(247,243,236,0.15)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
              }}
            >
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 fill-current flex-shrink-0"
                    style={{ color: "rgba(166,136,106,0.95)" }}
                  />
                ))}
              </div>
              <p
                className="text-[15px] font-medium leading-snug mb-2.5"
                style={{ color: "rgba(247,243,236,0.92)" }}
              >
                "{quote.text}"
              </p>
              <p
                className="text-[12px] font-medium"
                style={{ color: "rgba(247,243,236,0.48)" }}
              >
                — {quote.author}
              </p>
            </div>

            {/* Trust-pills */}
            <div className="flex flex-wrap gap-2 mt-6">
              {["Gratis te proberen", "Geen creditcard", "Privacy-first"].map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full"
                  style={{
                    background: "rgba(247,243,236,0.09)",
                    border: "1px solid rgba(247,243,236,0.16)",
                    color: "rgba(247,243,236,0.68)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* ── Rechts / mobiel-center: formulier-kaart ── */}
          <div className="w-full sm:w-[420px] lg:w-[440px] flex-shrink-0 py-8 sm:py-20">

            {/* Mobiel: heading boven formulier */}
            <div className="sm:hidden mb-6">
              <h1
                className="font-heading font-bold tracking-tight mb-1.5 text-[var(--color-bg)]"
                style={{ fontSize: "clamp(2rem, 8vw, 2.4rem)", lineHeight: 1.1 }}
              >
                Welkom <em className="not-italic text-[var(--ff-color-primary-300)]">terug.</em>
              </h1>
              <p className="text-sm font-light" style={{ color: "rgba(247,243,236,0.70)" }}>
                Log in om je stijladvies en outfits terug te zien.
              </p>
            </div>

            {/* Glazen formulier-kaart */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "rgba(247,243,236,0.10)",
                border: "1px solid rgba(247,243,236,0.18)",
                backdropFilter: "blur(28px)",
                WebkitBackdropFilter: "blur(28px)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.28), 0 1px 0 rgba(255,255,255,0.06) inset",
              }}
            >
              {/* Kaart-header */}
              <div
                className="px-6 pt-6 pb-4 border-b"
                style={{ borderColor: "rgba(247,243,236,0.12)" }}
              >
                <p className="text-[11px] font-bold tracking-[0.14em] uppercase mb-1" style={{ color: "rgba(166,136,106,0.85)" }}>
                  Persoonlijk stijladvies
                </p>
                <p
                  className="text-lg font-semibold"
                  style={{ color: "rgba(247,243,236,0.95)" }}
                >
                  Inloggen bij FitFi
                </p>
              </div>

              <form
                onSubmit={onSubmit}
                noValidate
                className="p-6 space-y-5"
                aria-label="Inlogformulier"
              >
                {/* Context-banner vanuit /results */}
                {comingFromResults && (
                  <div
                    className="flex items-start gap-3 px-4 py-3.5 rounded-xl"
                    style={{
                      background: "rgba(122,97,74,0.35)",
                      border: "1px solid rgba(166,136,106,0.45)",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: "rgba(166,136,106,0.25)" }}
                    >
                      <FileText
                        className="w-4 h-4"
                        style={{ color: "rgba(247,243,236,0.90)" }}
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-snug" style={{ color: "rgba(247,243,236,0.95)" }}>
                        Log in om je stijlrapport terug te zien.
                      </p>
                      <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "rgba(247,243,236,0.65)" }}>
                        Je outfits, combinaties en shoplinks wachten op je.
                      </p>
                    </div>
                  </div>
                )}

                {/* Server-fout */}
                {serverError && (
                  <div>
                    <ErrorAlert error={serverError} />
                    {isCredentialError && (
                      <div className="mt-2.5 flex items-center gap-2 text-sm">
                        <span style={{ color: "rgba(247,243,236,0.60)" }}>
                          Wachtwoord vergeten?
                        </span>
                        <NavLink
                          to="/wachtwoord-vergeten"
                          className="font-semibold underline underline-offset-2 transition-colors"
                          style={{ color: "rgba(206,179,154,0.95)" }}
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
                    className="block text-sm font-semibold"
                    style={{ color: "rgba(247,243,236,0.85)" }}
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
                    className={`w-full px-4 py-3.5 min-h-[52px] text-base rounded-xl border-2 transition-all outline-none placeholder:opacity-50 disabled:opacity-50 ${
                      emailError
                        ? "border-[var(--ff-color-danger-500)] focus:border-[var(--ff-color-danger-600)]"
                        : "focus:border-[var(--ff-color-primary-400)]"
                    }`}
                    style={{
                      background: "rgba(247,243,236,0.10)",
                      borderColor: emailError ? undefined : "rgba(247,243,236,0.22)",
                      color: "rgba(247,243,236,0.95)",
                    }}
                  />
                  {touched.email && emailError && (
                    <p
                      id="login-email-error"
                      role="alert"
                      className="text-xs font-medium flex items-center gap-1.5 mt-1"
                      style={{ color: "rgba(252,165,165,0.95)" }}
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
                    className="block text-sm font-semibold"
                    style={{ color: "rgba(247,243,236,0.85)" }}
                  >
                    Wachtwoord
                  </label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                      style={{ color: "rgba(247,243,236,0.40)" }}
                    />
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
                      className={`w-full pl-10 pr-12 py-3.5 min-h-[52px] text-base rounded-xl border-2 transition-all outline-none placeholder:opacity-50 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden disabled:opacity-50 ${
                        pwError
                          ? "border-[var(--ff-color-danger-500)] focus:border-[var(--ff-color-danger-600)]"
                          : "focus:border-[var(--ff-color-primary-400)]"
                      }`}
                      style={{
                        background: "rgba(247,243,236,0.10)",
                        borderColor: pwError ? undefined : "rgba(247,243,236,0.22)",
                        color: "rgba(247,243,236,0.95)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      tabIndex={-1}
                      className="absolute right-0 top-0 h-full w-12 flex items-center justify-center transition-colors focus-visible:outline-none"
                      style={{ color: "rgba(247,243,236,0.45)" }}
                      aria-label={showPw ? "Verberg wachtwoord" : "Toon wachtwoord"}
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {touched.password && pwError && (
                    <p
                      id="login-pw-error"
                      role="alert"
                      className="text-xs font-medium flex items-center gap-1.5 mt-1"
                      style={{ color: "rgba(252,165,165,0.95)" }}
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
                      className="text-xs font-medium underline underline-offset-2 transition-colors"
                      style={{ color: "rgba(206,179,154,0.85)" }}
                    >
                      Wachtwoord vergeten?
                    </NavLink>
                  </div>
                </div>

                {/* Inloggen knop */}
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="group w-full inline-flex items-center justify-between px-5 min-h-[56px] rounded-[16px] font-bold text-[15px] transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                  style={{
                    background: "var(--ff-color-primary-600)",
                    color: "var(--color-bg)",
                    boxShadow:
                      "0 4px 24px rgba(166,136,106,0.55), 0 1px 0 rgba(255,255,255,0.08) inset",
                    letterSpacing: "0.01em",
                  }}
                >
                  {loading ? (
                    <>
                      <span>Bezig…</span>
                      <Loader2
                        className="w-5 h-5 animate-spin flex-shrink-0"
                        aria-hidden="true"
                      />
                    </>
                  ) : (
                    <>
                      <span>Inloggen</span>
                      <span
                        className="w-8 h-8 rounded-xl inline-flex items-center justify-center transition-transform duration-200 group-hover:translate-x-0.5"
                        style={{ background: "rgba(255,255,255,0.14)" }}
                        aria-hidden="true"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </>
                  )}
                </button>

                {/* Registreer-CTA */}
                <div
                  className="pt-4 border-t"
                  style={{ borderColor: "rgba(247,243,236,0.12)" }}
                >
                  <p
                    className="text-xs text-center mb-3"
                    style={{ color: "rgba(247,243,236,0.50)" }}
                  >
                    Nog geen account?
                  </p>
                  <NavLink
                    to="/registreren"
                    className="flex items-center justify-center gap-2 w-full min-h-[52px] rounded-[16px] font-semibold text-sm transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-400)]"
                    style={{
                      color: "rgba(247,243,236,0.86)",
                      background: "rgba(250,248,245,0.08)",
                      border: "1px solid rgba(250,248,245,0.18)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <span>Maak gratis account aan</span>
                    <ArrowRight className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  </NavLink>
                </div>

                {/* Quiz-CTA */}
                <div
                  className="rounded-xl p-4 flex flex-col gap-2"
                  style={{
                    background: "rgba(122,97,74,0.28)",
                    border: "1px solid rgba(166,136,106,0.35)",
                  }}
                >
                  <p
                    className="text-xs font-semibold flex items-center gap-1.5"
                    style={{ color: "rgba(247,243,236,0.90)" }}
                  >
                    <Sparkles className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                    Nog geen account nodig?
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(247,243,236,0.60)" }}>
                    Doe de stijlquiz direct — geen registratie vereist.
                  </p>
                  <NavLink
                    to="/onboarding"
                    className="mt-1 inline-flex items-center justify-center gap-2 w-full py-2.5 min-h-[44px] rounded-xl font-semibold text-sm transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2"
                    style={{
                      background: "rgba(247,243,236,0.12)",
                      border: "1px solid rgba(247,243,236,0.20)",
                      color: "rgba(247,243,236,0.82)",
                    }}
                  >
                    Start de quiz zonder account
                    <ArrowRight className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  </NavLink>
                </div>
              </form>
            </div>

            {/* Trust-badges */}
            <div
              className="mt-5 flex items-center justify-center gap-4 text-xs"
              style={{ color: "rgba(247,243,236,0.50)" }}
            >
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(134,239,172,0.80)" }} aria-hidden="true" />
                <span>GDPR-compliant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(134,239,172,0.80)" }} aria-hidden="true" />
                <span>256-bit encryptie</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(134,239,172,0.80)" }} aria-hidden="true" />
                <span>Jouw data</span>
              </div>
            </div>

            <div className="mt-4 text-center">
              <NavLink
                to="/contact"
                className="text-xs underline underline-offset-2 transition-colors"
                style={{ color: "rgba(247,243,236,0.38)" }}
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
