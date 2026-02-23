// /src/App.tsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import ErrorBoundary from "@/components/ErrorBoundary";
import AnalyticsLoader from "@/components/analytics/AnalyticsLoader";
import Seo from "@/components/seo/Seo";
import RequireAuth from "@/components/auth/RequireAuth";
import { RequireQuiz } from "@/components/auth/RequireQuiz";
import NovaChatProvider from "@/components/nova/NovaChatProvider";
import ProfileSyncInitializer from "@/components/data/ProfileSyncInitializer";
import AwinMasterTag from "@/components/affiliate/AwinMasterTag";
import { NotificationProvider } from "@/context/NotificationContext";
import InstallPrompt from "@/components/pwa/InstallPrompt";

// Lazy pages
const LandingPage        = lazy(() => import("@/pages/LandingPage"));
const HowItWorksPage     = lazy(() => import("@/pages/HowItWorksPage"));
const PricingPage        = lazy(() => import("@/pages/PricingPage"));
const AboutPage          = lazy(() => import("@/pages/AboutPage"));
const ShopPage           = lazy(() => import("@/pages/ShopPage"));
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
const ResultsPreview     = lazy(() => import("@/pages/ResultsPreviewPage"));
const LoginPage          = lazy(() => import("@/pages/LoginPage"));
const RegisterPage       = lazy(() => import("@/pages/RegisterPage"));
const DashboardPage      = lazy(() => import("@/pages/DashboardPage"));
const ProfilePage        = lazy(() => import("@/pages/ProfilePage"));
const EmbeddingAnalytics = lazy(() => import("@/components/admin/EmbeddingAnalytics"));
const AdminProductsPage  = lazy(() => import("@/pages/AdminProductsPage"));
const AdminStripeSetupPage = lazy(() => import("@/pages/AdminStripeSetupPage"));
const AdminBramsFruitPage = lazy(() => import("@/pages/AdminBramsFruitPage"));
const AdminDashboardPage = lazy(() => import("@/pages/AdminDashboardPage"));
const AdminZalandoImportPage = lazy(() => import("@/pages/AdminZalandoImportPage"));
const AdminMoodPhotosPage = lazy(() => import("@/pages/AdminMoodPhotosPage"));
const AdminImageManagerPage = lazy(() => import("@/pages/AdminImageManagerPage"));
const AdminPWADashboard = lazy(() => import("@/pages/AdminPWADashboard"));
const AdminUsersPage = lazy(() => import("@/pages/AdminUsersPage"));
const AdminAuditPage = lazy(() => import("@/pages/AdminAuditPage"));
const AdminSwipeAnalyticsPage = lazy(() => import("@/pages/AdminSwipeAnalyticsPage"));
const AdminBlogManagementPage = lazy(() => import("@/pages/AdminBlogManagementPage"));
const AdminBlogEditorPage = lazy(() => import("@/pages/AdminBlogEditorPage"));
const AdminBlogTopicsPage = lazy(() => import("@/pages/AdminBlogTopicsPage"));
const AdminTestimonialsPage = lazy(() => import("@/pages/AdminTestimonialsPage"));
const AccessibilityTestPage = lazy(() => import("@/pages/AccessibilityTestPage"));
const BramsFruitCatalogPage = lazy(() => import("@/pages/BramsFruitCatalogPageSimple"));
const BillingPage        = lazy(() => import("@/pages/BillingPage"));
const NotFoundPage       = lazy(() => import("@/pages/NotFoundPage"));

const ORG_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "FitFi",
  url: "https://fitfi.ai",
  logo: "https://fitfi.ai/icons/icon-512.png",
  contactPoint: { "@type": "ContactPoint", email: "contact@fitfi.ai", contactType: "customer service" },
};

const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "FitFi",
  url: "https://fitfi.ai",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://fitfi.ai/blog?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

