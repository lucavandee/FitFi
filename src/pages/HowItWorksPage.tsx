import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquare, Brain, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';
import { ErrorBoundary } from '../components/ErrorBoundary';

const HowItWorksPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <div className="max-w-7xl mx-auto py-12 px-4 md:px-8 lg:px-16">
        
        {/* Hero Section */}
        <ErrorBoundary>
          <section className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-light text-[#0D1B2A] mb-6">
              Ontdek jezelf
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Beantwoord een paar snelle vragen en zie meteen jouw stijl-archetype
            </p>
            
            <div className="bg-white rounded-3xl p-8 max-w-4xl mx-auto shadow-sm">
              <h2 className="text-2xl font-medium text-[#0D1B2A] mb-6">
                Onze missie
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Wij helpen jou om moeiteloos stijl te vinden die echt bij je past — met slimme AI, échte producten en volledige transparantie.
              </p>
            </div>
          </section>
        </ErrorBoundary>

        {/* How It Works Steps */}
        <ErrorBoundary>
          <section className="mb-16">
            <h2 className="text-3xl font-light text-[#0D1B2A] text-center mb-12">
              Hoe het werkt
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-white rounded-3xl p-8 shadow-sm text-center relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-[#89CFF0] text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                
                <div className="w-16 h-16 bg-[#89CFF0]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="w-8 h-8 text-[#89CFF0]" />
                </div>
                
                <h3 className="text-xl font-medium text-[#0D1B2A] mb-4">
                  Ontdek jezelf
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Beantwoord een paar snelle vragen en zie meteen jouw stijl-archetype.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-3xl p-8 shadow-sm text-center relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-[#89CFF0] text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                
                <div className="w-16 h-16 bg-[#89CFF0]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Brain className="w-8 h-8 text-[#89CFF0]" />
                </div>
                
                <h3 className="text-xl font-medium text-[#0D1B2A] mb-4">
                  AI analyseert je stijl
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Onze AI begrijpt jouw voorkeuren en persoonlijkheid voor perfecte matches.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-3xl p-8 shadow-sm text-center relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-[#89CFF0] text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                
                <div className="w-16 h-16 bg-[#89CFF0]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-[#89CFF0]" />
                </div>
                
                <h3 className="text-xl font-medium text-[#0D1B2A] mb-4">
                  Shop met vertrouwen
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Koop items die je zeker weet dat ze bij je passen en je goed staan.
                </p>
              </div>
            </div>
          </section>
        </ErrorBoundary>

        {/* CTA Section */}
        <ErrorBoundary>
          <section className="bg-gradient-to-r from-[#89CFF0] to-blue-500 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-8 md:p-12 text-center">
            <h2 className="text-3xl font-light text-white mb-6">
              Klaar om je stijl te ontdekken?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              Begin vandaag nog met FitFi en ontdek hoe eenvoudig het is om er altijd op je best uit te zien.
            </p>
            <Button 
              as={Link}
              to="/registreren" 
              variant="secondary"
              size="lg"
              icon={<ArrowRight size={20} />}
              iconPosition="right"
              className="bg-white text-[#89CFF0] hover:bg-gray-100 px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Start nu gratis
            </Button>
            <p className="text-white/80 text-sm mt-4">
              Geen creditcard vereist • Direct resultaat
            </p>
          </div>
          </section>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default HowItWorksPage;