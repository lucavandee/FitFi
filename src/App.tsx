import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from '@/context/UserContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { GamificationProvider } from '@/context/GamificationContext';
import { OnboardingProvider } from '@/context/OnboardingContext';
import { NavigationServiceInitializer } from '@/components/NavigationServiceInitializer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ScrollToTop } from '@/components/ScrollToTop';
import Navbar from '@/components/layout/Navbar';
const ThankYouPage = React.lazy(() => import('@/pages/ThankYouPage'));
// Lazy load components for better performance
const NovaBubble = React.lazy(() => import('@/components/ai/NovaBubble'));

// Lazy load all pages for optimal code-splitting
const HomePage = React.lazy(() => import('@/pages/HomePage'));
const LandingPage = React.lazy(() => import('@/pages/LandingPage'));
const LoginPage = React.lazy(() => import('@/pages/LoginPage'));
const RegisterPage = React.lazy(() => import('@/pages/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('@/pages/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('@/pages/ResetPasswordPage'));
const ProfilePage = React.lazy(() => import('@/pages/ProfilePage'));
const AboutPage = React.lazy(() => import('@/pages/AboutPage'));
const HowItWorksPage = React.lazy(() => import('@/pages/HowItWorksPage'));
const PricingPage = React.lazy(() => import('@/pages/PricingPage'));
const ContactPage = React.lazy(() => import('@/pages/ContactPage'));
const FAQPage = React.lazy(() => import('@/pages/FAQPage'));
const LegalPage = React.lazy(() => import('@/pages/Legal Page'));
const SupportPage = React.lazy(() => import('@/pages/SupportPage'));
const TermsPage = React.lazy(() => import('@/pages/TermsPage'));
const GenderSelectPage = React.lazy(() => import('@/pages/GenderSelectPage'));
const ProductPage = React.lazy(() => import('@/pages/ProductPage'));
const PrivacyPolicyPage = React.lazy(() => import('@/pages/PrivacyPolicyPage'));
const ThankYouPage = React.lazy(() => import('@/pages/ThankYouPage'));

// Heavy pages already lazy loaded
// Heavy pages already lazy loaded
// Heavy pages already lazy loaded
// Heavy pages already lazy loaded
// Heavy pages already lazy loaded
// Heavy pages already lazy loaded
// Heavy pages already lazy loaded
// Heavy pages already lazy loaded
const OnboardingPage = React.lazy(() => import('@/pages/OnboardingPage'));
const QuizPage = React.lazy(() => import('@/pages/QuizPage'));
const ResultsPage = React.lazy(() => import('@/pages/ResultsPage'));
const EnhancedResultsPage = React.lazy(() => import('@/pages/EnhancedResultsPage'));
const DynamicOnboardingPage = React.lazy(() => import('@/pages/DynamicOnboardingPage'));
const DynamicResultsPage = React.lazy(() => import('@/pages/DynamicResultsPage'));
const DashboardPage = React.lazy(() => import('@/pages/DashboardPage'));
const BlogPage = React.lazy(() => import('@/pages/BlogPage'));
const BlogPage = React.lazy(() => import('@/pages/BlogPage'));
const BlogPage = React.lazy(() => import('@/pages/BlogPage'));
const BlogPage = React.lazy(() => import('@/pages/BlogPage'));
const BlogPage = React.lazy(() => import('@/pages/BlogPage'));
const BlogPage = React.lazy(() => import('@/pages/BlogPage'));
const BlogPage = React.lazy(() => import('@/pages/BlogPage'));
const BlogPage = React.lazy(() => import('@/pages/BlogPage'));
const BlogIndexPage = React.lazy(() => import('@/pages/BlogIndexPage'));
const BlogDetailPage = React.lazy(() => import('@/pages/BlogDetailPage'));
const BlogDetailPage = React.lazy(() => import('@/pages/BlogDetailPage'));
const BlogDetailPage = React.lazy(() => import('@/pages/BlogDetailPage'));
const BlogDetailPage = React.lazy(() => import('@/pages/BlogDetailPage'));
const BlogDetailPage = React.lazy(() => import('@/pages/BlogDetailPage'));
const BlogDetailPage = React.lazy(() => import('@/pages/BlogDetailPage'));
const BlogDetailPage = React.lazy(() => import('@/pages/BlogDetailPage'));
const BlogDetailPage = React.lazy(() => import('@/pages/BlogDetailPage'));
const TribesPage = React.lazy(() => import('@/pages/TribesPage'));
const TribeDetailPage = React.lazy(() => import('@/pages/TribeDetailPage'));
const HelpCenterPage = React.lazy(() => import('@/pages/HelpCenterPage'));
const FeedbackPage = React.lazy(() => import('@/pages/FeedbackPage'));
const SuccessStoriesPage = React.lazy(() => import('@/pages/SuccessStoriesPage'));
const OutfitsPage = React.lazy(() => import('@/pages/OutfitsPage'));
const GamificationPage = React.lazy(() => import('@/pages/GamificationPage'));
const AnalyticsPage = React.lazy(() => import('@/pages/AnalyticsPage'));

// Auth
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Loading fallback component
const PageLoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-[#89CFF0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Pagina laden...</p>
    </div>
  </div>
);

// NotFound component
const NotFound: React.FC = () => (
  <div className="min-h-screen bg-[#FAF8F6] flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-gray-600 mb-6">Pagina niet gevonden</p>
      <a href="/" className="text-[#bfae9f] hover:text-[#a89a8c] font-medium">
        Terug naar home
      </a>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <UserProvider>
          <GamificationProvider>
            <OnboardingProvider>
              <Router>
                <NavigationServiceInitializer />
                <ScrollToTop />
                <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50">
                  <Navbar />
                  <React.Suspense fallback={null}>
                  <React.Suspense fallback={null}>
                    <NovaBubble />
                  </React.Suspense>
                    <NovaBubble />
                  </React.Suspense>
                    <NovaBubble />
                  </React.Suspense>
                    <NovaBubble />
                  </React.Suspense>
                    <NovaBubble />
                  </React.Suspense>
                    <NovaBubble />
                  </React.Suspense>
                    <NovaBubble />
                  </React.Suspense>
                  </React.Suspense>
                  <React.Suspense fallback={<PageLoadingFallback />}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/over-ons" element={<AboutPage />} />
                    <Route path="/hoe-het-werkt" element={<HowItWorksPage />} />
                    <Route path="/prijzen" element={<PricingPage />} />
                    <Route path="/blog" element={<BlogIndexPage />} />
                    <Route path="/blog/:slug" element={<BlogDetailPage />} />
                    <Route path="/blog/:slug" element={<BlogDetailPage />} />
                    <Route path="/blog/:slug" element={<BlogDetailPage />} />
                    <Route path="/blog/:slug" element={<BlogDetailPage />} />
                    <Route path="/blog/:slug" element={<BlogDetailPage />} />
                    <Route path="/blog/:slug" element={<BlogDetailPage />} />
                    <Route path="/blog/:slug" element={<BlogDetailPage />} />
                    <Route path="/blog/:slug" element={<BlogDetailPage />} />
                    <Route path="/inloggen" element={<LoginPage />} />
                    <Route path="/registreren" element={<RegisterPage />} />
                    <Route path="/wachtwoord-vergeten" element={<ForgotPasswordPage />} />
                    <Route path="/wachtwoord-reset" element={<ResetPasswordPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/veelgestelde-vragen" element={<FAQPage />} />
                    <Route path="/juridisch" element={<LegalPage />} />
                    <Route path="/ondersteuning" element={<SupportPage />} />
                    <Route path="/help" element={<HelpCenterPage />} />
                    <Route path="/feedback" element={<FeedbackPage />} />
                    <Route path="/succesverhalen" element={<SuccessStoriesPage />} />
                    <Route path="/geslacht-selecteren" element={<GenderSelectPage />} />
                    <Route path="/product/:id" element={<ProductPage />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                    <Route path="/algemene-voorwaarden" element={<TermsPage />} />
                    <Route path="/bedankt" element={<ThankYouPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    
                    {/* Protected Routes */}
                    <Route path="/onboarding" element={
                      <ProtectedRoute>
                        <OnboardingPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/quiz" element={
                      <ProtectedRoute>
                        <QuizPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/dynamic-onboarding" element={
                      <ProtectedRoute>
                        <DynamicOnboardingPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/results" element={
                      <ProtectedRoute>
                        <ResultsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/resultaten" element={<Navigate to="/results" replace />} />
                    <Route path="/dynamic-results" element={
                      <ProtectedRoute>
                        <DynamicResultsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/enhanced-resultaten" element={
                      <ProtectedRoute>
                        <EnhancedResultsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/outfits" element={
                      <ProtectedRoute>
                        <OutfitsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/gamification" element={
                      <ProtectedRoute>
                        <GamificationPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/analytics" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AnalyticsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/tribes" element={
                      <ProtectedRoute>
                        <TribesPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/tribes/:slug" element={
                      <ProtectedRoute>
                        <TribeDetailPage />
                      </ProtectedRoute>
                    } />
                    
                    {/* Fallback */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  </React.Suspense>
                </div>
              </Router>
            </OnboardingProvider>
          </GamificationProvider>
        </UserProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;