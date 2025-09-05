export default function FeatureList(){
  const items = [
    { t:"Uitleg bij elke outfit", d:"Snap waarom iets werkt — silhouet, kleur en context." },
    { t:"Premium UI/UX", d:"Apple × Lululemon × OpenAI — clean, snel en toegankelijk." },
    { t:"Privacy-first", d:"EU-ready. Geen onnodige tracking, duidelijke consent." }
  ];
  return(
    <section className="grid gap-6 sm:grid-cols-3">
      {items.map(i=>(
        <div key={i.t} className="ff-card">
          <div className="font-heading text-lg text-[color:var(--ff-midnight)]">{i.t}</div>
          <p className="mt-1 text-gray-600 text-sm">{i.d}</p>
        </div>
      ))}
    </section>
  );
}