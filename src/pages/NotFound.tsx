// /src/pages/NotFound.tsx
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import PageHero from "@/components/marketing/PageHero";
import Button from "@/components/ui/Button";

// Belangrijk: importeer de quiz en render die rechtstreeks wanneer het pad /stijlquiz is.
// Zo werkt /stijlquiz onmiddellijk zonder router-wijzigingen (veilig & non-invasive).
import StyleQuizPage from "@/pages/StyleQuizPage";

export default function NotFound() {
  const { pathname } = useLocation();

  // Hotfix: route-alias voor /stijlquiz via NotFound.
  // - We renderen de quiz rechtstreeks. 
  // - Dit voorkomt 404 totdat de router expliciet wordt uitgebreid.
  // - Voldoet aan privacy/tokens-richtlijnen; geen providers aangepast.
  if (pathname === "/stijlquiz") {
    return <StyleQuizPage />;
  }

  return (
    <main className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Seo title="Pagina niet gevonden — FitFi" description="De pagina die je zocht bestaat niet (404)." path={pathname} />
      <PageHero
        eyebrow="FOUT 404"
        title="Pagina niet gevonden"
        subtitle="De pagina die je zocht bestaat niet. Ga terug naar de homepage of bekijk je resultaten."
        align="left"
        size="sm"
        ctas={[
          { label: "Ga naar home", to: "/", variant: "secondary" },
          { label: "Bekijk resultaten", to: "/results", variant: "primary" },
        ]}
      />

      <section className="ff-container pt-10 pb-16">
        <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] p-6">
          <p className="text-sm text-[var(--color-text)]/80">
            Gebruik de navigatie hierboven of de knoppen hieronder.
          </p>
          <div className="mt-4 flex gap-3">
            <Button as={NavLink} to="/" variant="secondary">Home</Button>
            <Button as={NavLink} to="/results" variant="primary">Resultaten</Button>
          </div>
        </div>
      </section>
    </main>
  );
}