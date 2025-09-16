import React from "react";
import { Link } from "react-router-dom";

const Hero: React.FC = () => {
  return (
    <section id="main" className="section" aria-labelledby="hero-title">
      <div className="container grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7 flex flex-col justify-center">
          <h1 id="hero-title" className="hero__title">Ontdek jouw perfecte stijl met AI</h1>
          <p className="lead mt-3 max-w-2xl">
            Van persoonlijkheidstest tot gepersonaliseerde outfits — inclusief korte uitleg
            waarom het werkt bij jouw silhouet, materialen en kleurtemperatuur.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link to="/registreren" className="btn btn-primary btn-lg">Ja, geef mij mijn gratis AI Style Report</Link>
            <Link to="/hoe-het-werkt" className="btn btn-ghost btn-lg">Hoe werkt het?</Link>
          </div>
        </div>
        <div className="lg:col-span-5">
          <div className="card interactive-elevate h-64" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
};

export default Hero;