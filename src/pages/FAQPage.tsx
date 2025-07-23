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
  MessageCircle,
  ArrowRight
} from 'lucide-react';
import Button from '../components/ui/Button';
import ErrorBoundary from '../components/ErrorBoundary';

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
    {
      question: "Kan ik mijn e-mailadres wijzigen?",
      answer: "Ja, je kunt je e-mailadres wijzigen via 'Dashboard' > 'Instellingen' > 'Accountgegevens'. Je ontvangt een bevestigingsmail op je nieuwe e-mailadres om de wijziging te bevestigen.",
      category: "account"
    },
    {
      question: "Hoe kan ik mijn profielfoto toevoegen of wijzigen?",
      answer: "Je kunt je profielfoto toevoegen of wijzigen via 'Dashboard' > 'Profiel'. Klik op de profielfoto-placeholder of je huidige foto en upload een nieuwe afbeelding.",
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
    {
      question: "Kan ik wisselen tussen maandelijks en jaarlijks abonnement?",
      answer: "Ja, je kunt op elk moment wisselen tussen maandelijkse en jaarlijkse facturering via 'Dashboard' > 'Instellingen' > 'Abonnement'. Bij overstap naar jaarlijks profiteer je direct van de korting.",
      category: "billing"
    },
    {
      question: "Is er een proefperiode voor Premium?",
      answer: "Ja, we bieden een gratis proefperiode van 14 dagen voor ons Premium abonnement. Je kunt alle functies uitproberen zonder verplichtingen en op elk moment opzeggen.",
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
    {
      question: "Kan ik aanbevelingen krijgen voor speciale gelegenheden?",
      answer: "Ja, je kunt specifieke gelegenheden selecteren in je stijlprofiel, zoals werk, casual, formeel of speciale evenementen. Onze AI zal outfits aanbevelen die geschikt zijn voor deze gelegenheden.",
      category: "styling"
    },
    {
      question: "Hoe kan ik feedback geven op aanbevelingen?",
      answer: "Bij elke aanbeveling kun je aangeven of je deze leuk vindt of niet. Je kunt ook specifieke feedback geven over waarom een aanbeveling wel of niet bij je past. Deze feedback helpt onze AI om betere aanbevelingen te doen.",
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
    {
      question: "Kan ik items opslaan voor later?",
      answer: "Ja, je kunt items en complete outfits opslaan in je favorieten. Ga naar 'Dashboard' > 'Opgeslagen Outfits' om je opgeslagen items te bekijken.",
      category: "shopping"
    },
    {
      question: "Bieden jullie kortingen aan?",
      answer: "Premium gebruikers krijgen toegang tot exclusieve kortingen en aanbiedingen van onze partnerretailers. Deze worden regelmatig bijgewerkt en zijn te vinden in de 'Aanbiedingen' sectie van je dashboard.",
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
    {
      question: "Hoe lang worden mijn foto's bewaard?",
      answer: "Je foto's worden bewaard zolang je account actief is, tenzij je ze handmatig verwijdert. Na analyse worden de originele foto's vervangen door geanonimiseerde data voor je stijlprofiel.",
      category: "photos"
    },
    {
      question: "Is er een limiet aan het aantal foto's dat ik kan uploaden?",
      answer: "Basis gebruikers kunnen 1 foto per maand uploaden. Premium gebruikers hebben onbeperkte foto-uploads en kunnen meerdere foto's uploaden voor een nog nauwkeurigere analyse.",
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
    },
    {
      question: "Delen jullie mijn gegevens met derden?",
      answer: "We delen je gegevens nooit met derden zonder jouw expliciete toestemming. We gebruiken je gegevens alleen om onze service te verbeteren en je persoonlijke aanbevelingen te doen.",
      category: "privacy"
    },
    {
      question: "Hoe zit het met cookies en tracking?",
      answer: "We gebruiken cookies en vergelijkbare technologieën om je ervaring te verbeteren en onze service te optimaliseren. Je kunt je cookievoorkeuren beheren via de cookie-instellingen op onze website. Meer informatie vind je in ons cookiebeleid.",
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
    <div className="min-h-screen bg-[#FAF8F6]">
      <div className="max-w-7xl mx-auto py-12 px-4 md:px-8 lg:px-16">
        {/* Hero Section */}
        <ErrorBoundary>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-gray-900 mb-6">
            Veelgestelde vragen
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
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
                  className="w-full px-4 py-3 pl-12 border border-gray-200 bg-white rounded-2xl shadow-sm focus:ring-2 focus:ring-[#bfae9f] focus:border-[#bfae9f] text-gray-900 placeholder-gray-500 transition-all"
                />
                <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <button
                  type="submit"
                  className="absolute right-3 top-2.5 bg-[#bfae9f] text-white px-4 py-1 rounded-xl hover:bg-[#a89a8c] transition-colors"
                >
                  Zoeken
                </button>
              </div>
            </form>
          </div>
        </div>
        </ErrorBoundary>

        {/* Categories */}
        <ErrorBoundary>
        <div className="mb-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(activeCategory === category.id ? null : category.id)}
                className={`p-4 rounded-lg flex flex-col items-center justify-center text-center transition-colors ${
                  activeCategory === category.id 
                    ? 'bg-[#bfae9f]/20 text-[#bfae9f]' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className={`p-2 rounded-full mb-2 ${
                  activeCategory === category.id 
                    ? 'bg-[#bfae9f]/30 text-[#bfae9f]' 
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {category.icon}
                </div>
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
        </ErrorBoundary>

        {/* FAQ Accordion */}
        <ErrorBoundary>
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-16">
          <div className="p-8">
            <h2 className="text-2xl font-medium text-gray-900 mb-8">
              {activeCategory 
                ? `${categories.find(c => c.id === activeCategory)?.name} FAQ` 
                : 'Alle veelgestelde vragen'}
            </h2>
            
            {filteredFAQs.length > 0 ? (
              <div className="space-y-4">
                {filteredFAQs.map((faq, index) => (
                  <div 
                    key={index} 
                    className="border border-gray-200 rounded-2xl overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full flex justify-between items-center p-4 text-left focus:outline-none focus:ring-2 focus:ring-[#bfae9f] focus:ring-inset"
                    >
                      <h3 className="text-lg font-medium text-gray-900">
                        {faq.question}
                      </h3>
                      {openFAQs.includes(index) ? (
                        <ChevronUp className="text-gray-500" size={20} />
                      ) : (
                        <ChevronDown className="text-gray-500" size={20} />
                      )}
                    </button>
                    
                    {openFAQs.includes(index) && (
                      <div className="p-4 bg-gray-50 border-t border-gray-200">
                        <p className="text-gray-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Geen resultaten gevonden
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  We konden geen antwoorden vinden die overeenkomen met je zoekopdracht.
                </p>
                <Button 
                  variant="outline"
                  className="rounded-2xl shadow-sm px-6 py-3 transition-transform hover:scale-105"
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
        </ErrorBoundary>

        {/* Popular Questions - NEW */}
        <ErrorBoundary>
        <div className="mb-16">
          <h2 className="text-2xl font-medium text-gray-900 text-center mb-8">
            Populaire vragen
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm transition-all hover:shadow-md hover:transform hover:scale-105">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Hoe werkt de stijlanalyse precies?
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Onze AI analyseert je antwoorden op de stijlvragenlijst en (optioneel) je foto om je lichaamsbouw, kleurenpalet en stijlvoorkeuren te bepalen. Op basis hiervan matchen we je met een van onze stijlarchetypen en selecteren we kledingitems die perfect bij jou passen.
              </p>
              <Link to="/hoe-het-werkt" className="text-[#bfae9f] hover:text-[#a89a8c] font-medium flex items-center transition-colors">
                Meer over onze technologie
                <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-3xl shadow-sm transition-all hover:shadow-md hover:transform hover:scale-105">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Wat is het verschil tussen Basis en Premium?
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Met het Basis plan krijg je toegang tot de stijlvragenlijst, 1 foto-upload per maand en 3 outfit aanbevelingen. Premium gebruikers krijgen onbeperkte foto-uploads, onbeperkte aanbevelingen, gedetailleerd stijladvies, seizoensgebonden updates en prioriteit ondersteuning.
              </p>
              <Link to="/prijzen" className="text-[#bfae9f] hover:text-[#a89a8c] font-medium flex items-center transition-colors">
                Bekijk alle abonnementen
                <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
          </div>
        </div>
        </ErrorBoundary>

        {/* Contact CTA */}
        <ErrorBoundary>
        <div className="bg-gradient-to-r from-[#bfae9f] to-purple-600 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-8 text-center">
            <h2 className="text-2xl font-medium text-white mb-4">
              Nog steeds vragen?
            </h2>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto leading-relaxed">
              Kon je het antwoord niet vinden? Ons supportteam staat klaar om je te helpen.
            </p>
            <Button 
              as={Link}
              to="/contact" 
              variant="secondary"
              size="lg"
              className="bg-white text-[#bfae9f] hover:bg-gray-100 rounded-2xl shadow-sm px-6 py-3 transition-transform hover:scale-105"
              icon={<MessageCircle size={20} />}
              iconPosition="left"
            >
              Neem contact op
            </Button>
          </div>
        </div>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default FAQPage;