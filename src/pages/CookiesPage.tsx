import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, ShieldCheck, ChartBar as BarChart2, Megaphone, Database, Globe, Settings, Clock, Scale, RefreshCw, Mail, ChevronDown, ArrowRight, Check, X, TriangleAlert as AlertTriangle } from 'lucide-react';
import Seo from '@/components/seo/Seo';

const UPDATED = '7 januari 2026';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: 'easeOut' },
  }),
};

const TRUST_STATS = [
  { label: 'Geen marketing-cookies' },
  { label: 'IP-anonymisatie actief' },
  { label: 'Opt-in voor analytics' },
  { label: 'GDPR-compliant' },
];

function CookieRow({ name, provider, purpose, retention }: {
  name: string; provider: string; purpose: string; retention: string;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] md:grid-cols-[1.5fr_1fr_2fr_1fr] gap-3 py-3 border-b border-[#E5E5E5] last:border-0 items-start">
      <code className="text-xs font-mono bg-[#F5F0EB] text-[#C2654A] px-2 py-1 rounded-lg break-all">{name}</code>
      <span className="text-xs text-[#8A8A8A] font-medium">{provider}</span>
      <span className="text-sm text-[#4A4A4A] leading-[1.6] col-span-2 md:col-span-1">{purpose}</span>
      <span className="text-xs text-[#8A8A8A]">{retention}</span>
    </div>
  );
}

type Section = {
  id: string;
  icon: React.ElementType;
  title: string;
  content: React.ReactNode;
};

