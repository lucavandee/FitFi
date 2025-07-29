import React, { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ErrorBoundary } from '../components/ErrorBoundary';
import LoadingFallback from '../components/ui/LoadingFallback';

// Import components directly (not lazy loaded for better LCP)
import Hero from '../components/landing/Hero';
import SocialProof from '../components/landing/SocialProof';
import HowItWorks from '../components/landing/HowItWorks';
import Features from '../components/landing/Features';
import Footer from '../components/layout/Footer';

// Lazy load heavy components for better performance
const PreviewCarousel = React.lazy(() => 
  import('../components/landing/PreviewCarousel').catch(err => {
    console.error('Failed to load PreviewCarousel:', err);
    return { default: () => <div>Preview niet beschikbaar</div> };
  })
);

const CommunityChallenge = React.lazy(() => 
  import('../components/landing/CommunityChallenge').catch(err => {
    console.error('Failed to load CommunityChallenge:', err);
    return { default: () => <div>Community challenge niet beschikbaar</div> };
  })
);

const UGCGallery = React.lazy(() => 
  import('../components/landing/UGCGallery').catch(err => {
    console.error('Failed to load UGCGallery:', err);
    return { default: () => <div>Gebruikersverhalen niet beschikbaar</div> };
  })
);

const ClosingCTA = React.lazy(() => 
  import('../components/landing/ClosingCTA').catch(err => {
    console.error('Failed to load ClosingCTA:', err);
    return { default: () => <div>CTA niet beschikbaar</div> };
  })
);

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCTAClick = () => {
    // Track conversion intent
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'begin_checkout', {
        event_category: 'conversion',
        event_label: 'ai_style_report_landing',
        value: 1
      });
    }
    
    // Navigate to onboarding
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>FitFi - AI Style Report | Ontdek wat jouw stijl over je zegt</title>
        <meta name="description" content="Krijg je gratis AI Style Report en ontdek wat jouw kledingkeuzes vertellen over jouw persoonlijkheid. 2 minuten quiz, direct resultaat." />
        <meta property="og:title" content="FitFi - AI Style Report | Ontdek wat jouw stijl over je zegt" />
        <meta property="og:description" content="Krijg je gratis AI Style Report en ontdek wat jouw kledingkeuzes vertellen over jouw persoonlijkheid." />
        <link rel="canonical" href="https://fitfi.app/" />
      </Helmet>

      {/* Hero Section - Critical above-the-fold content */}
      <ErrorBoundary>
        <Hero onCTAClick={handleCTAClick} />
      </ErrorBoundary>

      {/* Social Proof - Important for conversion */}
      <ErrorBoundary>
        <SocialProof />
      </ErrorBoundary>

      {/* How It Works - Core value proposition */}
      <ErrorBoundary>
        <HowItWorks />
      </ErrorBoundary>

      {/* Features - Product details */}
      <ErrorBoundary>
        <Features />
      </ErrorBoundary>

      {/* Preview Carousel - Lazy loaded for performance */}
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback message="Preview laden..." />}>
          <PreviewCarousel />
        </Suspense>
      </ErrorBoundary>

      {/* Community Challenge - Lazy loaded */}
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback message="Community challenge laden..." />}>
          <CommunityChallenge />
        </Suspense>
      </ErrorBoundary>

      {/* UGC Gallery - Lazy loaded */}
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback message="Gebruikersverhalen laden..." />}>
          <UGCGallery />
        </Suspense>
      </ErrorBoundary>

      {/* Closing CTA - Lazy loaded */}
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback message="Laatste sectie laden..." />}>
          <ClosingCTA onCTAClick={handleCTAClick} />
        </Suspense>
      </ErrorBoundary>

      {/* Footer */}
      <ErrorBoundary>
        <Footer />
      </ErrorBoundary>
    </div>
  );
};

export default LandingPage;