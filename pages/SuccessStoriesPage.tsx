import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Quote, ArrowRight, MessageSquare } from 'lucide-react';
import Button from '../components/ui/Button';

const SuccessStoriesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Succesverhalen van onze gebruikers
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Ontdek hoe FitFi het leven van duizenden Nederlanders heeft veranderd door hen te helpen hun perfecte stijl te vinden en zelfverzekerder te worden.
          </p>
        </div>

        {/* Featured Success Story */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-16 transition-colors">
          <div className="md:flex">
            <div className="md:w-1/2">
              <img 
                src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Emma's transformatie" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="md:w-1/2 p-8">
              <div className="flex items-center mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-current" size={20} />
                  ))}
                </div>
                <span className="ml-2 text-gray-600 dark:text-gray-400 text-sm">5.0</span>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                "FitFi heeft mijn garderobe en zelfvertrouwen compleet getransformeerd"
              </h2>
              
              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  "Als drukke moeder van twee had ik nooit tijd om na te denken over mijn stijl. Ik droeg altijd dezelfde saaie outfits en voelde me onzeker over mijn lichaam na twee zwangerschappen. FitFi heeft me geholpen te ontdekken welke stijlen echt bij mijn lichaamsbouw passen en me zelfverzekerder maken."
                </p>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  "De persoonlijke aanbevelingen waren verrassend nauwkeurig en hebben me aangemoedigd om buiten mijn comfortzone te treden. Ik krijg nu regelmatig complimenten over mijn outfits en voel me eindelijk weer goed in mijn eigen huid!"
                </p>
              </div>
              
              <div className="flex items-center">
                <div className="mr-4">
                  <img 
                    src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2" 
                    alt="Emma van der Berg" 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Emma van der Berg</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Amsterdam • Premium gebruiker sinds 2024</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* More Success Stories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Story 1 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
            <div className="relative h-64">
              <img 
                src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2" 
                alt="Thomas' verhaal" 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="text-yellow-400 fill-current" size={16} />
                ))}
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                "Eindelijk kleding die echt bij me past"
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                "Als man vond ik het altijd lastig om mijn eigen stijl te vinden. FitFi heeft me geholpen te begrijpen welke kleuren en pasvorm bij mijn lichaamsbouw passen. Ik krijg nu regelmatig complimenten over mijn outfits!"
              </p>
              <div className="flex items-center">
                <div className="mr-3">
                  <img 
                    src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2" 
                    alt="Thomas Jansen" 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Thomas Jansen</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Utrecht</p>
                </div>
              </div>
            </div>
          </div>

          {/* Story 2 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
            <div className="relative h-64">
              <img 
                src="https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2" 
                alt="Sophie's verhaal" 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="text-yellow-400 fill-current" size={16} />
                ))}
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                "Zoveel tijd en geld bespaard"
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                "Ik kocht altijd kleding die ik uiteindelijk nauwelijks droeg. FitFi heeft me geholpen bewustere keuzes te maken en een capsule garderobe op te bouwen met items die ik echt draag en die perfect bij elkaar passen."
              </p>
              <div className="flex items-center">
                <div className="mr-3">
                  <img 
                    src="https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2" 
                    alt="Sophie Bakker" 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Sophie Bakker</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Rotterdam</p>
                </div>
              </div>
            </div>
          </div>

          {/* Story 3 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
            <div className="relative h-64">
              <img 
                src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2" 
                alt="Jayden's verhaal" 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="text-yellow-400 fill-current" size={16} />
                ))}
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                "Van stijlloos naar stijlvol"
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                "Ik had geen idee wat mijn stijl was en droeg vooral wat comfortabel was. FitFi heeft me laten zien dat stijlvol en comfortabel hand in hand kunnen gaan. Nu voel ik me zelfverzekerder bij zakelijke afspraken én in mijn vrije tijd."
              </p>
              <div className="flex items-center">
                <div className="mr-3">
                  <img 
                    src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2" 
                    alt="Jayden de Vries" 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Jayden de Vries</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Den Haag</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial Grid */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-10">
            Wat onze gebruikers zeggen
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm transition-all hover:shadow-md">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="text-yellow-400 fill-current" size={16} />
                ))}
              </div>
              <div className="mb-4">
                <Quote className="text-gray-300 dark:text-gray-600" size={24} />
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  "FitFi heeft me geholpen mijn eigen stijl te ontdekken. De aanbevelingen zijn verrassend nauwkeurig!"
                </p>
              </div>
              <div className="flex items-center">
                <div className="mr-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500 font-medium">
                    L
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">Lisa K.</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Basis gebruiker</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm transition-all hover:shadow-md">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="text-yellow-400 fill-current" size={16} />
                ))}
              </div>
              <div className="mb-4">
                <Quote className="text-gray-300 dark:text-gray-600" size={24} />
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  "Als iemand die altijd moeite had met winkelen, is FitFi een gamechanger. Ik bespaar zoveel tijd!"
                </p>
              </div>
              <div className="flex items-center">
                <div className="mr-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 font-medium">
                    M
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">Mark V.</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Premium gebruiker</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm transition-all hover:shadow-md">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="text-yellow-400 fill-current" size={16} />
                ))}
              </div>
              <div className="mb-4">
                <Quote className="text-gray-300 dark:text-gray-600" size={24} />
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  "De persoonlijke aanbevelingen zijn geweldig. Eindelijk kleding die echt bij mijn lichaamsbouw past!"
                </p>
              </div>
              <div className="flex items-center">
                <div className="mr-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-500 font-medium">
                    A
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">Anouk B.</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Premium gebruiker</p>
                </div>
              </div>
            </div>

            {/* Testimonial 4 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm transition-all hover:shadow-md">
              <div className="flex mb-4">
                {[...Array(4)].map((_, i) => (
                  <Star key={i} className="text-yellow-400 fill-current" size={16} />
                ))}
                <Star className="text-gray-300 dark:text-gray-600" size={16} />
              </div>
              <div className="mb-4">
                <Quote className="text-gray-300 dark:text-gray-600" size={24} />
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  "Goede aanbevelingen, maar soms niet helemaal mijn smaak. Over het algemeen wel tevreden!"
                </p>
              </div>
              <div className="flex items-center">
                <div className="mr-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-500 font-medium">
                    J
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">Jeroen T.</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Basis gebruiker</p>
                </div>
              </div>
            </div>

            {/* Testimonial 5 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm transition-all hover:shadow-md">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="text-yellow-400 fill-current" size={16} />
                ))}
              </div>
              <div className="mb-4">
                <Quote className="text-gray-300 dark:text-gray-600" size={24} />
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  "De Premium upgrade was het absoluut waard! Zoveel meer opties en de seizoensgebonden updates zijn geweldig."
                </p>
              </div>
              <div className="flex items-center">
                <div className="mr-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500 font-medium">
                    F
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">Femke R.</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Premium gebruiker</p>
                </div>
              </div>
            </div>

            {/* Testimonial 6 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm transition-all hover:shadow-md">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="text-yellow-400 fill-current" size={16} />
                ))}
              </div>
              <div className="mb-4">
                <Quote className="text-gray-300 dark:text-gray-600" size={24} />
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  "Als stylist gebruik ik FitFi Business om mijn klanten beter te adviseren. Een onmisbaar hulpmiddel!"
                </p>
              </div>
              <div className="flex items-center">
                <div className="mr-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-500 font-medium">
                    D
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">David P.</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Business gebruiker</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Share Your Story */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-700 dark:to-orange-800 rounded-xl shadow-md overflow-hidden transition-colors mb-16">
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Deel jouw verhaal
            </h2>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Heb jij een positieve ervaring met FitFi? We horen graag hoe onze service jouw stijl en zelfvertrouwen heeft verbeterd.
            </p>
            <Button 
              as={Link}
              to="/feedback" 
              variant="secondary"
              size="lg"
              className="bg-white text-orange-600 hover:bg-gray-100"
              icon={<MessageSquare size={20} />}
              iconPosition="left"
            >
              Deel jouw verhaal
            </Button>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Klaar om je eigen succesverhaal te schrijven?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Sluit je aan bij duizenden tevreden gebruikers en ontdek hoe FitFi jouw stijl kan transformeren.
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

export default SuccessStoriesPage;