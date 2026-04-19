import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Mail, ArrowRight, Loader as Loader2, CircleCheck as CheckCircle, Lock, ArrowLeft } from "lucide-react";
import Seo from "@/components/seo/Seo";
import toast from "react-hot-toast";

function isEmail(v: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
}

export default function PasswordResetPage() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [touched, setTouched] = React.useState(false);

  const emailError =
    touched && !email
      ? "Vul je e-mailadres in."
      : touched && !isEmail(email)
      ? "Voer een geldig e-mailadres in, zoals jij@voorbeeld.nl."
      : null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!isEmail(email)) return;

    setLoading(true);
    setError(null);

    try {
      const { getSupabase } = await import("@/lib/supabase");
      const client = getSupabase();
      const { error: supaError } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/wachtwoord-instellen`,
      });

      if (supaError) {
        if (supaError.message?.toLowerCase().includes("rate limit")) {
          setError("Te veel pogingen. Wacht een moment en probeer opnieuw.");
        } else {
          setError("Er ging iets mis. Probeer het opnieuw of neem contact op.");
        }
        return;
      }

      setSent(true);
    } catch {
      setError("Er ging iets mis. Controleer je internetverbinding en probeer opnieuw.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Seo
        title="Wachtwoord vergeten — FitFi"
        description="Stuur een resetlink naar je e-mailadres om je wachtwoord opnieuw in te stellen."
        path="/wachtwoord-vergeten"
        noindex
      />

      <div
        className="w-full flex items-center justify-center px-4"
        style={{ minHeight: "calc(100vh - 72px)", background: "#FAFAF8" }}
      >
        <div className="w-full max-w-[420px] py-10">

          {/* Back link */}
          <NavLink
            to="/inloggen"
            className="inline-flex items-center gap-1.5 text-sm text-[#8A8A8A] hover:text-[#1A1A1A] mb-8 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4856E] rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Terug naar inloggen
          </NavLink>

          {!sent ? (
            <div
              className="rounded-2xl border border-[#E5E5E5] p-7 sm:p-8"
              style={{ background: "#FFFFFF", boxShadow: "0 4px 32px rgba(30,35,51,0.08)" }}
            >
              {/* Icon */}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: "#FAF5F2" }}
              >
                <Lock className="w-6 h-6" style={{ color: "#A8513A" }} aria-hidden="true" />
              </div>

              <h1 className="font-heading font-bold text-xl text-[#1A1A1A] mb-1">
                Wachtwoord vergeten?
              </h1>
              <p className="text-sm text-[#8A8A8A] mb-6 leading-relaxed">
                Vul je e-mailadres in. We sturen je een link waarmee je een nieuw wachtwoord kunt instellen.
              </p>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 p-3.5 rounded-xl mb-4 text-sm"
                  style={{
                    background: "#FEF2F2",
                    border: "1px solid #FECACA",
                    color: "#B91C1C",
                  }}
                >
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={onSubmit} noValidate aria-label="Wachtwoord reset formulier" className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="reset-email" className="block text-sm font-semibold text-[#1A1A1A]">
                    E-mailadres
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                      style={{ color: "#8A8A8A" }}
                      aria-hidden="true"
                    />
                    <input
                      id="reset-email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      placeholder="jij@voorbeeld.nl"
                      value={email}
                      autoFocus
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setTouched(true)}
                      aria-invalid={!!emailError}
                      aria-describedby={emailError ? "reset-email-error" : undefined}
                      disabled={loading}
                      className={`w-full pl-10 pr-4 py-3.5 min-h-[52px] text-base rounded-xl border-2 transition-colors bg-[#FAFAF8] text-[#1A1A1A] placeholder:text-[#8A8A8A] placeholder:opacity-60 outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:opacity-50 ${
                        emailError
                          ? "border-[#C24A4A] focus-visible:ring-[#FECACA]"
                          : "border-[#E5E5E5] focus-visible:border-[#C2654A] focus-visible:ring-[#F4E8E3]"
                      }`}
                    />
                  </div>
                  {emailError && (
                    <p id="reset-email-error" role="alert" className="text-xs font-medium flex items-center gap-1.5 mt-1" style={{ color: "#C24A4A" }}>
                      <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                      </svg>
                      {emailError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 min-h-[48px] rounded-xl font-semibold text-base transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2654A]/20"
                  style={{
                    background: "#A8513A",
                    color: "#FAFAF8",
                    boxShadow: "0 8px 40px rgba(166,136,106,0.35)",
                  }}
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /><span>Bezig…</span></>
                  ) : (
                    <><span>Stuur resetlink</span><ArrowRight className="w-5 h-5" aria-hidden="true" /></>
                  )}
                </button>
              </form>

              <div className="mt-4 text-center">
                <NavLink
                  to="/registreren"
                  className="text-sm text-[#8A8A8A] hover:text-[#A8513A] transition-colors underline underline-offset-2"
                >
                  Nog geen account? Maak er een aan
                </NavLink>
              </div>
            </div>
          ) : (
            <div
              className="rounded-2xl border border-[#E5E5E5] p-7 sm:p-8 text-center"
              style={{ background: "#FFFFFF", boxShadow: "0 4px 32px rgba(30,35,51,0.08)" }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: "#FAF5F2" }}
              >
                <CheckCircle className="w-7 h-7" style={{ color: "#A8513A" }} aria-hidden="true" />
              </div>
              <h1 className="font-heading font-bold text-xl text-[#1A1A1A] mb-2">
                Resetlink verstuurd
              </h1>
              <p className="text-sm text-[#8A8A8A] mb-1 leading-relaxed">
                Als <strong className="text-[#1A1A1A]">{email}</strong> bij ons bekend is, ontvang je binnen enkele minuten een e-mail met een resetlink.
              </p>
              <p className="text-xs text-[#8A8A8A] mb-7 leading-relaxed">
                Controleer ook je spam- of ongewenste e-mailmap.
              </p>

              <div className="space-y-2.5">
                <button
                  onClick={() => { setSent(false); setEmail(""); setTouched(false); }}
                  className="w-full py-3 rounded-xl font-semibold text-sm border-2 border-[#E5E5E5] text-[#1A1A1A] hover:border-[#D4856E] hover:bg-[#FAF5F2] transition-all"
                >
                  Ander e-mailadres proberen
                </button>
                <NavLink
                  to="/inloggen"
                  className="flex items-center justify-center gap-1.5 w-full py-3 rounded-xl font-bold text-sm transition-all"
                  style={{ background: "#A8513A", color: "#FAFAF8" }}
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  Terug naar inloggen
                </NavLink>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
