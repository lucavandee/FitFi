import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Hero from "@/components/landing/Hero";
import SmartImage from "@/components/media/SmartImage";
import Seo from "@/components/Seo";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import HeroTitle from "@/components/marketing/HeroTitle";
import Chip from "@/components/ui/Chip";
import { useUser } from "@/context/UserContext";
import SectionHeader from "@/components/marketing/SectionHeader";

const HomePage: React.FC = () => {
  const { user } = useUser();

  const handleStartQuiz = () => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "quiz_start", {
        location: "home_hero",
        event_category: "conversion",
        event_label: "home_cta_click",
      });
    }
  };

  return (
    <>
      {/* Uniforme SEO (vervangt eerdere dubbele Helmet/Seo zonder contentverlies) */}
      <Seo
        title="FitFi — AI Style Report voor jouw perfecte look"
        description="Ontdek jouw unieke stijl met onze AI-stylist. Krijg persoonlijke outfit-aanbevelingen die echt werken voor jouw leven."
        canonical="/"
        image="https://fitfi.ai/og-default.jpg"
        keywords="AI stylist, outfit aanbevelingen, stijlquiz, fashion advies, Nederlandse mode"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "FitFi",
          url: "https://fitfi.ai",
          logo: "https://fitfi.ai/logo.png",
        }}
      />

      <main id="main" className="bg-[var(--color-bg)] min-h-screen">
        <SectionHeader
          eyebrow="GRATIS AI STYLE REPORT"
          title="Ontdek wat jouw stijl over je zegt"
          subtitle="Wij combineren smaak, context en pasvorm tot outfits die je elke dag met vertrouwen draagt."
          align="left"
          as="h1"
        />

        {/* Bestaande hero/sections blijven ongewijzigd */}
        {/* Hero */}
        <Hero />

        {/* Hero content (bestaande layout en classes ongewijzigd) */}
        <section className="hero-gradient py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-6xl font-bold font-montserrat text-[var(--color-text)] mb-6">
                  Ontdek jouw perfecte stijl — snel, slim en persoonlijk
                </h1>
                <p className="text-lg md:text-xl text-[var(--color-text)]/80 mb-8">
                  Onze AI-stylist leert jouw smaak kennen en stelt outfits samen die écht werken voor jouw leven.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/results" onClick={handleStartQuiz} className="ff-cta px-6 py-3 rounded-2xl text-center">
                    Start gratis
                  </Link>
                  <Link
                    to="/hoe-het-werkt"
                    className="px-6 py-3 rounded-2xl border text-[var(--color-text)] border-[var(--color-border)] text-center"
                  >
                    Hoe het werkt
                  </Link>
                </div>
              </div>

              <div>
                <SmartImage
                  src="/images/hero/ai-stylist.jpg"
                  alt="AI-stylist die outfits samenstelt"
                  className="rounded-2xl shadow-xl w-full h-auto"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-[var(--color-surface)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-[var(--color-text)] mb-4">
                Waarom FitFi?
              </h2>
              <p className="text-lg text-[var(--color-text)]/80 max-w-2xl mx-auto">
                Onze AI begrijpt jouw unieke stijl en helpt je outfits te vinden die perfect passen bij wie je bent.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center p-8">
                <div className="w-16 h-16 bg-[var(--ff-color-primary-100)] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-semibold font-montserrat text-[var(--color-text)] mb-4">
                  Persoonlijk
                </h3>
                <p className="text-[var(--color-text)]/80">
                  Onze AI leert jouw voorkeuren, lichaamsbouw en lifestyle kennen voor perfect passende aanbevelingen.
                </p>
              </Card>

              <Card className="text-center p-8">
                <div className="w-16 h-16 bg-[var(--ff-color-primary-100)] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-xl font-semibold font-montserrat text-[var(--color-text)] mb-4">
                  Snel & Slim
                </h3>
                <p className="text-[var(--color-text)]/80">
                  In enkele minuten krijg je een compleet stijlprofiel met concrete outfit-ideeën die je direct kunt dragen.
                </p>
              </Card>

              <Card className="text-center p-8">
                <div className="w-16 h-16 bg-[var(--ff-color-primary-100)] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">🛍️</span>
                </div>
                <h3 className="text-xl font-semibold font-montserrat text-[var(--color-text)] mb-4">
                  Praktisch
                </h3>
                <p className="text-[var(--color-text)]/80">
                  Alle aanbevelingen zijn direct te kopen bij Nederlandse webshops. Van budget tot premium merken.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold font-montserrat text-[var(--color-text)] mb-6">
              Klaar om jouw perfecte stijl te ontdekken?
            </h2>
            <p className="text-lg text-[var(--color-text)]/80 mb-8 max-w-2xl mx-auto">
              Start nu met onze gratis stijlquiz en ontvang binnen enkele minuten jouw persoonlijke AI Style Report.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/results" onClick={handleStartQuiz} className="ff-cta px-8 py-4 rounded-2xl text-center">
                Start gratis stijlquiz
              </Link>
              <Link
                to="/pricing"
                className="px-8 py-4 rounded-2xl border text-[var(--color-text)] border-[var(--color-border)] text-center"
              >
                Bekijk prijzen
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default HomePage;