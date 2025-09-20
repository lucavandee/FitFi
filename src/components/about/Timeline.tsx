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
      "Extra varianten per silhouet, seizoensadvies en materiaal-uitleg met korte, heldere zinnen.",
  },
];

const Timeline: React.FC = () => {
  return (
    <section className="ff-section" aria-labelledby="timeline-title">
      <div className="ff-container">
        <header className="section-header mb-4">
          <p className="kicker">Roadmap</p>
          <h2 id="timeline-title" className="section-title">Stap voor stap, zonder ruis</h2>
          <p className="section-intro">Kleine, doordachte releases die direct waarde opleveren.</p>
        </header>

        <ol className="timeline" role="list">
          {items.map((it, i) => (
            <li key={i} className="timeline-item">
              <div className="timeline-dot" aria-hidden />
              <div className="timeline-content">
                <h3 className="text-lg font-semibold leading-tight">{it.title}</h3>
                <p className="text-sm opacity-80 mb-1">{it.meta}</p>
                <p className="leading-7">{it.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default Timeline;