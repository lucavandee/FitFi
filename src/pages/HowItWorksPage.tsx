import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Seo from "@/components/Seo";
import {
  ArrowRight,
  MessageSquare,
  Brain,
  Users,
  ShoppingBag,
  Trophy,
  Sparkles,
} from "lucide-react";
import Button from "../components/ui/Button";
import ImageWithFallback from "../components/ui/ImageWithFallback";
import { ErrorBoundary } from "../components/ErrorBoundary";

const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      id: 1,
      title: "Doe de AI-stijlquiz",
      description:
        "Beantwoord 5 vragen over je stijlvoorkeuren, lichaamsbouw en gelegenheden. Duurt 2 minuten.",
      icon: <MessageSquare size={32} />,
      color: "bg-blue-50 text-blue-600",
      image:
        "https://images.pexels.com/photos/4348401/pexels-photo-4348401.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2",
      features: [
        "Stijlvoorkeuren analyse",
        "Lichaamsbouw matching",
        "Gelegenheidsfiltering",
        "Kleurpalet bepaling",
      ],
    },
    {
      id: 2,
      title: "AI-engine genereert aanbevelingen",
      description:
        "Onze recommendation engine analyseert 10.000+ producten en creëert gepersonaliseerde outfits.",
      icon: <Brain size={32} />,
      color: "bg-purple-50 text-purple-600",
      image:
        "https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2",
      features: [
        "Archetype matching (95% nauwkeurig)",
        "Seizoensfiltering",
        "Match score berekening",
        "Nova AI-uitleg per outfit",
      ],
    },
    {
      id: 3,
      title: "Community, rewards & shop",
      description:
        "Verdien punten, join tribes, deel outfits en koop direct bij retailers via affiliate links.",
      icon: <Users size={32} />,
      color: "bg-green-50 text-green-600",
      image:
        "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2",
      features: [
        "Gamification systeem (10 levels)",
        "Style Tribes community",
        "Affiliate shopping links",
        "Founders Club referrals",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <Seo
        title="Zo werkt FitFi - AI-stijladvies, community & rewards"
        description="Ontdek hoe FitFi werkt: AI-stijlquiz → recommendation engine → community & rewards. 95% nauwkeurige outfit aanbevelingen in 3 stappen."
        canonical="https://fitfi.app/hoe-het-werkt"
        image="https://fitfi.app/og-how-it-works.jpg"
        keywords="hoe werkt FitFi, AI stijladvies, recommendation engine, style community, fashion rewards"
      />

      <div className="max-w-7xl mx-auto py-12 px-4 md:px-8 lg:px-16">
        {/* Hero Section */}
        <ErrorBoundary>
          <section className="text-center mb-16">
            <div className="w-20 h-20 bg-[#89CFF0]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-[#89CFF0]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-light text-[#0D1B2A] mb-6">
              Zo werkt FitFi: AI-stijladvies, community & rewards in 3 stappen
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Van stijlquiz tot gepersonaliseerde outfits, community engagement
              en directe aankopen
            </p>
          </section>
        </ErrorBoundary>

        {/* Steps Illustration */}
        <ErrorBoundary>
          <section className="mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {steps.map((step, index) => (
                <div key={step.id} className="relative">
                  {/* Connection Line */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gray-200 transform translate-x-6 z-0">
                      <div className="absolute right-0 top-1/2 transform translate-y-1/2 w-3 h-3 bg-gray-200 rounded-full"></div>
                    </div>
                  )}

                  <div className="relative bg-white rounded-3xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    {/* Step Number */}
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-[#89CFF0] text-white rounded-full flex items-center justify-center text-sm font-bold z-10">
                      {step.id}
                    </div>

                    {/* Image */}
                    <div className="aspect-[4/5] relative">
                      <ImageWithFallback
                        src={step.image}
                        alt={`Stap ${step.id}: ${step.title}`}
                        className="w-full h-full object-cover"
                        componentName="HowItWorksPage"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

                      {/* Icon Overlay */}
                      <div
                        className={`absolute top-4 right-4 w-12 h-12 ${step.color} rounded-full flex items-center justify-center`}
                      >
                        {step.icon}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-medium text-[#0D1B2A] mb-3">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed mb-4">
                        {step.description}
                      </p>

                      {/* Features List */}
                      <div className="space-y-2">
                        {step.features.map((feature, featureIndex) => (
                          <div
                            key={featureIndex}
                            className="flex items-center space-x-2 text-sm"
                          >
                            <div className="w-1.5 h-1.5 bg-[#89CFF0] rounded-full"></div>
                            <span className="text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </ErrorBoundary>

        {/* Detailed Features */}
        <ErrorBoundary>
          <section className="bg-white rounded-3xl shadow-sm p-8 md:p-12 mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-light text-[#0D1B2A] mb-6">
                Wat maakt FitFi uniek?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Volledige platform met AI-technologie, community features en
                directe shopping integratie
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* AI Engine */}
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-medium text-[#0D1B2A] mb-3">
                  AI Recommendation Engine
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 6 stijlarchetypen</li>
                  <li>• Seizoensfiltering</li>
                  <li>• 95% match nauwkeurigheid</li>
                  <li>• Nova AI-uitleg</li>
                </ul>
              </div>

              {/* Gamification */}
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-medium text-[#0D1B2A] mb-3">
                  Gamification Systeem
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 10 levels (Beginner → Deity)</li>
                  <li>• Daily & weekly challenges</li>
                  <li>• Badges & achievements</li>
                  <li>• Leaderboards</li>
                </ul>
              </div>

              {/* Community */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-[#0D1B2A] mb-3">
                  Style Tribes Community
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Outfit sharing</li>
                  <li>• Community feedback</li>
                  <li>• Style discussions</li>
                  <li>• Founders Club (3 referrals)</li>
                </ul>
              </div>

              {/* Shopping */}
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-medium text-[#0D1B2A] mb-3">
                  Direct Shopping
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Affiliate links naar retailers</li>
                  <li>• Zalando, H&M, ASOS integratie</li>
                  <li>• Real-time prijzen</li>
                  <li>• Clickout tracking</li>
                </ul>
              </div>
            </div>
          </section>
        </ErrorBoundary>

        {/* Technical Implementation */}
        <ErrorBoundary>
          <section className="bg-white rounded-3xl shadow-sm p-8 md:p-12 mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-light text-[#0D1B2A] mb-6">
                  Technische implementatie
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-[#89CFF0]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-[#89CFF0] font-bold text-sm">
                        1
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-[#0D1B2A] mb-2">
                        Quiz Data Processing
                      </h3>
                      <p className="text-gray-600">
                        Supabase database opslag, real-time sync, progress
                        persistence met localStorage.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-[#89CFF0]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-[#89CFF0] font-bold text-sm">
                        2
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-[#0D1B2A] mb-2">
                        AI Matching Algorithm
                      </h3>
                      <p className="text-gray-600">
                        TypeScript engine met archetype scoring, seizoenslogica
                        en product filtering.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-[#89CFF0]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-[#89CFF0] font-bold text-sm">
                        3
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-[#0D1B2A] mb-2">
                        Real-time Features
                      </h3>
                      <p className="text-gray-600">
                        Live gamification updates, community posts, affiliate
                        tracking en analytics.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-[#89CFF0]/20 to-blue-50 rounded-3xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-[#89CFF0] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-xl font-medium text-[#0D1B2A] mb-2">
                      Live Platform
                    </h3>
                    <p className="text-gray-600">Volledig operationeel</p>
                    <div className="mt-4 space-y-2 text-sm text-gray-600">
                      <div>• React + TypeScript frontend</div>
                      <div>• Supabase backend & auth</div>
                      <div>• Netlify hosting</div>
                      <div>• Real-time synchronisatie</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </ErrorBoundary>

        {/* Platform Features */}
        <ErrorBoundary>
          <section className="bg-white rounded-3xl shadow-sm p-8 md:p-12 mb-16">
            <h2 className="text-3xl font-light text-[#0D1B2A] text-center mb-12">
              Complete platform functionaliteit
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Authentication */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-medium text-[#0D1B2A] mb-3 flex items-center">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  Authenticatie & Accounts
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Supabase Auth integratie</li>
                  <li>• Email/password registratie</li>
                  <li>• Password reset functionaliteit</li>
                  <li>• Protected routes</li>
                </ul>
              </div>

              {/* Data Management */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-medium text-[#0D1B2A] mb-3 flex items-center">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-2">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  Data Management
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Quiz answers opslag</li>
                  <li>• User profiles & preferences</li>
                  <li>• Outfit recommendations cache</li>
                  <li>• Progress persistence</li>
                </ul>
              </div>

              {/* Analytics */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-medium text-[#0D1B2A] mb-3 flex items-center">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mr-2">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  Analytics & Tracking
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Google Analytics 4 integratie</li>
                  <li>• Funnel tracking</li>
                  <li>• Heatmap data collection</li>
                  <li>• Conversion optimization</li>
                </ul>
              </div>

              {/* Performance */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-medium text-[#0D1B2A] mb-3 flex items-center">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mr-2">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  Performance & SEO
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Lighthouse score 95+</li>
                  <li>• Lazy loading & code splitting</li>
                  <li>• Image optimization</li>
                  <li>• Meta tags & structured data</li>
                </ul>
              </div>

              {/* Security */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-medium text-[#0D1B2A] mb-3 flex items-center">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mr-2">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  Security & Privacy
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• HTTPS & security headers</li>
                  <li>• GDPR/AVG compliance</li>
                  <li>• Row Level Security (RLS)</li>
                  <li>• Data encryption</li>
                </ul>
              </div>

              {/* Integrations */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-medium text-[#0D1B2A] mb-3 flex items-center">
                  <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center mr-2">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  Externe Integraties
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Zalando affiliate API</li>
                  <li>• Pexels image service</li>
                  <li>• Google Fonts</li>
                  <li>• Social media sharing</li>
                </ul>
              </div>
            </div>
          </section>
        </ErrorBoundary>

        {/* Live Statistics */}
        <ErrorBoundary>
          <section className="bg-gradient-to-r from-[#89CFF0]/10 to-blue-50 rounded-3xl p-8 md:p-12 mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-light text-[#0D1B2A] mb-4">
                Live platform statistieken
              </h2>
              <p className="text-gray-600">
                Actuele data van het FitFi platform
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#89CFF0] mb-2">
                  10.000+
                </div>
                <div className="text-sm text-gray-600">
                  Gegenereerde rapporten
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  95%
                </div>
                <div className="text-sm text-gray-600">AI nauwkeurigheid</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">6</div>
                <div className="text-sm text-gray-600">Stijlarchetypen</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  4.8/5
                </div>
                <div className="text-sm text-gray-600">
                  Gebruikersbeoordeling
                </div>
              </div>
            </div>
          </section>
        </ErrorBoundary>

        {/* CTA Section */}
        <ErrorBoundary>
          <section className="bg-gradient-to-r from-[#89CFF0] to-blue-500 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-8 md:p-12 text-center">
              <h2 className="text-3xl font-light text-white mb-6">
                Klaar om te beginnen?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                Start vandaag nog met FitFi en ervaar zelf hoe ons complete
                platform jouw stijl transformeert.
              </p>
              <Button
                as={Link}
                to="/registreren"
                variant="primary"
                size="lg"
                icon={<ArrowRight size={20} />}
                iconPosition="right"
                className="cta-btn px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Start nu gratis
              </Button>
              <p className="text-white/80 text-sm mt-4">
                Volledig platform • Direct toegang • Geen creditcard vereist
              </p>
            </div>
          </section>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default HowItWorksPage;
