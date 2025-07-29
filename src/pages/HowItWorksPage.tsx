import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Upload, MessageSquare, FileText, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';
import ImageWithFallback from '../components/ui/ImageWithFallback';
import { ErrorBoundary } from '../components/ErrorBoundary';

const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      id: 1,
      title: 'Upload je foto',
      description: 'Upload een foto van jezelf zodat onze AI jouw lichaamsbouw en huidige stijl kan analyseren.',
      icon: <Upload size={32} />,
      color: 'bg-blue-50 text-blue-600',
      image: 'https://images.pexels.com/photos/4348401/pexels-photo-4348401.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2'
    },
    {
      id: 2,
      title: 'Doe de stijlquiz',
      description: 'Beantwoord vragen over je voorkeuren, lifestyle en doelen. Duurt slechts 2 minuten.',
      icon: <MessageSquare size={32} />,
      color: 'bg-purple-50 text-purple-600',
      image: 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2'
    },
    {
      id: 3,
      title: 'Ontvang je rapport',
      description: 'Krijg een gepersonaliseerd stijlrapport met outfit aanbevelingen en shopping links.',
      icon: <FileText size={32} />,
      color: 'bg-green-50 text-green-600',
      image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2'
    },
    {
      id: 4,
      title: 'Shop je look',
      description: 'Klik door naar onze partner retailers en shop je perfecte outfit met exclusieve kortingen.',
      icon: <Sparkles size={32} />,
      color: 'bg-orange-50 text-orange-600',
      image: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <Helmet>
        <title>Hoe het werkt - AI Personal Styling in 4 stappen | FitFi</title>
        <meta name="description" content="Ontdek hoe FitFi's AI-powered personal styling werkt. Upload foto → Doe quiz → Ontvang rapport → Shop je look. Slechts 2 minuten!" />
        <meta property="og:title" content="Hoe het werkt - AI Personal Styling in 4 stappen" />
        <meta property="og:description" content="Upload foto → Doe quiz → Ontvang rapport → Shop je look. Slechts 2 minuten!" />
        <meta property="og:image" content="https://fitfi.ai/og-how-it-works.jpg" />
        <link rel="canonical" href="https://fitfi.ai/hoe-het-werkt" />
      </Helmet>

      <div className="max-w-7xl mx-auto py-12 px-4 md:px-8 lg:px-16">
        
        {/* Hero Section */}
        <ErrorBoundary>
          <section className="text-center mb-16">
            <div className="w-20 h-20 bg-[#89CFF0]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-[#89CFF0]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-light text-[#0D1B2A] mb-6">
              Hoe FitFi werkt
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Van foto tot perfect passende outfits in slechts 4 eenvoudige stappen
            </p>
          </section>
        </ErrorBoundary>

        {/* Steps Illustration */}
        <ErrorBoundary>
          <section className="mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {steps.map((step, index) => (
                <div key={step.id} className="relative">
                  {/* Connection Line */}
                  {index < steps.length - 1 && index % 2 === 0 && (
                    <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gray-200 transform translate-x-6 z-0">
                      <div className="absolute right-0 top-1/2 transform translate-y-1/2 w-3 h-3 bg-gray-200 rounded-full"></div>
                    </div>
                  )}
                  
                  <div className="relative bg-white rounded-3xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    {/* Step Number */}
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-[#89CFF0] text-white rounded-full flex items-center justify-center text-sm font-bold z-10">
                      {step.id}
                    </div>
                    
                    {/* Image */}
                    <div className="aspect-[4/5] relative">
                      <ImageWithFallback
                        src={step.image}
                        alt={`Stap ${step.id}: ${step.title}`}
                        className="w-full h-full object-cover"
                        componentName="HowItWorksPage"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      
                      {/* Icon Overlay */}
                      <div className={`absolute top-4 right-4 w-12 h-12 ${step.color} rounded-full flex items-center justify-center`}>
                        {step.icon}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-medium text-[#0D1B2A] mb-3">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </ErrorBoundary>

        {/* CTA Section */}
        <ErrorBoundary>
          <section className="bg-gradient-to-r from-[#89CFF0] to-blue-500 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-8 md:p-12 text-center">
              <h2 className="text-3xl font-light text-white mb-6">
                Klaar om te beginnen?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                Start vandaag nog met FitFi en ontdek hoe eenvoudig het is om er altijd op je best uit te zien.
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
                Probeer nu gratis
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