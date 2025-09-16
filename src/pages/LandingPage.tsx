import React from "react";
import Hero from "@/components/landing/Hero";

const LandingPage: React.FC = () => {
  return (
    <main className="bg-[color:var(--color-bg)] text-[color:var(--color-text)] font-body">
      <Hero />
    </main>
  );
};

export default LandingPage;