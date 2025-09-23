import React from "react";

export default function LandingPage() {
  return (
    <section className="ff-section ff-hero">
      <div className="ff-container">
        <div className="ff-hero__eyebrow">Welkom bij FitFi</div>
        <h1 className="ff-hero__title">
          Ontdek jouw perfecte stijl met <span style={{color: 'var(--ff-primary-600)'}}>AI</span>
        </h1>
        <p className="ff-hero__lead">
          FitFi helpt je de kleding te vinden die perfect bij jou past. 
          Geen giswerk meer, alleen outfits die je zelfvertrouwen boosten.
        </p>
        <div className="d-flex" style={{gap: 'var(--sp-4)', marginTop: 'var(--sp-6)'}}>
          <button className="btn btn--primary">Start gratis</button>
          <button className="btn btn--ghost">Hoe het werkt</button>
        </div>
      </div>
    </section>
  );
}