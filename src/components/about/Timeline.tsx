import React from "react";

type Item = {
  title: string;
  meta: string;
  body: string;
};

const items: Item[] = [
  {
    title: "Idee → Proof of Concept",
    meta: "Concept & eerste modellen",
    body:
      "We vertaalden stijlvoorkeuren naar archetypen en koppelden die aan silhouet- en kleurlogica.",
  },
  {
    title: "Publieke beta NL",
    meta: "AI Style Report",
    body:
      "Rustige onboarding, helder rapport en outfits met shoplinks — zonder account of creditcard.",
  },
  {
    title: "Uitrol premium features",
    meta: "Meer outfits & garderobetips",
    body:
      "Extra varianten per silhouet, seizoensadvies en materiaal-uitleg in korte, heldere zinnen.",
  },
];

const Timeline: React.FC = () => {
  return (
    <section className="ff-section" aria-labelledby="timeline-title">
      <div className="ff-container">
        <header className="section-header">
          <p className="kicker">Roadmap</p>
          <h2 id="timeline-title" className="section-title">Stap voor stap, zonder ruis</h2>
          <p className="section-intro">Kleine, doordachte releases die direct waarde opleveren.</p>
        </header>

        <ol className="timeline timeline--alt" role="list">
          {items.map((it, i) => (
            <li key={i} className="timeline-item" aria-label={it.title}>
              <div className="timeline-col timeline-col--a">
                <article className="timeline-card">
                  <p className="timeline-meta">{it.meta}</p>
                  <h3 className="timeline-title">{it.title}</h3>
                  <p className="timeline-body">{it.body}</p>
                </article>
              </div>
              <div className="timeline-axis" aria-hidden>
                <span className="timeline-dot" />
                <span className="timeline-line" />
              </div>
              <div className="timeline-col timeline-col--b">
                <article className="timeline-card timeline-card--ghost" aria-hidden />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default Timeline;