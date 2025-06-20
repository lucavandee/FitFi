import React from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Camera, 
  Zap, 
  ShoppingBag, 
  ArrowRight,
  CheckCircle,
  Clock,
  Smartphone,
  Sparkles
} from 'lucide-react';
import Button from '../components/ui/Button';

const HowItWorksPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Hoe FitFi werkt
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            In vier eenvoudige stappen helpen we je jouw perfecte stijl te ontdekken en te shoppen. Geen gedoe, geen twijfel - alleen kleding die echt bij je past.
          </p>
        </div>

        {/* Step 1 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-12 transition-colors">
          <div className="md:flex">
            <div className="md:w-1/2 p-8">
              <div className="flex items-center mb-6">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full mr-4">
                  <User className="text-orange-500" size={24} />
                </div>
                <div>
                  <span className="text-orange-500 font-bold">Stap 1</span>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Vul je stijlprofiel in
                  </h2>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-6">
                Beantwoord enkele vragen over je stijlvoorkeuren, lichaamsbouw en levensstijl. Onze intuïtieve vragenlijst maakt het eenvoudig om je persoonlijkheid te laten zien.
              </p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-900 dark:text-white">Persoonlijke voorkeuren</span> - Geef aan welke stijlen, kleuren en patronen je aanspreken
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-900 dark:text-white">Gelegenheden</span> - Vertel ons voor welke situaties je kleding zoekt
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-900 dark:text-white">Comfort prioriteiten</span> - Geef aan wat voor jou belangrijk is in dagelijkse kleding
                  </p>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 bg-gray-100 dark:bg-gray-700 flex items-center justify-center p-8">
              <img 
                src="https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2" 
                alt="Stijlprofiel invullen" 
                className="rounded-lg shadow-md max-h-80 object-cover"
              />
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-12 transition-colors">
          <div className="md:flex flex-row-reverse">
            <div className="md:w-1/2 p-8">
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full mr-4">
                  <Camera className="text-blue-500" size={24} />
                </div>
                <div>
                  <span className="text-blue-500 font-bold">Stap 2</span>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Upload een foto (optioneel)
                  </h2>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-6">
                Voor nog nauwkeurigere aanbevelingen kun je een foto uploaden. Onze AI analyseert je lichaamsbouw en huidige stijl om perfecte matches te vinden.
              </p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-900 dark:text-white">Veilige verwerking</span> - Je foto wordt end-to-end versleuteld en nooit gedeeld
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-900 dark:text-white">Lichaamsbouw analyse</span> - Onze AI herkent welke stijlen jou flatteren
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-900 dark:text-white">Volledig optioneel</span> - Je krijgt ook zonder foto goede aanbevelingen
                  </p>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 bg-gray-100 dark:bg-gray-700 flex items-center justify-center p-8">
              <img 
                src="https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2" 
                alt="Foto uploaden" 
                className="rounded-lg shadow-md max-h-80 object-cover"
              />
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-12 transition-colors">
          <div className="md:flex">
            <div className="md:w-1/2 p-8">
              <div className="flex items-center mb-6">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full mr-4">
                  <Zap className="text-purple-500" size={24} />
                </div>
                <div>
                  <span className="text-purple-500 font-bold">Stap 3</span>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Ontvang gepersonaliseerde aanbevelingen
                  </h2>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-6">
                Onze AI verwerkt je voorkeuren en genereert direct outfits die perfect bij jou passen. Bekijk complete looks of individuele items.
              </p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-900 dark:text-white">Complete outfits</span> - Perfecte combinaties voor elke gelegenheid
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-900 dark:text-white">Match percentages</span> - Zie hoe goed elke aanbeveling bij je past
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-900 dark:text-white">Stijltips</span> - Krijg advies over hoe je items het beste draagt
                  </p>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 bg-gray-100 dark:bg-gray-700 flex items-center justify-center p-8">
              <img 
                src="https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2" 
                alt="Gepersonaliseerde aanbevelingen" 
                className="rounded-lg shadow-md max-h-80 object-cover"
              />
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-16 transition-colors">
          <div className="md:flex flex-row-reverse">
            <div className="md:w-1/2 p-8">
              <div className="flex items-center mb-6">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full mr-4">
                  <ShoppingBag className="text-green-500" size={24} />
                </div>
                <div>
                  <span className="text-green-500 font-bold">Stap 4</span>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Shop via onze partners
                  </h2>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-6">
                Vind je iets dat je leuk vindt? Met één klik word je doorgestuurd naar onze betrouwbare retailpartners om je aankoop te voltooien.
              </p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-900 dark:text-white">Directe links</span> - Shop bij bekende Nederlandse retailers
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-900 dark:text-white">Veilig winkelen</span> - Alle partners zijn zorgvuldig geselecteerd
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-900 dark:text-white">Prijsvergelijking</span> - Vind de beste deals voor jouw favoriete items
                  </p>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 bg-gray-100 dark:bg-gray-700 flex items-center justify-center p-8">
              <img 
                src="https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2" 
                alt="Online winkelen" 
                className="rounded-lg shadow-md max-h-80 object-cover"
              />
            </div>
          </div>
        </div>

        {/* Additional Benefits */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-10">
            Extra voordelen
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md transition-all hover:shadow-lg">
              <div className="text-orange-500 mb-4">
                <Clock size={28} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Tijdbesparend
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Bespaar gemiddeld 5 uur per maand aan zoeken en winkelen. FitFi doet het werk voor je.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md transition-all hover:shadow-lg">
              <div className="text-orange-500 mb-4">
                <Smartphone size={28} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Altijd beschikbaar
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Toegang tot je persoonlijke stijladvies wanneer en waar je maar wilt, direct op je telefoon.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md transition-all hover:shadow-lg">
              <div className="text-orange-500 mb-4">
                <Sparkles size={28} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Continu lerende AI
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Hoe meer je FitFi gebruikt, hoe beter de aanbevelingen worden. Onze AI leert van jouw feedback.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-700 dark:to-orange-800 rounded-xl shadow-md overflow-hidden transition-colors">
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Klaar om je stijlreis te beginnen?
            </h2>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Ontdek in slechts enkele minuten outfits die perfect bij jou passen. Geen verplichtingen, geen kosten.
            </p>
            <Button 
              as={Link}
              to="/onboarding" 
              variant="secondary"
              size="lg"
              className="bg-white text-orange-600 hover:bg-gray-100"
              icon={<ArrowRight size={20} />}
              iconPosition="right"
            >
              Start je stijlreis
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;