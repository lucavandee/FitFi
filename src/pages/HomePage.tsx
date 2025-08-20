import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import Seo from '@/components/Seo';
import Button from '../components/ui/Button';
import HeroTitle from '@/components/marketing/HeroTitle';
import Chip from '@/components/ui/Chip';
import Hero from '@/components/sections/Hero';
import StickyCTA from '@/components/ui/StickyCTA';
import NovaStyleSwipe from '@/components/nova/NovaStyleSwipe';
import HowItWorks from '@/components/sections/HowItWorks';
import { useOutfitsFeed } from '@/hooks/useOutfitsFeed';
import { HOMEPAGE_FLAGS, getHomepageFlag } from '@/config/homepage';
import { useUser } from '../context/UserContext';

const HomePage: React.FC = () => {
  const { user } = useUser();
  const { items: outfitItems, loading: outfitsLoading } = useOutfitsFeed();

  const handleStartQuiz = () => {
    // Track quiz start from home hero
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'quiz_start', { 
        location: 'home_hero',
        event_category: 'conversion',
        event_label: 'home_cta_click'
      });
    }
  };

  return (
    <>
      <Seo 
        title="FitFi - AI-Powered Personal Styling Platform"
        description="Ontdek jouw perfecte stijl met AI-powered personal styling. Gepersonaliseerde outfit aanbevelingen, stijlquiz en fashion advies."
        canonical="https://fitfi.app/home"
        keywords="AI personal stylist, outfit aanbevelingen, stijl quiz, fashion advies, Nederlandse mode platform"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "FitFi",
          "url": "https://fitfi.ai",
          "logo": "https://fitfi.ai/logo.png"
        }}
      />
      
      <div className="min-h-screen bg-[#FAF8F6]">
        {/* Hero Section */}
        <Hero />

        {/* AI Style Preview Section */}
        {getHomepageFlag('showNovaStyleSwipe') && (
          <section className="py-16 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              {outfitsLoading ? (
                <div className="h-[400px] rounded-2xl bg-gray-100 animate-pulse flex items-center justify-center" aria-hidden="true">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-[#89CFF0]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-6 h-6 text-[#89CFF0] animate-pulse" />
                    </div>
                    <p className="text-gray-600">Nova bereidt je style preview voor...</p>
                  </div>
                </div>
              ) : (
                <NovaStyleSwipe items={outfitItems} />
              )}
            </div>
          </section>
        )}

        {/* How It Works - Gated */}
        {getHomepageFlag('showHowItWorks') && (
          <HowItWorks />
        )}

        {/* Social Proof - Gated */}
        {getHomepageFlag('showSocialProof') && (
          <section className="py-16 bg-gray-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
              <h2 className="text-2xl font-light text-[#0D1B2A] mb-8">
                Wat anderen zeggen
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <p className="text-gray-700 italic mb-4">
                    "Verbazingwekkend nauwkeurig! Ik begrijp mezelf ineens veel beter."
                  </p>
                  <div className="flex items-center justify-center">
                    <div className="w-10 h-10 bg-[#89CFF0] rounded-full flex items-center justify-center text-white font-medium mr-3">
                      E
                    </div>
                    <div>
                      <p className="font-medium text-[#0D1B2A]">Emma</p>
                      <p className="text-sm text-gray-600">Geverifieerde gebruiker</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <p className="text-gray-700 italic mb-4">
                    "Alsof deze AI recht door mij heen keek, superwaardevol!"
                  </p>
                  <div className="flex items-center justify-center">
                    <div className="w-10 h-10 bg-[#89CFF0] rounded-full flex items-center justify-center text-white font-medium mr-3">
                      J
                    </div>
                    <div>
                      <p className="font-medium text-[#0D1B2A]">Jordi</p>
                      <p className="text-sm text-gray-600">Geverifieerde gebruiker</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Trust indicators */}
              <div className="mt-12 flex flex-wrap justify-center items-center space-x-8 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>10.000+ rapporten gegenereerd</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>4.8/5 gemiddelde beoordeling</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>95% nauwkeurigheid</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Features - Gated */}
        {getHomepageFlag('showFeatures') && (
          <section className="py-16 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
              <h2 className="text-3xl font-light text-[#0D1B2A] mb-6">
                Wat zit er in het AI Style Report?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
                Jouw persoonlijke stijlrapport bevat alles wat je nodig hebt
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { icon: '👤', title: 'Persoonlijkheid & stijl', desc: 'Begrijp de verborgen boodschap achter jouw keuzes' },
                  { icon: '🎯', title: '3 kritische insights', desc: 'De top 3 verbeterpunten die je nú kunt toepassen' },
                  { icon: '✨', title: "Nova's aanbevelingen", desc: 'Direct toepasbare tips en voorbeeldoutfits' },
                  { icon: '💝', title: 'Wishlist', desc: 'Perfect passende producten geselecteerd door Nova' }
                ].map((feature, index) => (
                  <div key={index} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className="text-lg font-medium text-[#0D1B2A] mb-3">{feature.title}</h3>
                    <p className="text-gray-600">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Blog Teasers - Gated (disabled by default) */}
        {getHomepageFlag('showBlogTeasers') && (
          <section className="py-16 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
              <h2 className="text-2xl font-light text-[#0D1B2A] mb-8">
                Laatste styling tips
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Blog teaser cards would go here */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="font-medium text-[#0D1B2A] mb-2">Blog teasers</h3>
                  <p className="text-gray-600 text-sm">Coming soon...</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Extra Feature Grid - Gated (disabled by default) */}
        {getHomepageFlag('showExtraFeatureGrid') && (
          <section className="py-16 bg-gray-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
              <h2 className="text-2xl font-light text-[#0D1B2A] mb-8">
                Extra features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Extra feature cards would go here */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="font-medium text-[#0D1B2A] mb-2">Extra features</h3>
                  <p className="text-gray-600 text-sm">Coming soon...</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Final CTA */}
        <section className="py-20 bg-gradient-to-r from-[#89CFF0] to-blue-500">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-light text-white mb-6">
              Klaar om te ontdekken wat jouw stijl over je zegt?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Duizenden mensen hebben al hun persoonlijke AI Style Report ontvangen.
            </p>
            
            <Button 
              as={Link}
              to="/registreren" 
              onClick={handleStartQuiz}
              variant="primary"
              size="lg"
              icon={<ArrowRight size={20} />}
              iconPosition="right"
              className="bg-white text-[#89CFF0] hover:bg-gray-100 px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              data-ff-event="cta_click"
              data-ff-loc="home_final"
            >
              Ja, geef mij mijn gratis AI Style Report
            </Button>
            
            <p className="text-white/80 text-sm mt-4">
              Geen creditcard vereist • Privacy gegarandeerd
            </p>
          </div>
        </section>

        {/* Debug Info - Gated */}
        {getHomepageFlag('showDebugInfo') && import.meta.env.DEV && (
          <section className="py-8 bg-yellow-50 border-t border-yellow-200">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <details className="text-sm">
                <summary className="font-medium text-yellow-800 cursor-pointer">
                  🔧 Homepage Debug Info
                </summary>
                <div className="mt-2 text-yellow-700">
                  <p>Active flags: {Object.entries(HOMEPAGE_FLAGS).filter(([,v]) => v).map(([k]) => k).join(', ')}</p>
                  <p>Outfit items: {outfitItems.length}</p>
                  <p>User: {user ? `${user.name} (${user.id})` : 'Anonymous'}</p>
                </div>
              </details>
            </div>
          </section>
        )}
      </div>

      {/* Sticky Mobile CTA */}
      <StickyCTA />
    </>
  );
};

export default HomePage;