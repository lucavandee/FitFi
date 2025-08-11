import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  User,
  CreditCard,
  ShoppingBag,
  Shirt,
  Camera,
  Shield,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import Button from '../components/ui/Button';

const HelpCenterPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Helpcentrum
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
            Vind antwoorden op al je vragen over FitFi. Doorzoek onze kennisbank of blader door categorieën.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Zoek in helpcentrum..."
                  className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                />
                <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <button
                  type="submit"
                  className="absolute right-3 top-2.5 bg-orange-500 text-white px-4 py-1 rounded-md hover:bg-orange-600 transition-colors"
                >
                  Zoeken
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Popular Topics */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Populaire onderwerpen
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Topic 1 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
              <div className="p-6">
                <div className="flex items-start">
                  <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full mr-4">
                    <User className="text-orange-500" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Account beheren
                    </h3>
                    <ul className="space-y-2">
                      <li>
                        <Link to="/help/account/create" className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors flex items-center">
                          <ChevronRight size={16} className="mr-1" />
                          Account aanmaken
                        </Link>
                      </li>
                      <li>
                        <Link to="/help/account/password" className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors flex items-center">
                          <ChevronRight size={16} className="mr-1" />
                          Wachtwoord wijzigen
                        </Link>
                      </li>
                      <li>
                        <Link to="/help/account/delete" className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors flex items-center">
                          <ChevronRight size={16} className="mr-1" />
                          Account verwijderen
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Topic 2 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
              <div className="p-6">
                <div className="flex items-start">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full mr-4">
                    <CreditCard className="text-blue-500" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Betalingen & Abonnementen
                    </h3>
                    <ul className="space-y-2">
                      <li>
                        <Link to="/help/billing/plans" className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors flex items-center">
                          <ChevronRight size={16} className="mr-1" />
                          Abonnementen vergelijken
                        </Link>
                      </li>
                      <li>
                        <Link to="/help/billing/payment" className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors flex items-center">
                          <ChevronRight size={16} className="mr-1" />
                          Betaalmethoden
                        </Link>
                      </li>
                      <li>
                        <Link to="/help/billing/cancel" className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors flex items-center">
                          <ChevronRight size={16} className="mr-1" />
                          Abonnement opzeggen
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Topic 3 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
              <div className="p-6">
                <div className="flex items-start">
                  <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full mr-4">
                    <Shirt className="text-green-500" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Stijladvies
                    </h3>
                    <ul className="space-y-2">
                      <li>
                        <Link to="/help/styling/quiz" className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors flex items-center">
                          <ChevronRight size={16} className="mr-1" />
                          Stijlvragenlijst
                        </Link>
                      </li>
                      <li>
                        <Link to="/help/styling/recommendations" className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors flex items-center">
                          <ChevronRight size={16} className="mr-1" />
                          Aanbevelingen begrijpen
                        </Link>
                      </li>
                      <li>
                        <Link to="/help/styling/feedback" className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors flex items-center">
                          <ChevronRight size={16} className="mr-1" />
                          Feedback geven
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* All Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-16 transition-colors">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              Alle categorieën
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Category 1 */}
              <div>
                <div className="flex items-center mb-4">
                  <User className="text-orange-500 mr-3" size={20} />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Account & Profiel
                  </h3>
                </div>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>
                    <Link to="/help/account/create" className="hover:text-orange-500 transition-colors">
                      Account aanmaken
                    </Link>
                  </li>
                  <li>
                    <Link to="/help/account/login" className="hover:text-orange-500 transition-colors">
                      Inlogproblemen
                    </Link>
                  </li>
                  <li>
                    <Link to="/help/account/profile" className="hover:text-orange-500 transition-colors">
                      Profiel bewerken
                    </Link>
                  </li>
                  <li>
                    <Link to="/help/account/preferences" className="hover:text-orange-500 transition-colors">
                      Stijlvoorkeuren
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Category 2 */}
              <div>
                <div className="flex items-center mb-4">
                  <CreditCard className="text-blue-500 mr-3" size={20} />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Betalingen & Abonnementen
                  </h3>
                </div>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>
                    <Link to="/help/billing/plans" className="hover:text-orange-500 transition-colors">
                      Abonnementen vergelijken
                    </Link>
                  </li>
                  <li>
                    <Link to="/help/billing/payment" className="hover:text-orange-500 transition-colors">
                      Betaalmethoden
                    </Link>
                  </li>
                  <li>
                    <Link to="/help/billing/invoice" className="hover:text-orange-500 transition-colors">
                      Facturen
                    </Link>
                  </li>
                  <li>
                    <Link to="/help/billing/cancel" className="hover:text-orange-500 transition-colors">
                      Abonnement opzeggen
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Category 3 */}
              <div>
                <div className="flex items-center mb-4">
                  <Shirt className="text-green-500 mr-3" size={20} />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Stijladvies
                  </h3>
                </div>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>
                    <Link to="/help/styling/quiz" className="hover:text-orange-500 transition-colors">
                      Stijlvragenlijst
                    </Link>
                  </li>
                  <li>
                    <Link to="/help/styling/recommendations" className="hover:text-orange-500 transition-colors">
                      Aanbevelingen begrijpen
                    </Link>
                  </li>
                  <li>
                    <Link to="/help/styling/feedback" className="hover:text-orange-500 transition-colors">
                      Feedback geven
                    </Link>
                  </li>
                  <li>
                    <Link to="/help/styling/save" className="hover:text-orange-500 transition-colors">
                      Outfits opslaan
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Category 4 */}
              <div>
                <div className="flex items-center mb-4">
                  <ShoppingBag className="text-purple-500 mr-3" size={20} />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Winkelen
                  </h3>
                </div>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>
                    <Link to="/help/shopping/retailers" className="hover:text-orange-500 transition-colors">
                      Partnerretailers
                    </Link>
                  </li>
                  <li>
                    <Link to="/help/shopping/purchase" className="hover:text-orange-500 transition-colors">
                      Aankopen doen
                    </Link>
                  </li>
                  <li>
                    <Link to="/help/shopping/returns" className="hover:text-orange-500 transition-colors">
                      Retourbeleid
                    </Link>
                  </li>
                  <li>
                    <Link to="/help/shopping/discounts" className="hover:text-orange-500 transition-colors">
                      Kortingen & aanbiedingen
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Category 5 */}
              <div>
                <div className="flex items-center mb-4">
                  <Camera className="text-red-500 mr-3" size={20} />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Foto's & Uploads
                  </h3>
                </div>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>
                    <Link to="/help/photos/upload" className="hover:text-orange-500 transition-colors">
                      Foto's uploaden
                    </Link>
                  </li>
                  <li>
                    <Link to="/help/photos/requirements" className="hover:text-orange-500 transition-colors">
                      Foto-eisen
                    </Link>
                  </li>
                  <li>
                    <Link to="/help/photos/delete" className="hover:text-orange-500 transition-colors">
                      Foto's verwijderen
                    </Link>
                  </li>
                  <li>
                    <Link to="/help/photos/privacy" className="hover:text-orange-500 transition-colors">
                      Foto privacy
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Category 6 */}
              <div>
                <div className="flex items-center mb-4">
                  <Shield className="text-indigo-500 mr-3" size={20} />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Privacy & Veiligheid
                  </h3>
                </div>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>
                    <Link to="/help/privacy/data" className="hover:text-orange-500 transition-colors">
                      Gegevensbeheer
                    </Link>
                  </li>
                  <li>
                    <Link to="/help/privacy/security" className="hover:text-orange-500 transition-colors">
                      Beveiligingsinstellingen
                    </Link>
                  </li>
                  <li>
                    <Link to="/help/privacy/gdpr" className="hover:text-orange-500 transition-colors">
                      GDPR & AVG
                    </Link>
                  </li>
                  <li>
                    <Link to="/help/privacy/delete" className="hover:text-orange-500 transition-colors">
                      Gegevens verwijderen
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-700 dark:to-orange-800 rounded-xl shadow-md overflow-hidden transition-colors mb-16">
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Geen antwoord gevonden?
            </h2>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Ons supportteam staat klaar om je te helpen met al je vragen. Neem direct contact met ons op.
            </p>
            <Button 
              as={Link}
              to="/contact" 
              variant="secondary"
              size="lg"
              className="bg-white text-orange-600 hover:bg-gray-100"
              icon={<ArrowRight size={20} />}
              iconPosition="right"
            >
              Neem contact op
            </Button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Snelle links
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/faq" className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors">
              Veelgestelde vragen
            </Link>
            <span className="text-gray-400 dark:text-gray-600">•</span>
            <Link to="/privacy-policy" className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors">
              Privacybeleid
            </Link>
            <span className="text-gray-400 dark:text-gray-600">•</span>
            <Link to="/terms" className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors">
              Algemene voorwaarden
            </Link>
            <span className="text-gray-400 dark:text-gray-600">•</span>
            <Link to="/contact" className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;