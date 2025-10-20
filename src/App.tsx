// /src/App.tsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import AnalyticsLoader from "@/components/analytics/AnalyticsLoader";
import Seo from "@/components/seo/Seo";
import RequireAuth from "@/components/auth/RequireAuth";
import NovaChatProvider from "@/components/nova/NovaChatProvider";
import NovaLauncher from "@/components/nova/NovaLauncher";
import ChatPanel from "@/components/nova/ChatPanel";
import ProfileSyncInitializer from "@/components/data/ProfileSyncInitializer";
import AwinMasterTag from "@/components/affiliate/AwinMasterTag";

// Lazy pages
const LandingPage        = lazy(() => import("@/pages/LandingPage"));
const HowItWorksPage     = lazy(() => import("@/pages/HowItWorksPage"));
const PricingPage        = lazy(() => import("@/pages/PricingPage"));
const AboutPage          = lazy(() => import("@/pages/AboutPage"));
const BlogPage           = lazy(() => import("@/pages/BlogPage"));
const BlogPostPage       = lazy(() => import("@/pages/BlogPostPage"));
const FAQPage            = lazy(() => import("@/pages/FAQPage"));
const ContactPage        = lazy(() => import("@/pages/ContactPage"));
const TermsPage          = lazy(() => import("@/pages/TermsPage"));
const PrivacyPage        = lazy(() => import("@/pages/PrivacyPage"));
const CookiesPage        = lazy(() => import("@/pages/CookiesPage"));
const DisclosurePage     = lazy(() => import("@/pages/DisclosurePage"));
const OnboardingFlow     = lazy(() => import("@/pages/OnboardingFlowPage"));
const EnhancedResults    = lazy(() => import("@/pages/EnhancedResultsPage"));
const LoginPage          = lazy(() => import("@/pages/LoginPage"));
const RegisterPage       = lazy(() => import("@/pages/RegisterPage"));
const DashboardPage      = lazy(() => import("@/pages/DashboardPage"));
const ProfilePage        = lazy(() => import("@/pages/ProfilePage"));
const EmbeddingAnalytics = lazy(() => import("@/components/admin/EmbeddingAnalytics"));
const AdminProductsPage  = lazy(() => import("@/pages/AdminProductsPage"));
const AdminStripeSetupPage = lazy(() => import("@/pages/AdminStripeSetupPage"));
const AdminBramsFruitPage = lazy(() => import("@/pages/AdminBramsFruitPage"));
const BramsFruitCatalogPage = lazy(() => import("@/pages/BramsFruitCatalogPage"));
const NotFoundPage       = lazy(() => import("@/pages/NotFoundPage"));

const WithSeo = {
  Home:       () => (<><Seo title="FitFi — Minimalistische outfits op maat" description="AI-gestuurde stijlresultaten en outfits in een rustige, premium ervaring." path="/" /><LandingPage /></>),
  How:        () => (<><Seo title="Hoe het werkt — FitFi" description="Zo bouwt FitFi jouw stijlprofiel en vertaalt dat naar outfits." path="/hoe-het-werkt" /><HowItWorksPage /></>),
  Pricing:    () => (<><Seo title="Prijzen — FitFi" description="Eerlijke prijzen. Start gratis, upgrade wanneer jij wilt." path="/prijzen" /><PricingPage /></>),
  About:      () => (<><Seo title="Over ons — FitFi" description="Wij geloven in rustige stijl, niet in ruis." path="/over-ons" /><AboutPage /></>),
  Blog:       () => (<><Seo title="Blog — FitFi" description="Rustige inzichten over stijl en silhouet." path="/blog" /><BlogPage /></>),
  BlogPost:   () => (<><Seo title="Artikel — FitFi" description="Lees meer op de FitFi blog." path={typeof window!=="undefined"?window.location.pathname:"/blog"} /><BlogPostPage /></>),
  FAQ:        () => (<><Seo title="Veelgestelde vragen — FitFi" description="Antwoorden op de meest gestelde vragen." path="/veelgestelde-vragen" /><FAQPage /></>),
  Contact:    () => (<><Seo title="Contact — FitFi" description="Neem contact op met het FitFi team." path="/contact" /><ContactPage /></>),
  Terms:      () => (<><Seo title="Algemene voorwaarden — FitFi" description="Voorwaarden van toepassing op het gebruik van FitFi." path="/algemene-voorwaarden" /><TermsPage /></>),
  Privacy:    () => (<><Seo title="Privacy — FitFi" description="Zo beschermen we jouw gegevens." path="/privacy" /><PrivacyPage /></>),
  Cookies:    () => (<><Seo title="Cookies — FitFi" description="Informatie over cookies en voorkeuren." path="/cookies" /><CookiesPage /></>),
  Disclosure: () => (<><Seo title="Disclosure — FitFi" description="Transparantieverklaring." path="/disclosure" /><DisclosurePage /></>),
  Onboarding: () => (<><Seo title="Start je Style Report — FitFi" description="Beantwoord enkele vragen en ontdek je perfecte stijl." path="/onboarding" /><OnboardingFlow /></>),
  Results:    () => (<><Seo title="Jouw resultaten — FitFi" description="Outfits en uitleg waarom ze voor je werken." path="/results" /><EnhancedResults /></>),
  Login:      () => (<><Seo title="Inloggen — FitFi" description="Log in om je stijlresultaten te zien." path="/inloggen" /><LoginPage /></>),
  Register:   () => (<><Seo title="Registreren — FitFi" description="Maak je account aan en start gratis." path="/registreren" /><RegisterPage /></>),
  Dashboard:  () => (<><Seo title="Dashboard — FitFi" description="Snel overzicht en acties." path="/dashboard" /><DashboardPage /></>),
  Profile:    () => (<><Seo title="Profiel — FitFi" description="Jouw stijlprofiel en embedding insights." path="/profile" /><ProfilePage /></>),
  Analytics:  () => (<><Seo title="Analytics — FitFi" description="Embedding analytics dashboard." path="/admin/analytics" noindex /><EmbeddingAnalytics /></>),
  AdminProducts: () => (<><Seo title="Product Management — FitFi" description="Stripe products management." path="/admin/products" noindex /><AdminProductsPage /></>),
  AdminStripeSetup: () => (<><Seo title="Stripe Setup — FitFi" description="Stripe configuration setup." path="/admin/stripe-setup" noindex /><AdminStripeSetupPage /></>),
  AdminBramsFruit: () => (<><Seo title="Brams Fruit Admin — FitFi" description="Brams Fruit product management." path="/admin/brams-fruit" noindex /><AdminBramsFruitPage /></>),
  BramsFruitCatalog: () => (<><Seo title="Brams Fruit Collectie — FitFi" description="Premium menswear met een rustige uitstraling." path="/collectie/brams-fruit" /><BramsFruitCatalogPage /></>),
  NotFound:   () => (<><Seo title="Niet gevonden — FitFi" description="De pagina kon niet worden gevonden." path={typeof window!=="undefined"?window.location.pathname:"/404"} noindex /><NotFoundPage /></>),
};

