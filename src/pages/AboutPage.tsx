import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, Users, Zap, Heart } from 'lucide-react';
import Button from '../components/ui/Button';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Over FitFi
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Stel je voor: binnen enkele klikken zie je outfits die naadloos passen bij jouw stijl én lichaam. 
            Geen eindeloos zoeken of twijfelen meer – FitFi brengt je direct naar je perfecte look.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-16 transition-colors">
          <div className="p-8">
            <div className="flex items-center mb-6">
              <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full mr-4">
                <Zap className="text-orange-500" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Onze missie
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-6">
              Onze missie is shoppen weer leuk, gemakkelijk en persoonlijk te maken. Met AI-gedreven stijladvies geven we je zelfvertrouwen én tijdwinst.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Bij FitFi geloven we dat iedereen recht heeft op kleding die perfect past bij hun unieke stijl, lichaamsbouw en persoonlijkheid. 
              Door geavanceerde AI-technologie te combineren met mode-expertise, maken we persoonlijk stijladvies toegankelijk voor iedereen.
            </p>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-16 transition-colors">
          <div className="p-8">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full mr-4">
                <Users className="text-blue-500" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Ons team
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 mb-4 flex items-center justify-center text-white text-4xl font-bold">
                  LD
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Luc van Dokkum
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-3">
                  Founder
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Verbindt zijn passie voor mode en technologie om jou slim en stijlvol te stylen.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 mb-4 flex items-center justify-center text-white text-4xl font-bold">
                  FT
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  FitFi Team
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-3">
                  Designers & Developers
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Een gepassioneerd team van designers, developers en mode-experts die samenwerken om jouw stijlreis te verbeteren.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-16 transition-colors">
          <div className="p-8">
            <div className="flex items-center mb-6">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full mr-4">
                <Heart className="text-purple-500" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Onze waarden
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Persoonlijke benadering
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  We geloven dat stijl persoonlijk is. Onze aanbevelingen zijn volledig afgestemd op jouw unieke voorkeuren en behoeften.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Innovatie
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  We blijven voortdurend innoveren om je de meest geavanceerde stijlervaring te bieden.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Inclusiviteit
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Mode is voor iedereen. We streven ernaar om inclusieve stijladvies te bieden voor alle lichaamstypes, genders en voorkeuren.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Duurzaamheid
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  We moedigen bewuste modekeuzes aan door te focussen op kwaliteit boven kwantiteit en duurzame merken te promoten.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-700 dark:to-orange-800 rounded-xl shadow-md overflow-hidden transition-colors">
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Word affiliate partner
            </h2>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Heb je een mode-blog, social media kanaal of website? Word partner en verdien commissie door jouw volgers te helpen hun perfecte stijl te vinden.
            </p>
            <Button
              as="a"
              href="mailto:partner@fitfi.nl"
              variant="secondary"
              size="lg"
              className="bg-white text-orange-600 hover:bg-gray-100"
              icon={<ArrowRight size={20} />}
              iconPosition="right"
            >
              Word partner
            </Button>
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Neem contact op
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Heb je vragen of feedback? We horen graag van je!
          </p>
          <Button
            as="a"
            href="mailto:info@fitfi.nl"
            variant="outline"
            icon={<Mail size={20} />}
            iconPosition="left"
          >
            Email ons
          </Button>
          
          <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
            <p>FitFi B.V. • Amsterdam, Nederland</p>
            <p>KVK: 12345678 • BTW: NL123456789B01</p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link to="/" className="text-orange-500 hover:text-orange-600 transition-colors">
            Terug naar home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;