import React from "react";
import Seo from "@/components/Seo";
import FaqAccordion, { FaqItem } from "@/components/faq/FaqAccordion";

const gettingStarted: FaqItem[] = [
  { q: "Hoe snel krijg ik mijn AI Style Report?", a: "Binnen 2 minuten. Beantwoord 6 korte vragen en je ontvangt direct je persoonlijke stijlprofiel met outfits." },
  { q: "Heb ik een account of creditcard nodig?", a: "Nee. Je kunt gratis starten zonder account of creditcard. Upgraden kan later als je wilt." },
  { q: "Kan ik ook zonder foto advies krijgen?", a: "Ja. Een foto is optioneel. Ons model werkt privacy-first en kan op basis van je antwoorden een helder profiel maken." },
];

const billing: FaqItem[] = [
  { q: "Wat is het verschil tussen Pro en Premium?", a: "Pro geeft je een volledig rapport met wekelijkse updates en 10+ outfits met shoplinks. Premium voegt seizoens-capsules, prioriteitenlijsten en early access toe." },
  { q: "Kan ik maandelijks betalen of jaarlijks met korting?", a: "Beide. Jaarlijks krijg je 20% voordeel. Je kunt op elk moment opzeggen; je plan stopt aan het einde van je periode." },
  { q: "Kan ik mijn plan later wijzigen?", a: "Ja. Upgraden of downgraden kan altijd. Wijzigingen worden per volgende periode toegepast." },
];

const privacy: FaqItem[] = [
  { q: "Wat doen jullie met mijn data?", a: "Zo min mogelijk. We hanteren een privacy-first aanpak: minimale data, transparant verwerkt. Jij houdt regie." },
  { q: "Worden mijn foto's opgeslagen?", a: "Alleen als je daar expliciet toestemming voor geeft om je advies te verbeteren. Standaard bewaren we geen foto's." },
  { q: "Kan ik mijn gegevens laten verwijderen?", a: "Ja. Stuur ons een bericht via de contactpagina en we verwijderen je gegevens conform AVG." },
];

const allForJsonLd = [...gettingStarted, ...billing, ...privacy];

const FaqPage: React.FC = () => {
  const [query, setQuery] = React.useState("");

  // Voor UI: tel totale matches (eenvoudige contains).
  const lc = query.trim().toLowerCase();
  const countMatches = (arr: FaqItem[]) =>
    arr.filter((x) => `${x.q} ${x.a}`.toLowerCase().includes(lc)).length;
  const totalMatches = lc
    ? countMatches(gettingStarted) + countMatches(billing) + countMatches(privacy)
    : gettingStarted.length + billing.length + privacy.length;

  return (
    <main id="main" className="bg-[var(--color-bg)] min-h-screen">
      <Seo
        title="Veelgestelde vragen — FitFi"
        description="Antwoorden over het AI Style Report, privacy en abonnementen. Kort en helder — zonder ruis."
        canonical="https://fitfi.ai/veelgestelde-vragen"
        ogImage="/images/social/faq-og.jpg"
      />

      {/* JSON-LD voor FAQPage */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: allForJsonLd.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          }),
        }}
      />

      {/* Hero */}
      <section className="ff-section ff-container">
        <header className="flow-lg max-w-3xl">
          <h1 className="section-title">Veelgestelde vragen</h1>
          <p className="text-[var(--color-muted)]">
            Vind snel je antwoord. Kort en helder — en als je er niet uitkomt, helpen we je graag verder.
          </p>

          {/* Zoekveld */}
          <div className="faq-search">
            <label htmlFor="faq-search-input" className="sr-only">Zoek in de FAQ</label>
            <input
              id="faq-search-input"
              className="input input-lg"
              type="search"
              placeholder="Zoek op onderwerp, bijvoorbeeld 'privacy' of 'abonnement'…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-describedby="faq-search-hint"
            />
            {query ? (
              <button
                type="button"
                className="input-clear"
                onClick={() => setQuery("")}
                aria-label="Wis zoekopdracht"
              >
                ×
              </button>
            ) : null}
            <div id="faq-search-hint" className="search-hint" aria-live="polite">
              {totalMatches} resultaat{totalMatches === 1 ? "" : "en"}
            </div>
          </div>
        </header>

        {/* Grid met categorieën */}
        <div className="faq-grid mt-8">
          <section aria-labelledby="faq-getting-started" className="faq-section">
            <h2 id="faq-getting-started" className="faq-heading">Starten</h2>
            <FaqAccordion items={gettingStarted} filterText={query} />
          </section>

          <section aria-labelledby="faq-billing" className="faq-section">
            <h2 id="faq-billing" className="faq-heading">Abonnement & betaling</h2>
            <FaqAccordion items={billing} filterText={query} />
          </section>

          <section aria-labelledby="faq-privacy" className="faq-section">
            <h2 id="faq-privacy" className="faq-heading">Privacy</h2>
            <FaqAccordion items={privacy} filterText={query} />
          </section>
        </div>

        <p className="text-[var(--color-muted)] mt-6">
          Nog een vraag? <a className="underlined" href="/contact">Neem contact op</a>. We reageren snel.
        </p>
      </section>
    </main>
  );
};

export default FaqPage;