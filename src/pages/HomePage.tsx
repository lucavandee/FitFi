import React from 'react';
import { Helmet } from 'react-helmet-async';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import HowItWorks from '../components/landing/HowItWorks';
import SocialProof from '../components/landing/SocialProof';
import TrustBelt from '../components/landing/TrustBelt';
import ClosingCTA from '../components/landing/ClosingCTA';

const HomePage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>FitFi - Ontdek jouw perfecte stijl met AI</title>
        <meta 
          name="description" 
          content="Krijg binnen 2 minuten een persoonlijk stijlrapport met uitleg, kleuren en 6-12 outfits. Direct toepasbaar in je garderobe." 
        />
        <meta name="keywords" content="stijladvies, AI styling, persoonlijke stijl, outfit aanbevelingen, kleuradvies" />
        <meta property="og:title" content="FitFi - Ontdek jouw perfecte stijl met AI" />
        <meta property="og:description" content="Krijg binnen 2 minuten een persoonlijk stijlrapport met uitleg, kleuren en 6-12 outfits." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://fitfi.ai" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="FitFi - Ontdek jouw perfecte stijl met AI" />
        <meta name="twitter:description" content="Krijg binnen 2 minuten een persoonlijk stijlrapport met uitleg, kleuren en 6-12 outfits." />
        <link rel="canonical" href="https://fitfi.ai" />
      </Helmet>
      
      <main className="min-h-screen">
        <Hero />
        <Features />
        <HowItWorks />
        <SocialProof />
        <TrustBelt />
        <ClosingCTA />
      </main>
    </>
  );
};

export default HomePage;