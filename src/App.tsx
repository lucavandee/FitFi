import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from '@/context/UserContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { GamificationProvider } from '@/context/GamificationContext';
import { OnboardingProvider } from '@/context/OnboardingContext';
import { NavigationServiceInitializer } from '@/components/NavigationServiceInitializer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ScrollToTop } from '@/components/ScrollToTop';
import Navbar from '@/components/layout/Navbar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Lazy load components for better performance
const NovaBubble = lazy(() => import('@/components/ai/NovaBubble'));

// Lazy load all pages for optimal code-splitting
const HomePage = lazy(() => import('@/pages/HomePage'));
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(()  => import('@/pages/ResetPasswordPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const HowItWorksPage = lazy(() => import('@/pages/HowItWorksPage'));
const PricingPage = lazy(() => import('@/pages/PricingPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const FAQPage = lazy(() => import('@/pages/FAQPage'));
const LegalPage = lazy(() => import('@/pages/LegalPage'));
const SupportPage = lazy(() => import('@/pages/SupportPage'));
const TermsPage = lazy(() => import('@/pages/TermsPage'));
const GenderSelectPage = lazy(() => import('@/pages/GenderSelectPage'));
const ProductPage = lazy(() => import('@/pages/ProductPage'));
const PrivacyPolicyPage = lazy(() => import('@/pages/PrivacyPolicyPage'));
const ThankYouPage = lazy(() => import('@/pages/ThankYouPage'));
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage'));
const QuizPage = lazy(() => import('@/pages/QuizPage'));
const ResultsPage = lazy(() => import('@/pages/ResultsPage'));
const EnhancedResultsPage = lazy(() => import('@/pages/EnhancedResultsPage'));
const DynamicOnboardingPage = lazy(() => import('@/pages/DynamicOnboardingPage'));
const DynamicResultsPage = lazy(() => import('@/pages/DynamicResultsPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const BlogPage = lazy(() => import('@/pages/BlogPage'));
const BlogIndexPage = lazy(() => import('@/pages/BlogIndexPage'));
const BlogDetailPage = lazy(() => import('@/pages/BlogDetailPage'));
const TribesPage = lazy(() => import('@/pages/TribesPage'));
const TribeDetailPage = lazy(() => import('@/pages/TribeDetailPage'));
const HelpCenterPage = lazy(() => import('@/pages/HelpCenterPage'));
const FeedbackPage = lazy(() => import('@/pages/FeedbackPage'));
const SuccessStoriesPage = lazy(() => import('@/pages/SuccessStoriesPage'));
const OutfitsPage = lazy(() => import('@/pages/OutfitsPage'));
const GamificationPage = lazy(() => import('@/pages/GamificationPage'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));

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
                  <Suspense fallback={null}>
                    <NovaBubble />
                  </Suspense>
                  <Suspense fallback={<PageLoadingFall back />}>
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/home" element={<HomePage />} />
                      <Route path="/over-ons" element={<AboutPage />} />
                      <Route path="/hoe-het-werkt" element={<HowItWorksPage />} />
                      <Route path="/prijzen" element={<PricingPage />} />
                      <Route path="/blog" element={<BlogIndexPage />} />
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
                      <Route path="/bedankt" element={<Th ankYouPage />} />
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
                  </Suspense>
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