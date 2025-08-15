import React, { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { track } from '@/utils/analytics';
import Seo from '@/components/Seo';
import { ErrorBoundary } from '../components/ErrorBoundary';
import LoadingFallback from '../components/ui/LoadingFallback';
import AffiliateDisclosureNote from '@/components/legal/AffiliateDisclosureNote';

// Import components directly (not lazy loaded for better LCP)
import Hero from '../components/landing/Hero';
import SocialProof from '../components/landing/SocialProof';
import HowItWorks from '../components/landing/HowItWorks';
import Features from '../components/landing/Features';
import Footer from '../components/layout/Footer';

// Lazy load heavy components with better error handling
const PreviewCarousel = React.lazy(() => 
  import('../components/landing/PreviewCarousel').catch(err => {
    console.error('Failed to load PreviewCarousel:', err);
    return { default: () => <div className="py-8 text-center text-gray-500">Preview tijdelijk niet beschikbaar</div> };
  })
);

const FoundersBlock = React.lazy(() => 
  import('../components/founders/FoundersBlock').catch(err => {
    console.error('Failed to load FoundersBlock:', err);
    return { default: () => <div className="py-8 text-center text-gray-500">Founders Club tijdelijk niet beschikbaar</div> };
  })
);

const UGCGallery = React.lazy(() => 
  import('../components/landing/UGCGallery').catch(err => {
    console.error('Failed to load UGCGallery:', err);
    return { default: () => <div className="py-8 text-center text-gray-500">Gebruikersverhalen tijdelijk niet beschikbaar</div> };
  })
);

const ClosingCTA = React.lazy(() => 
  import('../components/landing/ClosingCTA').catch(err => {
    console.error('Failed to load ClosingCTA:', err);
    return { default: () => <div className="py-8 text-center text-gray-500">CTA tijdelijk niet beschikbaar</div> };
  })
);

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCTAClick = () => {
    track('quiz_start_intent', { loc: 'closing_cta' });
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'begin_checkout', { event_label: 'ai_style_report_landing', value: 1 });
    }
    
    // Track conversion intent
    // Navigate to onboarding
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title="AI Style Report — Ontdek wat jouw stijl over je zegt"
        description="Krijg je gratis AI Style Report in 2 minuten. Zie wat jouw kledingkeuzes over je zeggen en ontvang direct passende outfits."
        jsonLd={[
          {
            "@context":"https://schema.org",
            "@type":"Organization",
            "name":"FitFi",
            "url":"https://www.fitfi.ai",
            "logo":"https://www.fitfi.ai/logo.png"
          },
          {
            "@context":"https://schema.org",
            "@type":"WebSite",
            "name":"FitFi",
            "url":"https://www.fitfi.ai",
            "potentialAction": {
              "@type":"SearchAction",
              "target":"https://www.fitfi.ai/?q={search_term_string}",
              "query-input":"required name=search_term_string"
            }
          }
        ]}
      />

      {/* Hero Section - Critical above-the-fold content */}
      <section className="section bg-white">
        <div className="container">
          <ErrorBoundary>
            <Hero onCTAClick={handleCTAClick} />
          </ErrorBoundary>
          <AffiliateDisclosureNote />
        </div>
      </section>

      {/* Social Proof - Important for conversion */}
      <ErrorBoundary>
        <section className="section bg-white">
          <div className="container">
            <SocialProof />
          </div>
        </section>
      </ErrorBoundary>

      {/* How It Works - Core value proposition */}
      <ErrorBoundary>
        <section className="section bg-white">
          <div className="container">
            <HowItWorks />
          </div>
        </section>
      </ErrorBoundary>

      {/* Features - Product details */}
      <ErrorBoundary>
        <section className="section bg-white">
          <div className="container">
            <Features />
          </div>
        </section>
      </ErrorBoundary>

      {/* Preview Carousel - Lazy loaded for performance */}
      <ErrorBoundary>
        <section className="section bg-white">
          <div className="container">
            <Suspense fallback={<LoadingFallback message="Preview laden..." />}>
              <PreviewCarousel />
            </Suspense>
          </div>
        </section>
      </ErrorBoundary>

      {/* Founders Club - Lazy loaded */}
      <ErrorBoundary>
        <section className="section bg-white">
          <div className="container">
            <div className="max-w-md mx-auto">
              <Suspense fallback={<LoadingFallback message="Founders Club laden..." />}>
                <FoundersBlock />
              </Suspense>
            </div>
          </div>
        </section>
      </ErrorBoundary>

      {/* UGC Gallery - Lazy loaded */}
      <ErrorBoundary>
        <section className="section bg-white">
          <div className="container">
            <Suspense fallback={<LoadingFallback message="Gebruikersverhalen laden..." />}>
              <UGCGallery />
            </Suspense>
          </div>
        </section>
      </ErrorBoundary>

      {/* Closing CTA - Lazy loaded */}
      <ErrorBoundary>
        <section className="section bg-white">
          <div className="container">
            <Suspense fallback={<LoadingFallback message="Laatste sectie laden..." />}>
              <ClosingCTA onCTAClick={handleCTAClick} />
            </Suspense>
          </div>
        </section>
      </ErrorBoundary>

      {/* Footer */}
      <ErrorBoundary>
        <section className="section bg-white">
          <div className="container">
            <Footer />
          </div>
        </section>
      </ErrorBoundary>
    </div>
  );
};

export default LandingPage;