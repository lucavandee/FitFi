import React from "react";
import Seo from "@/components/Seo";
import SectionHeader from "@/components/marketing/SectionHeader";

// Bestaande imports ongewijzigd:
import { ErrorBoundary } from "@/components/ErrorBoundary";
// import { Leaderboard, Badges, Challenges } from "@/components/gamification/...";
// etc.

const GamificationPage: React.FC = () => {
  return (
    <>
      {/* Uniforme SEO */}
      <Seo
        title="Gamification — FitFi"
        description="Spaar punten, behaal levels en win badges met challenges en leaderboards."
        canonical="/gamification"
      />

      <main className="min-h-screen bg-[var(--color-bg)]">
        <SectionHeader
          eyebrow="LEVELS & BADGES"
          title="Maak van stijl een spel dat je wint"
          subtitle="Verdien XP, bouw streaks en unlock perks met dagelijkse micro-acties."
          align="left"
          as="h1"
        />

        {/* Bestaande gamification-secties ongewijzigd */}
        <ErrorBoundary>
          {/* <Leaderboard /> <Badges /> <Challenges /> etc. */}
          {/* ... */}
        </ErrorBoundary>
      </main>
    </>
  );
};

export default GamificationPage;