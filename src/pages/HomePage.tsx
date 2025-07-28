import React, { useState, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Play, CheckCircle, Star, Users, Zap, Shield } from 'lucide-react';
import Button from '../components/ui/Button';
import Walkthrough from '../components/walkthrough/Walkthrough';
import StyleArchetypeSlider from '../components/home/StyleArchetypeSlider';
import { ErrorBoundary } from '../components/ErrorBoundary';
import LoadingFallback from '../components/ui/LoadingFallback';

// Import new components directly (not lazy loaded for better LCP)
import Hero from '../components/home/Hero';
import Testimonials from '../components/home/Testimonials';
import HowItWorks from '../components/home/HowItWorks';
import Features from '../components/home/Features';
import HomeFooter from '../components/home/HomeFooter';

// Lazy load heavy components for better performance
const PreviewCarousel = React.lazy(() => 
  import('../components/home/PreviewCarousel').catch(err => {
    console.error('Failed to load PreviewCarousel:', err);
    return { default: () => <div>Preview niet beschikbaar</div> };
  })
);

const CommunityUGC = React.lazy(() => 
  import('../components/home/CommunityUGC').catch(err => {
    console.error('Failed to load CommunityUGC:', err);
    return { default: () => <div>Community sectie niet beschikbaar</div> };
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
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>FitFi - Persoonlijke AI Stijladvies | Ontdek je perfecte look</title>
        <meta name="description" content="Ontdek je perfecte stijl met AI-powered aanbevelingen. Persoonlijke outfit suggesties gebaseerd op jouw voorkeuren en lichaamsbouw." />
        <meta property="og:title" content="FitFi - Persoonlijke AI Stijladvies" />
        <meta property="og:description" content="Ontdek je perfecte stijl met AI-powered aanbevelingen." />
        <link rel="canonical" href="https://fitfi.app/home" />
      </Helmet>

      {/* Hero Section - Critical above-the-fold content */}
      <ErrorBoundary>
        <Hero onCTAClick={handleCTAClick} />
      </ErrorBoundary>

      {/* Social Proof - Important for conversion */}
      <ErrorBoundary>
        <Testimonials />
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

      {/* Style Archetypes - Keep existing component */}
      <ErrorBoundary>
        <StyleArchetypeSlider />
      </ErrorBoundary>

      {/* Community UGC - Lazy loaded */}
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback message="Community sectie laden..." />}>
          <CommunityUGC />
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
        <HomeFooter />
      </ErrorBoundary>
    </div>
  );
};

export default HomePage;