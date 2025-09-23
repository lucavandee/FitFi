import React from 'react';

export default function Hero() {
  return (
    <section className="ff-section hero">
      <div className="ff-container">
        <span className="hero__eyebrow">Gratis AI Style Report</span>
        <h1 className="hero__title">Ontdek wat jouw stijl over je zegt</h1>
        <p className="hero__lead">
          Beantwoord 6 korte vragen en ontvang direct een persoonlijk stijlprofiel met outfits en shoplinks — privacy-first, zonder ruis.
        </p>

        <div className="hero__cta">
          <button className="btn btn--primary">Start gratis</button>
          <button className="btn btn--ghost">Bekijk voorbeeld</button>
        </div>

        <div className="hero__bullets">
          <span className="chip">100% gratis</span>
          <span className="chip">Klaar in 2 min</span>
          <span className="chip">Outfits + shoplinks</span>
          <span className="chip">Privacy-first</span>
        </div>

        <div className="hero__visual">
          <img src="/images/hero/main.jpg" alt="FitFi AI styling preview" />
        </div>
      </div>
    </section>
  );
}