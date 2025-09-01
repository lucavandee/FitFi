import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useSearchParams } from "react-router-dom";
import supabase from "@/lib/supabase";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);

  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/dashboard";

  const sb = supabase; // client object

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setPending(true); setError(null); setMessage(null);
    try {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate(redirect);
    } catch (err: any) {
      setError(err?.message || "Inloggen mislukt. Controleer je gegevens.");
    } finally { setPending(false); }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setPending(true); setError(null); setMessage(null);
    try {
      const { data, error } = await sb.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
      });
      if (error) throw error;
      if (data?.user?.email_confirmed_at) {
        navigate("/dashboard");
      } else {
        setMessage("Account aangemaakt. Bevestig je e-mail om verder te gaan.");
      }
    } catch (err: any) {
      setError(err?.message || "Registreren mislukt.");
    } finally { setPending(false); }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setPending(true); setError(null); setMessage(null);
    try {
      const { error } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-wachtwoord`,
      });
      if (error) throw error;
      setMessage("Reset-link verzonden. Check je inbox.");
      setMode("login");
    } catch (err: any) {
      setError(err?.message || "Kon reset-e-mail niet versturen.");
    } finally { setPending(false); }
  }

  return (
    <>
      <Helmet>
        <title>
          {mode === "login" ? "Inloggen" : mode === "signup" ? "Account aanmaken" : "Wachtwoord vergeten"} • FitFi
        </title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-[#FAFAF7] to-white flex items-center justify-center px-4">
        <div className="w-full max-w-md ff-card p-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-heading font-bold text-ink">
              {mode === "login" ? "Welkom terug" : mode === "signup" ? "Account aanmaken" : "Wachtwoord vergeten"}
            </h1>
            <div className="flex gap-3 text-sm">
              {mode !== "login" && (
                <button onClick={() => { setMode("login"); setError(null); setMessage(null); }}
                        className="underline underline-offset-2 hover:text-accent">
                  Inloggen
                </button>
              )}
              {mode !== "signup" && (
                <button onClick={() => { setMode("signup"); setError(null); setMessage(null); }}
                        className="underline underline-offset-2 hover:text-accent">
                  Registreren
                </button>
              )}
              {mode !== "forgot" && (
                <button onClick={() => { setMode("forgot"); setError(null); setMessage(null); }}
                        className="underline underline-offset-2 hover:text-accent">
                  Wachtwoord vergeten
                </button>
              )}
            </div>
          </div>

          {mode !== "forgot" && (
            <form onSubmit={mode === "login" ? handleLogin : handleSignup} className="space-y-4">
              <label className="block text-sm font-medium">
                E-mail
                <input
                  type="email" required autoComplete="email"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border p-3 focus:ring-2 focus:ring-accent"
                  placeholder="jij@voorbeeld.nl"
                />
              </label>

              <label className="block text-sm font-medium">
                Wachtwoord
                <div className="mt-1 relative">
                  <input
                    type={showPwd ? "text" : "password"} required
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border p-3 pr-12 focus:ring-2 focus:ring-accent"
                    placeholder="••••••••" minLength={8}
                  />
                  <button type="button" aria-label={showPwd ? "Verberg wachtwoord" : "Toon wachtwoord"}
                          onClick={() => setShowPwd(v => !v)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs opacity-70 hover:opacity-100">
                    {showPwd ? "Verberg" : "Toon"}
                  </button>
                </div>
                {mode === "login" && (
                  <div className="mt-1">
                    <button type="button"
                            className="text-sm underline underline-offset-2 hover:text-accent"
                            onClick={() => setMode("forgot")}>
                      Wachtwoord vergeten?
                    </button>
                  </div>
                )}
              </label>

              {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
              {message && <p className="text-sm text-green-700">{message}</p>}

              <button type="submit" disabled={pending} className="btn btn-primary w-full py-3 text-lg font-semibold">
                {pending ? "Bezig..." : mode === "login" ? "Inloggen" : "Account aanmaken"}
              </button>
            </form>
          )}

          {mode === "forgot" && (
            <form onSubmit={handleForgot} className="space-y-4">
              <label className="block text-sm font-medium">
                E-mail
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border p-3 focus:ring-2 focus:ring-accent"
                  placeholder="jij@voorbeeld.nl"
                />
              </label>

              {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
              {message && <p className="text-sm text-green-700">{message}</p>}

              <div className="flex gap-2">
                <button type="submit" disabled={pending} className="btn btn-primary flex-1 py-3">
                  {pending ? "Bezig..." : "Stuur reset-link"}
                </button>
                <button type="button" className="btn btn-ghost flex-1 py-3" onClick={() => setMode("login")}>
                  Terug
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}