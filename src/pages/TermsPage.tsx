import React from "react";
import { NavLink } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import PageHero from "@/components/marketing/PageHero";

const UPDATED = "1 oktober 2025";

type TocItem = { id: string; label: string };
const TOC: TocItem[] = [
  { id: "aanvaarding", label: "1. Aanvaarding" },
  { id: "definities", label: "2. Definities" },
  { id: "gebruik", label: "3. Toegestaan gebruik" },
  { id: "account", label: "4. Accounts & beveiliging" },
  { id: "betalingen", label: "5. Betalingen & abonnementen" },
  { id: "intellectueel", label: "6. Intellectuele eigendom" },
  { id: "usercontent", label: "7. Gebruikerscontent" },
  { id: "privacy", label: "8. Privacy & gegevens" },
  { id: "aansprakelijkheid", label: "9. Aansprakelijkheid & disclaimer" },
  { id: "beindiging", label: "10. Beëindiging" },
  { id: "wijzigingen", label: "11. Wijzigingen van de voorwaarden" },
  { id: "toepasselijk", label: "12. Toepasselijk recht" },
  { id: "contact", label: "13. Contact" },
];

export default function TermsPage() {
  return (
    <main id="main" className="bg-[var(--ff-color-bg)] text-[var(--ff-color-text)]">
      <Helmet>
        <title>Gebruiksvoorwaarden — FitFi</title>
        <meta name="description" content="Heldere, premium en privacy-first gebruiksvoorwaarden van FitFi." />
        <link rel="canonical" href="https://www.fitfi.ai/terms" />
      </Helmet>

      <PageHero
        id="page-terms"
        eyebrow="VOORWAARDEN"
        title="Gebruiksvoorwaarden"
        subtitle="Rustig, duidelijk en eerlijk. Dit document beschrijft hoe je FitFi gebruikt en wat je van ons mag verwachten."
        align="left"
        as="h1"
        size="sm"
        note={`Laatst bijgewerkt: ${UPDATED}`}
        ctas={[
          { label: "Contact", to: "/contact", variant: "secondary" },
          { label: "FAQ", to: "/veelgestelde-vragen", variant: "secondary" },
        ]}
      />

      <section className="ff-container py-8 sm:py-10">
        <div className="grid gap-8 md:grid-cols-[260px,1fr]">
          {/* TOC */}
          <aside className="h-max rounded-[var(--ff-radius-lg)] border border-[var(--ff-color-border)] bg-[var(--ff-color-surface)] p-4 shadow-[var(--ff-shadow-soft)]">
            <h2 className="font-heading text-sm tracking-wide text-[var(--ff-color-text)]/70">Inhoud</h2>
            <nav className="mt-3">
              <ol className="space-y-2 text-sm">
                {TOC.map((t) => (
                  <li key={t.id}>
                    <a className="hover:underline" href={`#${t.id}`}>{t.label}</a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          {/* Content */}
          <article className="prose prose-invert max-w-none">
            <section id="aanvaarding" className="rounded-[var(--ff-radius-lg)] border border-[var(--ff-color-border)] bg-[var(--ff-color-surface)] p-6 shadow-[var(--ff-shadow-soft)]">
              <h2>1. Aanvaarding</h2>
              <p>
                Door FitFi te bezoeken of te gebruiken, ga je akkoord met deze Gebruiksvoorwaarden.
                Gebruik je FitFi niet, dan kun je dit document als referentie bewaren maar ben je er niet door gebonden.
              </p>
            </section>

            <section id="definities" className="mt-6 rounded-[var(--ff-radius-lg)] border border-[var(--ff-color-border)] bg-[var(--ff-color-surface)] p-6 shadow-[var(--ff-shadow-soft)]">
              <h2>2. Definities</h2>
              <ul>
                <li><strong>FitFi</strong>: de website, app(s) en aanverwante diensten.</li>
                <li><strong>Gebruiker</strong>: iedere natuurlijke persoon die FitFi gebruikt.</li>
                <li><strong>Content</strong>: tekst, beelden, links en advies dat in FitFi wordt getoond.</li>
                <li><strong>Abonnement</strong>: een betaald plan (bijv. Pro of Elite) met aanvullende functies.</li>
              </ul>
            </section>

            <section id="gebruik" className="mt-6 rounded-[var(--ff-radius-lg)] border border-[var(--ff-color-border)] bg-[var(--ff-color-surface)] p-6 shadow-[var(--ff-shadow-soft)]">
              <h2>3. Toegestaan gebruik</h2>
              <ul>
                <li>Gebruik FitFi op een eerlijke, persoonlijke manier en volg de instructies in de interface.</li>
                <li>Reverse engineering, scraping, of geautomatiseerd gebruik dat de dienst kan verstoren is niet toegestaan.</li>
                <li>Je mag onze UI of content niet kopiëren of herpubliceren zonder toestemming.</li>
              </ul>
            </section>

            <section id="account" className="mt-6 rounded-[var(--ff-radius-lg)] border border-[var(--ff-color-border)] bg-[var(--ff-color-surface)] p-6 shadow-[var(--ff-shadow-soft)]">
              <h2>4. Accounts & beveiliging</h2>
              <p>
                Je bent zelf verantwoordelijk voor je inloggegevens en toestelbeveiliging.
                Meld verdachte activiteit via <NavLink to="/contact" className="underline hover:no-underline">/contact</NavLink>.
              </p>
            </section>

            <section id="betalingen" className="mt-6 rounded-[var(--ff-radius-lg)] border border-[var(--ff-color-border)] bg-[var(--ff-color-surface)] p-6 shadow-[var(--ff-shadow-soft)]">
              <h2>5. Betalingen & abonnementen</h2>
              <ul>
                <li>Je kunt gratis starten. Betaalde plannen worden duidelijk geprijsd op <NavLink to="/prijzen" className="underline hover:no-underline">/prijzen</NavLink>.</li>
                <li>Opzeggen of wisselen kan maandelijks; we hanteren een eerlijk pro-rata waar van toepassing.</li>
                <li>Betalingen verlopen via betrouwbare payment providers; FitFi slaat geen volledige betaalgegevens op.</li>
              </ul>
            </section>

            <section id="intellectueel" className="mt-6 rounded-[var(--ff-radius-lg)] border border-[var(--ff-color-border)] bg-[var(--ff-color-surface)] p-6 shadow-[var(--ff-shadow-soft)]">
              <h2>6. Intellectuele eigendom</h2>
              <p>
                FitFi, de UI, teksten, illustraties en onderliggende systemen zijn beschermd door auteursrechten en andere rechten.
                Je krijgt een beperkte, herroepbare, niet-exclusieve licentie om FitFi te gebruiken voor persoonlijke doeleinden.
              </p>
            </section>

            <section id="usercontent" className="mt-6 rounded-[var(--ff-radius-lg)] border border-[var(--ff-color-border)] bg-[var(--ff-color-surface)] p-6 shadow-[var(--ff-shadow-soft)]">
              <h2>7. Gebruikerscontent</h2>
              <ul>
                <li>Als je content aanlevert (bijv. feedback), zorg dan dat je daar rechten op hebt.</li>
                <li>Je geeft FitFi een beperkte licentie om die content te gebruiken om de dienst te leveren en te verbeteren.</li>
                <li>We mogen content verwijderen die in strijd is met wet of deze voorwaarden.</li>
              </ul>
            </section>

            <section id="privacy" className="mt-6 rounded-[var(--ff-radius-lg)] border border-[var(--ff-color-border)] bg-[var(--ff-color-surface)] p-6 shadow-[var(--ff-shadow-soft)]">
              <h2>8. Privacy & gegevens</h2>
              <p>
                FitFi werkt privacy-first: we verwerken alleen wat nodig is om je advies te tonen.
                Raadpleeg ons privacy-overzicht in de FAQ of neem contact op via <NavLink to="/contact" className="underline hover:no-underline">/contact</NavLink>.
                We volgen relevante EU-regels (zoals AVG) waar van toepassing.
              </p>
            </section>

            <section id="aansprakelijkheid" className="mt-6 rounded-[var(--ff-radius-lg)] border border-[var(--ff-color-border)] bg-[var(--ff-color-surface)] p-6 shadow-[var(--ff-shadow-soft)]">
              <h2>9. Aansprakelijkheid & disclaimer</h2>
              <ul>
                <li>FitFi biedt stijladvies "as is". We streven naar correctheid en duidelijkheid, maar kunnen niet garanderen dat alle informatie altijd volledig, actueel of foutloos is.</li>
                <li>We zijn niet aansprakelijk voor indirecte schade, gevolgschade of inkomstenderving. Wettelijke rechten van consumenten blijven uiteraard van kracht.</li>
              </ul>
            </section>

            <section id="beindiging" className="mt-6 rounded-[var(--ff-radius-lg)] border border-[var(--ff-color-border)] bg-[var(--ff-color-surface)] p-6 shadow-[var(--ff-shadow-soft)]">
              <h2>10. Beëindiging</h2>
              <p>
                Je kunt je gebruik op elk moment beëindigen. Bij misbruik of overtreding kunnen we toegang opschorten of beëindigen.
              </p>
            </section>

            <section id="wijzigingen" className="mt-6 rounded-[var(--ff-radius-lg)] border border-[var(--ff-color-border)] bg-[var(--ff-color-surface)] p-6 shadow-[var(--ff-shadow-soft)]">
              <h2>11. Wijzigingen van de voorwaarden</h2>
              <p>
                We kunnen deze voorwaarden bijwerken om de dienst of regelgeving beter te weerspiegelen. Grote wijzigingen kondigen we duidelijk aan.
                De datum bovenaan toont de laatste update.
              </p>
            </section>

            <section id="toepasselijk" className="mt-6 rounded-[var(--ff-radius-lg)] border border-[var(--ff-color-border)] bg-[var(--ff-color-surface)] p-6 shadow-[var(--ff-shadow-soft)]">
              <h2>12. Toepasselijk recht</h2>
              <p>
                Op deze voorwaarden is Nederlands recht van toepassing. Geschillen worden — waar toegestaan — voorgelegd aan de bevoegde rechter in Nederland.
                Niets in dit artikel beperkt dwingendrechtelijke consumentenrechten binnen de EU.
              </p>
            </section>

            <section id="contact" className="mt-6 rounded-[var(--ff-radius-lg)] border border-[var(--ff-color-border)] bg-[var(--ff-color-surface)] p-6 shadow-[var(--ff-shadow-soft)]">
              <h2>13. Contact</h2>
              <p>
                Vragen over deze voorwaarden? Neem contact op via{" "}
                <NavLink to="/contact" className="underline hover:no-underline">/contact</NavLink>{" "}
                of bekijk eerst de{" "}
                <NavLink to="/veelgestelde-vragen" className="underline hover:no-underline">FAQ</NavLink>.
              </p>
            </section>

            <p className="mt-8 text-sm text-[var(--ff-color-text)]/60">
              Dit is een compact, helder document. Het vervangt geen individueel juridisch advies.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}