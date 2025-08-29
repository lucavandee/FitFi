import React, { useState } from "react";
import supabase from "@/lib/supabase";
import { Helmet } from "react-helmet-async";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const sb = supabase; // ✅ client object, niet aanroepen

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    try {
      const { data, error } = await sb.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setMessage("We hebben je een loginlink gemaild. Check je inbox.");
    } catch (err: any) {
      setMessage(err?.message || "Er ging iets mis bij inloggen.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>Inloggen • FitFi</title>
      </Helmet>

      <div className="min-h-screen bg-primary flex items-center justify-center p-4">
        <form
          onSubmit={handleMagicLink}
          className="w-full max-w-md bg-white rounded-2xl shadow p-6 space-y-4"
        >
          <h1 className="text-xl font-semibold">Inloggen</h1>
          <label className="block text-sm">
            E-mail
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border p-2"
              placeholder="jij@voorbeeld.nl"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-black text-white py-2 disabled:opacity-60"
          >
            {pending ? "Verzenden..." : "Stuur magic link"}
          </button>

          {message && <p className="text-sm text-muted-foreground">{message}</p>}
        </form>
      </div>
    </>
  );
}