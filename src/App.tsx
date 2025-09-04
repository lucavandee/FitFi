import { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoadingFallback from "@/components/ui/LoadingFallback";
import Header from "@/components/layout/Header";
import PremiumFooter from "@/components/layout/PremiumFooter";
import AuthProvider from "@/context/AuthContext"; // ⬅️ BELANGRIJK
import { GamificationProvider } from "@/context/GamificationContext";

// Pages (lazy)
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const HomePage = lazy(() => import("@/pages/HomePage"));
const OnboardingPage = lazy(() => import("@/pages/OnboardingPage"));
const DynamicOnboardingPage = lazy(() => import("@/pages/DynamicOnboardingPage"));
const ResultsPage = lazy(() => import("@/pages/ResultsPage"));
const EnhancedResultsPage = lazy(() => import("@/pages/EnhancedResultsPage"));
const BlogIndexPage = lazy(() => import("@/pages/BlogIndexPage"));
const BlogDetailPage = lazy(() => import("@/pages/BlogDetailPage"));
const PricingPage = lazy(() => import("@/pages/PricingPage"));
const FAQPage = lazy(() => import("@/pages/FAQPage"));
const FeedPage = lazy(() => import("@/pages/FeedPage"));
const FeedbackPage = lazy(() => import("@/pages/FeedbackPage"));
const AnalyticsPage = lazy(() => import("@/pages/AnalyticsPage"));
const TribesPage = lazy(() => import("@/pages/TribesPage"));
const TribeDetailPage = lazy(() => import("@/pages/TribeDetailPage"));
const SavedOutfitsPage = lazy(() => import("@/pages/SavedOutfitsPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const HelpCenterPage = lazy(() => import("@/pages/HelpCenterPage"));
const SuccessStoriesPage = lazy(() => import("@/pages/SuccessStoriesPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));
const HowItWorksPage = lazy(() => import("@/pages/HowItWorksPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
const HealthPage = lazy(() => import("@/pages/HealthPage"));

export default function App() {
  return (
    // ⬇️ Wrap de héle shell met AuthProvider
    <AuthProvider>
      <GamificationProvider>
        <Router>
          {/* Je oude shell: Header → Routes → Footer */}
          <Header />

          <main role="main" className="min-h-[60vh]">
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/home" element={<HomePage />} />

                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="/onboarding/dynamic" element={<DynamicOnboardingPage />} />

                <Route path="/results" element={<ResultsPage />} />
                <Route path="/results/enhanced" element={<EnhancedResultsPage />} />

                <Route path="/blog" element={<BlogIndexPage />} />
                <Route path="/blog/:slug" element={<BlogDetailPage />} />

                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/feed" element={<FeedPage />} />
                <Route path="/feedback" element={<FeedbackPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />

                <Route path="/tribes" element={<TribesPage />} />
                <Route path="/tribes/:id" element={<TribeDetailPage />} />

                <Route path="/saved" element={<SavedOutfitsPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/help" element={<HelpCenterPage />} />
                <Route path="/success-stories" element={<SuccessStoriesPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />

                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                <Route path="/__health" element={<HealthPage />} />
                <Route path="/index.html" element={<Navigate to="/" replace />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </main>

          <PremiumFooter />
        </Router>
      </GamificationProvider>
    </AuthProvider>
  );
}