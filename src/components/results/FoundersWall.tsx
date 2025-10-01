// /src/components/results/FoundersWall.tsx
import React, { useState } from "react";
import { Mail, Clock as Unlock } from "lucide-react";
import Button from "@/components/ui/Button";

const FoundersWall: React.FC = () => {
  const [email, setEmail] = useState("");
  const valid = /\S+@\S+\.\S+/.test(email);

  const onSubmit = (e: React.FormEvent) => {
    // Non-blocking: laat de pagina doorlopen; Netlify Forms pakt het op wanneer geconfigureerd.
    // Zonder Netlify blijft dit een no-op en geeft de UI wel feedback.
    if (!valid) e.preventDefault();
  };

  return (
    <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-bg)] p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
          <Unlock className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-[var(--color-text)]">Founders-toegang</h3>
          <p className="text-[var(--color-text)]/70 text-sm">
            Ontgrendel extra outfits & challenges. Gratis voor early users.
          </p>
        </div>
      </div>

      <form
        name="founders-wall"
        method="POST"
        data-netlify="true"
        onSubmit={onSubmit}
        className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2"
      >
        <input type="hidden" name="form-name" value="founders-wall" />
        <label className="sr-only" htmlFor="founders-email">E-mail</label>
        <input
          id="founders-email"
          name="email"
          type="email"
          required
          inputMode="email"
          autoComplete="email"
          placeholder="jij@voorbeeld.nl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
        <Button
          type="submit"
          variant="primary"
          size="lg"
          icon={<Mail className="w-4 h-4" />}
        >
          Ontgrendel
        </Button>
      </form>

      {!valid && email.length > 0 ? (
        <p className="mt-2 text-xs text-[var(--color-text)]/70">Voer een geldig e-mailadres in.</p>
      ) : null}
    </div>
  );
};

export default FoundersWall;