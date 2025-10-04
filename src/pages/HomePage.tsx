import { Suspense, lazy } from 'react';
import { Helmet } from 'react-helmet-async';
import Container from '@/components/layout/Container';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import SocialProof from '@/components/landing/SocialProof';
import ClosingCTA from '@/components/landing/ClosingCTA';
import LoadingFallback from '@/components/ui/LoadingFallback';

const UGCGallery = lazy(() => import('@/components/landing/UGCGallery'));

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>FitFi - AI Styling voor Iedereen</title>
        <meta name="description" content="Ontdek je perfecte stijl met AI. Persoonlijke styling-adviezen op basis van je voorkeuren, lichaamsbouw en lifestyle." />
        <meta property="og:title" content="FitFi - AI Styling voor Iedereen" />
        <meta property="og:description" content="Ontdek je perfecte stijl met AI. Persoonlijke styling-adviezen op basis van je voorkeuren, lichaamsbouw en lifestyle." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://fitfi.nl" />
        <link rel="canonical" href="https://fitfi.nl" />
      </Helmet>

      <div className="min-h-screen">
        <Hero />
        
        <Container>
          <Features />
          <HowItWorks />
          
          <Suspense fallback={<LoadingFallback />}>
            <UGCGallery />
          </Suspense>
          
          <SocialProof />
        </Container>
        
        <ClosingCTA />
      </div>
    </>
  );
}