const WithSeo = {
  Home:       () => (<><Seo title="FitFi — Persoonlijk stijladvies in 2 minuten" description="Beantwoord een paar vragen en zie welke outfits bij je passen. Directe shoplinks, persoonlijk advies. Gratis starten." path="/" structuredData={ORG_SCHEMA} /><LandingPage /></>),
  How:        () => (<><Seo title="Hoe het werkt — FitFi" description="In drie stappen van quiz naar complete outfits met shoplinks. Geen foto's nodig, geen account verplicht." path="/hoe-het-werkt" /><HowItWorksPage /></>),
  Pricing:    () => (<><Seo title="Prijzen — FitFi" description="Gratis starten met je stijlprofiel en drie outfits. Premium geeft onbeperkte outfits, Nova AI en kleuranalyse." path="/prijzen" /><PricingPage /></>),
  About:      () => (<><Seo title="Over ons — FitFi" description="Wij bouwen een stijltool die eerlijk, rustig en effectief is. Leer meer over onze aanpak en principes." path="/over-ons" /><AboutPage /></>),
  Shop:       () => (<><Seo title="Shop — FitFi" description="Kleding en accessoires afgestemd op jouw stijlprofiel. Directe links naar webshops." path="/shop" /><ShopPage /></>),
  Blog:       () => (<><Seo title="Blog — FitFi" description="Artikelen over stijl, kleding en hoe je bewuste kledingkeuzes maakt." path="/blog" structuredData={WEBSITE_SCHEMA} /><BlogPage /></>),
  BlogPost:   () => (<><Seo title="Artikel — FitFi" description="Lees meer op de FitFi blog over stijl en kleding." path={typeof window!=="undefined"?window.location.pathname:"/blog"} /><BlogPostPage /></>),
  FAQ:        () => (<FAQPage />),
  Contact:    () => (<><Seo title="Contact — FitFi" description="Stuur ons een bericht. Wij reageren binnen 24 uur op vragen over je account of stijladvies." path="/contact" /><ContactPage /></>),
  Terms:      () => (<><Seo title="Algemene voorwaarden — FitFi" description="De gebruiksvoorwaarden van FitFi." path="/algemene-voorwaarden" /><TermsPage /></>),
  Privacy:    () => (<><Seo title="Privacybeleid — FitFi" description="Hoe wij omgaan met je gegevens. Transparant en GDPR-compliant." path="/privacy" /><PrivacyPage /></>),
  Cookies:    () => (<><Seo title="Cookiebeleid — FitFi" description="Welke cookies wij gebruiken en hoe je je voorkeuren kunt aanpassen." path="/cookies" /><CookiesPage /></>),
  Disclosure: () => (<><Seo title="Affiliate disclosure — FitFi" description="Transparantieverklaring over affiliate links en samenwerkingen." path="/disclosure" /><DisclosurePage /></>),
  Onboarding: () => (<><Seo title="Start je stijlquiz — FitFi" description="Beantwoord een paar vragen en zie direct welke outfits bij je passen." path="/onboarding" noindex /><OnboardingFlow /></>),
  Results:    () => (<><Seo title="Jouw stijlresultaten — FitFi" description="Jouw persoonlijke outfits met uitleg en directe shoplinks." path="/results" noindex /><EnhancedResults /></>),
  ResultsPreview: () => (<><Seo title="Voorbeeld stijlrapport — FitFi" description="Bekijk een voorbeeld van een persoonlijk stijlrapport met outfit-aanbevelingen." path="/results/preview" /><ResultsPreview /></>),
  Login:      () => (<><Seo title="Inloggen — FitFi" description="Log in en zie je opgeslagen outfits en stijlprofiel terug." path="/inloggen" noindex /><LoginPage /></>),
  Register:   () => (<><Seo title="Account aanmaken — FitFi" description="Maak een gratis account aan en sla je stijlrapport en outfits op." path="/registreren" noindex /><RegisterPage /></>),
  Dashboard:  () => (<><Seo title="Dashboard — FitFi" description="Jouw opgeslagen outfits, stijlprofiel en aanbevelingen." path="/dashboard" noindex /><DashboardPage /></>),
  Profile:    () => (<><Seo title="Profiel — FitFi" description="Bekijk en pas je stijlprofiel aan." path="/profile" noindex /><ProfilePage /></>),
  Billing:    () => (<><Seo title="Abonnement — FitFi" description="Bekijk je huidige plan en beheer je abonnement." path="/account/billing" noindex /><BillingPage /></>),
  Analytics:  () => (<><Seo title="Analytics — FitFi" description="Embedding analytics dashboard." path="/admin/analytics" noindex /><EmbeddingAnalytics /></>),
  AdminProducts: () => (<><Seo title="Product Management — FitFi" description="Stripe products management." path="/admin/products" noindex /><AdminProductsPage /></>),
  AdminStripeSetup: () => (<><Seo title="Stripe Setup — FitFi" description="Stripe configuration setup." path="/admin/stripe-setup" noindex /><AdminStripeSetupPage /></>),
  AdminBramsFruit: () => (<><Seo title="Brams Fruit Admin — FitFi" description="Brams Fruit product management." path="/admin/brams-fruit" noindex /><AdminBramsFruitPage /></>),
  AdminDashboard: () => (<><Seo title="Admin Dashboard — FitFi" description="Centraal admin dashboard voor gebruikersbeheer en metrics." path="/admin" noindex /><AdminDashboardPage /></>),
  AdminZalandoImport: () => (<><Seo title="Zalando Import — FitFi Admin" description="Import Zalando products to unified catalog." path="/admin/zalando-import" noindex /><AdminZalandoImportPage /></>),
  AdminMoodPhotos: () => (<><Seo title="Mood Photos Moderation — FitFi Admin" description="Review and moderate mood photos for visual preference quiz." path="/admin/mood-photos" noindex /><AdminMoodPhotosPage /></>),
  AdminImageManager: () => (<><Seo title="Image Manager — FitFi Admin" description="Bulk upload product images with SKU matching." path="/admin/images" noindex /><AdminImageManagerPage /></>),
  AdminPWADashboard: () => (<><Seo title="PWA Dashboard — FitFi Admin" description="Monitor PWA installations and push notifications." path="/admin/pwa" noindex /><AdminPWADashboard /></>),
  AdminUsers: () => (<><Seo title="Gebruikersbeheer — FitFi Admin" description="Beheer alle gebruikers en hun toegang." path="/admin/users" noindex /><AdminUsersPage /></>),
  AdminAudit: () => (<><Seo title="Audit Log — FitFi Admin" description="Bekijk alle gebruikersactiviteit en systeemgebeurtenissen." path="/admin/audit" noindex /><AdminAuditPage /></>),
  AdminSwipeAnalytics: () => (<><Seo title="Swipe Analytics — FitFi Admin" description="Bekijk swipe patterns en photo performance analytics." path="/admin/swipe-analytics" noindex /><AdminSwipeAnalyticsPage /></>),
  AdminBlog: () => (<><Seo title="Blog Beheer — FitFi Admin" description="Beheer blog posts en AI-gegenereerde content." path="/admin/blog" noindex /><AdminBlogManagementPage /></>),
  AdminBlogNew: () => (<><Seo title="Nieuwe Post — FitFi Admin" description="Maak een nieuwe blog post." path="/admin/blog/new" noindex /><AdminBlogEditorPage /></>),
  AdminBlogEdit: () => (<><Seo title="Bewerk Post — FitFi Admin" description="Bewerk blog post." path="/admin/blog/edit" noindex /><AdminBlogEditorPage /></>),
  AdminBlogTopics: () => (<><Seo title="Blog Topics — FitFi Admin" description="Beheer blog topic ideeën." path="/admin/blog/topics" noindex /><AdminBlogTopicsPage /></>),
  AdminTestimonials: () => (<><Seo title="Testimonials Beheer — FitFi Admin" description="Beheer klant testimonials voor de homepage." path="/admin/testimonials" noindex /><AdminTestimonialsPage /></>),
  AdminBramsFruitPreview: () => (<><Seo title="Brams Fruit Preview — FitFi Admin" description="Preview van Brams Fruit catalogus (admin only)." path="/admin/preview/brams-fruit" noindex /><BramsFruitCatalogPage /></>),
  AccessibilityTest: () => (<><Seo title="Accessibility Test — FitFi" description="WCAG 2.1 AA compliance test page." path="/accessibility-test" noindex /><AccessibilityTestPage /></>),
  NotFound:   () => (<><Seo title="Niet gevonden — FitFi" description="De pagina kon niet worden gevonden." path={typeof window!=="undefined"?window.location.pathname:"/404"} noindex /><NotFoundPage /></>),
};

