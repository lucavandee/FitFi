import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  ArrowLeft,
  MessageCircle,
  ArrowRight
} from 'lucide-react';
import Button from '../components/ui/Button';
import { ErrorBoundary } from '../components/ErrorBoundary';

interface FAQItem {
  question: string;
  answer: string;
}

const FaqPage: React.FC = () => {
  const [openFAQs, setOpenFAQs] = useState<number[]>([]);

  const faqData: FAQItem[] = [
    {
      question: "Hoe werkt FitFi's AI-stijlanalyse?",
      answer: "Onze AI analyseert je antwoorden op de stijlvragenlijst en (optioneel) je foto om je lichaamsbouw, kleurenpalet en stijlvoorkeuren te bepalen. Op basis hiervan matchen we je met een van onze stijlarchetypen en selecteren we kledingitems die perfect bij jou passen."
    },
    {
      question: "Is FitFi echt gratis?",
      answer: "Ja! Ons Free plan is volledig gratis en geeft je toegang tot de basis stijlquiz, 3 outfit aanbevelingen per maand en je persoonlijke stijlprofiel. Je kunt later upgraden naar Plus of Pro voor meer functies."
    },
    {
      question: "Hoe nauwkeurig zijn de aanbevelingen?",
      answer: "Onze AI heeft een nauwkeurigheid van 87% en wordt continu verbeterd. De aanbevelingen worden nauwkeuriger naarmate je meer feedback geeft en je profiel verfijnt. Premium gebruikers krijgen toegang tot geavanceerde analyses voor nog betere resultaten."
    },
    {
      question: "Kan ik mijn stijlvoorkeuren later aanpassen?",
      answer: "Absoluut! Je kunt je stijlvoorkeuren op elk moment aanpassen via je dashboard. Je kunt ook de stijlquiz opnieuw doen voor een volledig nieuwe analyse. Onze AI leert van je feedback en past de aanbevelingen automatisch aan."
    },
    {
      question: "Hoe worden mijn foto's gebruikt en opgeslagen?",
      answer: "Je foto's worden end-to-end versleuteld en alleen gebruikt voor stijlanalyse. Ze worden nooit gedeeld met derden zonder jouw expliciete toestemming. Je kunt je foto's op elk moment verwijderen via je privacy-instellingen."
    },
    {
      question: "Kan ik mijn abonnement op elk moment opzeggen?",
      answer: "Ja, je kunt je Plus of Pro abonnement op elk moment opzeggen. Je behoudt toegang tot alle functies tot het einde van je huidige factureringsperiode. Er zijn geen verborgen kosten of opzegtermijnen."
    }
  ];

  const toggleFAQ = (index: number) => {
    if (openFAQs.includes(index)) {
      setOpenFAQs(openFAQs.filter(i => i !== index));
    } else {
      setOpenFAQs([...openFAQs, index]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <Helmet>
        <title>Veelgestelde Vragen - Hulp en Ondersteuning | FitFi</title>
        <meta name="description" content="Vind antwoorden op veelgestelde vragen over FitFi. Van account beheer tot stijladvies - alle informatie die je nodig hebt." />
        <meta property="og:title" content="Veelgestelde Vragen - Hulp en Ondersteuning" />
        <meta property="og:description" content="Antwoorden op veelgestelde vragen over FitFi's AI-powered styling platform." />
        <link rel="canonical" href="https://fitfi.ai/faq" />
      </Helmet>

      <div className="max-w-4xl mx-auto py-12 px-4 md:px-8 lg:px-16">
        {/* Header */}
        <ErrorBoundary>
          <div className="mb-12">
            <Link 
              to="/" 
              className="inline-flex items-center text-[#89CFF0] hover:text-[#89CFF0]/80 transition-colors mb-6"
            >
              <ArrowLeft size={20} className="mr-2" />
              Terug naar home
            </Link>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-[#89CFF0]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <HelpCircle className="w-10 h-10 text-[#89CFF0]" />
              </div>
              <h1 className="text-4xl md:text-5xl font-light text-[#0D1B2A] mb-6">
                Veelgestelde vragen
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Vind snel antwoorden op de meest gestelde vragen over FitFi. Kun je het antwoord niet vinden? 
                Neem dan contact met ons op.
              </p>
            </div>
          </div>
        </ErrorBoundary>

        {/* FAQ Accordion */}
        <ErrorBoundary>
          <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-16">
            <div className="p-8">
              <div className="space-y-4">
                {faqData.map((faq, index) => (
                  <div 
                    key={index} 
                    className="border border-gray-200 rounded-2xl overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full flex justify-between items-center p-6 text-left focus:outline-none focus:ring-2 focus:ring-[#89CFF0] focus:ring-inset hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="text-lg font-medium text-[#0D1B2A] pr-4">
                        {faq.question}
                      </h3>
                      {openFAQs.includes(index) ? (
                        <ChevronUp className="text-[#89CFF0] flex-shrink-0" size={20} />
                      ) : (
                        <ChevronDown className="text-[#89CFF0] flex-shrink-0" size={20} />
                      )}
                    </button>
                    
                    {openFAQs.includes(index) && (
                      <div className="px-6 pb-6 bg-gray-50 border-t border-gray-200">
                        <p className="text-gray-700 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ErrorBoundary>

        {/* Contact CTA */}
        <ErrorBoundary>
          <div className="bg-gradient-to-r from-[#89CFF0] to-blue-500 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-8 text-center">
              <h2 className="text-2xl font-medium text-white mb-4">
                Nog steeds vragen?
              </h2>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto leading-relaxed">
                Ons supportteam staat klaar om je te helpen. We reageren binnen één werkdag.
              </p>
              <Button 
                as={Link}
                to="/contact" 
                variant="secondary"
                size="lg"
                className="bg-white text-[#89CFF0] hover:bg-gray-100 rounded-2xl shadow-sm px-6 py-3 transition-transform hover:scale-105"
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

export default FaqPage;