import React from "react";
import Seo from "@/components/seo/Seo";

const NotFoundPage = () => {
  return (
    <main id="main" className="bg-[var(--color-bg)]">
      <Seo
        title="Pagina niet gevonden — FitFi"
        description="Deze pagina bestaat niet. Ga terug naar de homepage of start de stijlquiz."
        noindex
      />
      <section className="ff-section">
        <div className="ff-container py-16 sm:py-20 md:py-24 text-center">
          <p
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-[var(--ff-color-primary-700)] mb-4"
            aria-hidden="true"
          >
            404
          </p>
          <h1 className="ff-h2 text-[var(--color-text)] mb-4">Pagina niet gevonden</h1>
          <p className="ff-body text-[var(--color-muted)] mb-8 max-w-sm mx-auto">
            De pagina die je zocht bestaat niet meer of is verplaatst.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/" className="ff-btn ff-btn-primary ff-btn--md">
              Naar de homepage
            </a>
            <a href="/onboarding" className="ff-btn ff-btn-secondary ff-btn--md">
              Start de stijlquiz
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};

export default NotFoundPage;
