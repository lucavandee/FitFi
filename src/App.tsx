import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

import NavigationServiceInitializer from '@/components/NavigationServiceInitializer';
import ScrollToTop from '@/components/ScrollToTop';
import ErrorBoundary from '@/components/ErrorBoundary';
import Footer from '@/components/layout/Footer';
import CookieBanner from '@/components/legal/CookieBanner';

// Lazy pages (adjust paths to your project as needed)
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const HomePage = lazy(() => import('@/pages/HomePage'));
const EnhancedResultsPage = lazy(() => import('@/pages/EnhancedResultsPage'));
const HowItWorksPage = lazy(() => import('@/pages/HowItWorksPage'));
const PricingPage = lazy(() => import('@/pages/PricingPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const BlogPage = lazy(() => import('@/pages/BlogPage'));
const FAQPage = lazy(() => import('@/pages/FAQPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function App() {
  return (
    <ErrorBoundary>
      {/* Must be inside Router context (provided in main.tsx) */}
      <NavigationServiceInitializer />
      <ScrollToTop />

      <Suspense fallback={<div />}>
        <Routes>
          {/* Keep only ONE <Route> per path — edit to match your app */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/results" element={<EnhancedResultsPage />} />
          <Route path="/hoe-het-werkt" element={<HowItWorksPage />} />
          <Route path="/prijzen" element={<PricingPage />} />
          <Route path="/over-ons" element={<AboutPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      <Footer />
      <CookieBanner />
    </ErrorBoundary>
  );
}

export default App;