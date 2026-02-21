import React from "react";

const NotFoundPage = () => {
  return (
    <section className="ff-section bg-[var(--color-bg)]">
      <div className="ff-container py-24 text-center">
        <p className="text-5xl font-bold text-[var(--ff-color-primary-700)] mb-4">404</p>
        <h1 className="ff-h2 text-[var(--color-text)] mb-4">Pagina niet gevonden</h1>
        <p className="ff-body text-[var(--color-muted)] mb-8 max-w-md mx-auto">
          De pagina die je zocht bestaat niet. Ga terug naar de homepage of start de stijlquiz.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="/" className="ff-btn ff-btn-primary ff-btn--md">
            Naar homepage
          </a>
          <a href="/onboarding" className="ff-btn ff-btn-secondary ff-btn--md">
            Start stijlquiz
          </a>
        </div>
      </div>
    </section>
  );
};

export default NotFoundPage;
