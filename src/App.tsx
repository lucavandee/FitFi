import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import RouteChangeTracker from "@/components/system/RouteChangeTracker";
import { lazyPage } from "@/utils/lazyPage";

// Lazy load pages
const HomePage = lazyPage(() => import("@/pages/HomePage"));
const QuizPage = lazyPage(() => import("@/pages/QuizPage"));
const ResultsPage = lazyPage(() => import("@/pages/ResultsPage"));
const AboutPage = lazyPage(() => import("@/pages/AboutPage"));
const PricingPage = lazyPage(() => import("@/pages/PricingPage"));
const ContactPage = lazyPage(() => import("@/pages/ContactPage"));
const PrivacyPage = lazyPage(() => import("@/pages/PrivacyPage"));
const TermsPage = lazyPage(() => import("@/pages/TermsPage"));
const NotFoundPage = lazyPage(() => import("@/pages/NotFoundPage"));

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <RouteChangeTracker />
        <div className="min-h-screen bg-white">
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/quiz" element={<QuizPage />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </ErrorBoundary>
  );
};

export default App;