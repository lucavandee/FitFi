import React from "react";
import { NavLink } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import PageHero from "@/components/marketing/PageHero";

const UPDATED = "1 oktober 2025";

type TocItem = { id: string; label: string };
const TOC: TocItem[] = [
  { id: "doel", label: "1. Doel & reikwijdte" },
  { id: "aanbevelingen", label: "2. Aanbevelingen (AI & uitlegbaarheid)" },
  { id: "affiliate", label: "3. Commerciële relaties & affiliate" },
  { id: "sponsoring", label: "4. Sponsoring, giften & samples" },
  { id: "prijzen", label: "5. Prijzen, beschikbaarheid & fouten" },
  { id: "beelden", label: "6. Beeldmateriaal & AI-generatie" },
  { id: "redactie", label: "7. Redactionele onafhankelijkheid" },
  { id: "privacy", label: "8. Privacy & gegevens" },
  { id: "conflicten", label: "9. Conflicten van belang" },
  { id: "wijzigingen", label: "10. Wijzigingen" },
  { id: "contact", label: "11. Contact" },
];

export default function DisclosurePage() {
  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Helmet>
        <title>Transparantie (Disclosure) — FitFi</title>
        <meta
          name="description"
          content="Heldere disclosure: hoe FitFi omgaat met aanbevelingen, affiliate, sponsoring, beelden en privacy."
        />
        <link rel="canonical" href="https://www.fitfi.ai/disclosure" />
      </Helmet>

      <PageHero
        id="page-disclosure"
        eyebrow="DISCLOSURE"
        title="Transparant en nuchter"
        subtitle="Hoe we aanbevelen, wanneer er commerciële relaties kunnen spelen en hoe we omgaan met beelden en privacy — rustig, duidelijk en eerlijk."
        align="left"
        as="h1"
        size="sm"
        note={`Laatst bijgewerkt: ${UPDATED}`}
        ctas={[
          { label: "FAQ", to: "/veelgestelde-vragen", variant: "secondary" },
          { label: "Contact", to: "/contact", variant: "secondary" },
        ]}
      />

      <section className="ff-container py-8 sm:py-10">
        <div className="grid gap-8 md:grid-cols-[260px,1fr]">
          {/* TOC */}
          <aside className="h-max rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-soft)]">
            <h2 className="font-heading text-sm tracking-wide text-[var(--color-text)]/70">Inhoud</h2>
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
            <section
              id="doel"
              className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]"
            >
              <h2>1. Doel &amp; reikwijdte</h2>
              <p>
                Deze pagina legt uit hoe FitFi omgaat met aanbevelingen, commerciële relaties,
                beeldmateriaal en privacy. We kiezen voor een premium maar nuchtere aanpak:
                duidelijk, eerlijk en zonder kleine lettertjes.
              </p>
            </section>

            <section
              id="aanbevelingen"
              className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]"
            >
              <h2>2. Aanbevelingen (AI &amp; uitlegbaarheid)</h2>
              <ul>
                <li>Outfits en items zijn gebaseerd op jouw voorkeuren plus beproefde principes (silhouet, kleur, proportie).</li>
                <li>We tonen waar mogelijk korte context bij een look: <em>waarom</em> dit past bij jou.</li>
                <li>We weigeren "pay-to-rank": betalende partijen bepalen niet jouw volgorde van aanbevelingen.</li>
              </ul>
            </section>

            <section
              id="affiliate"
              className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]"
            >
              <h2>3. Commerciële relaties &amp; affiliate</h2>
              <p>
                FitFi kan links tonen naar producten. Soms kan zo'n link een affiliate-code bevatten
                waardoor we een kleine vergoeding ontvangen als je iets koopt. Dit:
              </p>
              <ul>
                <li>kost jou niets extra's;</li>
                <li>verandert de inhoudelijke aanbeveling niet;</li>
                <li>wordt alleen toegepast als het relevant en beschikbaar is.</li>
              </ul>
              <p className="text-[var(--color-text)]/75">
                Als een specifieke samenwerking of korting van invloed is op content, vermelden we dat expliciet bij de betreffende sectie.
              </p>
            </section>

            <section
              id="sponsoring"
              className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]"
            >
              <h2>4. Sponsoring, giften &amp; samples</h2>
              <ul>
                <li>We accepteren geen sponsoring die onze onafhankelijkheid beperkt.</li>
                <li>Productsamples of giften hebben geen invloed op de beoordeling of volgorde.</li>
                <li>Materiële relaties die wél relevant zijn, worden duidelijk vermeld.</li>
              </ul>
            </section>

            <section
              id="prijzen"
              className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]"
            >
              <h2>5. Prijzen, beschikbaarheid &amp; fouten</h2>
              <ul>
                <li>Prijzen en voorraad kunnen wijzigen bij externe shops; controleer altijd de winkelpagina.</li>
                <li>We streven naar correctheid, maar menselijke en technische fouten kunnen voorkomen.</li>
                <li>Ziet u iets dat niet klopt? Laat het ons weten via <NavLink to="/contact" className="underline hover:no-underline">/contact</NavLink>.</li>
              </ul>
            </section>

            <section
              id="beelden"
              className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]"
            >
              <h2>6. Beeldmateriaal &amp; AI-generatie</h2>
              <ul>
                <li>We gebruiken eigen visuals en/of rechtenvrije assets. Waar nodig vermelden we credits.</li>
                <li>AI-gegeneerde beelden of composities worden alleen gebruikt ter illustratie en niet als productfoto.</li>
                <li>Beelden kunnen indicatief zijn; vertrouw voor maten/kleuren op de productpagina van de winkel.</li>
              </ul>
            </section>

            <section
              id="redactie"
              className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]"
            >
              <h2>7. Redactionele onafhankelijkheid</h2>
              <p>
                Content wordt samengesteld met het belang van de gebruiker voorop. Commerciële relaties
                hebben geen beslissende invloed op advies, copy of rangschikking.
              </p>
            </section>

            <section
              id="privacy"
              className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]"
            >
              <h2>8. Privacy &amp; gegevens</h2>
              <p>
                FitFi werkt privacy-first en verwerkt alleen wat nodig is om advies te tonen. Bekijk de
                relevante antwoorden in de{" "}
                <NavLink to="/veelgestelde-vragen" className="underline hover:no-underline">FAQ</NavLink>{" "}
                of neem contact op via{" "}
                <NavLink to="/contact" className="underline hover:no-underline">/contact</NavLink>.
              </p>
            </section>

            <section
              id="conflicten"
              className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]"
            >
              <h2>9. Conflicten van belang</h2>
              <p>
                Signaleren we een (potentieel) conflict van belang, dan benoemen we dat duidelijk of passen
                we de content aan zodat je keuzevrij blijft.
              </p>
            </section>

            <section
              id="wijzigingen"
              className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]"
            >
              <h2>10. Wijzigingen</h2>
              <p>
                We kunnen deze pagina bijwerken naarmate FitFi evolueert of regelgeving verandert. De datum
                bovenaan toont de laatste update. Grote wijzigingen lichten we toe.
              </p>
            </section>

            <section
              id="contact"
              className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]"
            >
              <h2>11. Contact</h2>
              <p>
                Vragen of zorgen? Neem contact op via{" "}
                <NavLink to="/contact" className="underline hover:no-underline">/contact</NavLink>.
              </p>
            </section>

            {/* Callout */}
            <div className="mt-8 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
              <h3 className="font-heading text-xl">Korte versie</h3>
              <p className="mt-2 text-[var(--color-text)]/80">
                We houden het simpel: <strong>jij eerst</strong>, geen pay-to-rank, en duidelijke
                vermelding wanneer iets commercieel kan zijn. Zo blijft FitFi premium én eerlijk.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <NavLink to="/veelgestelde-vragen" className="ff-btn ff-btn-secondary">Bekijk FAQ</NavLink>
                <NavLink to="/contact" className="ff-btn ff-btn-primary">Stel een vraag</NavLink>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}