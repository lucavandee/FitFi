import { Routes, Route, Link } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import LandingPage from "@/pages/LandingPage";
import OnboardingPage from "@/pages/OnboardingPage";
import EnhancedResultsPage from "@/pages/EnhancedResultsPage";
import NovaPage from "@/pages/NovaPage";
import BlogPage from "@/pages/BlogPage";
import TribesPage from "@/pages/TribesPage";
import TribeDetailPage from "@/pages/TribeDetailPage";
import PricingPage from "@/pages/PricingPage";
import PrivacyPage from "@/pages/PrivacyPage";
import TermsPage from "@/pages/TermsPage";
import CookiesPage from "@/pages/CookiesPage";
import HealthPage from "@/pages/HealthPage";
import DashboardPage from "@/pages/DashboardPage";
import FeedPage from "@/pages/FeedPage";
import NotFoundPage from "@/pages/NotFoundPage";

export default function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[color:var(--ff-surface)]">
        <header className="border-b bg-white">
          <nav className="ff-container py-4 flex items-center justify-between">
            <Link to="/" className="font-heading font-extrabold text-[color:var(--ff-midnight)]">FitFi</Link>
            <div className="flex items-center gap-4 text-sm">
              <Link to="/onboarding" className="hover:underline">Onboarding</Link>
              <Link to="/results" className="hover:underline">Resultaten</Link>
              <Link to="/nova" className="hover:underline">Nova</Link>
              <Link to="/tribes" className="hover:underline">Tribes</Link>
              <Link to="/pricing" className="hover:underline">Pricing</Link>
            </div>
          </nav>
        </header>
        <main className="ff-container py-8">
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
        </main>
        <footer className="ff-container py-8 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} FitFi — Alle rechten voorbehouden.
        </footer>
      </div>
    </ErrorBoundary>
  );
}