import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingFallback from "@/components/ui/LoadingFallback";
import PremiumHeader from "@/components/layout/PremiumHeader";
import PremiumFooter from "@/components/layout/PremiumFooter";

const LandingPage = lazy(() => import("@/pages/LandingPage"));
const OnboardingPage = lazy(() => import("@/pages/OnboardingPage"));
const EnhancedResultsPage = lazy(() => import("@/pages/EnhancedResultsPage"));
const NovaPage = lazy(() => import("@/pages/NovaPage"));
const BlogPage = lazy(() => import("@/pages/BlogPage"));
const TribesPage = lazy(() => import("@/pages/TribesPage"));
const TribeDetailPage = lazy(() => import("@/pages/TribeDetailPage"));
const PricingPage = lazy(() => import("@/pages/PricingPage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const CookiesPage = lazy(() => import("@/pages/CookiesPage"));
const HealthPage = lazy(() => import("@/pages/HealthPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const FeedPage = lazy(() => import("@/pages/FeedPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

export default function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[color:var(--ff-surface)]">
        <PremiumHeader />
        <main className="ff-container py-10">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/results" element={<EnhancedResultsPage />} />
              <Route path="/nova" element={<NovaPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/tribes" element={<TribesPage />} />
              <Route path="/tribes/:tribeId" element={<TribeDetailPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/cookies" element={<CookiesPage />} />
              <Route path="/__health" element={<HealthPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/feed" element={<FeedPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>
        <PremiumFooter />
      </div>
    </ErrorBoundary>
  );
}