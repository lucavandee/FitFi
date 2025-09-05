export default function FeatureList() {
  return (
    <section className="grid gap-6 sm:grid-cols-3">
      {[
        { title: "Uitleg bij elke outfit", desc: "Snap waarom iets werkt — silhouet, kleur en context." },
        { title: "Premium UI/UX", desc: "Apple × Lululemon × OpenAI — clean, snel en toegankelijk." },
        { title: "Privacy-first", desc: "EU-ready. Geen onnodige tracking, duidelijke consent." },
      ].map((f) => (
        <div key={f.title} className="ff-card">
          <div className="font-heading text-lg text-[color:var(--ff-midnight)]">{f.title}</div>
          <p className="mt-1 text-gray-600 text-sm">{f.desc}</p>
        </div>
      ))}
    </section>
  );
}