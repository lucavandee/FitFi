// /src/pages/LoginPage.tsx
import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { Eye, EyeOff, CircleAlert as AlertCircle, CircleCheck as CheckCircle2, ShieldCheck, BookmarkCheck } from "lucide-react";
import PageHero from "@/components/marketing/PageHero";
import Button from "@/components/ui/Button";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.trim().length > 3 && pw.length >= 6;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!canSubmit) {
      setError("Vul je e-mail en wachtwoord correct in.");
      return;
    }
    // Demo: direct door naar resultaten
    navigate("/results");
  };

  return (
    <main>
      <PageHero
        eyebrow="Welkom terug"
        title="Log in — ga verder met je stijl"
        subtitle="Bewaarde outfits, punten en challenges: log in en ga verder waar je was."
      />

      <section className="container mx-auto px-4 md:px-6 -mt-6 md:-mt-8">
        {/* Waarom inloggen — compacte callout */}
        <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 md:p-6 shadow-[var(--shadow-soft)] mb-6 md:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center" aria-hidden>
                <BookmarkCheck className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-[var(--color-text)]">Bewaar favorieten</p>
                <p className="text-[var(--color-text)]/70 text-sm">Snel terug naar je beste matches.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center" aria-hidden>
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-[var(--color-text)]">Levels & streaks</p>
                <p className="text-[var(--color-text)]/70 text-sm">Behoud je voortgang en beloningen.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center" aria-hidden>
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-[var(--color-text)]">Persoonlijker advies</p>
                <p className="text-[var(--color-text)]/70 text-sm">Hoe meer je gebruikt, hoe beter de tips.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulier */}
        <form onSubmit={onSubmit} className="max-w-xl mx-auto rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 md:p-8 shadow-[var(--shadow-soft)]">
          <div className="space-y-4">
            <label className="block">
              <span className="block text-sm text-[var(--color-text)]/80 mb-1">E-mail</span>
              <input
                type="email"
                required
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="jij@voorbeeld.nl"
                aria-label="E-mail"
              />
            </label>

            <label className="block">
              <span className="block text-sm text-[var(--color-text)]/80 mb-1">Wachtwoord</span>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete="current-password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder="Je wachtwoord"
                  aria-label="Wachtwoord"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
                  aria-label={showPw ? "Verberg wachtwoord" : "Toon wachtwoord"}
                >
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </label>

            {error ? (
              <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-[var(--color-text)]">
                <AlertCircle className="w-4 h-4" />
                <p className="text-sm">{error}</p>
              </div>
            ) : null}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={!canSubmit}
            >
              Log in
            </Button>

            <p className="text-center text-sm text-[var(--color-text)]/70">
              Nog geen account?{" "}
              <NavLink to="/register" className="underline">Maak er gratis één</NavLink>
            </p>
          </div>
        </form>
      </section>
    </main>
  );
};

export default LoginPage;