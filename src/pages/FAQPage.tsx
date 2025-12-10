import React, { useState, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CircleHelp as HelpCircle, ShieldCheck, Lock, CreditCard, Clock, Plus, Minus, Search, ThumbsUp, ThumbsDown, Hash } from "lucide-react";

type QA = { q: string; a: React.ReactNode; id: string; category: string };

const FAQ_GENERAL: QA[] = [
  {
    q: "Wat krijg ik precies als ik start?",
    a: (
      <>
        Je krijgt <strong>minimaal 5 complete outfits</strong> met uitleg waarom ze bij je passen. Elke outfit heeft directe shoplinks. Je hoeft geen account te maken om te starten.
      </>
    ),
  },
  {
    q: "Werkt FitFi op mobiel?",
    a: (
      <>
        Ja, volledig. De app is mobile-first: even snel en overzichtelijk op je telefoon als op desktop.
      </>
    ),
  },
  {
    q: "Is dit stijladvies persoonlijk of generiek?",
    a: (
      <>
        Persoonlijk. Je antwoorden worden vertaald naar jouw unieke stijlprofiel (zoals "65% Minimalistisch, 25% Casual Chic"). Outfits worden hier op afgestemd.
      </>
    ),
  },
];

const FAQ_PRIVACY: QA[] = [
  {
    q: "Hoe gaan jullie met mijn data om?",
    a: (
      <>
        We bewaren alleen je quizantwoorden en outfitvoorkeuren. <strong>Geen doorverkoop, geen tracking.</strong> Je kunt je gegevens altijd laten verwijderen via contact@fitfi.ai.
      </>
    ),
  },
  {
    q: "Moet ik foto's uploaden?",
    a: (
      <>
        Nee, de quiz werkt zonder foto's. Premium-leden kunnen <em>later</em> optioneel foto's uploaden voor kleuranalyse. Volledig vrijwillig.
      </>
    ),
  },
  {
    q: "Waarom passen deze outfits bij mij?",
    a: (
      <>
        Elke outfit toont een korte uitleg: waarom de kleuren kloppen, welke pasvorm past bij je voorkeur, en hoe de stijl aansluit bij je profiel. Je ziet altijd het <em>waarom</em>.
      </>
    ),
  },
];

const FAQ_PRICING: QA[] = [
  {
    q: "Blijft er een gratis optie?",
    a: (
      <>
        Ja. Met <strong>Starter</strong> krijg je gratis toegang tot je eerste 5 outfits en stijlprofiel. Je kunt altijd gratis blijven.
      </>
    ),
  },
  {
    q: "Kan ik maandelijks opzeggen of wisselen?",
    a: (
      <>
        Ja. <strong>Geen lange contracten.</strong> Je kunt elk moment opzeggen of van plan wisselen. Maandelijks gefactureerd.
      </>
    ),
  },
  {
    q: "Welke betaalmethodes ondersteunen jullie?",
    a: (
      <>
        iDEAL, creditcard en Apple Pay via Stripe. Veilig en vertrouwd.
      </>
    ),
  },
];

const FAQ_PRODUCT: QA[] = [
  {
    q: "Kan ik de quiz opnieuw doen?",
    a: (
      <>
        Ja, <strong>zo vaak als je wilt</strong>. Je krijgt dan nieuwe outfits op basis van je nieuwe antwoorden. Je oude profiel blijft bewaard.
      </>
    ),
  },
  {
    q: "Kan ik outfits opslaan?",
    a: (
      <>
        Ja. Je kunt favoriete outfits opslaan in je dashboard. Shoplinks blijven beschikbaar, zodat je later kunt winkelen.
      </>
    ),
  },
  {
    q: "Wat als ik hulp nodig heb?",
    a: (
      <>
        Mail ons op <strong>contact@fitfi.ai</strong>. We reageren binnen 24 uur en denken mee over je stijlvragen.
      </>
    ),
  },
];

function FAQSection({ title, items, delay = 0 }: { title: string; items: QA[]; delay?: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay }}
      className="ff-container py-8"
    >
      <h2 className="font-heading text-2xl text-[var(--color-text)] mb-4">{title}</h2>
      <div className="rounded-[var(--radius-2xl)] bg-white/80 backdrop-blur-sm shadow-[var(--shadow-lifted)] border border-[var(--color-border)] overflow-hidden">
        {items.map((item, i) => (
          <FAQItem key={i} item={item} index={i} />
        ))}
      </div>
    </motion.section>
  );
}

