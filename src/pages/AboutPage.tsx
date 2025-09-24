import React from "react";
import { NavLink } from "react-router-dom";
import { Users, Target, Shield } from "lucide-react";

const VALUES = [
  {
    icon: <Target className="w-5 h-5" />,
    title: "Persoonlijk, niet generiek",
    desc: "We vertalen jouw stijl naar outfits die kloppen – van silhouet tot kleur."
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Minimal & warm",
    desc: "Premium, rustig en functioneel. Geen ruis of drukte."
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Eerlijke aanbevelingen",
    desc: "We linken soms naar shops, maar advies blijft stijl- en pasvorm-gedreven."
  }
];

const METRICS = [
  { label: "Vragen naar stijlprofiel", value: "6", help: "Klaar in ±2 min" },
  { label: "Outfits in Starter", value: "3", help: "Per maand" },
  { label: "Outfits in Pro", value: "10", help: "Per maand" },
  { label: "Shoplinks & alerts", value: "✓", help: "Optioneel" }
];

const TEAM_MEMBERS = [
  { name: "Sarah", role: "Stylist", image: "https://picsum.photos/seed/sarah/400/400" },
  { name: "Mike", role: "Developer", image: "https://picsum.photos/seed/mike/400/400" },
  { name: "Lisa", role: "Designer", image: "https://picsum.photos/seed/lisa/400/400" }
];

export default function AboutPage() {
  return (
    <main id="main" className="bg-bg text-text">
      <section className="ff-container ff-stack-lg py-12 sm:py-14">
        <div className="ff-about-hero">
          <div className="ff-stack">
            <p className="text-sm text-text/70">Over FitFi</p>
            <h1 className="font-heading text-2xl sm:text-3xl ff-text-balance">
              Wij maken kleden weer makkelijk
            </h1>
            <p className="text-text/80">
              Geen eindeloos scrollen. Gewoon outfits die passen bij jouw smaak en leven.
            </p>
            <div className="cta-row">
              <NavLink to="/hoe-het-werkt" className="ff-btn ff-btn-secondary">
                Hoe het werkt
              </NavLink>
              <NavLink to="/quiz" className="ff-btn ff-btn-primary">
                Proberen
              </NavLink>
            </div>
          </div>
          <div className="media">
            <div 
              style={{ 
                aspectRatio: "16/10", 
                background: "var(--color-surface)",
                borderRadius: "var(--radius-2xl)"
              }} 
            />
          </div>
        </div>

        <section aria-labelledby="values-title" className="ff-stack-lg">
          <h2 id="values-title" className="font-heading text-xl sm:text-2xl">
            Onze waarden
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {VALUES.map((value, index) => (
              <article key={index} className="ff-card p-5">
                <div className="text-text/70 mb-2">{value.icon}</div>
                <h3 className="font-semibold">{value.title}</h3>
                <p className="mt-1 text-text/80">{value.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="metrics-title" className="ff-stack-lg">
          <h2 id="metrics-title" className="font-heading text-xl sm:text-2xl">
            In cijfers
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {METRICS.map((metric, index) => (
              <div key={index} className="ff-glass p-4 text-center">
                <div className="text-2xl font-bold text-text">{metric.value}</div>
                <div className="text-sm text-text/70">{metric.label}</div>
                {metric.help && (
                  <div className="text-xs text-text/60 mt-1">{metric.help}</div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="team-title" className="ff-stack-lg">
          <h2 id="team-title" className="font-heading text-xl sm:text-2xl">
            Ons team
          </h2>
          <div className="ff-team-grid">
            {TEAM_MEMBERS.map((member) => (
              <article key={member.name} className="ff-team-card">
                <img alt={`${member.name}, ${member.role}`} src={member.image} />
                <div className="ff-team-name">{member.name}</div>
                <div className="ff-team-role">{member.role}</div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}