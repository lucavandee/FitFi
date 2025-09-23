import React from "react";

export default function PricingPage() {
  return (
    <section className="ff-section">
      <div className="ff-container">
        <div className="ff-hero">
          <h1 className="ff-hero__title">Prijzen</h1>
          <p className="ff-hero__lead">
            Kies het plan dat bij jou past. Altijd transparant, geen verborgen kosten.
          </p>
        </div>
        
        <div className="pr-grid">
          <article className="card pr-card">
            <h3 className="card__title">Starter</h3>
            <p className="pr-card__price">€0</p>
            <p className="text-muted">Begin meteen, privacy-first.</p>
            <ul style={{margin: 'var(--sp-4) 0', paddingLeft: 'var(--sp-4)'}}>
              <li>5 outfits per maand</li>
              <li>Basis stijladvies</li>
              <li>Privacy-first</li>
            </ul>
            <button className="btn">Probeer nu</button>
          </article>
          
          <article className="card pr-card pr-card--best">
            <div className="pr-card__badge">Meest gekozen</div>
            <h3 className="card__title">Premium</h3>
            <p className="pr-card__price">€9<span>/m</span></p>
            <p className="text-muted">Alles wat je nodig hebt om slimmer te shoppen.</p>
            <ul style={{margin: 'var(--sp-4) 0', paddingLeft: 'var(--sp-4)'}}>
              <li>Onbeperkte outfits</li>
              <li>AI-powered matching</li>
              <li>Seizoensadvies</li>
              <li>Premium support</li>
            </ul>
            <button className="btn btn--primary">Start gratis</button>
          </article>
          
          <article className="card pr-card">
            <h3 className="card__title">Pro</h3>
            <p className="pr-card__price">€19<span>/m</span></p>
            <p className="text-muted">Voor power users en personal shoppers.</p>
            <ul style={{margin: 'var(--sp-4) 0', paddingLeft: 'var(--sp-4)'}}>
              <li>Alles van Premium</li>
              <li>Personal styling sessies</li>
              <li>Exclusieve merken</li>
              <li>Priority support</li>
            </ul>
            <button className="btn btn--ghost">Contact</button>
          </article>
        </div>
      </div>
    </section>
  );
}