function FAQItem({ item, index }: { item: QA; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="border-t border-[var(--color-border)] first:border-t-0"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between gap-4 text-left hover:bg-[var(--ff-color-primary-50)] transition-colors group"
      >
        <span className="font-heading text-[var(--color-text)] group-hover:text-[var(--ff-color-primary-700)] transition-colors">
          {item.q}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex-shrink-0"
        >
          {isOpen ? (
            <Minus className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
          ) : (
            <Plus className="w-5 h-5 text-[var(--color-muted)] group-hover:text-[var(--ff-color-primary-600)] transition-colors" />
          )}
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 text-[var(--color-text)]/80 leading-relaxed">
              {item.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQPage() {

  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--ff-color-primary-50)] via-white to-[var(--ff-color-accent-50)] py-24 md:py-32 border-b-2 border-[var(--color-border)]">
        {/* Animated gradient blobs */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              x: [0, 50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[var(--ff-color-primary-400)] to-[var(--ff-color-accent-400)] rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
              x: [0, -30, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[var(--ff-color-accent-400)] to-[var(--ff-color-primary-400)] rounded-full blur-3xl"
          />
        </div>

        <div className="ff-container relative">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--color-text)] mb-8 leading-tight">
                Veelgestelde
                <span className="block bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] bg-clip-text text-transparent">
                  Vragen
                </span>
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl md:text-2xl text-[var(--color-muted)] mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Kort, duidelijk en premium — . Staat je vraag er niet tussen? Laat het ons weten.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Trust badges with animations */}
      <section className="ff-container py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "Privacybewust",
              body:
                "We verwerken alleen wat nodig is en verkopen niets door. Transparant en zorgvuldig.",
            },
            {
              icon: CreditCard,
              title: "Eerlijk geprijsd",
              body:
                "Begin gratis. Upgraden kan later.",
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
              <motion.article
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="rounded-[var(--radius-2xl)] bg-white/80 backdrop-blur-sm p-8 shadow-[var(--shadow-lifted)] border border-[var(--color-border)] hover:shadow-[var(--shadow-elevated)] transition-shadow"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center shadow-lg mb-4"
                >
                  <Icon className="h-6 w-6 text-white" aria-hidden />
                </motion.div>
                <h3 className="font-heading text-xl mb-2 text-[var(--color-text)]">{c.title}</h3>
                <p className="text-[var(--color-muted)] leading-relaxed">{c.body}</p>
              </motion.article>
            );
          })}
        </div>
      </section>

      {/* FAQ Sections with animated accordions */}
      <FAQSection title="Algemeen" items={FAQ_GENERAL} delay={0} />
      <FAQSection title="Privacy & data" items={FAQ_PRIVACY} delay={0.1} />
      <FAQSection title="Prijzen & abonnementen" items={FAQ_PRICING} delay={0.2} />
      <FAQSection title="Product & gebruik" items={FAQ_PRODUCT} delay={0.3} />

      {/* CTA Section */}
      <section className="ff-container py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-[var(--radius-2xl)] bg-gradient-to-br from-[var(--ff-color-primary-50)] via-white to-[var(--ff-color-accent-50)] p-8 md:p-12 border-2 border-[var(--color-border)] shadow-[var(--shadow-elevated)] relative overflow-hidden"
        >
          {/* Decorative gradient blob */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--ff-color-primary-400)] to-[var(--ff-color-accent-400)] rounded-full blur-3xl opacity-20" />

          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center shadow-lg flex-shrink-0"
            >
              <HelpCircle className="h-8 w-8 text-white" aria-hidden />
            </motion.div>
            <div className="flex-1">
              <h2 className="font-heading text-2xl md:text-3xl text-[var(--color-text)] mb-2">
                Nog een vraag?
              </h2>
              <p className="text-[var(--color-muted)] text-lg leading-relaxed">
                We helpen je graag verder. Bekijk de prijzen of start direct —
                opzeggen kan altijd.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <NavLink to="/prijzen" className="ff-btn ff-btn-secondary px-6 py-3">
                  Bekijk prijzen
                </NavLink>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <NavLink to="/results" className="ff-btn ff-btn-primary px-6 py-3">
                  Start gratis
                </NavLink>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}