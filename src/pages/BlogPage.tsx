import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, Tag, Clock, Search } from 'lucide-react';
import Button from '../components/ui/Button';
import ErrorBoundary from '../components/ErrorBoundary';

const BlogPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF8F6]">
      <div className="max-w-7xl mx-auto py-12 px-4 md:px-8 lg:px-16">
        {/* Hero Section */}
        <ErrorBoundary>
        <div className="text-center mb-16">
          <h1 className="text-4xl font-light text-gray-900 mb-6">
            FitFi Mode Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Ontdek de nieuwste trends, stijltips en mode-inzichten van onze experts. Laat je inspireren en leer hoe je je persoonlijke stijl kunt verbeteren.
          </p>
        </div>
        </ErrorBoundary>

        {/* Search Bar */}
        <ErrorBoundary>
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Zoek artikelen..."
              className="w-full px-4 py-3 pl-12 border border-gray-200 bg-white rounded-2xl shadow-sm focus:ring-2 focus:ring-[#bfae9f] focus:border-[#bfae9f] text-gray-900 placeholder-gray-500 transition-all"
            />
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          </div>
        </div>
        </ErrorBoundary>

        {/* Featured Article */}
        <ErrorBoundary>
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-16">
          <div className="md:flex">
            <div className="md:w-1/2">
              <img 
                src="https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="De kunst van minimalisme" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="md:w-1/2 p-8">
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <div className="flex items-center mr-4">
                  <Calendar size={16} className="mr-1" />
                  <span>12 april 2025</span>
                </div>
                <div className="flex items-center">
                  <User size={16} className="mr-1" />
                  <span>Laura Smit</span>
                </div>
              </div>
              
              <h2 className="text-2xl font-medium text-gray-900 mb-4">
                De kunst van minimalisme: minder items, meer stijl
              </h2>
              
              <p className="text-gray-600 leading-relaxed mb-6">
                Ontdek hoe een minimalistische garderobe je kan helpen tijd te besparen, duurzamer te leven én er altijd stijlvol uit te zien. In dit artikel delen we praktische tips voor het creëren van een capsule garderobe die perfect bij jouw stijl past.
              </p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm flex items-center">
                  <Tag size={14} className="mr-1" />
                  Minimalisme
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm flex items-center">
                  <Tag size={14} className="mr-1" />
                  Capsule garderobe
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm flex items-center">
                  <Tag size={14} className="mr-1" />
                  Duurzaamheid
                </span>
              </div>
              
              <Button 
                as={Link}
                to="/blog/minimalisme-kunst" 
                variant="primary"
                className="rounded-2xl shadow-sm px-6 py-3 transition-transform hover:scale-105"
                icon={<ArrowRight size={16} />}
                iconPosition="right"
              >
                Lees verder
              </Button>
            </div>
          </div>
        </div>
        </ErrorBoundary>

        {/* Recent Articles */}
        <ErrorBoundary>
        <div className="mb-16">
          <h2 className="text-2xl font-medium text-gray-900 mb-8">
            Recente artikelen
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Article 1 */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md hover:transform hover:scale-105">
              <div className="relative">
                <img 
                  src="https://images.pexels.com/photos/2043590/pexels-photo-2043590.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=2" 
                  alt="Streetwear trends 2025" 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4 bg-[#bfae9f] text-white px-3 py-1 rounded-full text-xs font-medium">
                  Trending
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <div className="flex items-center mr-4">
                    <Calendar size={14} className="mr-1" />
                    <span>8 april 2025</span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={14} className="mr-1" />
                    <span>5 min</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-medium text-gray-900 mb-3">
                  Streetwear trends 2025: wat draagt de jeugd dit jaar?
                </h3>
                
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Een diepgaande analyse van de nieuwste streetwear trends en hoe je deze kunt integreren in je eigen stijl, ongeacht je leeftijd.
                </p>
                
                <Link 
                  to="/blog/streetwear-trends-2025" 
                  className="text-[#bfae9f] hover:text-[#a89a8c] font-medium flex items-center transition-colors"
                >
                  Lees verder
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>

            {/* Article 2 */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md hover:transform hover:scale-105">
              <div className="relative">
                <img 
                  src="https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=2" 
                  alt="Duurzame mode" 
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <div className="flex items-center mr-4">
                    <Calendar size={14} className="mr-1" />
                    <span>2 april 2025</span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={14} className="mr-1" />
                    <span>7 min</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-medium text-gray-900 mb-3">
                  Duurzame mode: stijlvol én verantwoord shoppen
                </h3>
                
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Ontdek hoe je bewuste modekeuzes kunt maken zonder in te leveren op stijl. We bespreken de beste duurzame merken en praktische tips.
                </p>
                
                <Link 
                  to="/blog/duurzame-mode" 
                  className="text-[#bfae9f] hover:text-[#a89a8c] font-medium flex items-center transition-colors"
                >
                  Lees verder
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>

            {/* Article 3 */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md hover:transform hover:scale-105">
              <div className="relative">
                <img 
                  src="https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=2" 
                  alt="Zakelijke casual" 
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <div className="flex items-center mr-4">
                    <Calendar size={14} className="mr-1" />
                    <span>28 maart 2025</span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={14} className="mr-1" />
                    <span>6 min</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-medium text-gray-900 mb-3">
                  De nieuwe zakelijke casual: wat werkt in 2025
                </h3>
                
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Hoe kleed je je professioneel maar comfortabel in het hybride werktijdperk? Ontdek de nieuwe regels voor zakelijke casual kleding.
                </p>
                
                <Link 
                  to="/blog/zakelijke-casual-2025" 
                  className="text-[#bfae9f] hover:text-[#a89a8c] font-medium flex items-center transition-colors"
                >
                  Lees verder
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
        </ErrorBoundary>

        {/* Categories */}
        <ErrorBoundary>
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-16">
          <div className="p-8">
            <h2 className="text-2xl font-medium text-gray-900 mb-6">
              Ontdek per categorie
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link 
                to="/blog/category/trends" 
                className="bg-[#bfae9f]/10 p-4 rounded-2xl text-center hover:bg-[#bfae9f]/20 transition-colors"
              >
                <h3 className="font-medium text-gray-900">Trends</h3>
                <p className="text-sm text-gray-500">12 artikelen</p>
              </Link>
              
              <Link 
                to="/blog/category/styling-tips" 
                className="bg-blue-50 p-4 rounded-2xl text-center hover:bg-blue-100 transition-colors"
              >
                <h3 className="font-medium text-gray-900">Styling Tips</h3>
                <p className="text-sm text-gray-500">18 artikelen</p>
              </Link>
              
              <Link 
                to="/blog/category/duurzaamheid" 
                className="bg-green-50 p-4 rounded-2xl text-center hover:bg-green-100 transition-colors"
              >
                <h3 className="font-medium text-gray-900">Duurzaamheid</h3>
                <p className="text-sm text-gray-500">9 artikelen</p>
              </Link>
              
              <Link 
                to="/blog/category/ai-insights" 
                className="bg-purple-50 p-4 rounded-2xl text-center hover:bg-purple-100 transition-colors"
              >
                <h3 className="font-medium text-gray-900">AI Insights</h3>
                <p className="text-sm text-gray-500">7 artikelen</p>
              </Link>
            </div>
          </div>
        </div>
        </ErrorBoundary>

        {/* Newsletter */}
        <ErrorBoundary>
        <div className="bg-gradient-to-r from-[#bfae9f] to-purple-600 rounded-3xl shadow-sm overflow-hidden mb-16">
          <div className="p-8 md:flex items-center">
            <div className="md:w-2/3 mb-6 md:mb-0 md:pr-8">
              <h2 className="text-2xl font-medium text-white mb-4">
                Blijf op de hoogte
              </h2>
              <p className="text-white/90 mb-0 leading-relaxed">
                Schrijf je in voor onze nieuwsbrief en ontvang wekelijks de nieuwste stijltips, trends en exclusieve aanbiedingen direct in je inbox.
              </p>
            </div>
            <div className="md:w-1/3">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Je e-mailadres"
                  className="flex-1 px-4 py-3 rounded-l-2xl border-0 focus:ring-2 focus:ring-white"
                />
                <button className="bg-white text-[#bfae9f] px-4 py-3 rounded-r-2xl font-medium hover:bg-gray-100 transition-colors">
                  Inschrijven
                </button>
              </div>
              <p className="text-white/80 text-xs mt-2">
                We respecteren je privacy. Je kunt je op elk moment uitschrijven.
              </p>
            </div>
          </div>
        </div>
        </ErrorBoundary>

        {/* CTA Section */}
        <ErrorBoundary>
        <div className="text-center">
          <h2 className="text-3xl font-light text-gray-900 mb-6">
            Klaar om je stijl te transformeren?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Laat onze AI je helpen de perfecte outfits te vinden die bij jouw unieke stijl en lichaamsbouw passen.
          </p>
          <Button 
            as={Link}
            to="/onboarding" 
            variant="primary"
            size="lg"
            icon={<ArrowRight size={20} />}
            iconPosition="right"
            className="bg-[#bfae9f] hover:bg-[#a89a8c] text-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            Begin je stijlreis
          </Button>
        </div>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default BlogPage;