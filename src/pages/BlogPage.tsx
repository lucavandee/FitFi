import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BookOpen, ArrowRight, Calendar, Clock } from 'lucide-react';
import Button from '../components/ui/Button';
import { ErrorBoundary } from '../components/ErrorBoundary';

const BlogPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <Helmet>
        <title>Blog - Styling Tips & Mode Trends | FitFi</title>
        <meta name="description" content="Ontdek de laatste styling tips, mode trends en persoonlijke groei-inzichten op de FitFi blog. Binnenkort beschikbaar!" />
        <meta property="og:title" content="Blog - Styling Tips & Mode Trends" />
        <meta property="og:description" content="Styling tips, mode trends en persoonlijke groei-inzichten op de FitFi blog." />
        <meta property="og:image" content="https://fitfi.ai/og-blog.jpg" />
        <link rel="canonical" href="https://fitfi.ai/blog" />
      </Helmet>

      <div className="max-w-7xl mx-auto py-12 px-4 md:px-8 lg:px-16">
        {/* Hero Section */}
        <ErrorBoundary>
          <div className="text-center mb-16">
            <div className="w-20 h-20 bg-[#89CFF0]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-[#89CFF0]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-light text-[#0D1B2A] mb-6">
              FitFi Blog
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Ontdek de laatste trends, styling tips en inzichten over mode, persoonlijkheid en zelfexpressie.
            </p>
          </div>
        </ErrorBoundary>

        {/* Empty State */}
        <ErrorBoundary>
          <div className="bg-white rounded-3xl shadow-sm p-12 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-[#89CFF0]/20 to-purple-50 rounded-full flex items-center justify-center mx-auto mb-8">
                <Calendar className="w-12 h-12 text-[#89CFF0]" />
              </div>
              
              <h2 className="text-3xl font-medium text-[#0D1B2A] mb-6">
                Binnenkort beschikbaar
              </h2>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                We werken hard aan waardevolle content over styling, persoonlijke groei en mode-psychologie. 
                Onze blog komt binnenkort online met wekelijkse artikelen van experts.
              </p>
              
              <div className="bg-gradient-to-r from-[#89CFF0]/10 to-purple-50 rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-medium text-[#0D1B2A] mb-4">
                  Wat kun je verwachten?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#89CFF0] rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">Styling tips van experts</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#89CFF0] rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">Mode psychologie artikelen</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#89CFF0] rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">Seizoensgebonden trends</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[#89CFF0] rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">Persoonlijke groei tips</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                  as={Link}
                  to="/registreren" 
                  variant="primary"
                  icon={<ArrowRight size={20} />}
                  iconPosition="right"
                  className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
                >
                  Start met FitFi
                </Button>
                <Button 
                  as={Link}
                  to="/contact" 
                  variant="outline"
                  className="border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white"
                >
                  Blijf op de hoogte
                </Button>
              </div>
            </div>
          </div>
        </ErrorBoundary>

        {/* Newsletter Signup */}
        <ErrorBoundary>
          <div className="mt-16 bg-gradient-to-r from-[#89CFF0] to-blue-500 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-8 md:p-12 text-center">
              <h2 className="text-3xl font-light text-white mb-4">
                Wees de eerste die het weet
              </h2>
              <p className="text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                Meld je aan voor onze nieuwsbrief en ontvang een melding zodra onze blog live gaat, 
                plus exclusieve styling tips.
              </p>
              
              <div className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Je e-mailadres"
                    className="flex-1 px-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-white/50 text-gray-900"
                  />
                  <Button
                    variant="secondary"
                    className="bg-white text-[#89CFF0] hover:bg-gray-100 px-6 py-3"
                  >
                    Aanmelden
                  </Button>
                </div>
                <p className="text-white/80 text-sm mt-3">
                  Geen spam, alleen waardevolle content. Uitschrijven kan altijd.
                </p>
              </div>
            </div>
          </div>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default BlogPage;