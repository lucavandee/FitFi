import { lazy } from 'react';
import { Helmet } from 'react-helmet-async';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import SocialProof from '@/components/landing/SocialProof';
import ClosingCTA from '@/components/landing/ClosingCTA';

const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>FitFi - AI Styling voor Jouw Perfecte Look</title>
        <meta name="description" content="Ontdek jouw perfecte stijl met AI-powered styling advies. Persoonlijke outfit aanbevelingen die bij jou passen." />
      </Helmet>
      
      <div className="min-h-screen">
        <Hero />
        <Features />
        <HowItWorks />
        <SocialProof />
        <ClosingCTA />
      </div>
    </>
  );
};

export default HomePage;