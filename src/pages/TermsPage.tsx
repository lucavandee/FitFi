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
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Helmet>
        <title>Gebruiksvoorwaarden — FitFi</title>
        <meta name="description" content="Heldere, premium en privacy-first gebruiksvoorwaarden van FitFi." />
        <link rel="canonical" href="https://www.fitfi.ai/terms" />
      </Helmet>

      <PageHero
        id="page-terms"
        eyebrow="VOORWAARDEN"
        title="Gebruiksvoorwaarden"
        subtitle="Helder en eerlijk. Dit document beschrijft hoe je FitFi gebruikt en wat je van ons mag verwachten."
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
          <aside className="h-max rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-soft)]">
            <h2 className="font-heading text-sm tracking-wide text-[var(--color-text)]/70">Inhoud</h2>
            <nav className="mt-3">
              <ol className="space-y-2 text-sm">
                {TOC.map((t) => (
                  <li key={t.id}><a className="hover:underline" href={`#${t.id}`}>{t.label}</a></li>
                ))}
              </ol>
            </nav>
          </aside>

          <article className="prose prose-invert max-w-none">
            {[
              { id: "aanvaarding", title: "1. Aanvaarding", body:
                <>
                  <p>Door FitFi te bezoeken of te gebruiken, ga je akkoord met deze Gebruiksvoorwaarden.</p>
                  <p>Gebruik je FitFi niet, dan kun je dit document als referentie bewaren maar ben je er niet door gebonden.</p>
                </> },
              { id: "definities", title: "2. Definities", body:
                <ul>
                  <li><strong>FitFi</strong>: de website, app(s) en aanverwante diensten.</li>
                  <li><strong>Gebruiker</strong>: iedere natuurlijke persoon die FitFi gebruikt.</li>
                  <li><strong>Content</strong>: tekst, beelden, links en advies dat in FitFi wordt getoond.</li>
                  <li><strong>Abonnement</strong>: een betaald plan met aanvullende functies.</li>
                </ul> },
              { id: "gebruik", title: "3. Toegestaan gebruik", body:
                <ul>
                  <li>Gebruik FitFi op een eerlijke, persoonlijke manier en volg de instructies in de interface.</li>
                  <li>Reverse engineering, scraping, of geautomatiseerd gebruik dat de dienst kan verstoren is niet toegestaan.</li>
                  <li>Kopiëren of herpubliceren van UI of content zonder toestemming is niet toegestaan.</li>
                </ul> },
              { id: "account", title: "4. Accounts & beveiliging", body:
                <p>Je bent verantwoordelijk voor je inloggegevens en toestelbeveiliging. Meld verdachte activiteit via <NavLink to="/contact" className="underline hover:no-underline">/contact</NavLink>.</p> },
              { id: "betalingen", title: "5. Betalingen & abonnementen", body:
                <ul>
                  <li>Je kunt gratis starten. Betaalde plannen staan op <NavLink to="/prijzen" className="underline hover:no-underline">/prijzen</NavLink>.</li>
                  <li>Opzeggen of wisselen kan maandelijks; waar van toepassing hanteren we een eerlijk pro-rata.</li>
                  <li>Betalingen verlopen via betrouwbare payment providers; FitFi slaat geen volledige betaalgegevens op.</li>
                </ul> },
              { id: "intellectueel", title: "6. Intellectuele eigendom", body:
                <p>FitFi, de UI, teksten, illustraties en onderliggende systemen zijn beschermd. Je krijgt een beperkte, herroepbare, niet-exclusieve licentie voor persoonlijk gebruik.</p> },
              { id: "usercontent", title: "7. Gebruikerscontent", body:
                <ul>
                  <li>Zorg dat je rechten hebt op content die je aanlevert (bijv. feedback).</li>
                  <li>Je geeft FitFi een beperkte licentie om dit te gebruiken om de dienst te leveren en verbeteren.</li>
                  <li>We kunnen content verwijderen die in strijd is met wet of deze voorwaarden.</li>
                </ul> },
              { id: "privacy", title: "8. Privacy & gegevens", body:
                <p>FitFi werkt privacy-first: we verwerken alleen wat nodig is om je advies te tonen. Zie de FAQ of neem contact op via <NavLink to="/contact" className="underline hover:no-underline">/contact</NavLink>. We volgen relevante EU-regels (zoals AVG) waar van toepassing.</p> },
              { id: "aansprakelijkheid", title: "9. Aansprakelijkheid & disclaimer", body:
                <ul>
                  <li>FitFi biedt stijladvies "as is". We streven naar correctheid en duidelijkheid, maar garanderen geen volledigheid of foutloosheid.</li>
                  <li>We zijn niet aansprakelijk voor indirecte of gevolgschade; wettelijke consumentenrechten blijven van kracht.</li>
                </ul> },
              { id: "beindiging", title: "10. Beëindiging", body:
                <p>Je kunt je gebruik op elk moment beëindigen. Bij misbruik of overtreding kunnen we toegang opschorten of beëindigen.</p> },
              { id: "wijzigingen", title: "11. Wijzigingen van de voorwaarden", body:
                <p>We kunnen dit document bijwerken. Grote wijzigingen kondigen we duidelijk aan. De datum bovenaan toont de laatste update.</p> },
              { id: "toepasselijk", title: "12. Toepasselijk recht", body:
                <p>Nederlands recht is van toepassing. Geschillen worden — waar toegestaan — voorgelegd aan de bevoegde rechter in Nederland. Dit beperkt dwingendrechtelijke EU-consumentenrechten niet.</p> },
              { id: "contact", title: "13. Contact", body:
                <p>Vragen? Ga naar <NavLink to="/contact" className="underline hover:no-underline">/contact</NavLink> of bekijk de <NavLink to="/veelgestelde-vragen" className="underline hover:no-underline">FAQ</NavLink>.</p> },
            ].map((s) => (
              <section key={s.id} id={s.id} className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
                <h2>{s.title}</h2>
                {s.body}
              </section>
            ))}

            <p className="mt-8 text-sm text-[var(--color-text)]/60">
              Dit is een compact, helder document. Het vervangt geen individueel juridisch advies.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}