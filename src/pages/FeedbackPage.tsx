// src/pages/FeedbackPage.tsx
import React from "react";
import { Star, Send } from "lucide-react";

export default function FeedbackPage() {
  const [rating, setRating] = React.useState<number | null>(4);
  const [msg, setMsg] = React.useState("");

  return (
    <main id="main" className="bg-bg text-text">
      <section className="ff-container ff-stack-lg py-12 sm:py-14">
        <header className="ff-stack">
          <p className="text-sm text-text/70">Help FitFi beter maken</p>
          <h1 className="font-heading text-2xl sm:text-3xl">Feedback</h1>
          <p className="text-text/80 max-w-2xl">
            Deel je ervaring. Kort is prima — we lezen alles zelf.
          </p>
        </header>

        <form
          className="ff-card p-5 ff-stack"
          onSubmit={(e) => {
            e.preventDefault();
            alert("Dankjewel! We hebben je feedback ontvangen.");
            setMsg("");
          }}
        >
          <fieldset>
            <legend className="font-semibold">Hoe zou je FitFi beoordelen?</legend>
            <div className="mt-2 flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={rating === n}
                  onClick={() => setRating(n)}
                  className={[
                    "ff-btn h-10 w-10 p-0",
                    rating && n <= rating ? "ff-btn-primary" : "ff-btn-secondary",
                  ].join(" ")}
                >
                  <Star className="w-4 h-4" aria-hidden />
                  <span className="sr-only">{n} sterren</span>
                </button>
              ))}
            </div>
          </fieldset>

          <label className="ff-stack">
            <span className="font-semibold">Wat kunnen we beter doen?</span>
            <textarea
              className="min-h-[120px] w-full bg-surface border border-border rounded-lg p-3 outline-none"
              placeholder="Voorbeeld: De uitleg bij kleuren mag compacter…"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
            />
          </label>

          <div className="cta-row">
            <button type="submit" className="ff-btn ff-btn-primary">
              <Send className="w-4 h-4" />
              <span className="ml-2">Versturen</span>
            </button>
            <a href="/privacy" className="ff-btn ff-btn-secondary">
              Privacyverklaring
            </a>
          </div>
        </form>
      </section>
    </main>
  );
}