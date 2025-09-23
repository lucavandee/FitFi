import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// Components
import Navbar from '@/components/layout/Navbar';
import ErrorBoundary from '@/components/ErrorBoundary';

// Pages - lazy loaded
import HomePage from '@/pages/HomePage';
import BlogPage from '@/pages/BlogPage';
import AboutPage from '@/pages/AboutPage';
import QuizPage from '@/pages/QuizPage';
import ResultsPage from '@/pages/ResultsPage';
import EnhancedResultsPage from '@/pages/EnhancedResultsPage';
import OnboardingPage from '@/pages/OnboardingPage';
import PricingPage from '@/pages/PricingPage';
import PrivacyPage from '@/pages/PrivacyPage';
import TermsPage from '@/pages/TermsPage';
import CookiesPage from '@/pages/CookiesPage';
import HealthPage from '@/pages/HealthPage';
import NotFoundPage from '@/pages/NotFoundPage';

function App() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Naar hoofdinhoud
      </a>
      <Helmet>
        <title>FitFi - AI Styling Platform</title>
        <meta name="description" content="Premium AI styling platform voor Nederland en EU" />
      </Helmet>
      <Navbar />
      <ErrorBoundary>
        <main id="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/over-ons" element={<AboutPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/enhanced-results" element={<EnhancedResultsPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/cookies" element={<CookiesPage />} />
            <Route path="/__health" element={<HealthPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </ErrorBoundary>
    </>
  );
}

export default App;