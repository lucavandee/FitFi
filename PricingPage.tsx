import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, ArrowRight, Zap, Crown, ShieldCheck, Clock, Sparkles, Star, Users, Award } from 'lucide-react';
import Button from '../components/ui/Button';

const PricingPage: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const toggleBillingPeriod = () => {
    setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly');
  };

  // Calculate yearly prices with 20% discount
  const getPrice = (monthlyPrice: number) => {
    if (billingPeriod === 'yearly') {
      const yearlyPrice = monthlyPrice * 12 * 0.8; // 20% discount
      return (yearlyPrice / 12).toFixed(2);
    }
    return monthlyPrice.toFixed(2);
  };

  // Testimonials data
  const testimonials = [
    {
      id: 1,
      name: "Emma van der Berg",
      role: "Marketing Professional",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2",
      quote: "De Premium upgrade was het absoluut waard! Zoveel meer opties en de seizoensgebonden updates zijn geweldig.",
      rating: 5
    },
    {
      id: 2,
      name: "Thomas Jansen",
      role: "Software Engineer",
      avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2",
      quote: "Als iemand die altijd moeite had met winkelen, is FitFi Premium een gamechanger. Ik bespaar zoveel tijd!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Transparante prijzen voor elke stijlzoeker
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Of je nu net begint met het ontdekken van je stijl of op zoek bent naar geavanceerde styling opties, wij hebben een passend abonnement voor jou.
          </p>
        </div>

        {/* Pricing Toggle - Monthly/Yearly */}
        <div className="flex justify-center mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-full p-1 inline-flex shadow-sm">
            <button 
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-full transition-colors ${
                billingPeriod === 'monthly' 
                  ? 'bg-orange-500 text-white font-medium' 
                  : 'text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Maandelijks
            </button>
            <button 
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-full transition-colors ${
                billingPeriod === 'yearly' 
                  ? 'bg-orange-500 text-white font-medium' 
                  : 'text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Jaarlijks <span className="text-green-500 font-bold">(-20%)</span>
            </button>
          </div>
        </div>

        {/* Pricing Tiers */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Free Tier */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Basis</h2>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">€0</span>
                <span className="ml-1 text-gray-500 dark:text-gray-400">/maand</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Perfect om FitFi uit te proberen en je stijl te ontdekken.
              </p>
              
              <Button 
                as={Link}
                to="/onboarding" 
                variant="outline" 
                fullWidth
                className="mb-8"
              >
                Gratis starten
              </Button>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-600 dark:text-gray-400">Basis stijlvragenlijst</span>
                </div>
                <div className="flex items-start">
                  <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-600 dark:text-gray-400">1 foto-upload per maand</span>
                </div>
                <div className="flex items-start">
                  <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-600 dark:text-gray-400">3 outfit aanbevelingen</span>
                </div>
                <div className="flex items-start">
                  <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-600 dark:text-gray-400">Basis stijltips</span>
                </div>
                <div className="flex items-start">
                  <X className="text-gray-300 dark:text-gray-600 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-400 dark:text-gray-500">Geavanceerde stijlanalyse</span>
                </div>
                <div className="flex items-start">
                  <X className="text-gray-300 dark:text-gray-600 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-400 dark:text-gray-500">Seizoensgebonden updates</span>
                </div>
                <div className="flex items-start">
                  <X className="text-gray-300 dark:text-gray-600 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-400 dark:text-gray-500">Prioriteit ondersteuning</span>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Tier */}
          <div className="bg-orange-50 dark:bg-gray-800 border-2 border-orange-500 rounded-xl overflow-hidden relative transition-all hover:shadow-xl transform hover:scale-[1.02]">
            <div className="absolute top-0 right-0 bg-orange-500 text-white px-4 py-1 text-xs font-bold uppercase rounded-bl-lg">
              Populair
            </div>
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Premium</h2>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">€{getPrice(12.99)}</span>
                <span className="ml-1 text-gray-500 dark:text-gray-400">/maand</span>
                {billingPeriod === 'yearly' && (
                  <span className="ml-2 text-sm text-green-500 font-medium">Bespaar 20%</span>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Alle tools die je nodig hebt voor een complete stijltransformatie
              </p>
              
              <Button 
                as={Link}
                to={`/onboarding?plan=premium&billing=${billingPeriod}`}
                variant="primary" 
                fullWidth
                className="mb-8"
              >
                Start premium proefperiode
              </Button>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-600 dark:text-gray-400">Geavanceerde stijlvragenlijst</span>
                </div>
                <div className="flex items-start">
                  <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-600 dark:text-gray-400">Onbeperkte foto-uploads</span>
                </div>
                <div className="flex items-start">
                  <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-600 dark:text-gray-400">Onbeperkte outfit aanbevelingen</span>
                </div>
                <div className="flex items-start">
                  <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-600 dark:text-gray-400">Gedetailleerd styling advies</span>
                </div>
                <div className="flex items-start">
                  <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-600 dark:text-gray-400">Seizoensgebonden garderobe updates</span>
                </div>
                <div className="flex items-start">
                  <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-600 dark:text-gray-400">Prioriteit ondersteuning</span>
                </div>
                <div className="flex items-start">
                  <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-600 dark:text-gray-400">Exclusieve kortingen bij partners</span>
                </div>
              </div>
            </div>
          </div>

          {/* Business Tier */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Business</h2>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">€{getPrice(29.99)}</span>
                <span className="ml-1 text-gray-500 dark:text-gray-400">/maand</span>
                {billingPeriod === 'yearly' && (
                  <span className="ml-2 text-sm text-green-500 font-medium">Bespaar 20%</span>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Voor professionals en bedrijven in de mode-industrie.
              </p>
              
              <Button 
                as={Link}
                to="/contact?plan=business" 
                variant="outline" 
                fullWidth
                className="mb-8"
              >
                Neem contact op
              </Button>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-600 dark:text-gray-400">Alles uit het Premium pakket</span>
                </div>
                <div className="flex items-start">
                  <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-600 dark:text-gray-400">API-toegang voor integraties</span>
                </div>
                <div className="flex items-start">
                  <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-600 dark:text-gray-400">White-label oplossingen</span>
                </div>
                <div className="flex items-start">
                  <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-600 dark:text-gray-400">Geavanceerde analytics</span>
                </div>
                <div className="flex items-start">
                  <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-600 dark:text-gray-400">Dedicated accountmanager</span>
                </div>
                <div className="flex items-start">
                  <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-600 dark:text-gray-400">Aangepaste rapportages</span>
                </div>
                <div className="flex items-start">
                  <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={18} />
                  <span className="text-gray-600 dark:text-gray-400">Onbeperkte gebruikers</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials - NEW */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-10">
            Wat onze premium gebruikers zeggen
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transition-all hover:shadow-lg">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-current" size={16} />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name} 
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-16 transition-colors">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
              Vergelijk alle functies
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 px-4 font-medium text-gray-500 dark:text-gray-400">Functie</th>
                    <th className="text-center py-4 px-4 font-medium text-gray-500 dark:text-gray-400">Basis</th>
                    <th className="text-center py-4 px-4 font-medium text-orange-500">Premium</th>
                    <th className="text-center py-4 px-4 font-medium text-gray-500 dark:text-gray-400">Business</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-4 px-4 text-gray-900 dark:text-white">Stijlvragenlijst</td>
                    <td className="py-4 px-4 text-center">Basis</td>
                    <td className="py-4 px-4 text-center text-orange-500 font-medium">Geavanceerd</td>
                    <td className="py-4 px-4 text-center">Aangepast</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-4 px-4 text-gray-900 dark:text-white">Foto-uploads</td>
                    <td className="py-4 px-4 text-center">1 per maand</td>
                    <td className="py-4 px-4 text-center text-orange-500 font-medium">Onbeperkt</td>
                    <td className="py-4 px-4 text-center">Onbeperkt</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-4 px-4 text-gray-900 dark:text-white">Outfit aanbevelingen</td>
                    <td className="py-4 px-4 text-center">3 per maand</td>
                    <td className="py-4 px-4 text-center text-orange-500 font-medium">Onbeperkt</td>
                    <td className="py-4 px-4 text-center">Onbeperkt</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-4 px-4 text-gray-900 dark:text-white">Stijladvies</td>
                    <td className="py-4 px-4 text-center">Basis</td>
                    <td className="py-4 px-4 text-center text-orange-500 font-medium">Gedetailleerd</td>
                    <td className="py-4 px-4 text-center">Op maat</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-4 px-4 text-gray-900 dark:text-white">Seizoensgebonden updates</td>
                    <td className="py-4 px-4 text-center">
                      <X className="inline text-gray-400" size={18} />
                    </td>
                    <td className="py-4 px-4 text-center text-orange-500">
                      <Check className="inline" size={18} />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Check className="inline text-green-500" size={18} />
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-4 px-4 text-gray-900 dark:text-white">Prioriteit ondersteuning</td>
                    <td className="py-4 px-4 text-center">
                      <X className="inline text-gray-400" size={18} />
                    </td>
                    <td className="py-4 px-4 text-center text-orange-500">
                      <Check className="inline" size={18} />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Check className="inline text-green-500" size={18} />
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-4 px-4 text-gray-900 dark:text-white">Exclusieve kortingen</td>
                    <td className="py-4 px-4 text-center">
                      <X className="inline text-gray-400" size={18} />
                    </td>
                    <td className="py-4 px-4 text-center text-orange-500">
                      <Check className="inline" size={18} />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Check className="inline text-green-500" size={18} />
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-4 px-4 text-gray-900 dark:text-white">API-toegang</td>
                    <td className="py-4 px-4 text-center">
                      <X className="inline text-gray-400" size={18} />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <X className="inline text-gray-400" size={18} />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Check className="inline text-green-500" size={18} />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 text-gray-900 dark:text-white">Dedicated accountmanager</td>
                    <td className="py-4 px-4 text-center">
                      <X className="inline text-gray-400" size={18} />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <X className="inline text-gray-400" size={18} />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Check className="inline text-green-500" size={18} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Why Premium */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-10">
            Waarom kiezen voor Premium?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Reason 1 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md transition-all hover:shadow-lg">
              <div className="flex items-start">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full mr-4">
                  <Zap className="text-orange-500" size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Onbeperkte mogelijkheden
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Krijg onbeperkte toegang tot alle functies en aanbevelingen, zodat je je stijl volledig kunt verkennen.
                  </p>
                </div>
              </div>
            </div>

            {/* Reason 2 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md transition-all hover:shadow-lg">
              <div className="flex items-start">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full mr-4">
                  <Crown className="text-orange-500" size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Premium ervaring
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Geniet van een reclamevrije ervaring met prioriteit ondersteuning en exclusieve functies.
                  </p>
                </div>
              </div>
            </div>

            {/* Reason 3 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md transition-all hover:shadow-lg">
              <div className="flex items-start">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full mr-4">
                  <ShieldCheck className="text-orange-500" size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Geavanceerde beveiliging
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Premium gebruikers krijgen extra beveiligingslagen voor hun gegevens en uploads.
                  </p>
                </div>
              </div>
            </div>

            {/* Reason 4 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md transition-all hover:shadow-lg">
              <div className="flex items-start">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full mr-4">
                  <Clock className="text-orange-500" size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Altijd up-to-date
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Ontvang seizoensgebonden updates en blijf op de hoogte van de nieuwste trends die bij jouw stijl passen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Guarantee Section - NEW */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-8 mb-16 transition-colors">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/4 flex justify-center mb-6 md:mb-0">
              <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
                <Award className="text-blue-500" size={40} />
              </div>
            </div>
            <div className="md:w-3/4 md:pl-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Onze 14-dagen tevredenheidsgarantie
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We zijn zo overtuigd van de kwaliteit van onze Premium service dat we een 14-dagen geld-terug-garantie bieden. Als je niet tevreden bent, krijg je je geld volledig terug - geen vragen gesteld.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center">
                  <Check className="text-green-500 mr-2" size={18} />
                  <span className="text-gray-700 dark:text-gray-300">Geen verplichtingen</span>
                </div>
                <div className="flex items-center">
                  <Check className="text-green-500 mr-2" size={18} />
                  <span className="text-gray-700 dark:text-gray-300">Eenvoudig opzeggen</span>
                </div>
                <div className="flex items-center">
                  <Check className="text-green-500 mr-2" size={18} />
                  <span className="text-gray-700 dark:text-gray-300">100% geld terug</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-16 transition-colors">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
              Veelgestelde vragen over abonnementen
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Kan ik mijn abonnement op elk moment opzeggen?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Ja, je kunt je Premium abonnement op elk moment opzeggen. Je behoudt toegang tot alle Premium functies tot het einde van je huidige factureringsperiode.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Is er een proefperiode voor Premium?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Ja, we bieden een gratis proefperiode van 14 dagen voor ons Premium abonnement. Je kunt alle functies uitproberen zonder verplichtingen.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Wat gebeurt er met mijn gegevens als ik downgrade?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Als je van Premium naar Basis gaat, blijven al je gegevens en voorkeuren bewaard. Je verliest alleen toegang tot Premium functies zoals onbeperkte aanbevelingen.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Kan ik wisselen tussen maandelijks en jaarlijks?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Ja, je kunt op elk moment wisselen tussen maandelijkse en jaarlijkse facturering. Bij overstap naar jaarlijks profiteer je direct van de korting.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods - NEW */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Veilige betaalmethoden
          </h2>
          
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex items-center justify-center mx-auto mb-2">
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" className="text-gray-400"/>
                  <path d="M7 15C8.10457 15 9 14.1046 9 13C9 11.8954 8.10457 11 7 11C5.89543 11 5 11.8954 5 13C5 14.1046 5.89543 15 7 15Z" fill="currentColor" className="text-blue-500"/>
                  <path d="M15 11C13.8954 11 13 11.8954 13 13C13 14.1046 13.8954 15 15 15C16.1046 15 17 14.1046 17 13C17 11.8954 16.1046 11 15 11Z" fill="currentColor" className="text-orange-500"/>
                  <path d="M11 13C11 11.8954 11.8954 11 13 11C14.1046 11 15 11.8954 15 13C15 14.1046 14.1046 15 13 15C11.8954 15 11 14.1046 11 13Z" fill="currentColor" className="text-yellow-500"/>
                </svg>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Mastercard</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex items-center justify-center mx-auto mb-2">
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" className="text-gray-400"/>
                  <path d="M9 9H15V15H9V9Z" fill="currentColor" className="text-blue-500"/>
                </svg>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Visa</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex items-center justify-center mx-auto mb-2">
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5L2 12L12 19L22 12L12 5Z" fill="currentColor" className="text-orange-500"/>
                </svg>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">iDEAL</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex items-center justify-center mx-auto mb-2">
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 7H4C2.89543 7 2 7.89543 2 9V15C2 16.1046 2.89543 17 4 17H20C21.1046 17 22 16.1046 22 15V9C22 7.89543 21.1046 7 20 7Z" fill="currentColor" className="text-blue-500"/>
                  <path d="M12 12C12 10.3431 13.3431 9 15 9C16.6569 9 18 10.3431 18 12C18 13.6569 16.6569 15 15 15C13.3431 15 12 13.6569 12 12Z" fill="currentColor" className="text-blue-300"/>
                </svg>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">PayPal</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex items-center justify-center mx-auto mb-2">
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" className="text-gray-400"/>
                  <path d="M7 12H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gray-400"/>
                  <path d="M12 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gray-400"/>
                </svg>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Apple Pay</p>
            </div>
          </div>
          
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center">
              <ShieldCheck size={16} className="mr-2 text-green-500" />
              Alle betalingen zijn veilig en versleuteld
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Klaar om je stijl naar het volgende niveau te tillen?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Begin vandaag nog met FitFi en ontdek hoe eenvoudig het is om er altijd op je best uit te zien.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              as={Link}
              to="/onboarding" 
              variant="outline"
              size="lg"
            >
              Gratis starten
            </Button>
            <Button 
              as={Link}
              to="/onboarding?plan=premium" 
              variant="primary"
              size="lg"
              icon={<Sparkles size={20} />}
              iconPosition="left"
            >
              Premium proberen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;