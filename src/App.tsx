import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import SEO from '@/components/system/SEO';

// Lazy loading voor alle pagina's
const HomePage = React.lazy(() => import('@/pages/HomePage'));
const HowItWorksPage = React.lazy(() => import('@/pages/HowItWorksPage'));
const PricingPage = React.lazy(() => import('@/pages/PricingPage'));
const OverOnsPage = React.lazy(() => import('@/pages/OverOnsPage'));
const FAQPage = React.lazy(() => import('@/pages/FAQPage'));
const BlogPage = React.lazy(() => import('@/pages/BlogPage'));
const EnhancedResultsPage = React.lazy(() => import('@/pages/EnhancedResultsPage'));
const OnboardingPage = React.lazy(() => import('@/pages/OnboardingPage'));
const NotFoundPage = React.lazy(() => import('@/pages/NotFoundPage'));

export default function App() {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:block focus:p-2 focus:outline-none focus-visible:ring-2">
        Naar hoofdinhoud
      </a>

      {/* Globale SEO baseline */}
      <SEO />

      {/* Exact één Navbar, sticky en glas/blur via polish.css */}
      <Navbar />

      <main id="main" className="min-h-screen bg-[var(--ff-color-bg)] text-[var(--ff-color-text)]">
        <React.Suspense fallback={<div className="ff-skeleton h-64 mx-auto my-16 max-w-3xl" aria-busy="true" />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/hoe-het-werkt" element={<HowItWorksPage />} />
            <Route path="/prijzen" element={<PricingPage />} />
            <Route path="/over-ons" element={<OverOnsPage />} />
            <Route path="/veelgestelde-vragen" element={<FAQPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/results" element={<EnhancedResultsPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </React.Suspense>
      </main>
    </>
  );
}