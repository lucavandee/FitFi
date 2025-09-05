import { Helmet } from "react-helmet-async";
import HomeHero from "@/components/landing/HomeHero";
import FeatureList from "@/components/landing/FeatureList";
import SocialProof from "@/components/landing/SocialProof";
import Logos from "@/components/landing/Logos";
import CTASection from "@/components/landing/CTASection";

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>FitFi — AI-styling die bij je past</title>
        <meta name="description" content="Krijg outfits die kloppen met AI-styling. Persoonlijk, snel en met uitleg bij elke look." />
      </Helmet>
      <div className="grid gap-8">
        <HomeHero />
        <FeatureList />
        <SocialProof />
        <Logos />
        <CTASection />
      </div>
    </>
  );
}