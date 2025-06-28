import React from 'react';
import { Link } from 'react-router-dom';
import { Shirt, Sparkles, ShieldCheck, Clock, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';

const ProductPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ontdek de kracht van AI-gestuurd stijladvies
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            FitFi is een revolutionair platform dat AI gebruikt om jou te helpen je perfecte stijl te vinden, tijd te besparen en er altijd op je best uit te zien.
          </p>
        </div>

        {/* What is FitFi */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-16 transition-colors">
          <div className="p-8">
            <div className="flex items-center mb-6">
              <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full mr-4">
                <Shirt className="text-orange-500" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Wat is FitFi?
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-6">
              FitFi is jouw persoonlijke stijlassistent die AI-technologie combineert met mode-expertise om je te helpen kleding te vinden die perfect bij je past.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              Anders dan traditionele webshops of stylisten, analyseert FitFi jouw unieke voorkeuren, lichaamsbouw en levensstijl om gepersonaliseerde outfits samen te stellen die echt bij je passen.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Of je nu op zoek bent naar dagelijkse outfits, werkkleding of speciale gelegenheden - FitFi helpt je tijd te besparen en zelfverzekerder te voelen in wat je draagt.
            </p>
          </div>
        </div>

        {/* Key Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-10">
            Belangrijkste functies
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md transition-all hover:shadow-lg">
              <div className="text-orange-500 mb-4">
                <Sparkles size={28} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                AI-gestuurde stijlanalyse
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Onze geavanceerde AI analyseert duizenden modecombinaties en jouw unieke voorkeuren om de perfecte match te vinden.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600 dark:text-gray-400">Persoonlijke stijlprofiel</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600 dark:text-gray-400">Lichaamsbouw analyse</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600 dark:text-gray-400">Kleuranalyse</span>
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md transition-all hover:shadow-lg">
              <div className="text-orange-500 mb-4">
                <Clock size={28} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Tijdbesparende oplossingen
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Stop met eindeloos zoeken. FitFi bespaart je uren door direct de beste opties voor jou te selecteren.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600 dark:text-gray-400">Complete outfits in één klik</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600 dark:text-gray-400">Directe winkellinks</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600 dark:text-gray-400">Seizoensgebonden updates</span>
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md transition-all hover:shadow-lg">
              <div className="text-orange-500 mb-4">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Privacy-eerst aanpak
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Je gegevens en foto's worden versleuteld en nooit gedeeld met derden zonder jouw toestemming.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600 dark:text-gray-400">End-to-end encryptie</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600 dark:text-gray-400">Volledige controle over je data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600 dark:text-gray-400">GDPR-compliant</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-gradient-to-r from-orange-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-8 mb-16 transition-colors">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Voordelen van FitFi
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/80 dark:bg-gray-800/80 p-6 rounded-lg shadow-sm backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <span className="text-orange-500 mr-2">01</span>
                Persoonlijke pasvorm
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Kleding die echt bij jouw lichaamsbouw past, voor maximaal comfort en een vleiende look.
              </p>
            </div>
            
            <div className="bg-white/80 dark:bg-gray-800/80 p-6 rounded-lg shadow-sm backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <span className="text-orange-500 mr-2">02</span>
                Stijlvertrouwen
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Voel je zelfverzekerder met outfits die perfect passen bij jouw persoonlijke stijl.
              </p>
            </div>
            
            <div className="bg-white/80 dark:bg-gray-800/80 p-6 rounded-lg shadow-sm backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <span className="text-orange-500 mr-2">03</span>
                Tijdbesparing
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Geen uren meer spenderen aan zoeken en passen - krijg direct outfits die bij je passen.
              </p>
            </div>
            
            <div className="bg-white/80 dark:bg-gray-800/80 p-6 rounded-lg shadow-sm backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <span className="text-orange-500 mr-2">04</span>
                Garderobe optimalisatie
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Ontdek hoe je bestaande kledingstukken beter kunt combineren en waar je slim in kunt investeren.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Klaar om je stijl te transformeren?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Begin vandaag nog met FitFi en ontdek hoe eenvoudig het is om er altijd op je best uit te zien.
          </p>
          <Button 
            as={Link}
            to="/onboarding" 
            variant="primary"
            size="lg"
            icon={<ArrowRight size={20} />}
            iconPosition="right"
            className="hover-lift transition-transform shadow-lg hover:shadow-xl"
          >
            Probeer nu gratis
          </Button>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            Geen creditcard vereist • Gratis te gebruiken
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;