import React from "react";
import { NavLink } from "react-router-dom";
import PageHero from "@/components/marketing/PageHero";
import { useFadeInOnVisible } from "@/hooks/useFadeInOnVisible";
import { CircleHelp as HelpCircle, ShieldCheck, Lock, CreditCard, Clock } from "lucide-react";

type QA = { q: string; a: React.ReactNode };

const FAQ_GENERAL: QA[] = [
  {
    q: "Wat krijg ik precies als ik start?",
    a: (
      <>
        Je beantwoordt 6 korte vragen en ontvangt direct meerdere outfits met uitleg
        (waarom dit werkt voor jou) en shoplinks zonder ruis. Je hoeft geen account te
        maken om te starten.
      </>
    ),
  },
  {
    q: "Werkt FitFi op mobiel?",
    a: (
      <>
        Ja. De ervaring is mobile-first ontworpen. De UI blijft rustig en snel op alle
        schermformaten.
      </>
    ),
  },
  {
    q: "Is dit stijladvies persoonlijk of generiek?",
    a: (
      <>
        Persoonlijk. We vertalen je voorkeuren naar archetypen, kleuraccenten en
        pasvormrichting. Je krijgt dus geen willekeurige boards, maar combinaties die
        bij jou passen — inclusief korte redenatie.
      </>
    ),
  },
];

const FAQ_PRIVACY: QA[] = [
  {
    q: "Hoe gaan jullie met mijn data om?",
    a: (
      <>
        Privacy-first. We verwerken alleen wat strikt nodig is om je advies te tonen en
        bewaren niets onnodigs. Geen doorverkoop van gegevens. Je kunt altijd contact
        opnemen als je iets wilt laten verwijderen.
      </>
    ),
  },
  {
    q: "Moet ik foto's uploaden?",
    a: (
      <>
        Nee. Je kunt starten zonder uploads. Later kun je optioneel meer delen voor
        extra nuance; dat is geheel aan jou.
      </>
    ),
  },
  {
    q: "Is de AI uitlegbaar?",
    a: (
      <>
        Ja. Bij outfits tonen we kort <em>waarom</em> keuzes kloppen (silhouet, kleur,
        proportie). Geen black box.
      </>
    ),
  },
];

const FAQ_PRICING: QA[] = [
  {
    q: "Blijft er een gratis optie?",
    a: (
      <>
        Ja. Met <strong>Starter</strong> kun je gratis kennismaken. Upgraden kan later
        wanneer jij daar klaar voor bent.
      </>
    ),
  },
  {
    q: "Kan ik maandelijks opzeggen of wisselen?",
    a: (
      <>
        Ja. Je zit nergens aan vast. Je kunt maandelijks opzeggen of wisselen; we
        verrekenen fair.
      </>
    ),
  },
  {
    q: "Welke betaalmethodes ondersteunen jullie?",
    a: (
      <>
        De gebruikelijke betaalmethoden via een betrouwbare payment provider. Afrekenen
        gaat zoals je gewend bent.
      </>
    ),
  },
];

const FAQ_PRODUCT: QA[] = [
  {
    q: "Komen er updates of variaties?",
    a: (
      <>
        Ja. We breiden looks en variaties uit (seizoenen, wishlist, alerts) met behoud
        van rust en consistentie.
      </>
    ),
  },
  {
    q: "Kan ik items makkelijk terugvinden?",
    a: (
      <>
        Ja. Bij elke look tonen we items met duidelijke context en shoplinks. Je ziet
        <em>wat</em> het is en <em>waarom</em> het werkt.
      </>
    ),
  },
  {
    q: "Wat als ik ergens niet uitkom?",
    a: (
      <>
        Laat het ons weten — we denken mee en verbeteren de uitleg waar nodig. Samen
        houden we de ervaring premium én praktisch.
      </>
    ),
  },
];

