import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  User, 
  CreditCard, 
  ShoppingBag, 
  Shirt, 
  Camera, 
  Shield, 
  MessageCircle 
} from 'lucide-react';
import Button from '../components/ui/Button';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openFAQs, setOpenFAQs] = useState<number[]>([]);

  const faqData: FAQItem[] = [
    // Account & Registratie
    {
      question: "Hoe maak ik een account aan?",
      answer: "Je kunt eenvoudig een account aanmaken door op 'Aanmelden' te klikken in de rechterbovenhoek van de website. Vul je e-mailadres, naam en een wachtwoord in. Je ontvangt een bevestigingsmail om je account te activeren.",
      category: "account"
    },
    {
      question: "Kan ik mijn wachtwoord wijzigen?",
      answer: "Ja, je kunt je wachtwoord wijzigen via je accountinstellingen. Ga naar 'Dashboard' > 'Instellingen' > 'Wachtwoord wijzigen'. Als je je wachtwoord bent vergeten, klik dan op 'Wachtwoord vergeten' op de inlogpagina.",
      category: "account"
    },
    {
      question: "Hoe kan ik mijn account verwijderen?",
      answer: "Je kunt je account verwijderen via 'Dashboard' > 'Instellingen' > 'Account beheren' > 'Account verwijderen'. Let op: dit verwijdert permanent al je gegevens en kan niet ongedaan worden gemaakt.",
      category: "account"
    },
    
    // Betalingen & Abonnementen
    {
      question: "Welke betaalmethoden accepteren jullie?",
      answer: "We accepteren verschillende betaalmethoden, waaronder creditcards (Visa, Mastercard, American Express), iDEAL, PayPal en bankoverschrijvingen. De beschikbare betaalmethoden worden getoond tijdens het afrekenproces.",
      category: "billing"
    },
    {
      question: "Hoe kan ik mijn abonnement opzeggen?",
      answer: "Je kunt je abonnement op elk moment opzeggen via 'Dashboard' > 'Instellingen' > 'Abonnement' > 'Opzeggen'. Je behoudt toegang tot alle Premium functies tot het einde van je huidige factureringsperiode.",
      category: "billing"
    },
    {
      question: "Krijg ik een factuur voor mijn aankoop?",
      answer: "Ja, na elke betaling ontvang je automatisch een factuur per e-mail. Je kunt al je facturen ook bekijken en downloaden via 'Dashboard' > 'Instellingen' > 'Facturen'.",
      category: "billing"
    },
    
    // Stijladvies
    {
      question: "Hoe nauwkeurig zijn de stijlaanbevelingen?",
      answer: "Onze AI-algoritmen zijn getraind op duizenden mode-items en stijlvoorkeuren. De nauwkeurigheid verbetert naarmate je meer feedback geeft op aanbevelingen. Premium gebruikers krijgen toegang tot geavanceerde analyses voor nog nauwkeurigere resultaten.",
      category: "styling"
    },
    {
      question: "Kan ik mijn stijlvoorkeuren later aanpassen?",
      answer: "Ja, je kunt je stijlvoorkeuren op elk moment aanpassen via 'Dashboard' > 'Stijlvoorkeuren'. Je kunt ook de stijlvragenlijst opnieuw invullen voor een volledig nieuwe analyse.",
      category: "styling"
    },
    {
      question: "Hoe vaak worden de aanbevelingen bijgewerkt?",
      answer: "Basis gebruikers krijgen maandelijks nieuwe aanbevelingen. Premium gebruikers krijgen wekelijkse updates en seizoensgebonden vernieuwingen. Je kunt ook handmatig nieuwe aanbevelingen genereren door je voorkeuren aan te passen.",
      category: "styling"
    },
    
    // Winkelen
    {
      question: "Hoe werken de winkellinks?",
      answer: "Wanneer je op een aanbevolen item klikt, word je doorgestuurd naar de website van de retailer waar je het item kunt kopen. FitFi verkoopt zelf geen producten, maar verbindt je met betrouwbare retailers.",
      category: "shopping"
    },
    {
      question: "Zijn de prijzen actueel?",
      answer: "We streven ernaar om actuele prijzen te tonen, maar deze kunnen soms afwijken van de prijzen op de website van de retailer. De definitieve prijs wordt altijd getoond op de website van de retailer voordat je een aankoop doet.",
      category: "shopping"
    },
    {
      question: "Wat als een item niet meer beschikbaar is?",
      answer: "Als een item niet meer beschikbaar is, proberen we vergelijkbare alternatieven aan te bieden. Je kunt ook feedback geven op niet-beschikbare items, zodat we onze database kunnen updaten.",
      category: "shopping"
    },
    
    // Foto's & Uploads
    {
      question: "Hoe worden mijn foto's gebruikt?",
      answer: "Je foto's worden uitsluitend gebruikt om je lichaamsbouw en huidige stijl te analyseren voor betere aanbevelingen. Ze worden end-to-end versleuteld en nooit gedeeld met derden zonder jouw expliciete toestemming.",
      category: "photos"
    },
    {
      question: "Welk soort foto's moet ik uploaden?",
      answer: "Voor de beste resultaten, upload een foto van jezelf in staande positie, bij voorkeur in strakke maar comfortabele kleding. De foto moet goed belicht zijn en je hele lichaam tonen. Meerdere hoeken geven de meest nauwkeurige analyse.",
      category: "photos"
    },
    {
      question: "Kan ik mijn foto's verwijderen?",
      answer: "Ja, je kunt je foto's op elk moment verwijderen via 'Dashboard' > 'Privacy' > 'Mijn foto's beheren'. Verwijderde foto's worden permanent uit onze systemen verwijderd.",
      category: "photos"
    },
    
    // Privacy & Veiligheid
    {
      question: "Hoe beschermen jullie mijn gegevens?",
      answer: "We nemen gegevensbescherming zeer serieus. Al je gegevens worden versleuteld opgeslagen, en we volgen strikte beveiligingsprotocollen. We verkopen of delen je gegevens nooit zonder jouw expliciete toestemming. Lees ons privacybeleid voor meer details.",
      category: "privacy"
    },
    {
      question: "Kan ik al mijn gegevens downloaden?",
      answer: "Ja, in overeenstemming met de AVG/GDPR kun je al je gegevens downloaden via 'Dashboard' > 'Privacy' > 'Mijn gegevens downloaden'. Je ontvangt een volledig overzicht van alle gegevens die we over je hebben.",
      category: "privacy"
    },
    {
      question: "Hoe kan ik mijn gegevens laten verwijderen?",
      answer: "Je kunt verzoeken om al je gegevens te verwijderen via 'Dashboard' > 'Privacy' > 'Mijn gegevens verwijderen'. Dit verwijdert permanent al je persoonlijke informatie, foto's, voorkeuren en accountgegevens uit onze systemen.",
      category: "privacy"
    }
  ];

  const toggleFAQ = (index: number) => {
    if (openFAQs.includes(index)) {
      setOpenFAQs(openFAQs.filter(i => i !== index));
    } else {
      setOpenFAQs([...openFAQs, index]);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  const filteredFAQs = faqData.filter(faq => 
    (activeCategory ? faq.category === activeCategory : true) &&
    (searchQuery ? 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      : true
    )
  );

  const categories = [
    { id: "account", name: "Account & Registratie", icon: <User size={20} /> },
    { id: "billing", name: "Betalingen & Abonnementen", icon: <CreditCard size={20} /> },
    { id: "styling", name: "Stijladvies", icon: <Shirt size={20} /> },
    { id: "shopping", name: "Winkelen", icon: <ShoppingBag size={20} /> },
    { id: "photos", name: "Foto's & Uploads", icon: <Camera size={20} /> },
    { id: "privacy", name: "Privacy & Veiligheid", icon: <Shield size={20} /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Veelgestelde vragen
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
            Vind snel antwoorden op de meest gestelde vragen over FitFi. Kun je het antwoord niet vinden? Neem dan contact met ons op.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Zoek in veelgestelde vragen..."
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

        {/* Categories */}
        <div className="mb-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(activeCategory === category.id ? null : category.id)}
                className={`p-4 rounded-lg flex flex-col items-center justify-center text-center transition-colors ${
                  activeCategory === category.id 
                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' 
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className={`p-2 rounded-full mb-2 ${
                  activeCategory === category.id 
                    ? 'bg-orange-200 dark:bg-orange-800/50 text-orange-600 dark:text-orange-400' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  {category.icon}
                </div>
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-16 transition-colors">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              {activeCategory 
                ? `${categories.find(c => c.id === activeCategory)?.name} FAQ` 
                : 'Alle veelgestelde vragen'}
            </h2>
            
            {filteredFAQs.length > 0 ? (
              <div className="space-y-4">
                {filteredFAQs.map((faq, index) => (
                  <div 
                    key={index} 
                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full flex justify-between items-center p-4 text-left focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-inset"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {faq.question}
                      </h3>
                      {openFAQs.includes(index) ? (
                        <ChevronUp className="text-gray-500 dark:text-gray-400" size={20} />
                      ) : (
                        <ChevronDown className="text-gray-500 dark:text-gray-400" size={20} />
                      )}
                    </button>
                    
                    {openFAQs.includes(index) && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-gray-600 dark:text-gray-300">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Geen resultaten gevonden
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  We konden geen antwoorden vinden die overeenkomen met je zoekopdracht.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory(null);
                  }}
                >
                  Alle vragen weergeven
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-700 dark:to-orange-800 rounded-xl shadow-md overflow-hidden transition-colors">
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Nog steeds vragen?
            </h2>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Kon je het antwoord niet vinden? Ons supportteam staat klaar om je te helpen.
            </p>
            <Button 
              as={Link}
              to="/contact" 
              variant="secondary"
              size="lg"
              className="bg-white text-orange-600 hover:bg-gray-100"
              icon={<MessageCircle size={20} />}
              iconPosition="left"
            >
              Neem contact op
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;