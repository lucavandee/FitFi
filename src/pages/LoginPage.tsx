import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useSearchParams } from "react-router-dom";
import supabase from "@/lib/supabase";

type Mode = "login" | "signup" | "forgot";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);

  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/";

  const sb = supabase; // client object — niet aanroepen

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);

    try {
      const { data, error } = await sb.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // logged in
      setMessage("Je bent ingelogd.");
      // kleine delay voor UX, dan door
      setTimeout(() => navigate(redirect), 150);
    } catch (err: any) {
      setError(
        err?.message ||
          "Inloggen mislukt. Controleer je e-mailadres en wachtwoord."
      );
    } finally {
      setPending(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);

    try {
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;

      // Afhankelijk van je Supabase settings kan email-verificatie vereist zijn
      if (data?.user?.email_confirmed_at) {
        setMessage("Account aangemaakt en ingelogd.");
        setTimeout(() => navigate(redirect), 150);
      } else {
        setMessage(
          "Account aangemaakt. Check je inbox om je e-mail te bevestigen."
        );
      }
    } catch (err: any) {
      setError(
        err?.message || "Registreren mislukt. Probeer het opnieuw."
      );
    } finally {
      setPending(false);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-wachtwoord`,
      });
      if (error) throw error;
      setMessage("We hebben je een e-mail gestuurd om je wachtwoord te resetten.");
      setMode("login");
    } catch (err: any) {
      setError(err?.message || "Kon reset-e-mail niet versturen.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>{mode === "login" ? "Inloggen" : mode === "signup" ? "Account aanmaken" : "Wachtwoord vergeten"} • FitFi</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-[#FAFAF7] to-[#FFFDF8] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold">
              {mode === "login" && "Inloggen"}
              {mode === "signup" && "Account aanmaken"}
              {mode === "forgot" && "Wachtwoord vergeten"}
            </h1>
            <div className="flex gap-2 text-sm">
              {mode !== "login" && (
                <button
                  type="button"
                  className="underline underline-offset-2 hover:opacity-80"
                  onClick={() => {
                    setMode("login");
                    setError(null);
                    setMessage(null);
                  }}
                >
                  Inloggen
                </button>
              )}
              {mode !== "signup" && (
                <button
                  type="button"
                  className="underline underline-offset-2 hover:opacity-80"
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                    setMessage(null);
                  }}
                >
                  Registreren
                </button>
              )}
              {mode !== "forgot" && (
                <button
                  type="button"
                  className="underline underline-offset-2 hover:opacity-80"
                  onClick={() => {
                    setMode("forgot");
                    setError(null);
                    setMessage(null);
                  }}
                >
                  Wachtwoord vergeten
                </button>
              )}
            </div>
          </div>

          {mode !== "forgot" && (
            <form onSubmit={mode === "login" ? handleLogin : handleSignup} className="space-y-4">
              <label className="block text-sm">
                E-mail
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border p-2"
                  placeholder="jij@voorbeeld.nl"
                />
              </label>

              <label className="block text-sm">
                Wachtwoord
                <div className="mt-1 relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    required
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border p-2 pr-10"
                    placeholder="••••••••"
                    minLength={8}
                  />
                  <button
                    type="button"
                    aria-label={showPwd ? "Verberg wachtwoord" : "Toon wachtwoord"}
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-sm opacity-70 hover:opacity-100"
                  >
                    {showPwd ? "Verberg" : "Toon"}
                  </button>
                </div>
                {mode === "login" && (
                  <div className="mt-1">
                    <button
                      type="button"
                      className="text-sm underline underline-offset-2 hover:opacity-80"
                      onClick={() => setMode("forgot")}
                    >
                      Wachtwoord vergeten?
                    </button>
                  </div>
                )}
              </label>

              {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
              {message && <p className="text-sm text-green-700">{message}</p>}

              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-lg bg-black text-white py-2 disabled:opacity-60"
              >
                {pending ? "Bezig..." : mode === "login" ? "Inloggen" : "Account aanmaken"}
              </button>
            </form>
          )}

          {mode === "forgot" && (
            <form onSubmit={handleForgot} className="space-y-4">
              <label className="block text-sm">
                E-mail
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border p-2"
                  placeholder="jij@voorbeeld.nl"
                />
              </label>

              {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
              {message && <p className="text-sm text-green-700">{message}</p>}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={pending}
                  className="flex-1 btn btn-primary disabled:opacity-60"
                >
                  {pending ? "Bezig..." : "Stuur reset-link"}
                </button>
                <button
                  type="button"
                  className="flex-1 btn btn-ghost"
                  onClick={() => setMode("login")}
                >
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