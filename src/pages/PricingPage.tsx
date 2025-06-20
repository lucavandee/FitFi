import React from 'react';
import { Link } from 'react-router-dom';
import { Check, X, ArrowRight, Zap, Crown, ShieldCheck, Clock, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';

const PricingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Transparante prijzen voor elke stijlzoeker
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Of je nu net begint met het ontdekken van je stijl of op zoek bent naar geavanceerde styling opties, wij hebben een passend abonnement voor jou.
          </p>
        </div>

        {/* Pricing Toggle - Monthly/Yearly */}
        <div className="flex justify-center mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-full p-1 inline-flex shadow-sm">
            <button className="px-6 py-2 rounded-full bg-orange-500 text-white font-medium">
              Maandelijks
            </button>
            <button className="px-6 py-2 rounded-full text-gray-700 dark:text-gray-300 font-medium">
              Jaarlijks (20% korting)
            </button>
          </div>
        </div>

        {/* Pricing Tiers */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Free Tier */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Basis</h2>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">€0</span>
                <span className="ml-1 text-gray-500 dark:text-gray-400">/maand</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Perfect om FitFi uit te proberen en je stijl te ontdekken.
              </p>
              
              <Button 
                as={Link}
                to="/onboarding" 
                variant="outline" 
                fullWidth
                className="mb-8"
              >
                Gratis starten
              </Button>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-600 dark:text-gray-400">Basis stijlvragenlijst</span>
                </div>
                <div className="flex items-start">
                  <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-600 dark:text-gray-400">1 foto-upload per maand</span>
                </div>
                <div className="flex items-start">
                  <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-600 dark:text-gray-400">3 outfit aanbevelingen</span>
                </div>
                <div className="flex items-start">
                  <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-600 dark:text-gray-400">Basis stijltips</span>
                </div>
                <div className="flex items-start">
                  <X className="text-gray-300 dark:text-gray-600 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-400 dark:text-gray-500">Geavanceerde stijlanalyse</span>
                </div>
                <div className="flex items-start">
                  <X className="text-gray-300 dark:text-gray-600 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-400 dark:text-gray-500">Seizoensgebonden updates</span>
                </div>
                <div className="flex items-start">
                  <X className="text-gray-300 dark:text-gray-600 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-400 dark:text-gray-500">Prioriteit ondersteuning</span>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Tier */}
          <div className="bg-orange-50 dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border-2 border-orange-500 relative transition-all hover:shadow-xl transform hover:scale-[1.02]">
            <div className="absolute top-0 right-0 bg-orange-500 text-white px-4 py-1 text-xs font-bold uppercase rounded-bl-lg">
              Populair
            </div>
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Premium</h2>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">€12,99</span>
                <span className="ml-1 text-gray-500 dark:text-gray-400">/maand</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Voor wie serieus is over stijl en het maximale uit FitFi wil halen.
              </p>
              
              <Button 
                as={Link}
                to="/onboarding?plan=premium" 
                variant="primary" 
                fullWidth
                className="mb-8"
              >
                Start premium proefperiode
              </Button>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-600 dark:text-gray-400">Geavanceerde stijlvragenlijst</span>
                </div>
                <div className="flex items-start">
                  <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-600 dark:text-gray-400">Onbeperkte foto-uploads</span>
                </div>
                <div className="flex items-start">
                  <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-600 dark:text-gray-400">Onbeperkte outfit aanbevelingen</span>
                </div>
                <div className="flex items-start">
                  <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-600 dark:text-gray-400">Gedetailleerd styling advies</span>
                </div>
                <div className="flex items-start">
                  <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-600 dark:text-gray-400">Seizoensgebonden garderobe updates</span>
                </div>
                <div className="flex items-start">
                  <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-600 dark:text-gray-400">Prioriteit ondersteuning</span>
                </div>
                <div className="flex items-start">
                  <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-600 dark:text-gray-400">Exclusieve kortingen bij partners</span>
                </div>
              </div>
            </div>
          </div>

          {/* Business Tier */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Business</h2>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">€29,99</span>
                <span className="ml-1 text-gray-500 dark:text-gray-400">/maand</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Voor professionals en bedrijven in de mode-industrie.
              </p>
              
              <Button 
                as={Link}
                to="/contact?plan=business" 
                variant="outline" 
                fullWidth
                className="mb-8"
              >
                Neem contact op
              </Button>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-600 dark:text-gray-400">Alles uit het Premium pakket</span>
                </div>
                <div className="flex items-start">
                  <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-600 dark:text-gray-400">API-toegang voor integraties</span>
                </div>
                <div className="flex items-start">
                  <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-600 dark:text-gray-400">White-label oplossingen</span>
                </div>
                <div className="flex items-start">
                  <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-600 dark:text-gray-400">Geavanceerde analytics</span>
                </div>
                <div className="flex items-start">
                  <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-600 dark:text-gray-400">Dedicated accountmanager</span>
                </div>
                <div className="flex items-start">
                  <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-600 dark:text-gray-400">Aangepaste rapportages</span>
                </div>
                <div className="flex items-start">
                  <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-600 dark:text-gray-400">Onbeperkte gebruikers</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-16 transition-colors">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
              Vergelijk alle functies
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 px-4 font-medium text-gray-500 dark:text-gray-400">Functie</th>
                    <th className="text-center py-4 px-4 font-medium text-gray-500 dark:text-gray-400">Basis</th>
                    <th className="text-center py-4 px-4 font-medium text-orange-500">Premium</th>
                    <th className="text-center py-4 px-4 font-medium text-gray-500 dark:text-gray-400">Business</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-4 px-4 text-gray-900 dark:text-white">Stijlvragenlijst</td>
                    <td className="py-4 px-4 text-center">Basis</td>
                    <td className="py-4 px-4 text-center text-orange-500 font-medium">Geavanceerd</td>
                    <td className="py-4 px-4 text-center">Aangepast</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-4 px-4 text-gray-900 dark:text-white">Foto-uploads</td>
                    <td className="py-4 px-4 text-center">1 per maand</td>
                    <td className="py-4 px-4 text-center text-orange-500 font-medium">Onbeperkt</td>
                    <td className="py-4 px-4 text-center">Onbeperkt</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-4 px-4 text-gray-900 dark:text-white">Outfit aanbevelingen</td>
                    <td className="py-4 px-4 text-center">3 per maand</td>
                    <td className="py-4 px-4 text-center text-orange-500 font-medium">Onbeperkt</td>
                    <td className="py-4 px-4 text-center">Onbeperkt</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-4 px-4 text-gray-900 dark:text-white">Stijladvies</td>
                    <td className="py-4 px-4 text-center">Basis</td>
                    <td className="py-4 px-4 text-center text-orange-500 font-medium">Gedetailleerd</td>
                    <td className="py-4 px-4 text-center">Op maat</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-4 px-4 text-gray-900 dark:text-white">Seizoensgebonden updates</td>
                    <td className="py-4 px-4 text-center">
                      <X className="inline text-gray-400" size={18} />
                    </td>
                    <td className="py-4 px-4 text-center text-orange-500">
                      <Check className="inline" size={18} />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Check className="inline text-green-500" size={18} />
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-4 px-4 text-gray-900 dark:text-white">Prioriteit ondersteuning</td>
                    <td className="py-4 px-4 text-center">
                      <X className="inline text-gray-400" size={18} />
                    </td>
                    <td className="py-4 px-4 text-center text-orange-500">
                      <Check className="inline" size={18} />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Check className="inline text-green-500" size={18} />
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-4 px-4 text-gray-900 dark:text-white">Exclusieve kortingen</td>
                    <td className="py-4 px-4 text-center">
                      <X className="inline text-gray-400" size={18} />
                    </td>
                    <td className="py-4 px-4 text-center text-orange-500">
                      <Check className="inline" size={18} />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Check className="inline text-green-500" size={18} />
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-4 px-4 text-gray-900 dark:text-white">API-toegang</td>
                    <td className="py-4 px-4 text-center">
                      <X className="inline text-gray-400" size={18} />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <X className="inline text-gray-400" size={18} />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Check className="inline text-green-500" size={18} />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 text-gray-900 dark:text-white">Dedicated accountmanager</td>
                    <td className="py-4 px-4 text-center">
                      <X className="inline text-gray-400" size={18} />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <X className="inline text-gray-400" size={18} />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Check className="inline text-green-500" size={18} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Why Premium */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-10">
            Waarom kiezen voor Premium?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Reason 1 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md transition-all hover:shadow-lg">
              <div className="flex items-start">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full mr-4">
                  <Zap className="text-orange-500" size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Onbeperkte mogelijkheden
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Krijg onbeperkte toegang tot alle functies en aanbevelingen, zodat je je stijl volledig kunt verkennen.
                  </p>
                </div>
              </div>
            </div>

            {/* Reason 2 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md transition-all hover:shadow-lg">
              <div className="flex items-start">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full mr-4">
                  <Crown className="text-orange-500" size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Premium ervaring
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Geniet van een reclamevrije ervaring met prioriteit ondersteuning en exclusieve functies.
                  </p>
                </div>
              </div>
            </div>

            {/* Reason 3 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md transition-all hover:shadow-lg">
              <div className="flex items-start">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full mr-4">
                  <ShieldCheck className="text-orange-500" size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Geavanceerde beveiliging
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Premium gebruikers krijgen extra beveiligingslagen voor hun gegevens en uploads.
                  </p>
                </div>
              </div>
            </div>

            {/* Reason 4 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md transition-all hover:shadow-lg">
              <div className="flex items-start">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full mr-4">
                  <Clock className="text-orange-500" size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Altijd up-to-date
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Ontvang seizoensgebonden updates en blijf op de hoogte van de nieuwste trends die bij jouw stijl passen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-16 transition-colors">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
              Veelgestelde vragen over abonnementen
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Kan ik mijn abonnement op elk moment opzeggen?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Ja, je kunt je Premium abonnement op elk moment opzeggen. Je behoudt toegang tot alle Premium functies tot het einde van je huidige factureringsperiode.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Is er een proefperiode voor Premium?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Ja, we bieden een gratis proefperiode van 14 dagen voor ons Premium abonnement. Je kunt alle functies uitproberen zonder verplichtingen.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Wat gebeurt er met mijn gegevens als ik downgrade?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Als je van Premium naar Basis gaat, blijven al je gegevens en voorkeuren bewaard. Je verliest alleen toegang tot Premium functies zoals onbeperkte aanbevelingen.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Kan ik wisselen tussen maandelijks en jaarlijks?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Ja, je kunt op elk moment wisselen tussen maandelijkse en jaarlijkse facturering. Bij overstap naar jaarlijks profiteer je direct van de korting.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Klaar om je stijl naar het volgende niveau te tillen?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Begin vandaag nog met FitFi en ontdek hoe eenvoudig het is om er altijd op je best uit te zien.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              as={Link}
              to="/onboarding" 
              variant="outline"
              size="lg"
            >
              Gratis starten
            </Button>
            <Button 
              as={Link}
              to="/onboarding?plan=premium" 
              variant="primary"
              size="lg"
              icon={<Sparkles size={20} />}
              iconPosition="left"
            >
              Premium proberen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;