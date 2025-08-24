import React from "react";
import { ChevronDown, Shield, Heart, Zap, DollarSign, Users } from "lucide-react";

type QA = { q: string; a: React.ReactNode };
const items: (QA & { icon: React.ComponentType<any> })[] = [
  {
    q: "Wat gebeurt er na de test?",
    a: <>Je ontvangt direct je <strong>stijlcode</strong>, <strong>outfitvoorstellen</strong> en een korte <strong>uitleg</strong> waarom het bij je past. Daarna kun je outfits bewaren en gericht shoppen.</>,
    icon: Zap,
  },
  {
    q: "Wat kost het?",
    a: <>De stijltest is <strong>gratis</strong>. We voegen later een Premium-laag toe voor extra features zoals diepere analyses en persoonlijke capsules.</>,
    icon: Heart,
  },
  {
    q: "Werkt dit voor mannen én vrouwen?",
    a: <>Ja. Onze AI-stylist is getraind op diverse silhouetten en voorkeuren. We houden rekening met seizoenen en context.</>,
    icon: Users,
  },
  {
    q: "Hoe verdienen jullie geld?",
    a: <>Transparant: we werken met <strong>affiliate-links</strong> naar partners. Als je via ons shopt, kan FitFi een kleine commissie ontvangen — jij betaalt niets extra.</>,
    icon: DollarSign,
  },
  {
    q: "Wat doen jullie met mijn data?",
    a: <>We gebruiken alleen wat nodig is om je stijl te bepalen en de ervaring te verbeteren. Lees meer in onze <a className="underline hover:text-[#89CFF0] transition-colors" href="/privacy">privacyverklaring</a>.</>,
    icon: Shield,
  },
];

export default function MiniFAQ() {
  return (
    <section className="bg-[#F6F6F6]">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#0D1B2A] mb-2">Veelgestelde vragen</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Alles wat je wilt weten over Nova en je persoonlijke stijlanalyse
          </p>
        </div>
        <div className="mt-6 space-y-3">
          {items.map((it, i) => (
            <details key={i} className="group rounded-2xl bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-4 p-6 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#89CFF0]/10 flex items-center justify-center">
                    <it.icon className="w-4 h-4 text-[#89CFF0]" />
                  </div>
                  <span className="text-base font-semibold text-[#0D1B2A]">{it.q}</span>
                </div>
                <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform duration-200 flex-shrink-0" />
              </summary>
              <div className="px-6 pb-6">
                <div className="pl-11 text-sm text-slate-700 leading-relaxed">{it.a}</div>
              </div>
            </details>
          ))}
        </div>
        
        {/* CTA at bottom */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-slate-600 mb-4">
            <div className="w-2 h-2 rounded-full bg-[#89CFF0]"></div>
            Nog vragen? We helpen je graag verder
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/quiz"
              className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-slate-900 bg-[#89CFF0] hover:bg-[#7fc2e3] transition-all duration-200 shadow-[0_8px_25px_rgba(137,207,240,0.25)] hover:shadow-[0_12px_35px_rgba(137,207,240,0.35)] hover:-translate-y-0.5"
              data-cta="faq_primary"
            >
              Start je stijltest
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold text-[#0D1B2A] ring-1 ring-slate-200 hover:bg-slate-50 transition-all duration-200"
              data-cta="faq_secondary"
            >
              Stel een vraag
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}