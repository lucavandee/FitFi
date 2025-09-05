import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <section className="grid gap-6 md:grid-cols-2">
      <Helmet><title>FitFi — AI-styling die bij je past</title></Helmet>
      <div className="ff-card">
        <h1 className="ff-hero-title mb-4">AI-styling die bij je past</h1>
        <p className="text-midnight/70 mb-6">
          Wij helpen je met stijl — slim, persoonlijk en future-ready.
        </p>
        <div className="flex items-center gap-3">
          <Link to="/onboarding" className="px-4 py-2 rounded-2xl bg-[color:var(--ff-turquoise)] text-[color:var(--ff-midnight)] font-semibold hover:opacity-90 transition">Doe de stijlscan</Link>
          <Link to="/results" className="px-4 py-2 rounded-2xl bg-white border border-black/10 hover:bg-[color:var(--ff-surface)] transition">Bekijk demo</Link>
        </div>
      </div>
      <div className="ff-card">
        <h2 className="text-xl font-semibold text-[color:var(--ff-midnight)] mb-2">Waarom dit werkt</h2>
        <ul className="list-disc pl-5 text-midnight/70 space-y-1">
          <li>Explainability bij elke outfit.</li>
          <li>Premium UI (Apple × Lululemon × OpenAI).</li>
          <li>Privacy-first, EU-ready.</li>
        </ul>
      </div>
    </section>
  );
}