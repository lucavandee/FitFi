import React, { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { track } from '@/utils/analytics';
import Seo from '@/components/Seo';
import { ErrorBoundary } from '../components/ErrorBoundary';
import LoadingFallback from '../components/ui/LoadingFallback';

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

      {/* Founders Club - Lazy loaded */}
      <ErrorBoundary>
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6">
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