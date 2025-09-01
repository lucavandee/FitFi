import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import supabase from "@/lib/supabase";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const sb = supabase;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Inloggen mislukt.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Helmet><title>Inloggen • FitFi</title></Helmet>
      <div className="min-h-screen bg-gradient-to-b from-[#F6F6F6] to-white flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-card border border-black/5 p-8">
          <h1 className="text-2xl font-heading font-bold text-ink mb-2">
            {mode === "login" ? "Welkom terug" : "Account aanmaken"}
          </h1>
          <p className="text-muted mb-6 text-sm">
            {mode === "login"
              ? "Log in om je persoonlijke stijl-dashboard te openen."
              : "Maak je account aan en ontdek jouw stijl."}
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <label className="block text-sm font-medium">
              E-mail
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border p-3 focus:ring-2 focus:ring-accent"
                placeholder="jij@voorbeeld.nl"
              />
            </label>

            <label className="block text-sm font-medium">
              Wachtwoord
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border p-3 focus:ring-2 focus:ring-accent"
                placeholder="••••••••"
              />
            </label>

            {error && <p className="text-red-600 text-sm">{error}</p>}
            {message && <p className="text-green-600 text-sm">{message}</p>}

            <button
              type="submit"
              disabled={pending}
              className="btn btn-primary w-full py-3 text-lg font-semibold"
            >
              {pending ? "Bezig..." : "Inloggen"}
            </button>
          </form>

          <div className="mt-6 flex justify-between text-sm">
            <button
              type="button"
              onClick={() => setMode("signup")}
              className="underline hover:text-accent"
            >
              Registreren
            </button>
            <button
              type="button"
              onClick={() => setMode("forgot")}
              className="underline hover:text-accent"
            >
              Wachtwoord vergeten?
            </button>
          </div>
        </div>
      </div>
    </>
  );
}