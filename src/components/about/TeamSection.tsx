import React from "react";

type Member = {
  name: string;
  role: string;
  location?: string;
  bio: string;
};

const members: Member[] = [
  {
    name: "Lara",
    role: "UX & Brand",
    location: "Rotterdam",
    bio: "Verantwoordelijk voor het rustige, premium design-systeem en de editorial flows.",
  },
  {
    name: "Milan",
    role: "Product & ML",
    location: "Utrecht",
    bio: "Stuurt de modellen die silhouet, materiaal en kleurtemperatuur vertalen naar advies.",
  },
  {
    name: "Sanne",
    role: "Ops & Partnerships",
    location: "Amsterdam",
    bio: "Bouwt het partner-ecosysteem en borgt privacy-first processen.",
  },
];

const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const TeamSection: React.FC = () => {
  return (
    <section className="ff-section" aria-labelledby="team-title">
      <div className="ff-container">
        <header className="section-header mb-4">
          <p className="kicker">Team</p>
          <h2 id="team-title" className="section-title">Mensen achter FitFi</h2>
          <p className="section-intro">
            Een klein team met een gezamenlijk kompas: duidelijke stijl zonder ruis — met respect voor privacy.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {members.map((m) => (
            <article
              key={m.name}
              className="card card-hover p-6 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-soft)]"
            >
              <div className="flex items-center gap-4">
                <div className="avatar-chip" aria-hidden>
                  <span className="avatar-initials">{initials(m.name)}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold leading-tight">{m.name}</h3>
                  <p className="opacity-80">{m.role}{m.location ? ` — ${m.location}` : ""}</p>
                </div>
              </div>
              <p className="leading-7 mt-4">{m.bio}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;