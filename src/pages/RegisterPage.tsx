import React, { useState } from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Loader as Loader2, Clock, Sparkles, Lock, AlertCircle } from "lucide-react";
import Seo from "@/components/seo/Seo";
import { useUser } from "@/context/UserContext";
import Logo from "@/components/ui/Logo";
import toast from "react-hot-toast";
import track from "@/utils/telemetry";
import {
  emailErrors, passwordErrors, getSupabaseAuthError,
  type ErrorMessage,
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

const strengthBarColors = [
  "bg-[#C24A4A]",
  "bg-[#C24A4A]",
  "bg-[#D4913D]",
  "bg-[#3D8B5E]",
  "bg-[#3D8B5E]",
] as const;

const strengthTextColors = [
  "text-[#C24A4A]",
  "text-[#C24A4A]",
  "text-[#D4913D]",
  "text-[#3D8B5E]",
  "text-[#3D8B5E]",
] as const;

const TRUST_ITEMS = [
  { icon: Clock, title: "Klaar in 2 minuten", desc: "Korte quiz, direct resultaat" },
  { icon: Sparkles, title: "Persoonlijk rapport", desc: "Kleuren, outfits en shoplinks" },
  { icon: Lock, title: "Jouw data, jouw keuze", desc: "Verwijder je account op elk moment" },
];

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, user, status } = useUser();
  const fromPath = (location.state as { from?: string })?.from;

  React.useEffect(() => {
    if (status === 'authenticated' && user) {
      navigate(fromPath || '/dashboard', { replace: true });
    }
  }, [status, user, fromPath, navigate]);

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

  const isEmailTaken = serverError?.title === "E-mailadres al in gebruik";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setServerError(null);

    if (!isEmail(email)) { setServerError(emailErrors.invalid(email)); return; }
    if (password.length < 8) { setServerError(passwordErrors.tooShort(8)); return; }
    if (!accepted) { toast.error("Accepteer de voorwaarden om verder te gaan."); return; }

    setLoading(true);
    try {
      const displayName = email.split("@")[0];
      await register(email, password, displayName);
      track("registration_success", { source: fromPath || "direct" });
      toast.success("Account aangemaakt! Je bent nu ingelogd.");
      setTimeout(() => navigate("/onboarding"), 400);
    } catch (err: unknown) {
      const supaErr = err as { message?: string; status?: number } | null;
      if (
        supaErr?.message?.toLowerCase().includes("already registered") ||
        supaErr?.message?.toLowerCase().includes("user already registered") ||
        supaErr?.status === 422
      ) {
        setServerError(emailErrors.alreadyExists());
      } else {
        setServerError(getSupabaseAuthError(err));
      }
      track("registration_error", { reason: (err as Error)?.message || "unknown" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Seo
        title="Account aanmaken — FitFi"
        description="Maak een gratis FitFi account aan en sla je stijlrapport op."
        path="/registreren"
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
              {comingFromResults ? "Bewaar je resultaten" : "Start jouw stijlreis"}
            </h2>
            <p className="text-base text-[#4A4A4A] text-center leading-[1.7] mb-12">
              In twee minuten weet je welke kleuren en outfits bij je passen.
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
              <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">
                {comingFromResults ? "Sla je resultaten op" : "Account aanmaken"}
              </h1>
              <p className="text-sm text-[#4A4A4A] mb-10">
                Al een account?{" "}
                <NavLink
                  to="/inloggen"
                  className="text-[#C2654A] hover:text-[#A8513A] underline underline-offset-4 transition-colors duration-200"
                >
                  Inloggen
                </NavLink>
              </p>
            </motion.div>

            <form onSubmit={onSubmit} noValidate aria-label="Registratieformulier">
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
              {serverError && isEmailTaken && (
                <div className="mb-6 flex items-center gap-2 text-sm">
                  <span className="text-[#8A8A8A]">Al een account?</span>
                  <NavLink to="/inloggen" className="font-semibold text-[#C2654A] underline underline-offset-2 hover:text-[#A8513A]">
                    Inloggen
                  </NavLink>
                </div>
              )}

              <div className="space-y-5">
                {/* Email field */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.08 }}
                  className="space-y-2"
                >
                  <label htmlFor="reg-email" className="block text-sm font-medium text-[#1A1A1A]">
                    E-mailadres
                  </label>
                  <input
                    id="reg-email"
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
                    aria-describedby={emailError ? "reg-email-error" : undefined}
                    disabled={loading}
                    className={`w-full bg-white border rounded-2xl py-4 px-5 text-base text-[#1A1A1A] placeholder:text-[#8A8A8A] focus:outline-none focus:ring-2 focus:ring-[#C2654A]/20 focus:border-[#C2654A] transition-all duration-200 disabled:opacity-50 ${
                      emailError
                        ? "border-[#C24A4A] focus:ring-[#C24A4A]/20"
                        : "border-[#E5E5E5]"
                    }`}
                  />
                  {touched.email && emailError && (
                    <p id="reg-email-error" role="alert" className="text-sm text-[#C24A4A] mt-2 flex items-center gap-1.5">
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
                  <label htmlFor="reg-password" className="block text-sm font-medium text-[#1A1A1A]">
                    Wachtwoord
                  </label>
                  <div className="relative">
                    <input
                      id="reg-password"
                      type={showPw ? "text" : "password"}
                      autoComplete="new-password"
                      enterKeyHint="done"
                      placeholder="Minimaal 8 tekens"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                      aria-invalid={!!pwError}
                      aria-describedby="reg-pw-hint"
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

                  {pwData ? (
                    <div className="mt-2" aria-live="polite">
                      <div className="h-1 bg-[#E5E5E5] rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ease-out rounded-full ${strengthBarColors[pwData.score]}`}
                          style={{ width: `${pwData.pct}%` }}
                        />
                      </div>
                      <p className={`text-xs font-medium mt-1 ${strengthTextColors[pwData.score]}`}>{pwData.label}</p>
                    </div>
                  ) : (
                    <p id="reg-pw-hint" className="text-xs text-[#8A8A8A] mt-1.5">Minimaal 8 tekens, mix van letters en cijfers.</p>
                  )}

                  {touched.password && pwError && (
                    <p role="alert" className="text-sm text-[#C24A4A] mt-2 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-[#C24A4A]" />
                      <InlineError error={pwError} />
                    </p>
                  )}
                </motion.div>
              </div>

              {/* Checkbox + trust notes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.24 }}
              >
                <label className="flex items-start gap-3 mt-6 cursor-pointer group">
                  <div className="flex-shrink-0 mt-0.5">
                    <div
                      role="checkbox"
                      aria-checked={accepted}
                      tabIndex={0}
                      onClick={() => setAccepted(!accepted)}
                      onKeyDown={(e) => (e.key === " " || e.key === "Enter") && setAccepted(!accepted)}
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#C2654A]/40 ${
                        accepted
                          ? "bg-[#C2654A] border-[#C2654A]"
                          : "bg-white border-[#E5E5E5] group-hover:border-[#C2654A]"
                      }`}
                    >
                      {accepted && (
                        <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M2 6l3 3 5-5" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-[#4A4A4A] leading-[1.5]">
                    Ik ga akkoord met de{" "}
                    <a href="/algemene-voorwaarden" target="_blank" rel="noopener noreferrer" className="text-[#C2654A] underline underline-offset-2 hover:text-[#A8513A]" onClick={(e) => e.stopPropagation()}>algemene voorwaarden</a>{" "}
                    en het{" "}
                    <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-[#C2654A] underline underline-offset-2 hover:text-[#A8513A]" onClick={(e) => e.stopPropagation()}>privacybeleid</a>.
                  </span>
                </label>

                {/* Trust notes with terracotta dots */}
                <div className="mt-4 space-y-2">
                  {[
                    "Geen spam. Alleen updates die jij aanzet.",
                    "We vragen alleen wat nodig is voor je rapport.",
                    "Je kunt je account altijd verwijderen.",
                  ].map((text) => (
                    <div key={text} className="text-xs text-[#8A8A8A] flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-[#C2654A] flex-shrink-0" />
                      {text}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Submit button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.32 }}
              >
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#C2654A] hover:bg-[#A8513A] text-white font-semibold text-base py-3 px-6 rounded-xl transition-colors duration-200 mt-8 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /><span>Account aanmaken...</span></>
                  ) : (
                    <><span>Account aanmaken</span><ArrowRight className="w-4 h-4" aria-hidden="true" /></>
                  )}
                </button>
              </motion.div>
            </form>

            {/* Start quiz without account */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
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

            {/* Contact link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.48 }}
              className="text-center mt-6"
            >
              <NavLink
                to="/contact"
                className="text-sm text-[#8A8A8A] hover:text-[#4A4A4A] transition-colors duration-200"
              >
                Vragen? Neem contact op
              </NavLink>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
