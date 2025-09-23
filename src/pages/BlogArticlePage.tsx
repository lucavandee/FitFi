import React from "react";
import { useParams } from "react-router-dom";

export default function BlogArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  
  return (
    <section className="ff-section">
      <div className="ff-container">
        <article style={{maxWidth: '65ch', margin: '0 auto'}}>
          <header style={{marginBottom: 'var(--sp-6)'}}>
            <div className="badge" style={{marginBottom: 'var(--sp-3)'}}>Blog</div>
            <h1>Blog artikel: {slug}</h1>
            <div className="text-muted" style={{fontSize: 'var(--fs-14)'}}>
              Gepubliceerd op 15 januari 2025
            </div>
          </header>
          
          <div className="skel" style={{height: '300px', marginBottom: 'var(--sp-6)'}}></div>
          
          <div style={{lineHeight: 1.7}}>
            <p>
              Dit is een voorbeeld blog artikel. In een echte implementatie zou hier 
              de content van het artikel staan, opgehaald op basis van de slug parameter.
            </p>
            
            <p>
              FitFi's blog bevat tips over styling, seizoenstrends, en hoe je het beste 
              uit je garderobe haalt. Onze AI-gedreven inzichten helpen je om bewuste 
              keuzes te maken.
            </p>
            
            <h2>Waarom persoonlijke styling belangrijk is</h2>
            <p>
              Kleding is meer dan alleen bescherming tegen de elementen. Het is een vorm 
              van zelfexpressie en kan je zelfvertrouwen enorm boosten wanneer je de juiste 
              keuzes maakt.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}