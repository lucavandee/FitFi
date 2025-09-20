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
    bio: "Ontwerpt het rustige, premium design-systeem en de editorial flows.",
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
        <header className="section-header">
          <p className="kicker">Team</p>
          <h2 id="team-title" className="section-title">Mensen achter FitFi</h2>
          <p className="section-intro">
            Klein team, groot kompas: duidelijke stijl zonder ruis — met respect voor privacy.
          </p>
        </header>

        <div className="team-grid">
          {members.map((m) => (
            <article key={m.name} className="team-card" aria-label={`${m.name}, ${m.role}`}>
              <div className="team-meta">
                <div className="avatar-ring" aria-hidden>
                  <span className="avatar-initials">{initials(m.name)}</span>
                </div>
                <div>
                  <h3 className="team-name">{m.name}</h3>
                  <p className="team-role">
                    {m.role}{m.location ? ` — ${m.location}` : ""}
                  </p>
                </div>
              </div>
              <p className="team-bio">{m.bio}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;