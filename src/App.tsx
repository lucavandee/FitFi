import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { IS_PROD_VIEW } from '@/config/preview';
import CrashGate from '@/components/system/CrashGate';
import { lazyAny } from '@/utils/lazyPage';
import { UserProvider } from '@/context/UserContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { GamificationProvider } from '@/context/GamificationContext';
import { OnboardingProvider } from '@/context/OnboardingContext';
import { NavigationServiceInitializer } from '@/components/NavigationServiceInitializer';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ScrollToTop } from '@/components/ScrollToTop';
import Navbar from '@/components/layout/Navbar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppPortal from '@/components/layout/AppPortal';
import NovaLoginPromptHost from '@/components/auth/NovaLoginPromptHost';

// Lazy load components with lazyAny for better error handling
const HomePage = lazy(() => import('@/pages/HomePage'));
const HowItWorksPage = lazy(() => import('@/pages/HowItWorksPage'));
const SuccessStoriesPage = lazy(() => import('@/pages/SuccessStoriesPage'));
const BlogIndexPage = lazy(() => import('@/pages/BlogIndexPage'));
const BlogDetailPage = lazy(() => import('@/pages/BlogDetailPage'));
const HelpCenterPage = lazy(() => import('@/pages/HelpCenterPage'));
const FAQPage = lazy(() => import('@/pages/FAQPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const PricingPage = lazy(() => import('@/pages/PricingPage'));
const PrivacyPolicyPage = lazy(() => import('@/pages/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('@/pages/TermsPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));

const NovaBubble = lazyAny(() => import('@/components/ai/NovaBubble'));
const NovaLauncher = lazyAny(() => import('@/components/ai/NovaLauncher'));
const CookieBanner = lazyAny(() => import('@/components/legal/CookieBanner'));

// Lazy load all pages with lazyAny for optimal code-splitting
const LandingPage = lazyAny(() => import('@/pages/LandingPage'));
const ForgotPasswordPage = lazyAny(() => import('@/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazyAny(() => import('@/pages/ResetPasswordPage'));
const GenderSelectPage = lazyAny(() => import('@/pages/GenderSelectPage'));
const ProductPage = lazyAny(() => import('@/pages/ProductPage'));
const ThankYouPage = lazyAny(() => import('@/pages/ThankYouPage'));
const OnboardingPage = lazyAny(() => import('@/pages/OnboardingPage'));
const QuizPage = lazyAny(() => import('@/pages/QuizPage'));
const ResultsPage = lazyAny(() => import('@/pages/ResultsPage'));
const EnhancedResultsPage = lazyAny(() => import('@/pages/EnhancedResultsPage'));
const DynamicOnboardingPage = lazyAny(() => import('@/pages/DynamicOnboardingPage'));
const DynamicResultsPage = lazyAny(() => import('@/pages/DynamicResultsPage'));
const DashboardPage = lazyAny(() => import('@/pages/DashboardPage'));
const OutfitsPage = lazyAny(() => import('@/pages/OutfitsPage'));
const ShopRedirect = lazyAny(() => import('@/pages/ShopRedirect'));
const ProfilePage = lazyAny(() => import('@/pages/ProfilePage'));

// Lazy load informational pages (only if they exist)
const TribesPage = lazy(() => import('@/pages/TribesPage'));
const TribeDetailPage = lazy(() => import('@/pages/TribeDetailPage'));
const FeedbackPage = lazy(() => import('@/pages/FeedbackPage'));
const GamificationPage = lazy(() => import('@/pages/GamificationPage'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));
const FeedPage = lazy(() => import('@/pages/FeedPage'));
const HealthCheckPage = lazy(() => import('@/pages/HealthCheckPage'));
const BrandSafetyPage = lazy(() => import('@/pages/BrandSafetyPage'));
const DisclosurePage = lazy(() => import('@/pages/DisclosurePage'));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'));
const CookiesPage = lazy(() => import('@/pages/CookiesPage'));
const SupportPage = lazy(() => import('@/pages/SupportPage'));
const LegalPage = lazy(() => import('@/pages/LegalPage'));

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
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
    <h1 className="text-2xl font-semibold">Pagina niet gevonden</h1>
    <p className="mt-2 text-slate-600">
      De pagina die je zoekt bestaat niet of is verplaatst.
    </p>
    <a href="/" className="mt-4 underline">
      ← Terug naar home
    </a>
  </div>
);

const App: React.FC = () => {
  return (
    <CrashGate>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <UserProvider>
            <GamificationProvider>
              <OnboardingProvider>
                <ErrorBoundary>
                  <Router>
                    <NavigationServiceInitializer />
                    <ScrollToTop />
                    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50">
                      <Navbar />
                      <Suspense fallback={<div className="p-8">Loading…</div>}>
                        <Routes>
                        
                          {/* Public Pages */}
                          <Route path="/" element={
                            <Suspense fallback={null}>
                              <HomePage />
                            </Suspense>
                          } />
                          <Route path="/hoe-het-werkt" element={
                            <Suspense fallback={null}>
                              <HowItWorksPage />
                            </Suspense>
                          } />
                          <Route path="/succesverhalen" element={
                            <Suspense fallback={null}>
                              <SuccessStoriesPage />
                            </Suspense>
                          } />
                          <Route path="/blog" element={
                            <Suspense fallback={null}>
                              <BlogIndexPage />
                            </Suspense>
                          } />
                          <Route path="/blog/:slug" element={
                            <Suspense fallback={null}>
                              <BlogDetailPage />
                            </Suspense>
                          } />
                          <Route path="/help" element={
                            <Suspense fallback={null}>
                              <HelpCenterPage />
                            </Suspense>
                          } />
                          <Route path="/faq" element={
                            <Suspense fallback={null}>
                              <FAQPage />
                            </Suspense>
                          } />
                          <Route path="/inloggen" element={
                            <Suspense fallback={null}>
                              <LoginPage />
                            </Suspense>
                          } />
                          <Route path="/registreren" element={
                            <Suspense fallback={null}>
                              <RegisterPage />
                            </Suspense>
                          } />
                          <Route path="/prijzen" element={
                            <Suspense fallback={null}>
                              <PricingPage />
                            </Suspense>
                          } />
                          <Route path="/privacybeleid" element={
                            <Suspense fallback={null}>
                              <PrivacyPolicyPage />
                            </Suspense>
                          } />
                          <Route path="/voorwaarden" element={
                            <Suspense fallback={null}>
                              <TermsPage />
                            </Suspense>
                          } />
                          <Route path="/contact" element={
                            <Suspense fallback={null}>
                              <ContactPage />
                            </Suspense>
                          } />
                          <Route path="/over-ons" element={
                            <Suspense fallback={null}>
                              <AboutPage />
                            </Suspense>
                          } />
                          
                          {/* Legacy/Additional Public Routes */}
                          <Route path="/home" element={<HomePage />} />
                          <Route path="/login" element={<Navigate to="/inloggen" replace />} />
                          <Route path="/wachtwoord-vergeten" element={<ForgotPasswordPage />} />
                          <Route path="/wachtwoord-reset" element={<ResetPasswordPage />} />
                          <Route path="/veelgestelde-vragen" element={<Navigate to="/faq" replace />} />
                          <Route path="/geslacht-selecteren" element={<GenderSelectPage />} />
                          <Route path="/product/:id" element={<ProductPage />} />
                          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                          <Route path="/algemene-voorwaarden" element={<TermsPage />} />
                          <Route path="/bedankt" element={<ThankYouPage />} />
                          <Route path="/profile" element={<ProfilePage />} />
                          <Route path="/terms" element={<TermsPage />} />
                          <Route path="/shop" element={<ShopRedirect />} />
                          
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

                          {/* Informational Pages */}
                          <Route path="/tribes" element={
                            <Suspense fallback={null}>
                              <TribesPage />
                            </Suspense>
                          } />
                          <Route path="/tribes/:id" element={
                            <Suspense fallback={null}>
                              <TribeDetailPage />
                            </Suspense>
                          } />
                          <Route path="/feedback" element={
                            <Suspense fallback={null}>
                              <FeedbackPage />
                            </Suspense>
                          } />
                          <Route path="/gamification" element={
                            <Suspense fallback={null}>
                              <GamificationPage />
                            </Suspense>
                          } />
                          <Route path="/analytics" element={
                            <Suspense fallback={null}>
                              <AnalyticsPage />
                            </Suspense>
                          } />
                          <Route path="/feed" element={
                            <Suspense fallback={null}>
                              <FeedPage />
                            </Suspense>
                          } />
                          <Route path="/health" element={
                            <Suspense fallback={null}>
                              <HealthCheckPage />
                            </Suspense>
                          } />
                          <Route path="/brand-safety" element={
                            <Suspense fallback={null}>
                              <BrandSafetyPage />
                            </Suspense>
                          } />
                          <Route path="/disclosure" element={
                            <Suspense fallback={null}>
                              <DisclosurePage />
                            </Suspense>
                          } />
                          <Route path="/privacy" element={
                            <Suspense fallback={null}>
                              <PrivacyPage />
                            </Suspense>
                          } />
                          <Route path="/cookies" element={
                            <Suspense fallback={null}>
                              <CookiesPage />
                            </Suspense>
                          } />
                          <Route path="/ondersteuning" element={
                            <Suspense fallback={null}>
                              <SupportPage />
                            </Suspense>
                          } />
                          <Route path="/juridisch" element={
                            <Suspense fallback={null}>
                              <LegalPage />
                            </Suspense>
                          } />
                          
                          {/* 404 Fallback - MUST BE LAST */}
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </Suspense>
                      
                      {/* Nova AI Chat - Always mounted with fail-safe */}
                      {NOVA_ENABLED && (
                        <>
                          <Suspense fallback={null}><NovaLauncher /></Suspense>
                          <Suspense fallback={null}><NovaBubble /></Suspense>
                        </>
                      )}
                      
                      {/* Cookie Consent Banner */}
                      <Suspense fallback={null}><CookieBanner /></Suspense>
                      
                      {/* Nova Login Prompt Host */}
                      <NovaLoginPromptHost />
                    </div>
                  </Router>
                </ErrorBoundary>
              </OnboardingProvider>
            </GamificationProvider>
          </UserProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </CrashGate>
  );
}

export default App;