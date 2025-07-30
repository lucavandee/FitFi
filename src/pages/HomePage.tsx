import React, { useState, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Play, CheckCircle, Star, Users, Zap, Shield } from 'lucide-react';
import Button from '../components/ui/Button';
import { ErrorBoundary } from '../components/ErrorBoundary';
import LoadingFallback from '../components/ui/LoadingFallback';
import { HOME_SECTIONS, MOBILE_FLAGS } from '../constants/homeFlags';

// Import new components directly (not lazy loaded for better LCP)
import Hero from '../components/home/Hero';
import KPIBadges from '../components/home/KPIBadges';
import HorizontalFlow from '../components/home/HorizontalFlow';
import ScrollIndicator from '../components/home/ScrollIndicator';
import BackToTopFAB from '../components/home/BackToTopFAB';
import Features from '../components/home/Features';
import Footer from '../components/layout/Footer';

// Lazy load components for better performance
const Testimonials = React.lazy(() => import('../components/home/Testimonials'));
const StyleArchetypeSlider = React.lazy(() => import('../components/home/StyleArchetypeSlider'));
const PreviewCarousel = React.lazy(() => import('../components/home/PreviewCarousel'));

const FoundersBlockTeaser = React.lazy(() => 
  import('../components/founders/FoundersBlockTeaser').catch(err => {
    console.error('Failed to load FoundersBlockTeaser:', err);
    return { default: () => <div>Founders Club niet beschikbaar</div> };
  })
);

const UGCGallery = React.lazy(() => 
  import('../components/landing/UGCGallery').catch(err => {
    console.error('Failed to load UGCGallery:', err);
    return { default: () => <div>Gebruikersverhalen niet beschikbaar</div> };
  })
);

const ClosingCTA = React.lazy(() => 
  import('../components/home/ClosingCTA').catch(err => {
    console.error('Failed to load ClosingCTA:', err);
    return { default: () => <div>CTA niet beschikbaar</div> };
  })
);

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Track form submission
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'lead_capture', {
        event_category: 'engagement',
        event_label: 'homepage_form',
        name: formData.name,
        email: formData.email
      });
    }
    
    // Navigate to onboarding with pre-filled data
    window.location.href = `/onboarding?name=${encodeURIComponent(formData.name)}&email=${encodeURIComponent(formData.email)}`;
  };

  const handleCTAClick = () => {
    // Track conversion intent
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'begin_checkout', {
        event_category: 'conversion',
        event_label: 'ai_style_report_homepage',
        value: 1
      });
    }
    
    // Navigate to onboarding
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-white" data-page="homepage">
      <Helmet>
        <title>FitFi - Persoonlijke AI Stijladvies | Ontdek je perfecte look</title>
        <meta name="description" content="Ontdek je perfecte stijl met AI-powered aanbevelingen. Persoonlijke outfit suggesties gebaseerd op jouw voorkeuren en lichaamsbouw." />
        <meta property="og:title" content="FitFi - Persoonlijke AI Stijladvies" />
        <meta property="og:description" content="Ontdek je perfecte stijl met AI-powered aanbevelingen." />
        <link rel="canonical" href="https://fitfi.app/home" />
      </Helmet>

      {/* Hero Section - Critical above-the-fold content */}
      {HOME_SECTIONS.HERO && (
        <ErrorBoundary>
          <section data-section="hero">
            <Hero onCTAClick={handleCTAClick} />
            
            {/* KPI Badges - Mobile only, below hero CTA */}
            {MOBILE_FLAGS.SHOW_KPI_BADGES_IN_HERO && (
              <div className="md:hidden -mt-8 pb-8">
                <KPIBadges />
              </div>
            )}
          </section>
        </ErrorBoundary>
      )}

      {/* Scroll Indicator - Mobile only */}
      <div className="md:hidden">
        <ScrollIndicator />
      </div>

      {/* How It Works - Horizontal Flow on Mobile */}
      {HOME_SECTIONS.HOW_IT_WORKS && (
        <ErrorBoundary>
          <HorizontalFlow />
        </ErrorBoundary>
      )}

      {/* Social Proof - Lazy loaded */}
      {HOME_SECTIONS.SOCIAL_PROOF && (
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback message="Testimonials laden..." />}>
            <section data-section="testimonials">
              <Testimonials />
            </section>
          </Suspense>
        </ErrorBoundary>
      )}

      {/* Features - Product details */}
      {HOME_SECTIONS.FEATURES && (
        <ErrorBoundary>
          <section data-section="features">
            <Features />
          </section>
        </ErrorBoundary>
      )}

      {/* Preview Carousel - Lazy loaded for performance */}
      {HOME_SECTIONS.PREVIEW_CAROUSEL && (
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback message="Preview laden..." />}>
            <section data-section="preview">
              <PreviewCarousel />
            </section>
          </Suspense>
        </ErrorBoundary>
      )}

      {/* Style Archetypes - Keep existing component */}
      {HOME_SECTIONS.STYLE_ARCHETYPES && (
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback message="Stijlen laden..." />}>
            <section data-section="archetypes" className="hidden md:block">
              <StyleArchetypeSlider />
            </section>
          </Suspense>
        </ErrorBoundary>
      )}

      {/* Founders Club - Lazy loaded */}
      {HOME_SECTIONS.FOUNDERS_CLUB && (
        <ErrorBoundary>
          <Suspense fallback={null}>
            <section data-section="founders" className="hidden md:block">
              <FoundersBlockTeaser />
            </section>
          </Suspense>
        </ErrorBoundary>
      )}

      {/* UGC Gallery - Hidden on mobile */}
      {HOME_SECTIONS.UGC_GALLERY && (
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback message="Verhalen laden..." />}>
            <section data-section="ugc" className="hidden md:block">
              <UGCGallery />
            </section>
          </Suspense>
        </ErrorBoundary>
      )}

      {/* Closing CTA - Lazy loaded */}
      {HOME_SECTIONS.CLOSING_CTA && (
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback message="Laatste sectie laden..." />}>
            <section data-section="closingCta">
              <ClosingCTA onCTAClick={handleCTAClick} />
            </section>
          </Suspense>
        </ErrorBoundary>
      )}

      {/* Back to Top FAB */}
      {MOBILE_FLAGS.SHOW_BACK_TO_TOP_FAB && <BackToTopFAB />}

      {/* Footer */}
      <ErrorBoundary>
        <section data-section="footer">
          <Footer />
        </section>
      </ErrorBoundary>
    </div>
  );
};

export default HomePage;