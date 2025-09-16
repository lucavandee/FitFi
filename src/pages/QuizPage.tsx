import React from "react";

const QuizPage: React.FC = () => {
  return (
    <main className="bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
      <section
        className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24"
        aria-labelledby="quiz-title"
      >
        <h1
          id="quiz-title"
          className="font-heading text-[clamp(2rem,5vw,2.5rem)] leading-tight tracking-[-0.02em]"
        >
          Quiz
        </h1>
        <p className="mt-3 text-[color:var(--color-muted)]">
          Beantwoord een paar korte vragen. Op basis daarvan bouwen we je
          stijlprofiel en eerste outfits.
        </p>

        {/* Placeholdervrije, toegankelijke form-structuur (UI wordt door bestaande quizlogica ingevuld) */}
        <form className="mt-8 space-y-8" aria-describedby="quiz-help">
          <fieldset className="card">
            <legend className="sr-only">Stijlrichting</legend>
            <div className="card-inner space-y-3">
              <label className="block">
                <span className="text-sm">Welke richting spreekt je het meest aan?</span>
                <select
                  className="mt-2 input"
                  aria-label="Stijlrichting"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Maak een keuze
                  </option>
                  <option value="smart-minimal">Smart minimal</option>
                  <option value="italian-casual">Italiaans casual</option>
                  <option value="relaxed-weekend">Relaxed weekend</option>
                </select>
              </label>
              <p className="text-xs text-[color:var(--color-muted)]">
                Kies wat het dichtst bij je gevoel ligt; je kunt dit later finetunen.
              </p>
            </div>
          </fieldset>

          <fieldset className="card">
            <legend className="sr-only">Comfort</legend>
            <div className="card-inner">
              <label className="block">
                <span className="text-sm">Hoe belangrijk is comfort?</span>
                <input
                  type="range"
                  min={0}
                  max={10}
                  defaultValue={7}
                  className="range"
                  aria-label="Comfortniveau"
                />
              </label>
            </div>
          </fieldset>

          <div className="flex items-center gap-3">
            <button type="submit" className="btn btn-primary" aria-label="Volgende">
              Volgende
            </button>
            <a href="/dynamic-onboarding" className="btn btn-ghost">
              Terug
            </a>
          </div>

          <p id="quiz-help" className="text-xs text-[color:var(--color-muted)]">
            Wij slaan geen gevoelige data op zonder toestemming.
          </p>
        </form>
      </section>
    </main>
  );
};

export default QuizPage;