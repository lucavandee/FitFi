import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import ErrorBoundary from '@/components/ErrorBoundary'
import LoadingFallback from '@/components/ui/LoadingFallback'

// Lazy load pages
const HomePage = lazy(() => import('@/pages/HomePage'))
const LandingPage = lazy(() => import('@/pages/LandingPage'))
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage'))
const EnhancedResultsPage = lazy(() => import('@/pages/EnhancedResultsPage'))
const NovaPage = lazy(() => import('@/pages/NovaPage'))
const BlogIndexPage = lazy(() => import('@/pages/BlogIndexPage'))
const BlogDetailPage = lazy(() => import('@/pages/BlogDetailPage'))
const TribesPage = lazy(() => import('@/pages/TribesPage'))
const TribeDetailPage = lazy(() => import('@/pages/TribeDetailPage'))
const PricingPage = lazy(() => import('@/pages/PricingPage'))
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'))
const TermsPage = lazy(() => import('@/pages/TermsPage'))
const CookiesPage = lazy(() => import('@/pages/CookiesPage'))
const HealthPage = lazy(() => import('@/pages/HealthPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const FeedPage = lazy(() => import('@/pages/FeedPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/results" element={<EnhancedResultsPage />} />
            <Route path="/nova" element={<NovaPage />} />
            <Route path="/blog" element={<BlogIndexPage />} />
            <Route path="/blog/:slug" element={<BlogDetailPage />} />
            <Route path="/tribes" element={<TribesPage />} />
            <Route path="/tribes/:slug" element={<TribeDetailPage />} />
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
      </Router>
    </ErrorBoundary>
  )
}

export default App