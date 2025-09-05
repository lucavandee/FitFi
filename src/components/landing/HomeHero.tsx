import { Link } from "react-router-dom";
import track from "@/services/analytics";

export default function HomeHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl p-8 sm:p-10 bg-white ff-hero">
      <div className="grid gap-8 md:grid-cols-2 items-center">
        <div>
          <h1 className="ff-hero-title text-4xl sm:text-6xl">AI-styling die bij je past</h1>
          <p className="mt-4 text-[color:var(--ff-midnight)]/70 max-w-prose">
            Wij helpen je met stijl — slim, persoonlijk en future-ready. Krijg outfits die kloppen, met korte uitleg bij elke look.
          </p>
          <div className="mt-6 flex items-center gap-3">
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
          <p className="ff-subtle mt-4">Geen druk. Geen onzin. Wel een heldere uitleg per outfit.</p>
        </div>
        <div className="relative">
          <div className="aspect-[4/3] w-full rounded-2xl bg-gradient-to-br from-[rgba(137,207,240,0.25)] via-white to-[rgba(13,27,42,0.06)] shadow-[0_10px_30px_rgba(13,27,42,0.08)] grid place-items-center">
            <div className="text-center">
              <div className="font-heading text-2xl text-[color:var(--ff-midnight)]">Smart Casual – Italiaans</div>
              <div className="mt-2 text-gray-600 text-sm">Live preview van AI-outfits (demo)</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}