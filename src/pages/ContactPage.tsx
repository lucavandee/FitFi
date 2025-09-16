// src/pages/ContactPage.tsx
import React from "react";

const ContactPage: React.FC = () => {
  return (
    <main className="bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
      <section className="section" aria-labelledby="contact-title">
        <div className="container grid lg:grid-cols-3 gap-8 items-start">
          <header className="lg:col-span-1">
            <h1 id="contact-title" className="hero__title text-[clamp(2rem,5vw,2.6rem)]">Contact</h1>
            <p className="lead mt-3">Vragen, ideeën of zakelijk samenwerken? Stuur een bericht — we reageren snel.</p>
            <div className="mt-6 subcard">
              <div className="subcard__inner">
                <div className="text-sm"><strong>Support</strong><br/><span className="muted">Binnen 24 uur reactie</span></div>
                <div className="mt-3 text-sm"><strong>Zakelijk</strong><br/><span className="muted">Partnerships & affiliates</span></div>
              </div>
            </div>
          </header>

          <form className="lg:col-span-2 card" aria-describedby="contact-help">
            <div className="card__inner grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm">Naam</span>
                <input className="input mt-2" placeholder="Jouw naam" aria-label="Naam" />
              </label>
              <label className="block">
                <span className="text-sm">E-mail</span>
                <input type="email" className="input mt-2" placeholder="naam@voorbeeld.nl" aria-label="E-mail" />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm">Bericht</span>
                <textarea className="textarea mt-2" placeholder="Waarmee kunnen we je helpen?" aria-label="Bericht" />
              </label>
              <div className="sm:col-span-2">
                <button type="submit" className="btn btn-primary">Verstuur</button>
              </div>
            </div>
            <p id="contact-help" className="text-xs muted px-6 pb-6">We gebruiken je gegevens uitsluitend om op je bericht te reageren.</p>
          </form>
        </div>
      </section>
    </main>
  );
};
export default ContactPage;