import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import track from "@/services/analytics";

export default function LandingPage() {
  return (
    <section className="ff-hero grid gap-6 md:grid-cols-2">
      <Helmet><title>FitFi — AI-styling die bij je past</title></Helmet>

      <div className="ff-card">
        <h1 className="ff-hero-title text-4xl sm:text-5xl mb-4">
          AI-styling die bij je past
        </h1>
        <p className="text-[color:var(--ff-midnight)]/70 mb-6">
          Wij helpen je met stijl — slim, persoonlijk en future-ready.
        </p>

        <div className="flex items-center gap-3">
          <Link
            to="/onboarding"
            className="btn btn-primary"
            onClick={() => track("nova:cta", { where: "hero", action: "onboarding" })}
          >
            Doe de stijlscan
          </Link>
          <Link
            to="/results"
            className="btn btn-ghost"
            onClick={() => track("nova:cta", { where: "hero", action: "demo" })}
          >
            Bekijk demo
          </Link>
        </div>

        <p className="ff-subtle mt-4">
          Korte uitleg bij elke outfit — transparant en menselijk.
        </p>
      </div>

      <div className="ff-card">
        <h2 className="font-heading text-xl text-[color:var(--ff-midnight)] mb-3">Waarom dit werkt</h2>
        <ul className="list-disc pl-5 text-[color:var(--ff-midnight)]/70 space-y-1">
          <li>Explainability bij elke outfit.</li>
          <li>Premium UI (Apple × Lululemon × OpenAI).</li>
          <li>Privacy-first, EU-ready.</li>
        </ul>
      </div>
    </section>
  );
}