// /src/pages/RegisterPage.tsx
import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { Eye, EyeOff, CircleAlert as AlertCircle, CircleCheck as CheckCircle2, ShieldCheck, BookmarkCheck } from "lucide-react";
import PageHero from "@/components/marketing/PageHero";
import Button from "@/components/ui/Button";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.trim().length > 3 && pw.length >= 6 && accepted;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!canSubmit) {
      setError("Vul je gegevens correct in en accepteer de voorwaarden.");
      return;
    }
    // Demo: direct door naar resultaten
    navigate("/results");
  };

  return (
    <main>
      <PageHero
        eyebrow="Gratis account"
        title="Start in 1 minuut — outfits die écht bij je passen"
        subtitle="Bewaar favorieten, verdien punten en ontgrendel challenges. Rustige, consistente UI die je focus houdt op stijl."
      />

      <section className="container mx-auto px-4 md:px-6 -mt-6 md:-mt-8">
        {/* Waarom registreren — compacte callout */}
        <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 md:p-6 shadow-[var(--shadow-soft)] mb-6 md:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center" aria-hidden>
                <BookmarkCheck className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-[var(--color-text)]">Bewaar outfits</p>
                <p className="text-[var(--color-text)]/70 text-sm">Favorieten en wishlist op één plek.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center" aria-hidden>
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-[var(--color-text)]">Punten & streaks</p>
                <p className="text-[var(--color-text)]/70 text-sm">Ontvang beloningen met dagelijkse checks.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center" aria-hidden>
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-[var(--color-text)]">Persoonlijker advies</p>
                <p className="text-[var(--color-text)]/70 text-sm">Betere matches op basis van voorkeuren.</p>
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
                  autoComplete="new-password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder="Minimaal 6 tekens"
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

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1"
                aria-label="Ik accepteer de voorwaarden"
              />
              <span className="text-[var(--color-text)]/80 text-sm">
                Ik ga akkoord met de{" "}
                <NavLink to="/voorwaarden" className="underline">voorwaarden</NavLink> en{" "}
                <NavLink to="/privacy" className="underline">privacy</NavLink>.
              </span>
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
              Maak account aan
            </Button>

            <p className="text-center text-sm text-[var(--color-text)]/70">
              Al een account?{" "}
              <NavLink to="/login" className="underline">Log in</NavLink>
            </p>
          </div>
        </form>
      </section>
    </main>
  );
};

export default RegisterPage;