export default function App() {
  return (
    <NovaChatProvider>
      <NotificationProvider>
        <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
          <ErrorBoundary>
            <ProfileSyncInitializer />
            <AwinMasterTag />
            <Navbar />
          <Suspense fallback={
            <div className="ff-container py-16 flex flex-col items-center gap-3" role="status" aria-live="polite">
              <div className="w-8 h-8 border-2 border-[var(--color-border)] border-t-[var(--ff-color-primary-600)] rounded-full animate-spin" aria-hidden="true" />
              <span className="text-sm text-[var(--color-muted)]">Laden…</span>
            </div>
          }>
            <main id="main">
              <Routes>
                {/* Marketing */}
                <Route path="/" element={<WithSeo.Home />} />
                <Route path="/hoe-het-werkt" element={<WithSeo.How />} />
                <Route path="/prijzen" element={<WithSeo.Pricing />} />
                <Route path="/over-ons" element={<WithSeo.About />} />
                <Route path="/shop" element={<WithSeo.Shop />} />
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
                <Route path="/signup" element={<Navigate to="/registreren" replace />} />

                {/* App (afgeschermd) */}
                <Route path="/dashboard" element={<RequireAuth><RequireQuiz><WithSeo.Dashboard /></RequireQuiz></RequireAuth>} />
                <Route path="/profile" element={<RequireAuth><WithSeo.Profile /></RequireAuth>} />
                <Route path="/account/billing" element={<RequireAuth><WithSeo.Billing /></RequireAuth>} />
                <Route path="/results" element={<RequireQuiz><WithSeo.Results /></RequireQuiz>} />
                <Route path="/results/preview" element={<WithSeo.ResultsPreview />} />

                {/* Admin */}
                <Route path="/admin" element={<RequireAuth><WithSeo.AdminDashboard /></RequireAuth>} />
                <Route path="/admin/analytics" element={<RequireAuth><WithSeo.Analytics /></RequireAuth>} />
                <Route path="/admin/swipe-analytics" element={<RequireAuth><WithSeo.AdminSwipeAnalytics /></RequireAuth>} />
                <Route path="/admin/products" element={<RequireAuth><WithSeo.AdminProducts /></RequireAuth>} />
                <Route path="/admin/stripe-setup" element={<RequireAuth><WithSeo.AdminStripeSetup /></RequireAuth>} />
                <Route path="/admin/brams-fruit" element={<RequireAuth><WithSeo.AdminBramsFruit /></RequireAuth>} />
                <Route path="/admin/zalando-import" element={<RequireAuth><WithSeo.AdminZalandoImport /></RequireAuth>} />
                <Route path="/admin/mood-photos" element={<RequireAuth><WithSeo.AdminMoodPhotos /></RequireAuth>} />
                <Route path="/admin/images" element={<RequireAuth><WithSeo.AdminImageManager /></RequireAuth>} />
                <Route path="/admin/pwa" element={<RequireAuth><WithSeo.AdminPWADashboard /></RequireAuth>} />
                <Route path="/admin/users" element={<RequireAuth><WithSeo.AdminUsers /></RequireAuth>} />
                <Route path="/admin/audit" element={<RequireAuth><WithSeo.AdminAudit /></RequireAuth>} />
                <Route path="/admin/blog" element={<RequireAuth><WithSeo.AdminBlog /></RequireAuth>} />
                <Route path="/admin/blog/new" element={<RequireAuth><WithSeo.AdminBlogNew /></RequireAuth>} />
                <Route path="/admin/blog/edit/:id" element={<RequireAuth><WithSeo.AdminBlogEdit /></RequireAuth>} />
                <Route path="/admin/blog/topics" element={<RequireAuth><WithSeo.AdminBlogTopics /></RequireAuth>} />
                <Route path="/admin/testimonials" element={<RequireAuth><WithSeo.AdminTestimonials /></RequireAuth>} />
                <Route path="/admin/preview/brams-fruit" element={<RequireAuth><WithSeo.AdminBramsFruitPreview /></RequireAuth>} />

                {/* Accessibility Test (dev/admin only) */}
                <Route path="/accessibility-test" element={<WithSeo.AccessibilityTest />} />

                {/* 404 */}
                <Route path="*" element={<WithSeo.NotFound />} />
              </Routes>
            </main>
          </Suspense>
          <Footer />
          <MobileBottomNav />
          <InstallPrompt />
          <AnalyticsLoader />
        </ErrorBoundary>
      </div>
      </NotificationProvider>
    </NovaChatProvider>
  );
}