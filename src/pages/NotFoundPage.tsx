import React from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";

const NotFoundPage: React.FC = () => {
  return (
    <main id="main" className="bg-[var(--color-bg)] min-h-screen">
      <Seo
        title="Pagina niet gevonden | FitFi"
        description="De pagina die je zoekt bestaat niet. Ga terug naar de homepage of bekijk onze prijzen."
        canonical="https://fitfi.ai/404"
      />

      <section className="ff-section">
        <div className="ff-container">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] p-8 text-center">
            <p className="kicker">Fout 404</p>
            <h1 className="section-title">Pagina niet gevonden</h1>
            <p className="section-intro">
              De link kan verouderd zijn of de pagina is verplaatst.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/" className="btn btn-primary" aria-label="Ga naar de homepage">
                Terug naar home
              </Link>
              <Link to="/prijzen" className="btn btn-secondary" aria-label="Bekijk prijzen">
                Bekijk prijzen
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default NotFoundPage;