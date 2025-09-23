import React from "react";

export default function HowItWorksPage() {
  return (
    <section className="ff-section">
      <div className="ff-container">
        <div className="ff-hero">
          <h1 className="ff-hero__title">Hoe het werkt</h1>
          <p className="ff-hero__lead">
            In drie eenvoudige stappen naar jouw perfecte stijl.
          </p>
        </div>
        
        <div className="grid-3" style={{marginTop: 'var(--sp-8)'}}>
          <article className="card">
            <div className="card__body">
              <div className="badge" style={{marginBottom: 'var(--sp-3)'}}>Stap 1</div>
              <h3 className="card__title">Vertel over jezelf</h3>
              <p>Beantwoord een paar vragen over je stijl, lichaam en voorkeuren. Dit duurt slechts 2 minuten.</p>
            </div>
          </article>
          
          <article className="card">
            <div className="card__body">
              <div className="badge" style={{marginBottom: 'var(--sp-3)'}}>Stap 2</div>
              <h3 className="card__title">AI analyseert</h3>
              <p>Onze AI analyseert jouw profiel en matcht dit met duizenden kledingstukken en stijlen.</p>
            </div>
          </article>
          
          <article className="card">
            <div className="card__body">
              <div className="badge" style={{marginBottom: 'var(--sp-3)'}}>Stap 3</div>
              <h3 className="card__title">Krijg je outfits</h3>
              <p>Ontvang gepersonaliseerde outfit-aanbevelingen die perfect bij jou passen.</p>
            </div>
          </article>
        </div>
        
        <div style={{textAlign: 'center', marginTop: 'var(--sp-8)'}}>
          <button className="btn btn--primary">Begin nu</button>
        </div>
      </div>
    </section>
  );
}