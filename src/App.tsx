import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CrashGate from '@/components/system/CrashGate';
import { lazyAny } from '@/utils/lazyPage';
import { UserProvider } from '@/context/UserContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { GamificationProvider } from '@/context/GamificationContext';
import { OnboardingProvider } from '@/context/OnboardingContext';
import { NavigationServiceInitializer } from '@/components/NavigationServiceInitializer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ScrollToTop } from '@/components/ScrollToTop';
import Navbar from '@/components/layout/Navbar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppPortal from '@/components/layout/AppPortal';

// Lazy load components with lazyAny for better error handling
const NovaBubble = lazyAny(() => import('@/components/ai/NovaBubble'));

// Lazy load all pages with lazyAny for optimal code-splitting
const HomePage = lazyAny(() => import('@/pages/HomePage'));
const LandingPage = lazyAny(() => import('@/pages/LandingPage'));
const LoginPage = lazyAny(() => import('@/pages/LoginPage'));
const RegisterPage = lazyAny(() => import('@/pages/RegisterPage'));
const ForgotPasswordPage = lazyAny(() => import('@/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazyAny(() => import('@/pages/ResetPasswordPage'));
const ProfilePage = lazyAny(() => import('@/pages/ProfilePage'));
const AboutPage = lazyAny(() => import('@/pages/AboutPage'));
const HowItWorksPage = lazyAny(() => import('@/pages/HowItWorksPage'));
const PricingPage = lazyAny(() => import('@/pages/PricingPage'));
const ContactPage = lazyAny(() => import('@/pages/ContactPage'));
const FAQPage = lazyAny(() => import('@/pages/FAQPage'));
const LegalPage = lazyAny(() => import('@/pages/LegalPage'));
const SupportPage = lazyAny(() => import('@/pages/SupportPage'));
const TermsPage = lazyAny(() => import('@/pages/TermsPage'));
const GenderSelectPage = lazyAny(() => import('@/pages/GenderSelectPage'));
const ProductPage = lazyAny(() => import('@/pages/ProductPage'));
const PrivacyPolicyPage = lazyAny(() => import('@/pages/PrivacyPolicyPage'));
const ThankYouPage = lazyAny(() => import('@/pages/ThankYouPage'));
const OnboardingPage = lazyAny(() => import('@/pages/OnboardingPage'));
const QuizPage = lazyAny(() => import('@/pages/QuizPage'));
const ResultsPage = lazyAny(() => import('@/pages/ResultsPage'));
const EnhancedResultsPage = lazyAny(() => import('@/pages/EnhancedResultsPage'));
const DynamicOnboardingPage = lazyAny(() => import('@/pages/DynamicOnboardingPage'));
const DynamicResultsPage = lazyAny(() => import('@/pages/DynamicResultsPage'));
const DashboardPage = lazyAny(() => import('@/pages/DashboardPage'));
const BlogIndexPage = lazyAny(() => import('@/pages/BlogIndexPage'));
const BlogDetailPage = lazyAny(() => import('@/pages/BlogDetailPage'));
const TribesPage = lazyAny(() => import('@/pages/TribesPage'));
const TribeDetailPage = lazyAny(() => import('@/pages/TribeDetailPage'));
const HelpCenterPage = lazyAny(() => import('@/pages/HelpCenterPage'));
const FeedbackPage = lazyAny(() => import('@/pages/FeedbackPage'));
const SuccessStoriesPage = lazyAny(() => import('@/pages/SuccessStoriesPage'));
const OutfitsPage = lazyAny(() => import('@/pages/OutfitsPage'));
const GamificationPage = lazyAny(() => import('@/pages/GamificationPage'));
const AnalyticsPage = lazyAny(() => import('@/pages/AnalyticsPage'));
const FeedPage = lazyAny(() => import('@/pages/FeedPage'));
const HealthCheckPage = lazyAny(() => import('@/pages/HealthCheckPage'));

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Nova feature flag
const NOVA_ENABLED = (import.meta.env.VITE_NOVA_ENABLED ?? 'true') !== 'false';
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
    <CrashGate>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <UserProvider>
            <GamificationProvider>
              <OnboardingProvider>
                <Router>
                  <NavigationServiceInitializer />
                  <ScrollToTop />
                  <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50">
                    <Navbar />
                    <Suspense fallback={<div className="p-8">Loading…</div>}>
                      <Routes>
                      
                        {/* Public Routes */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/home" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/inloggen" element={<LoginPage />} />
                        <Route path="/registreren" element={<RegisterPage />} />
                        <Route path="/wachtwoord-vergeten" element={<ForgotPasswordPage />} />
                        <Route path="/wachtwoord-reset" element={<ResetPasswordPage />} />
                        <Route path="/over-ons" element={<AboutPage />} />
                        <Route path="/hoe-het-werkt" element={<HowItWorksPage />} />
                        <Route path="/prijzen"  element={<PricingPage />} />
                        <Route path="/blog" element={<BlogIndexPage />} />
                        <Route path="/blog/:slug" element={<BlogDetailPage />} />
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
                      
                        {/* Public Routes */}
                        <Route path="/feed" element={<FeedPage />} />
                        
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
                          <ProtectedRoute allowedRoles={['admin']} redirectTo="/login">
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
                        <Route path="/tribes/id/:tribeId" element={
                          <ProtectedRoute>
                            <TribeDetailPage />
                          </ProtectedRoute>
                        } />
                        
                        {/* Health Check Route */}
                        <Route path="__health" element={<HealthCheckPage />} />
                      
                        {/* Fallback */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                    
                    {/* Nova AI Chat - Always mounted with fail-safe */}
                    {NOVA_ENABLED && (
                      <AppPortal id="nova-root">
                        <Suspense fallback={null}>
                          <NovaBubble />
                        </Suspense>
                      </AppPortal>
                    )}
                  </div>
                </Router>
              </OnboardingProvider>
            </GamificationProvider>
          </UserProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </CrashGate>
  );
}

export default App;