export default function FAQPage() {
  const fadeIntro = useFadeInOnVisible<HTMLDivElement>({ threshold: 0.15 });
  const fadeGrid = useFadeInOnVisible<HTMLDivElement>({ threshold: 0.15 });
  const fadeGen = useFadeInOnVisible<HTMLDivElement>({ threshold: 0.15 });
  const fadePri = useFadeInOnVisible<HTMLDivElement>({ threshold: 0.15 });
  const fadePrice = useFadeInOnVisible<HTMLDivElement>({ threshold: 0.15 });
  const fadeProd = useFadeInOnVisible<HTMLDivElement>({ threshold: 0.15 });

  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--ff-color-primary-50)] via-white to-[var(--ff-color-primary-25)] py-24 md:py-32">
        <div className="ff-container relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--color-text)] mb-8 leading-tight">
              Veelgestelde
              <span className="block text-[var(--ff-color-primary-600)]">Vragen</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Kort, duidelijk en premium — zonder ruis. Staat je vraag er niet tussen? Laat het ons weten.
            </p>
          </div>
        </div>
      </section>

      {/* Snapshot-kaarten: vertrouwen en duidelijkheid */}
      <section className="ff-container py-8">
        <div
          ref={fadeGrid.ref as any}
          style={{
            opacity: fadeGrid.visible ? 1 : 0,
            transform: fadeGrid.visible ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 600ms ease, transform 600ms ease",
          }}
          className="grid gap-6 md:grid-cols-3"
        >
          {[
            {
              icon: ShieldCheck,
              title: "Privacy-first",
              body:
                "We verwerken alleen wat nodig is en verkopen niets door. Transparant en zorgvuldig.",
            },
            {
              icon: CreditCard,
              title: "Eerlijk geprijsd",
              body:
                "Begin gratis. Upgraden kan later — zonder kleine lettertjes of verplichtingen.",
            },
            {
              icon: Clock,
              title: "Direct resultaat",
              body:
                "6 vragen, meerdere looks. Korte redenatie per outfit zodat je zélf kunt kiezen.",
            },
          ].map((c, i) => {
            const Icon = c.icon;
            return (
              <article
                key={i}
                className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)] border border-[var(--color-border)]"
              >
                <Icon className="h-5 w-5 text-[var(--color-text)]/70" aria-hidden />
                <h3 className="font-heading text-lg mt-3">{c.title}</h3>
                <p className="text-[var(--color-text)]/80 mt-2">{c.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Algemene vragen */}
      <section className="ff-container py-4">
        <h2 className="font-heading text-2xl text-[var(--color-text)] mb-3">Algemeen</h2>
        <div
          ref={fadeGen.ref as any}
          style={{
            opacity: fadeGen.visible ? 1 : 0,
            transform: fadeGen.visible ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 600ms ease, transform 600ms ease",
          }}
          className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)]"
        >
          {FAQ_GENERAL.map((item, i) => (
            <details
              key={i}
              className="border-t border-[var(--color-border)] first:border-t-0 p-4"
            >
              <summary className="cursor-pointer font-heading text-[var(--color-text)]">
                {item.q}
              </summary>
              <div className="mt-2 text-[var(--color-text)]/80">{item.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* Privacy & data */}
      <section className="ff-container py-8">
        <h2 className="font-heading text-2xl text-[var(--color-text)] mb-3">
          Privacy & data
        </h2>
        <div
          ref={fadePri.ref as any}
          style={{
            opacity: fadePri.visible ? 1 : 0,
            transform: fadePri.visible ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 600ms ease, transform 600ms ease",
          }}
          className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)]"
        >
          {FAQ_PRIVACY.map((item, i) => (
            <details
              key={i}
              className="border-t border-[var(--color-border)] first:border-t-0 p-4"
            >
              <summary className="cursor-pointer font-heading text-[var(--color-text)]">
                {item.q}
              </summary>
              <div className="mt-2 text-[var(--color-text)]/80">{item.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* Prijzen & abonnementen */}
      <section className="ff-container py-8">
        <h2 className="font-heading text-2xl text-[var(--color-text)] mb-3">
          Prijzen & abonnementen
        </h2>
        <div
          ref={fadePrice.ref as any}
          style={{
            opacity: fadePrice.visible ? 1 : 0,
            transform: fadePrice.visible ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 600ms ease, transform 600ms ease",
          }}
          className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)]"
        >
          {FAQ_PRICING.map((item, i) => (
            <details
              key={i}
              className="border-t border-[var(--color-border)] first:border-t-0 p-4"
            >
              <summary className="cursor-pointer font-heading text-[var(--color-text)]">
                {item.q}
              </summary>
              <div className="mt-2 text-[var(--color-text)]/80">{item.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* Product & gebruik */}
      <section className="ff-container py-8">
        <h2 className="font-heading text-2xl text-[var(--color-text)] mb-3">
          Product & gebruik
        </h2>
        <div
          ref={fadeProd.ref as any}
          style={{
            opacity: fadeProd.visible ? 1 : 0,
            transform: fadeProd.visible ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 600ms ease, transform 600ms ease",
          }}
          className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)]"
        >
          {FAQ_PRODUCT.map((item, i) => (
            <details
              key={i}
              className="border-t border-[var(--color-border)] first:border-t-0 p-4"
            >
              <summary className="cursor-pointer font-heading text-[var(--color-text)]">
                {item.q}
              </summary>
              <div className="mt-2 text-[var(--color-text)]/80">{item.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* Hulp nodig? */}
      <section className="ff-container pb-12">
        <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)] border border-[var(--color-border)]">
          <div className="flex items-start gap-3">
            <HelpCircle className="h-5 w-5 text-[var(--color-text)]/70" aria-hidden />
            <div>
              <h2 className="font-heading text-xl">Nog een vraag?</h2>
              <p className="mt-1 text-[var(--color-text)]/80">
                We helpen je graag verder. Bekijk de prijzen of start direct —
                opzeggen kan altijd.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <NavLink to="/prijzen" className="ff-btn ff-btn-secondary">
                  Bekijk prijzen
                </NavLink>
                <NavLink to="/results" className="ff-btn ff-btn-primary">
                  Start gratis
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}