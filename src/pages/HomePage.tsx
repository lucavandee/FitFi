import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  User,
  Check,
  Mail,
  Camera,
  Zap,
  Star,
  Users,
  Award
} from 'lucide-react';
import Button from '../components/ui/Button';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    // Track lead capture event
    if (typeof window.trackLeadCapture === 'function') {
      window.trackLeadCapture('hero_form', 'new_lead');
      console.log('📊 Lead capture tracked from hero form - GA4 event sent');
    }
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Store form data in localStorage for the onboarding
    localStorage.setItem('fitfi-lead-data', JSON.stringify(formData));
    
    // Navigate to onboarding (not questionnaire)
    navigate('/onboarding');
  };

  // Testimonials data
  const testimonials = [
    {
      id: 1,
      name: "Emma van der Berg",
      role: "Marketing Professional",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2",
      quote: "FitFi heeft mijn garderobe en zelfvertrouwen compleet getransformeerd. Ik krijg nu regelmatig complimenten over mijn outfits!",
      rating: 5
    },
    {
      id: 2,
      name: "Thomas Jansen",
      role: "Software Engineer",
      avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2",
      quote: "Als man vond ik het altijd lastig om mijn eigen stijl te vinden. FitFi heeft me geholpen te begrijpen welke kleuren en pasvorm bij mijn lichaamsbouw passen.",
      rating: 5
    },
    {
      id: 3,
      name: "Sophie Bakker",
      role: "Ondernemer",
      avatar: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2",
      quote: "Ik kocht altijd kleding die ik uiteindelijk nauwelijks droeg. FitFi heeft me geholpen bewustere keuzes te maken en een capsule garderobe op te bouwen.",
      rating: 5
    }
  ];

  // Partner logos
  const partners = [
    { name: "Zalando", logo: "https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=100&h=50&dpr=2" },
    { name: "H&M", logo: "https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=100&h=50&dpr=2" },
    { name: "Wehkamp", logo: "https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=100&h=50&dpr=2" },
    { name: "ASOS", logo: "https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=100&h=50&dpr=2" }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-orange-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-20 overflow-hidden transition-colors">
        <div className="absolute inset-0 z-0 opacity-30 dark:opacity-20">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="flex-1 text-center lg:text-left mb-10 lg:mb-0 lg:pr-10 animate-slide-up">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Ontdek je perfecte stijl met <span className="text-orange-500">AI</span>
              </h1>
              <p className="mt-6 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0">
                FitFi gebruikt AI om je voorkeuren en foto te analyseren en gepersonaliseerde kleding- en lifestyle-aanbevelingen voor je te maken.
              </p>
              
              {/* Lead Capture Form */}
              <div className="mt-10 max-w-md mx-auto lg:mx-0">
                <form onSubmit={handleFormSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors animate-scale-in">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Begin je stijlreis
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Krijg gepersonaliseerde aanbevelingen in enkele minuten
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="hero-name" className="sr-only">
                        Je naam
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User size={18} className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="hero-name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                          placeholder="Je naam"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="hero-email" className="sr-only">
                        E-mailadres
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail size={18} className="text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="hero-email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                          placeholder="je@email.com"
                        />
                      </div>
                    </div>
                    
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      fullWidth
                      disabled={isSubmitting || !formData.name.trim() || !formData.email.trim()}
                      icon={isSubmitting ? undefined : <ArrowRight size={20} />}
                      iconPosition="right"
                      className="hover-lift transition-transform"
                    >
                      {isSubmitting ? 'Quiz starten...' : 'Doe de stijlscan'}
                    </Button>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                    <ShieldCheck size={14} className="mr-1 text-green-500" />
                    Je gegevens zijn veilig en versleuteld
                  </div>
                </form>
              </div>
              
              <div className="mt-6 text-center lg:text-left">
                <Button 
                  as={Link}
                  to="/hoe-het-werkt" 
                  size="sm" 
                  variant="ghost"
                  className="hover-lift transition-transform animate-fade-in"
                >
                  Bekijk voorbeelden
                </Button>
              </div>
            </div>
            
            <div className="flex-1 flex justify-center lg:justify-end animate-fade-in">
              <div className="relative h-[420px] w-[320px] rounded-xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                  alt="Stijlvolle persoon met gepersonaliseerde outfit" 
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <div className="bg-white/90 dark:bg-gray-800/90 rounded-lg p-4 backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                      <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
                        <Sparkles className="text-orange-500" size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Stijl match: 94%</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-xs mt-1">Perfect voor jouw voorkeuren</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="flex flex-wrap justify-center gap-8 text-center animate-fade-in">
            <div className="flex flex-col items-center">
              <div className="text-gray-600 dark:text-gray-400 mb-1">Vertrouwd door</div>
              <div className="font-bold text-2xl text-gray-900 dark:text-white">10.000+</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">Actieve gebruikers</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-gray-600 dark:text-gray-400 mb-1">Outfits gemaakt</div>
              <div className="font-bold text-2xl text-gray-900 dark:text-white">1M+</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">& groeiend</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-gray-600 dark:text-gray-400 mb-1">Tevredenheid</div>
              <div className="font-bold text-2xl text-gray-900 dark:text-white">4.8/5</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">Gemiddelde beoordeling</div>
            </div>
          </div>
        </div>
      </section>

      {/* USP Section - NEW */}
      <section className="py-16 bg-white dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* USP 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-4">
                <Zap className="text-orange-500" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Binnen 3 minuten jouw ideale outfit
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Onze geavanceerde AI analyseert duizenden modecombinaties om direct de perfecte match voor jou te vinden.
              </p>
            </div>

            {/* USP 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                <Camera className="text-blue-500" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                AI-styling op maat, op basis van je foto
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Upload een foto en ontvang binnen enkele minuten gepersonaliseerde outfits die perfect bij jouw lichaamsbouw en stijl passen.
              </p>
            </div>

            {/* USP 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <Users className="text-green-500" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Voor ondernemers, sporters en stijlbewusten
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Of je nu indruk wilt maken op werk, comfortabel wilt sporten of gewoon je stijl wilt verbeteren - FitFi heeft de perfecte look voor jou.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50 dark:bg-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Hoe het werkt in 3 stappen
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Van persoonlijke voorkeur tot perfecte outfit - ons AI-systeem maakt het eenvoudig om je ideale stijl te ontdekken.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Step 1 */}
            <div className="text-center group animate-fade-in">
              <div className="relative mb-8">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <User className="text-white" size={32} />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Stap 1: Quiz invullen
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Vertel ons over je stijlvoorkeuren, lifestyle en fashion doelen door onze intuïtieve vragenlijst in te vullen.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="relative mb-8">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <Camera className="text-white" size={32} />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Stap 2: Foto uploaden
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Upload veilig een foto zodat onze AI je lichaamsbouw en huidige stijl kan begrijpen voor betere aanbevelingen.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="relative mb-8">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <Zap className="text-white" size={32} />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Stap 3: Ontvang aanbevelingen
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Krijg direct gepersonaliseerde outfit-aanbevelingen die perfect passen bij jouw stijl, lichaamsbouw en lifestyle.
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center mt-16 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <Button 
              as={Link}
              to="/onboarding" 
              variant="primary"
              size="lg"
              icon={<ArrowRight size={20} />}
              iconPosition="right"
              className="hover-lift transition-transform shadow-lg hover:shadow-xl"
            >
              Begin nu met de quiz
            </Button>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              Gratis te gebruiken • Geen creditcard vereist
            </p>
          </div>
        </div>
      </section>

      {/* Privacy & Security Section - NEW */}
      <section className="py-16 bg-white dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-8 transition-colors">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/4 flex justify-center mb-6 md:mb-0">
                <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
                  <ShieldCheck className="text-blue-500" size={40} />
                </div>
              </div>
              <div className="md:w-3/4 md:pl-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Jouw privacy is onze prioriteit
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Bij FitFi nemen we de beveiliging van je gegevens zeer serieus. Je foto's worden end-to-end versleuteld en direct na analyse verwijderd. We delen je gegevens nooit met derden zonder jouw expliciete toestemming.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <Check className="text-green-500 mr-2" size={18} />
                    <span className="text-gray-700 dark:text-gray-300">End-to-end encryptie</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="text-green-500 mr-2" size={18} />
                    <span className="text-gray-700 dark:text-gray-300">AVG/GDPR Compliant</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="text-green-500 mr-2" size={18} />
                    <span className="text-gray-700 dark:text-gray-300">Foto's direct verwijderd</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - NEW */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Wat onze gebruikers zeggen
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Duizenden mensen hebben hun stijl al getransformeerd met FitFi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md transition-all hover:shadow-lg">
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
                    loading="lazy"
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
      </section>

      {/* Partners Section - NEW */}
      <section className="py-12 bg-white dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-500 dark:text-gray-400">
              Onze partners
            </h2>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {partners.map((partner, index) => (
              <div key={index} className="grayscale hover:grayscale-0 transition-all duration-300">
                <img 
                  src={partner.logo} 
                  alt={partner.name} 
                  className="h-8 md:h-10 object-contain"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Waarom kiezen voor FitFi
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Ons platform biedt unieke voordelen die ons onderscheiden van traditionele stylingdiensten.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm transition-all hover-lift animate-fade-in">
              <div className="text-orange-500 mb-4">
                <Sparkles size={28} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                AI-gestuurde aanbevelingen
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Onze geavanceerde AI analyseert duizenden modecombinaties om te vinden wat het beste bij jou past.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm transition-all hover-lift animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="text-orange-500 mb-4">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Privacy-eerst aanpak
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Je gegevens en foto's worden versleuteld en nooit gedeeld met derden zonder jouw toestemming.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm transition-all hover-lift animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="text-orange-500 mb-4">
                <Clock size={28} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Bespaar tijd & geld
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Stop met geld verspillen aan kleding die niet bij je past. Krijg gepersonaliseerd advies binnen enkele minuten.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 bg-white dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Kies je abonnement
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Begin gratis of upgrade voor premium functies en aanbevelingen.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden transition-all hover-lift animate-fade-in">
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Gratis</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-white">€0</span>
                  <span className="ml-1 text-gray-500 dark:text-gray-400">/maand</span>
                </div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Perfect om het platform uit te proberen
                </p>

                <ul className="mt-6 space-y-4">
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-gray-600 dark:text-gray-400">
                      Basis stijlvragenlijst
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-gray-600 dark:text-gray-400">
                      1 foto-upload per maand
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-gray-600 dark:text-gray-400">
                      3 outfit aanbevelingen
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-gray-600 dark:text-gray-400">
                      Basis stijltips
                    </p>
                  </li>
                </ul>
              </div>

              <div className="px-6 pb-6">
                <Button 
                  as={Link}
                  to="/onboarding" 
                  variant="outline" 
                  fullWidth
                  className="mt-8"
                >
                  Aan de slag
                </Button>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="bg-orange-50 dark:bg-gray-800 border-2 border-orange-500 rounded-xl overflow-hidden relative transition-all hover-lift animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="absolute top-0 right-0 bg-orange-500 text-white px-4 py-1 text-xs font-bold uppercase rounded-bl-lg">
                Populair
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Premium</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-white">€12,99</span>
                  <span className="ml-1 text-gray-500 dark:text-gray-400">/maand</span>
                </div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Alle tools die je nodig hebt voor een complete stijltransformatie
                </p>

                <ul className="mt-6 space-y-4">
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-gray-600 dark:text-gray-400">
                      Geavanceerde stijlvragenlijst
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-gray-600 dark:text-gray-400">
                      Onbeperkte foto-uploads
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-gray-600 dark:text-gray-400">
                      Onbeperkte outfit aanbevelingen
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-gray-600 dark:text-gray-400">
                      Gedetailleerd styling advies
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-gray-600 dark:text-gray-400">
                      Seizoensgebonden garderobe updates
                    </p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-gray-600 dark:text-gray-400">
                      Prioriteit ondersteuning
                    </p>
                  </li>
                </ul>
              </div>

              <div className="px-6 pb-6">
                <Button 
                  as={Link}
                  to="/onboarding?plan=premium" 
                  variant="primary" 
                  fullWidth
                  className="mt-8"
                >
                  Start premium proefperiode
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-700 dark:to-orange-800 py-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Klaar om je perfecte stijl te ontdekken?
          </h2>
          <p className="text-white/90 text-lg max-w-2xl mx-auto mb-8">
            Sluit je aan bij duizenden tevreden gebruikers die hun stijl hebben getransformeerd met FitFi.
          </p>
          <Button 
            as={Link}
            to="/onboarding" 
            variant="secondary"
            size="lg"
            className="animate-fade-in"
          >
            Begin gratis
          </Button>
        </div>
      </section>

      {/* Mobile Sticky CTA - NEW */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 z-50">
        <Button
          as={Link}
          to="/onboarding"
          variant="primary"
          fullWidth
          icon={<Zap size={18} />}
          iconPosition="left"
          className="animate-pulse hover:animate-none"
        >
          🚀 Start mijn stijltest
        </Button>
      </div>
    </div>
  );
};

export default HomePage;