import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Zap, Heart } from 'lucide-react';
import Button from '../components/ui/Button';
import ImageWithFallback from '../components/ui/ImageWithFallback';
import { ErrorBoundary } from '../components/ErrorBoundary';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF8F6]">
      <div className="max-w-7xl mx-auto py-12 px-4 md:px-8 lg:px-16">
        
        {/* Hero Section */}
        <ErrorBoundary>
          <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-br from-[#FAF8F6] via-white to-[#F5F3F0] rounded-3xl mb-16 shadow-sm">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="flex-1 text-center lg:text-left mb-12 lg:mb-0 lg:pr-10">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 leading-tight mb-6">
                  Train je eigen stijlcoach — ontdek outfits die écht bij je passen
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-600 leading-relaxed mb-8">
                  Swipe, leer en shop in 1 minuut — laat keuzestress achter je
                </p>
                
                <Button 
                  as={Link}
                  to="/registreren" 
                  variant="primary"
                  size="lg"
                  icon={<ArrowRight size={20} />}
                  iconPosition="right"
                  className="bg-[#bfae9f] hover:bg-[#a89a8c] text-white px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105 rounded-2xl"
                >
                  Start de stijlquiz
                </Button>
              </div>
              
              <div className="flex-1 flex justify-center lg:justify-end relative">
                <div className="relative h-[500px] w-[350px] rounded-3xl overflow-hidden shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#bfae9f]/20 z-10"></div>
                  
                  <ImageWithFallback 
                    src="https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=2" 
                    alt="Vrouw die swipet op mobiele interface" 
                    className="h-full w-full object-cover"
                    fallbackSrc="/images/fallback-user.png"
                  />
                  
                  {/* Swipe indicator overlay */}
                  <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-gray-700">Swipe om te leren</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </section>
        </ErrorBoundary>

        {/* USP Blocks */}
        <ErrorBoundary>
          <section className="py-20 bg-white rounded-3xl shadow-sm mb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-6">
                Waarom FitFi?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* USP 1 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-[#89CFF0]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-[#89CFF0]" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-4">
                  Persoonlijk & Nauwkeurig
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  AI-analyse van jouw unieke stijl en persoonlijkheid voor perfect passende aanbevelingen.
                </p>
              </div>
              
              {/* USP 2 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-[#89CFF0]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-8 h-8 text-[#89CFF0]" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-4">
                  Gemakkelijk & Snel
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Altijd passende outfits, zonder stress. FitFi doet het denkwerk voor je.
                </p>
              </div>
              
              {/* USP 3 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-[#89CFF0]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-[#89CFF0]" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-4">
                  Inspirerend & Motiverend
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Ontdek je ware stijlpotentieel en boost je zelfvertrouwen met FitFi's inzichten.
                </p>
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
              Klaar om je stijl te upgraden?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Begin nu met de quiz en zie direct outfits die bij jou passen.
            </p>
            <Button 
              as={Link}
              to="/registreren" 
              variant="secondary"
              size="lg"
              icon={<ArrowRight size={20} />}
              iconPosition="right"
              className="bg-white text-[#89CFF0] hover:bg-gray-50 text-lg px-8 py-4 font-medium shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 rounded-2xl"
            >
              Start de stijlquiz
            </Button>
            <p className="text-sm text-white/80 mt-4">
              Geen verplichtingen • Gratis te gebruiken
            </p>
          </div>
          </section>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default AboutPage;