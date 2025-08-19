import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  Clock, 
  ArrowRight, 
  HelpCircle,
  FileText,
  Video,
  BookOpen
} from 'lucide-react';
import Button from '../components/ui/Button';

const SupportPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ondersteuning
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            We staan voor je klaar om je te helpen met al je vragen over FitFi. Vind snel antwoorden of neem direct contact met ons op.
          </p>
        </div>

        {/* Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Chat */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
            <div className="p-6">
              <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <MessageCircle className="text-orange-500" size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Live Chat
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Chat direct met ons supportteam voor snelle antwoorden op al je vragen.
              </p>
              <div className="mb-4">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                  <Clock size={16} className="mr-2" />
                  <span>Beschikbaarheid</span>
                </div>
                <p className="text-gray-900 dark:text-white">
                  Ma-Vr: 9:00 - 18:00<br />
                  Za: 10:00 - 16:00<br />
                  Zo: Gesloten
                </p>
              </div>
              <Button 
                variant="primary"
                fullWidth
                icon={<MessageCircle size={16} />}
                iconPosition="left"
              >
                Start chat
              </Button>
            </div>
          </div>

          {/* Email */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
            <div className="p-6">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Mail className="text-blue-500" size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                E-mail
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Stuur ons een e-mail voor uitgebreidere vragen of feedback. We reageren binnen 24 uur.
              </p>
              <div className="mb-4">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                  <Clock size={16} className="mr-2" />
                  <span>Reactietijd</span>
                </div>
                <p className="text-gray-900 dark:text-white">
                  Meestal binnen 24 uur<br />
                  Premium: binnen 12 uur<br />
                  Business: binnen 4 uur
                </p>
              </div>
              <Button 
                as="a"
                href="mailto:support@fitfi.nl"
                variant="outline"
                fullWidth
                icon={<Mail size={16} />}
                iconPosition="left"
              >
                E-mail ons
              </Button>
            </div>
          </div>

          {/* Phone */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
            <div className="p-6">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Phone className="text-green-500" size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Telefoon
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Liever persoonlijk contact? Bel ons voor directe ondersteuning bij complexe vragen.
              </p>
              <div className="mb-4">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                  <Clock size={16} className="mr-2" />
                  <span>Beschikbaarheid</span>
                </div>
                <p className="text-gray-900 dark:text-white">
                  Ma-Vr: 9:00 - 17:00<br />
                  Za-Zo: Gesloten<br />
                  <span className="text-sm text-gray-500 dark:text-gray-400">(Premium & Business only)</span>
                </p>
              </div>
              <Button 
                as="a"
                href="tel:+31201234567"
                variant="outline"
                fullWidth
                icon={<Phone size={16} />}
                iconPosition="left"
              >
                +31 20 123 4567
              </Button>
            </div>
          </div>
        </div>

        {/* Self-Help Resources */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-10">
            Zelfhulp bronnen
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Help Center */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
              <div className="p-6">
                <div className="flex items-start">
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full mr-4">
                    <HelpCircle className="text-purple-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      Helpcentrum
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Vind antwoorden op veelgestelde vragen en gedetailleerde handleidingen voor alle FitFi functies.
                    </p>
                    <Button 
                      as={Link}
                      to="/help-center" 
                      variant="outline"
                      icon={<ArrowRight size={16} />}
                      iconPosition="right"
                    >
                      Bezoek helpcentrum
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Knowledge Base */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
              <div className="p-6">
                <div className="flex items-start">
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full mr-4">
                    <BookOpen className="text-yellow-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      Kennisbank
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Uitgebreide artikelen over mode, stijl en hoe je het meeste uit FitFi kunt halen.
                    </p>
                    <Button 
                      as={Link}
                      to="/knowledge-base" 
                      variant="outline"
                      icon={<ArrowRight size={16} />}
                      iconPosition="right"
                    >
                      Verken kennisbank
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Tutorials */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
              <div className="p-6">
                <div className="flex items-start">
                  <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full mr-4">
                    <Video className="text-red-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      Video tutorials
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Visuele handleidingen die je stap voor stap door alle FitFi functies leiden.
                    </p>
                    <Button 
                      as={Link}
                      to="/tutorials" 
                      variant="outline"
                      icon={<ArrowRight size={16} />}
                      iconPosition="right"
                    >
                      Bekijk tutorials
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Documentation */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
              <div className="p-6">
                <div className="flex items-start">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full mr-4">
                    <FileText className="text-blue-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      Documentatie
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Technische documentatie voor ontwikkelaars en Business gebruikers van onze API.
                    </p>
                    <Button 
                      as={Link}
                      to="/docs" 
                      variant="outline"
                      icon={<ArrowRight size={16} />}
                      iconPosition="right"
                    >
                      Lees documentatie
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-16 transition-colors">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
              Veelgestelde vragen
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Hoe nauwkeurig zijn de stijlaanbevelingen?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Onze AI-algoritmen zijn getraind op duizenden mode-items en stijlvoorkeuren. De nauwkeurigheid verbetert naarmate je meer feedback geeft op aanbevelingen. Premium gebruikers krijgen toegang tot geavanceerde analyses voor nog nauwkeurigere resultaten.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Hoe worden mijn foto's gebruikt en opgeslagen?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Je foto's worden end-to-end versleuteld en alleen gebruikt voor stijlanalyse. Ze worden nooit gedeeld met derden zonder jouw expliciete toestemming. Je kunt je foto's op elk moment verwijderen via je privacy-instellingen.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Kan ik mijn abonnement op elk moment opzeggen?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Ja, je kunt je Premium abonnement op elk moment opzeggen. Je behoudt toegang tot alle Premium functies tot het einde van je huidige factureringsperiode. Er zijn geen verborgen kosten of opzegtermijnen.
                </p>
              </div>
              
              <div className="text-center mt-8">
                <Button 
                  as={Link}
                  to="/faq" 
                  variant="outline"
                >
                  Bekijk alle veelgestelde vragen
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Support Team */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-10">
            Ons supportteam
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Team Member 1 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md text-center transition-all hover:shadow-lg">
              <img 
                src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2" 
                alt="Emma" 
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Emma
              </h3>
              <p className="text-orange-500 font-medium text-sm mb-3">
                Support Manager
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                "Ik help je graag met al je vragen over je account en abonnement."
              </p>
            </div>

            {/* Team Member 2 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md text-center transition-all hover:shadow-lg">
              <img 
                src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2" 
                alt="Thomas" 
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Thomas
              </h3>
              <p className="text-orange-500 font-medium text-sm mb-3">
                Stijlexpert
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                "Mijn specialiteit is het beantwoorden van al je vragen over stijladvies."
              </p>
            </div>

            {/* Team Member 3 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md text-center transition-all hover:shadow-lg">
              <img 
                src="https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2" 
                alt="Sophie" 
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Sophie
              </h3>
              <p className="text-orange-500 font-medium text-sm mb-3">
                Technisch Specialist
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                "Ik help je met technische problemen en vragen over de app."
              </p>
            </div>

            {/* Team Member 4 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md text-center transition-all hover:shadow-lg">
              <img 
                src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2" 
                alt="Jayden" 
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Jayden
              </h3>
              <p className="text-orange-500 font-medium text-sm mb-3">
                Business Consultant
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                "Ik adviseer Business klanten over integraties en API-gebruik."
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-700 dark:to-orange-800 rounded-xl shadow-md overflow-hidden transition-colors">
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Nog steeds vragen?
            </h2>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Ons vriendelijke supportteam staat klaar om je te helpen. Neem vandaag nog contact met ons op.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                as="a"
                href="mailto:support@fitfi.nl"
                variant="secondary"
                className="bg-white text-orange-600 hover:bg-gray-100"
                icon={<Mail size={20} />}
                iconPosition="left"
              >
                E-mail ons
              </Button>
              <Button 
                variant="outline"
                className="text-white border-white/30 hover:bg-white/10"
                icon={<MessageCircle size={20} />}
                iconPosition="left"
              >
                Start chat
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;