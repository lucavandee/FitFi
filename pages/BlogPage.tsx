import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, Tag, Clock, Search } from 'lucide-react';
import Button from '../components/ui/Button';

const BlogPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            FitFi Mode Blog
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Ontdek de nieuwste trends, stijltips en mode-inzichten van onze experts. Laat je inspireren en leer hoe je je persoonlijke stijl kunt verbeteren.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Zoek artikelen..."
              className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
            />
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          </div>
        </div>

        {/* Featured Article */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-16 transition-colors">
          <div className="md:flex">
            <div className="md:w-1/2">
              <img 
                src="https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="De kunst van minimalisme" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="md:w-1/2 p-8">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center mr-4">
                  <Calendar size={16} className="mr-1" />
                  <span>12 april 2025</span>
                </div>
                <div className="flex items-center">
                  <User size={16} className="mr-1" />
                  <span>Laura Smit</span>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                De kunst van minimalisme: minder items, meer stijl
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                Ontdek hoe een minimalistische garderobe je kan helpen tijd te besparen, duurzamer te leven én er altijd stijlvol uit te zien. In dit artikel delen we praktische tips voor het creëren van een capsule garderobe die perfect bij jouw stijl past.
              </p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm flex items-center">
                  <Tag size={14} className="mr-1" />
                  Minimalisme
                </span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm flex items-center">
                  <Tag size={14} className="mr-1" />
                  Capsule garderobe
                </span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm flex items-center">
                  <Tag size={14} className="mr-1" />
                  Duurzaamheid
                </span>
              </div>
              
              <Button 
                as={Link}
                to="/blog/minimalisme-kunst" 
                variant="primary"
                icon={<ArrowRight size={16} />}
                iconPosition="right"
              >
                Lees verder
              </Button>
            </div>
          </div>
        </div>

        {/* Recent Articles */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Recente artikelen
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Article 1 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
              <div className="relative">
                <img 
                  src="https://images.pexels.com/photos/2043590/pexels-photo-2043590.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=2" 
                  alt="Streetwear trends 2025" 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Trending
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <div className="flex items-center mr-4">
                    <Calendar size={14} className="mr-1" />
                    <span>8 april 2025</span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={14} className="mr-1" />
                    <span>5 min</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Streetwear trends 2025: wat draagt de jeugd dit jaar?
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Een diepgaande analyse van de nieuwste streetwear trends en hoe je deze kunt integreren in je eigen stijl, ongeacht je leeftijd.
                </p>
                
                <Link 
                  to="/blog/streetwear-trends-2025" 
                  className="text-orange-500 hover:text-orange-600 font-medium flex items-center"
                >
                  Lees verder
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>

            {/* Article 2 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
              <div className="relative">
                <img 
                  src="https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=2" 
                  alt="Duurzame mode" 
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <div className="flex items-center mr-4">
                    <Calendar size={14} className="mr-1" />
                    <span>2 april 2025</span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={14} className="mr-1" />
                    <span>7 min</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Duurzame mode: stijlvol én verantwoord shoppen
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Ontdek hoe je bewuste modekeuzes kunt maken zonder in te leveren op stijl. We bespreken de beste duurzame merken en praktische tips.
                </p>
                
                <Link 
                  to="/blog/duurzame-mode" 
                  className="text-orange-500 hover:text-orange-600 font-medium flex items-center"
                >
                  Lees verder
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>

            {/* Article 3 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
              <div className="relative">
                <img 
                  src="https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=2" 
                  alt="Zakelijke casual" 
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <div className="flex items-center mr-4">
                    <Calendar size={14} className="mr-1" />
                    <span>28 maart 2025</span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={14} className="mr-1" />
                    <span>6 min</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  De nieuwe zakelijke casual: wat werkt in 2025
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Hoe kleed je je professioneel maar comfortabel in het hybride werktijdperk? Ontdek de nieuwe regels voor zakelijke casual kleding.
                </p>
                
                <Link 
                  to="/blog/zakelijke-casual-2025" 
                  className="text-orange-500 hover:text-orange-600 font-medium flex items-center"
                >
                  Lees verder
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-16 transition-colors">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Ontdek per categorie
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link 
                to="/blog/category/trends" 
                className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg text-center hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white">Trends</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">12 artikelen</p>
              </Link>
              
              <Link 
                to="/blog/category/styling-tips" 
                className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white">Styling Tips</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">18 artikelen</p>
              </Link>
              
              <Link 
                to="/blog/category/duurzaamheid" 
                className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white">Duurzaamheid</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">9 artikelen</p>
              </Link>
              
              <Link 
                to="/blog/category/ai-insights" 
                className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white">AI Insights</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">7 artikelen</p>
              </Link>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-700 dark:to-orange-800 rounded-xl shadow-md overflow-hidden transition-colors mb-16">
          <div className="p-8 md:flex items-center">
            <div className="md:w-2/3 mb-6 md:mb-0 md:pr-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                Blijf op de hoogte
              </h2>
              <p className="text-white/90 mb-0">
                Schrijf je in voor onze nieuwsbrief en ontvang wekelijks de nieuwste stijltips, trends en exclusieve aanbiedingen direct in je inbox.
              </p>
            </div>
            <div className="md:w-1/3">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Je e-mailadres"
                  className="flex-1 px-4 py-3 rounded-l-lg border-0 focus:ring-2 focus:ring-white"
                />
                <button className="bg-white text-orange-600 px-4 py-3 rounded-r-lg font-medium hover:bg-gray-100 transition-colors">
                  Inschrijven
                </button>
              </div>
              <p className="text-white/80 text-xs mt-2">
                We respecteren je privacy. Je kunt je op elk moment uitschrijven.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Klaar om je stijl te transformeren?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Laat onze AI je helpen de perfecte outfits te vinden die bij jouw unieke stijl en lichaamsbouw passen.
          </p>
          <Button 
            as={Link}
            to="/onboarding" 
            variant="primary"
            size="lg"
            icon={<ArrowRight size={20} />}
            iconPosition="right"
            className="hover-lift transition-transform shadow-lg hover:shadow-xl"
          >
            Begin je stijlreis
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;