import React from "react";
import Seo from "@/components/Seo";
import Footer from "@/components/layout/Footer";

const ContactPage: React.FC = () => {
  return (
    <main id="main" className="bg-[var(--color-bg)] min-h-screen">
      <Seo
        title="Contact — We helpen je graag | FitFi"
        description="Vragen over het AI Style Report, privacy of samenwerkingen? Stuur ons een bericht — we reageren snel en helder."
        canonical="https://fitfi.ai/contact"
      />

      <section className="ff-section">
        <div className="ff-container">
          <header className="section-header">
            <p className="kicker">Contact</p>
            <h1 className="section-title">We helpen je graag</h1>
            <p className="section-intro">
              Korte vragen, feedback of een idee voor samenwerking? Stuur ons een bericht.
              We antwoorden doorgaans binnen één werkdag.
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Contactkaart */}
            <aside className="card p-6">
              <h2 className="text-lg font-semibold">Snelle links</h2>
              <ul className="mt-3 space-y-2 text-sm">
                <li><a className="link" href="/faq">FAQ</a></li>
                <li><a className="link" href="/privacy">Privacy</a></li>
                <li><a className="link" href="/cookies">Cookies</a></li>
                <li><a className="link" href="/prijzen">Prijzen</a></li>
              </ul>

              <div className="mt-6">
                <h3 className="text-sm font-semibold opacity-80">E-mail</h3>
                <a className="link" href="mailto:hello@fitfi.ai" aria-label="Stuur e-mail naar hello@fitfi.ai">
                  hello@fitfi.ai
                </a>
              </div>
            </aside>

            {/* Formulier */}
            <form
              className="card p-6 md:col-span-2"
              method="post"
              action="#"
              noValidate
              aria-labelledby="contact-form-title"
            >
              <h2 id="contact-form-title" className="text-lg font-semibold mb-2">
                Stuur ons een bericht
              </h2>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium opacity-80">
                    Naam
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    className="mt-1 w-full rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-3 placeholder:opacity-60 focus:outline-none focus-visible:ring-2 shadow-[var(--shadow-soft)]"
                    placeholder="Voor- en achternaam"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium opacity-80">
                    E-mail
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="mt-1 w-full rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-3 placeholder:opacity-60 focus:outline-none focus-visible:ring-2 shadow-[var(--shadow-soft)]"
                    placeholder="jij@voorbeeld.nl"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="message" className="block text-sm font-medium opacity-80">
                    Bericht
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    className="mt-1 w-full rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-3 placeholder:opacity-60 focus:outline-none focus-visible:ring-2 shadow-[var(--shadow-soft)]"
                    placeholder="Waarmee kunnen we helpen?"
                  />
                </div>
              </div>

              <div className="mt-4">
                <button
                  type="submit"
                  className="btn btn-primary"
                  aria-label="Verstuur bericht"
                >
                  Versturen
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default ContactPage;