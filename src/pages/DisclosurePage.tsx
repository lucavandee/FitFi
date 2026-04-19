import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Link2, Gift, Tag, Image, Newspaper, Lock, CircleAlert as AlertCircle, RefreshCw, Mail, ChevronDown, ArrowRight } from 'lucide-react';
import Seo from '@/components/seo/Seo';

const UPDATED = '1 oktober 2025';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: 'easeOut' },
  }),
};

const TRUST_STATS = [
  { label: 'Geen pay-to-rank' },
  { label: 'Affiliate transparant vermeld' },
  { label: 'Privacy-first aanpak' },
  { label: 'Redactioneel onafhankelijk' },
];

type Section = {
  id: string;
  icon: React.ElementType;
  title: string;
  content: React.ReactNode;
};

const SECTIONS: Section[] = [
  {
    id: 'doel',
    icon: ShieldCheck,
    title: '1. Doel & reikwijdte',
    content: (
      <p className="text-[15px] text-[#4A4A4A] leading-[1.7]">
        Deze pagina legt uit hoe FitFi omgaat met aanbevelingen, commerciële relaties,
        beeldmateriaal en privacy. We kiezen voor een premium maar nuchtere aanpak:
        duidelijk, eerlijk en zonder kleine lettertjes.
      </p>
    ),
  },
  {
    id: 'aanbevelingen',
    icon: Newspaper,
    title: '2. Aanbevelingen (AI & uitlegbaarheid)',
    content: (
      <ul className="space-y-3">
        {[
          'Outfits en items zijn gebaseerd op jouw voorkeuren plus beproefde principes (silhouet, kleur, proportie).',
          'We tonen waar mogelijk korte context bij een look: waarom dit past bij jou.',
          'We weigeren "pay-to-rank": betalende partijen bepalen niet jouw volgorde van aanbevelingen.',
        ].map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-[15px] text-[#4A4A4A] leading-[1.7]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C2654A] flex-shrink-0 mt-[0.55em]" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: 'affiliate',
    icon: Link2,
    title: '3. Commerciële relaties & affiliate',
    content: (
      <div className="space-y-4">
        <p className="text-[15px] text-[#4A4A4A] leading-[1.7]">
          FitFi kan links tonen naar producten. Soms bevat zo'n link een affiliate-code
          waardoor we een kleine vergoeding ontvangen als je iets koopt. Dit:
        </p>
        <ul className="space-y-3">
          {[
            'kost jou niets extra\'s;',
            'verandert de inhoudelijke aanbeveling niet;',
            'wordt alleen toegepast als het relevant en beschikbaar is.',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-[15px] text-[#4A4A4A] leading-[1.7]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C2654A] flex-shrink-0 mt-[0.55em]" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
        <p className="text-[15px] text-[#8A8A8A] leading-[1.7]">
          Als een specifieke samenwerking of korting van invloed is op content, vermelden we dat expliciet bij de betreffende sectie.
        </p>
      </div>
    ),
  },
  {
    id: 'sponsoring',
    icon: Gift,
    title: '4. Sponsoring, giften & samples',
    content: (
      <ul className="space-y-3">
        {[
          'We accepteren geen sponsoring die onze onafhankelijkheid beperkt.',
          'Productsamples of giften hebben geen invloed op de beoordeling of volgorde.',
          'Materiële relaties die wél relevant zijn, worden duidelijk vermeld.',
        ].map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-[15px] text-[#4A4A4A] leading-[1.7]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C2654A] flex-shrink-0 mt-[0.55em]" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: 'prijzen',
    icon: Tag,
    title: '5. Prijzen, beschikbaarheid & fouten',
    content: (
      <ul className="space-y-3">
        {[
          'Prijzen en voorraad kunnen wijzigen bij externe shops; controleer altijd de winkelpagina.',
          'We streven naar correctheid, maar menselijke en technische fouten kunnen voorkomen.',
        ].map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-[15px] text-[#4A4A4A] leading-[1.7]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C2654A] flex-shrink-0 mt-[0.55em]" aria-hidden="true" />
            {item}
          </li>
        ))}
        <li className="flex items-start gap-3 text-[15px] text-[#4A4A4A] leading-[1.7]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C2654A] flex-shrink-0 mt-[0.55em]" aria-hidden="true" />
          Zie je iets dat niet klopt?{' '}
          <NavLink to="/contact" className="text-[#C2654A] hover:text-[#A8513A] underline underline-offset-4 transition-colors duration-200">
            Laat het ons weten
          </NavLink>.
        </li>
      </ul>
    ),
  },
  {
    id: 'beelden',
    icon: Image,
    title: '6. Beeldmateriaal & AI-generatie',
    content: (
      <ul className="space-y-3">
        {[
          'We gebruiken eigen visuals en/of rechtenvrije assets. Waar nodig vermelden we credits.',
          'AI-gegenereerde beelden of composities worden alleen gebruikt ter illustratie en niet als productfoto.',
          'Beelden kunnen indicatief zijn; vertrouw voor maten/kleuren op de productpagina van de winkel.',
        ].map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-[15px] text-[#4A4A4A] leading-[1.7]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C2654A] flex-shrink-0 mt-[0.55em]" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: 'redactie',
    icon: Newspaper,
    title: '7. Redactionele onafhankelijkheid',
    content: (
      <p className="text-[15px] text-[#4A4A4A] leading-[1.7]">
        Content wordt samengesteld met het belang van de gebruiker voorop. Commerciële
        relaties hebben geen beslissende invloed op advies, copy of rangschikking.
      </p>
    ),
  },
  {
    id: 'privacy',
    icon: Lock,
    title: '8. Privacy & gegevens',
    content: (
      <p className="text-[15px] text-[#4A4A4A] leading-[1.7]">
        FitFi werkt privacy-first en verwerkt alleen wat nodig is om advies te tonen. Bekijk de
        relevante antwoorden in de{' '}
        <NavLink to="/veelgestelde-vragen" className="text-[#C2654A] hover:text-[#A8513A] underline underline-offset-4 transition-colors duration-200">
          FAQ
        </NavLink>{' '}
        of neem contact op via{' '}
        <NavLink to="/contact" className="text-[#C2654A] hover:text-[#A8513A] underline underline-offset-4 transition-colors duration-200">
          /contact
        </NavLink>.
      </p>
    ),
  },
  {
    id: 'conflicten',
    icon: AlertCircle,
    title: '9. Conflicten van belang',
    content: (
      <p className="text-[15px] text-[#4A4A4A] leading-[1.7]">
        Signaleren we een (potentieel) conflict van belang, dan benoemen we dat duidelijk of
        passen we de content aan zodat je keuzevrij blijft.
      </p>
    ),
  },
  {
    id: 'wijzigingen',
    icon: RefreshCw,
    title: '10. Wijzigingen',
    content: (
      <p className="text-[15px] text-[#4A4A4A] leading-[1.7]">
        We kunnen deze pagina bijwerken naarmate FitFi evolueert of regelgeving verandert.
        De datum bovenaan toont de laatste update. Grote wijzigingen lichten we toe.
      </p>
    ),
  },
  {
    id: 'contact',
    icon: Mail,
    title: '11. Contact',
    content: (
      <p className="text-[15px] text-[#4A4A4A] leading-[1.7]">
        Vragen of zorgen? Neem contact op via{' '}
        <NavLink to="/contact" className="text-[#C2654A] hover:text-[#A8513A] underline underline-offset-4 transition-colors duration-200">
          /contact
        </NavLink>.
      </p>
    ),
  },
];

function AccordionSection({ section, isOpen, onToggle, index }: {
  section: Section;
  isOpen: boolean;
  onToggle: (id: string) => void;
  index: number;
}) {
  const Icon = section.icon;
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      custom={index * 0.5}
      className="border-b border-[#E5E5E5]"
    >
      <h2 className="m-0">
        <button
          onClick={() => onToggle(section.id)}
          aria-expanded={isOpen}
          aria-controls={`panel-${section.id}`}
          className="w-full flex items-center justify-between py-6 gap-4 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2654A]/40 focus-visible:ring-offset-2 rounded"
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${isOpen ? 'bg-[#F4E8E3]' : 'bg-[#F5F0EB]'}`}>
              <Icon className="w-4 h-4 text-[#C2654A]" aria-hidden="true" />
            </div>
            <span className="text-base font-semibold text-[#1A1A1A] leading-snug">{section.title}</span>
          </div>
          <span
            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isOpen ? 'bg-[#F4E8E3]' : 'bg-[#F5F0EB]'}`}
            aria-hidden="true"
          >
            <ChevronDown className={`w-4 h-4 text-[#C2654A] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </span>
        </button>
      </h2>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`panel-${section.id}`}
            role="region"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-6 pl-[52px] max-w-[640px]">
              {section.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function DisclosurePage() {
  const [openId, setOpenId] = useState<string | null>('doel');

  function toggle(id: string) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  return (
    <>
      <Seo
        title="Transparantie (Disclosure) — FitFi"
        description="Heldere disclosure: hoe FitFi omgaat met aanbevelingen, affiliate, sponsoring, beelden en privacy."
        path="/affiliate-disclosure"
      />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-[#C2654A] focus:text-white focus:rounded-xl focus:shadow-2xl focus:font-semibold"
      >
        Spring naar hoofdinhoud
      </a>

      <main id="main-content" className="bg-[#FAFAF8]">

        {/* ── HERO ── */}
        <section
          className="bg-[#F5F0EB] pt-44 pb-12 md:pt-52 md:pb-16 text-center"
          aria-labelledby="disclosure-hero-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="inline-flex items-center gap-2.5 mb-8"
            >
              <span className="w-6 h-px bg-[#C2654A]" aria-hidden="true" />
              <span className="text-xs font-semibold tracking-[2.5px] uppercase text-[#C2654A]">
                Disclosure
              </span>
              <span className="w-6 h-px bg-[#C2654A]" aria-hidden="true" />
            </motion.div>

            <motion.h1
              id="disclosure-hero-heading"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="text-[32px] md:text-[56px] text-[#1A1A1A] leading-[1.05] max-w-[700px] mx-auto mb-6"
            >
              <span className="font-serif italic">Transparant </span>
              <span className="font-sans font-bold">en nuchter</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
              className="text-lg text-[#4A4A4A] leading-[1.7] max-w-[520px] mx-auto"
            >
              Hoe we aanbevelen, wanneer commerciële relaties kunnen spelen, en hoe we omgaan
              met beelden en privacy.{' '}
              <Link
                to="/contact"
                className="text-[#C2654A] hover:text-[#A8513A] underline underline-offset-4 transition-colors duration-200"
              >
                Stel een vraag
              </Link>
              .
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
              className="flex items-center justify-center gap-6 mt-8 flex-wrap"
            >
              {TRUST_STATS.map(({ label }) => (
                <div key={label} className="flex items-center gap-2 text-sm font-medium text-[#4A4A4A]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C2654A] flex-shrink-0" aria-hidden="true" />
                  {label}
                </div>
              ))}
            </motion.div>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={4}
              className="text-xs text-[#8A8A8A] mt-6"
            >
              Laatst bijgewerkt: {UPDATED}
            </motion.p>

          </div>
        </section>

        {/* ── SAMENVATTING CALLOUT ── */}
        <section className="bg-[#FAFAF8] pt-16 pb-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="max-w-[720px] mx-auto bg-[#F5F0EB] border border-[#E5E5E5] rounded-2xl p-6 md:p-8 flex items-start gap-5"
            >
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <ShieldCheck className="w-5 h-5 text-[#C2654A]" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1A1A1A] mb-2">Korte versie</h2>
                <p className="text-[15px] text-[#4A4A4A] leading-[1.7]">
                  <strong>Jij eerst</strong>, geen pay-to-rank, en duidelijke vermelding wanneer
                  iets commercieel kan zijn. Zo blijft FitFi premium én eerlijk.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── ACCORDION ── */}
        <section className="bg-[#FAFAF8] pt-12 pb-24" aria-label="Disclosure secties">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-[720px] mx-auto border-t border-[#E5E5E5]">
              {SECTIONS.map((section, i) => (
                <AccordionSection
                  key={section.id}
                  section={section}
                  isOpen={openId === section.id}
                  onToggle={toggle}
                  index={i}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── BOTTOM CTA ── */}
        <section className="bg-[#F5F0EB] py-40 text-center" aria-label="Meer weten">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <motion.h2
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
              className="text-[32px] md:text-[56px] text-[#1A1A1A] leading-[1.05] mb-6"
            >
              <span className="font-serif italic">Nog vragen?</span>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={1}
              className="text-[17px] text-[#4A4A4A] mb-12"
            >
              We reageren binnen 24 uur en denken graag mee.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={2}
              className="flex items-center justify-center gap-4 flex-wrap"
            >
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl bg-[#C2654A] hover:bg-[#A8513A] text-white font-semibold text-[15px] transition-colors duration-200"
              >
                Stel een vraag
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                to="/veelgestelde-vragen"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-[#E5E5E5] hover:border-[#C2654A] text-[#1A1A1A] font-medium text-[15px] transition-colors duration-200 bg-white"
              >
                Bekijk FAQ
              </Link>
            </motion.div>

          </div>
        </section>

      </main>
    </>
  );
}