export default function App() {
  return (
    <NovaChatProvider>
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
        <ErrorBoundary>
          <ProfileSyncInitializer />
          <AwinMasterTag />
          <Navbar />
          <Suspense fallback={<div className="ff-container py-10">Laden…</div>}>
            <main id="main">
              <Routes>
                {/* Marketing */}
                <Route path="/" element={<WithSeo.Home />} />
                <Route path="/hoe-het-werkt" element={<WithSeo.How />} />
                <Route path="/prijzen" element={<WithSeo.Pricing />} />
                <Route path="/over-ons" element={<WithSeo.About />} />
                <Route path="/blog" element={<WithSeo.Blog />} />
                <Route path="/blog/:slug" element={<WithSeo.BlogPost />} />
                <Route path="/veelgestelde-vragen" element={<WithSeo.FAQ />} />
                <Route path="/faq" element={<Navigate to="/veelgestelde-vragen" replace />} />
                <Route path="/contact" element={<WithSeo.Contact />} />

                {/* Juridisch (NL canoniek) */}
                <Route path="/algemene-voorwaarden" element={<WithSeo.Terms />} />
                <Route path="/terms" element={<Navigate to="/algemene-voorwaarden" replace />} />
                <Route path="/privacy" element={<WithSeo.Privacy />} />
                <Route path="/cookies" element={<WithSeo.Cookies />} />
                <Route path="/disclosure" element={<WithSeo.Disclosure />} />

                {/* Onboarding / Quiz */}
                <Route path="/onboarding" element={<WithSeo.Onboarding />} />
                <Route path="/quiz" element={<Navigate to="/onboarding" replace />} />
                <Route path="/stijlquiz" element={<Navigate to="/onboarding" replace />} />

                {/* Auth (NL canoniek) */}
                <Route path="/inloggen" element={<WithSeo.Login />} />
                <Route path="/login" element={<Navigate to="/inloggen" replace />} />
                <Route path="/registreren" element={<WithSeo.Register />} />
                <Route path="/register" element={<Navigate to="/registreren" replace />} />

                {/* App (afgeschermd) */}
                <Route path="/dashboard" element={<RequireAuth><WithSeo.Dashboard /></RequireAuth>} />
                <Route path="/profile" element={<RequireAuth><WithSeo.Profile /></RequireAuth>} />
                <Route path="/results" element={<RequireAuth><WithSeo.Results /></RequireAuth>} />

                {/* Brams Fruit */}
                <Route path="/collectie/brams-fruit" element={<WithSeo.BramsFruitCatalog />} />

                {/* Admin */}
                <Route path="/admin/analytics" element={<RequireAuth><WithSeo.Analytics /></RequireAuth>} />
                <Route path="/admin/products" element={<RequireAuth><WithSeo.AdminProducts /></RequireAuth>} />
                <Route path="/admin/stripe-setup" element={<RequireAuth><WithSeo.AdminStripeSetup /></RequireAuth>} />
                <Route path="/admin/brams-fruit" element={<RequireAuth><WithSeo.AdminBramsFruit /></RequireAuth>} />

                {/* 404 */}
                <Route path="*" element={<WithSeo.NotFound />} />
              </Routes>
            </main>
          </Suspense>
          <Footer />
          <ChatPanel />
          <NovaLauncher />
          <AnalyticsLoader />
        </ErrorBoundary>
      </div>
    </NovaChatProvider>
  );
}