const SECTIONS: Section[] = [
  {
    id: 'wat',
    icon: Cookie,
    title: '1. Wat zijn cookies?',
    content: (
      <p className="text-[15px] text-[#4A4A4A] leading-[1.7]">
        Cookies zijn kleine tekstbestanden die je browser opslaat. Ze helpen websites om
        voorkeuren te onthouden en functionaliteit te bieden. Naast cookies gebruiken we ook
        Local Storage — dat werkt hetzelfde maar wordt nooit automatisch naar onze servers
        verstuurd.
      </p>
    ),
  },
  {
    id: 'essentieel',
    icon: ShieldCheck,
    title: '2. Functionele cookies (essentieel)',
    content: (
      <div className="space-y-4">
        <p className="text-[15px] text-[#4A4A4A] leading-[1.7]">
          Nodig om FitFi te laten werken. Deze cookies kun je niet uitschakelen zonder dat
          de dienst stopt.
        </p>
        <div className="bg-[#F5F0EB] rounded-2xl p-4 md:p-5 space-y-1">
          <div className="hidden md:grid md:grid-cols-[1.5fr_1fr_2fr_1fr] gap-3 pb-2 mb-1 border-b border-[#E5E5E5]">
            {['Naam', 'Provider', 'Doel', 'Bewaartermijn'].map((h) => (
              <span key={h} className="text-xs font-bold uppercase tracking-wide text-[#8A8A8A]">{h}</span>
            ))}
          </div>
          <CookieRow name="sb-<project>-auth-token" provider="Supabase" purpose="Authenticatie sessie" retention="7 dagen" />
          <CookieRow name="ff_cookie_prefs" provider="FitFi" purpose="Cookie-voorkeuren opslaan" retention="Permanent" />
          <CookieRow name="fitfi_theme" provider="FitFi" purpose="Dark/light mode voorkeur" retention="Permanent" />
          <CookieRow name="fitfi_quiz_progress" provider="FitFi" purpose="Quiz-voortgang lokaal opslaan" retention="Sessie" />
        </div>
        <p className="text-xs text-[#8A8A8A]">
          Rechtsgrond: Overeenkomst (noodzakelijk voor dienstverlening, art. 6 lid 1 sub b AVG)
        </p>
      </div>
    ),
  },
  {
    id: 'analytics',
    icon: BarChart2,
    title: '3. Analytische cookies (opt-in)',
    content: (
      <div className="space-y-4">
        <p className="text-[15px] text-[#4A4A4A] leading-[1.7]">
          Deze cookies helpen ons begrijpen hoe je FitFi gebruikt, zodat we de dienst
          kunnen verbeteren. Ze worden <strong>alleen</strong> geplaatst na jouw expliciete
          toestemming.
        </p>
        <div className="bg-[#F5F0EB] rounded-2xl p-4 md:p-5 space-y-1">
          <div className="hidden md:grid md:grid-cols-[1.5fr_1fr_2fr_1fr] gap-3 pb-2 mb-1 border-b border-[#E5E5E5]">
            {['Naam', 'Provider', 'Doel', 'Bewaartermijn'].map((h) => (
              <span key={h} className="text-xs font-bold uppercase tracking-wide text-[#8A8A8A]">{h}</span>
            ))}
          </div>
          <CookieRow name="_ga" provider="Google" purpose="Gebruikers onderscheiden" retention="2 jaar" />
          <CookieRow name="_ga_<id>" provider="Google" purpose="Sessie-status bijhouden" retention="2 jaar" />
          <CookieRow name="_gid" provider="Google" purpose="Gebruikers onderscheiden" retention="24 uur" />
          <CookieRow name="_gat" provider="Google" purpose="Request rate limiting" retention="1 minuut" />
        </div>
        <div className="flex items-start gap-3 bg-white border border-[#E5E5E5] rounded-2xl p-4">
          <AlertTriangle className="w-4 h-4 text-[#D4913D] flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[#1A1A1A]">Datatransfer naar de VS</p>
            <p className="text-xs text-[#8A8A8A] leading-[1.6]">
              Google Analytics stuurt gegevens naar servers in de VS (Schrems II). Wij hebben
              IP-anonymisatie ingeschakeld, DPA-overeenkomst met Google, en geen advertentie-
              of profilinggebruik.
            </p>
          </div>
        </div>
        <p className="text-xs text-[#8A8A8A]">
          Rechtsgrond: Toestemming (art. 6 lid 1 sub a AVG)
        </p>
      </div>
    ),
  },
  {
    id: 'marketing',
    icon: Megaphone,
    title: '4. Marketing cookies',
    content: (
      <div className="space-y-4">
        <p className="text-[15px] text-[#4A4A4A] leading-[1.7]">
          <strong>We gebruiken geen marketing-cookies.</strong> Concreet betekent dat:
        </p>
        <ul className="space-y-2">
          {[
            'Facebook/Meta Pixel',
            'Google Ads tracking',
            'TikTok Pixel',
            'LinkedIn Insight Tag',
            'DoubleClick advertentienetwerk',
          ].map((item) => (
            <li key={item} className="flex items-center gap-3 text-[15px] text-[#4A4A4A]">
              <div className="w-5 h-5 rounded-full bg-[#C24A4A]/10 flex items-center justify-center flex-shrink-0">
                <X className="w-3 h-3 text-[#C24A4A]" aria-hidden="true" />
              </div>
              {item}
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: 'localstorage',
    icon: Database,
    title: '5. Local Storage',
    content: (
      <div className="space-y-4">
        <p className="text-[15px] text-[#4A4A4A] leading-[1.7]">
          Naast cookies slaan we ook data op in Local Storage. Dit wordt{' '}
          <strong>nooit automatisch naar onze servers verstuurd</strong> en blijft lokaal
          in je browser.
        </p>
        <div className="bg-[#F5F0EB] rounded-2xl p-4 md:p-5 space-y-1">
          <CookieRow name="fitfi_quiz_progress" provider="FitFi" purpose="Quiz-voortgang opslaan" retention="Lokaal" />
          <CookieRow name="fitfi_onboarding_seen" provider="FitFi" purpose="Onboarding-status" retention="Lokaal" />
          <CookieRow name="sb-<project>-auth-token" provider="Supabase" purpose="Auth token cache" retention="Lokaal" />
        </div>
      </div>
    ),
  },
  {
    id: 'derde-partijen',
    icon: Globe,
    title: '6. Externe diensten',
    content: (
      <div className="space-y-4">
        <p className="text-[15px] text-[#4A4A4A] leading-[1.7]">
          We maken gebruik van drie externe diensten die zelf ook cookies kunnen plaatsen.
          Alle partijen hebben verwerkersovereenkomsten (DPA's) en handelen conform AVG.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { name: 'Supabase', type: 'Essentieel', info: 'Database & auth', location: 'EU (Frankfurt)' },
            { name: 'Stripe', type: 'Essentieel', info: 'Betalingen', location: 'EU & VS' },
            { name: 'Google Analytics', type: 'Analytisch', info: 'Gebruiksstatistieken', location: 'VS (USA)' },
          ].map((s) => (
            <div key={s.name} className="bg-[#F5F0EB] border border-[#E5E5E5] rounded-2xl p-4">
              <p className="text-sm font-bold text-[#1A1A1A] mb-1">{s.name}</p>
              <p className="text-xs text-[#8A8A8A] mb-2">{s.type}</p>
              <p className="text-xs text-[#4A4A4A]">{s.info}</p>
              <p className="text-xs text-[#8A8A8A] mt-1">{s.location}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'beheren',
    icon: Settings,
    title: '7. Voorkeuren beheren',
    content: (
      <div className="space-y-4">
        <p className="text-[15px] text-[#4A4A4A] leading-[1.7]">
          Je kunt je cookie-voorkeuren op elk moment wijzigen via drie kanalen:
        </p>
        <ul className="space-y-3">
          {[
            { label: 'Via je profiel', desc: 'Ga naar Profiel → Account → Cookie-instellingen' },
            { label: 'Via je browser', desc: 'Verwijder cookies handmatig in de browserinstellingen' },
            { label: 'Do Not Track', desc: 'We respecteren DNT-headers in je browser' },
          ].map((item) => (
            <li key={item.label} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#3D8B5E]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-[#3D8B5E]" aria-hidden="true" />
              </div>
              <span className="text-[15px] text-[#4A4A4A] leading-[1.7]">
                <strong className="text-[#1A1A1A]">{item.label}:</strong> {item.desc}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-[#8A8A8A] leading-[1.6]">
          Consent intrekken = cookies verwijderen. Wanneer je analytische cookies uitschakelt
          via je profiel, worden alle Google Analytics cookies onmiddellijk verwijderd.
        </p>
      </div>
    ),
  },
  {
    id: 'bewaartermijn',
    icon: Clock,
    title: '8. Bewaartermijnen',
    content: (
      <div className="space-y-3">
        {[
          { type: 'Sessie-cookies', retention: 'Tot je browser sluit', auto: true },
          { type: 'Functionele cookies', retention: 'Max. 1 jaar', auto: true },
          { type: 'Google Analytics (_ga)', retention: '2 jaar', auto: true },
          { type: 'Google Analytics (_gid)', retention: '24 uur', auto: true },
          { type: 'Local Storage', retention: 'Permanent', auto: false },
        ].map((row) => (
          <div key={row.type} className="flex items-center justify-between py-3 border-b border-[#E5E5E5] last:border-0 gap-4">
            <span className="text-sm font-medium text-[#1A1A1A]">{row.type}</span>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-xs text-[#8A8A8A]">{row.retention}</span>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${row.auto ? 'bg-[#3D8B5E]/10' : 'bg-[#C24A4A]/10'}`}>
                {row.auto
                  ? <Check className="w-3 h-3 text-[#3D8B5E]" aria-hidden="true" />
                  : <X className="w-3 h-3 text-[#C24A4A]" aria-hidden="true" />
                }
              </div>
            </div>
          </div>
        ))}
        <p className="text-xs text-[#8A8A8A] pt-1">
          Vinkje = automatisch verwijderd na vervaldatum. Kruis = handmatig verwijderen via
          browserinstellingen.
        </p>
      </div>
    ),
  },
  {
    id: 'gdpr',
    icon: Scale,
    title: '9. GDPR & jouw rechten',
    content: (
      <div className="space-y-4">
        <p className="text-[15px] text-[#4A4A4A] leading-[1.7]">
          Onder de AVG heb je de volgende rechten met betrekking tot cookies en data:
        </p>
        <ul className="space-y-3">
          {[
            { right: 'Inzage (art. 15)', desc: 'overzicht van alle cookies en verwerking' },
            { right: 'Verwijdering (art. 17)', desc: 'alle cookies en je account verwijderen' },
            { right: 'Bezwaar (art. 21)', desc: 'bezwaar maken tegen analytische cookies' },
            { right: 'Dataportabiliteit (art. 20)', desc: 'export van je gegevens opvragen' },
          ].map((item) => (
            <li key={item.right} className="flex items-start gap-3 text-[15px] text-[#4A4A4A] leading-[1.7]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C2654A] flex-shrink-0 mt-[0.55em]" aria-hidden="true" />
              <span><strong className="text-[#1A1A1A]">{item.right}:</strong> {item.desc}</span>
            </li>
          ))}
        </ul>
        <p className="text-[15px] text-[#4A4A4A] leading-[1.7]">
          Contact:{' '}
          <a href="mailto:privacy@fitfi.ai" className="text-[#C2654A] hover:text-[#A8513A] underline underline-offset-4 transition-colors duration-200">
            privacy@fitfi.ai
          </a>
        </p>
      </div>
    ),
  },
  {
    id: 'wijzigingen',
    icon: RefreshCw,
    title: '10. Wijzigingen',
    content: (
      <p className="text-[15px] text-[#4A4A4A] leading-[1.7]">
        We kunnen dit beleid bijwerken naarmate FitFi evolueert of regelgeving verandert.
        Grote wijzigingen kondigen we aan via e-mail (als je een account hebt), in-app
        notificatie of een vernieuwde cookie-banner. De datum bovenaan toont de laatste
        update.
      </p>
    ),
  },
  {
    id: 'contact',
    icon: Mail,
    title: '11. Meer informatie & contact',
    content: (
      <ul className="space-y-3">
        {[
          { label: 'Privacyverklaring', href: '/privacy', internal: true },
          { label: 'AVG-rechten & vragen', href: 'mailto:privacy@fitfi.ai', internal: false },
          { label: 'Klachten: Autoriteit Persoonsgegevens', href: 'https://autoriteitpersoonsgegevens.nl', internal: false },
          { label: 'Google Privacy Policy', href: 'https://policies.google.com/privacy', internal: false },
        ].map((item) => (
          <li key={item.label} className="flex items-start gap-3 text-[15px] text-[#4A4A4A] leading-[1.7]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C2654A] flex-shrink-0 mt-[0.55em]" aria-hidden="true" />
            {item.internal ? (
              <Link to={item.href} className="text-[#C2654A] hover:text-[#A8513A] underline underline-offset-4 transition-colors duration-200">
                {item.label}
              </Link>
            ) : (
              <a href={item.href} className="text-[#C2654A] hover:text-[#A8513A] underline underline-offset-4 transition-colors duration-200" target={item.href.startsWith('http') ? '_blank' : undefined} rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}>
                {item.label}
              </a>
            )}
          </li>
        ))}
      </ul>
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
            <div className="pb-6 pl-[52px] max-w-[680px]">
              {section.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function CookiesPage() {
  const [openId, setOpenId] = useState<string | null>('wat');

  function toggle(id: string) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  return (
    <>
      <Seo
        title="Cookies & voorkeuren — FitFi"
        description="Helder cookiebeleid: functionele en analytische cookies, geen marketing-tracking. Volledige controle over je voorkeuren."
        path="/cookies"
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
          aria-labelledby="cookies-hero-heading"
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
                Cookiebeleid
              </span>
              <span className="w-6 h-px bg-[#C2654A]" aria-hidden="true" />
            </motion.div>

            <motion.h1
              id="cookies-hero-heading"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="text-[32px] md:text-[56px] text-[#1A1A1A] leading-[1.05] max-w-[700px] mx-auto mb-6"
            >
              <span className="font-serif italic">Cookies & </span>
              <span className="font-sans font-bold">voorkeuren</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
              className="text-lg text-[#4A4A4A] leading-[1.7] max-w-[520px] mx-auto"
            >
              We houden het licht en relevant — je hebt de regie. Geen marketing-cookies,
              analytics alleen met jouw toestemming.{' '}
              <Link
                to="/contact"
                className="text-[#C2654A] hover:text-[#A8513A] underline underline-offset-4 transition-colors duration-200"
              >
                Vragen?
              </Link>
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
              className="max-w-[720px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              {[
                { icon: Check, color: '#3D8B5E', bg: 'bg-[#3D8B5E]/10', label: 'Essentiële cookies', desc: 'Altijd aan — nodig voor login en voorkeuren' },
                { icon: Check, color: '#3D8B5E', bg: 'bg-[#3D8B5E]/10', label: 'Analytics (opt-in)', desc: 'Alleen met jouw expliciete toestemming' },
                { icon: X, color: '#C24A4A', bg: 'bg-[#C24A4A]/10', label: 'Marketing cookies', desc: 'Nooit — geen pixel, geen advertentietracking' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="bg-white border border-[#E5E5E5] rounded-2xl p-5 flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full ${item.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-4 h-4" style={{ color: item.color }} aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1A1A1A] mb-0.5">{item.label}</p>
                      <p className="text-xs text-[#8A8A8A] leading-[1.6]">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* ── ACCORDION ── */}
        <section className="bg-[#FAFAF8] pt-12 pb-24" aria-label="Cookiebeleid secties">
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
        <section className="bg-[#F5F0EB] py-40 text-center" aria-label="Voorkeuren beheren">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <motion.h2
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
              className="text-[32px] md:text-[56px] text-[#1A1A1A] leading-[1.05] mb-6"
            >
              <span className="font-serif italic">Jij hebt de regie.</span>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={1}
              className="text-[17px] text-[#4A4A4A] mb-12"
            >
              Pas je cookie-instellingen aan via je profiel, of neem contact op.
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
                to="/profiel"
                className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-[#C2654A] hover:bg-[#A8513A] text-white font-semibold text-[15px] transition-colors duration-200"
              >
                Instellingen aanpassen
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                to="/privacy"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-[#E5E5E5] hover:border-[#C2654A] text-[#1A1A1A] font-medium text-[15px] transition-colors duration-200 bg-white"
              >
                Privacyverklaring
              </Link>
            </motion.div>

          </div>
        </section>

      </main>
    </>
  );
}
