import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Check } from 'lucide-react';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';
import Walkthrough from '../components/walkthrough/Walkthrough';
import StyleArchetypeSlider from '../components/home/StyleArchetypeSlider';
import ImageWithFallback from '../components/ui/ImageWithFallback';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeGender, setActiveGender] = useState<'male' | 'female'>('female');
  
  // Switch gender every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveGender(prev => prev === 'male' ? 'female' : 'male');
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

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
    }
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Store form data in localStorage for the onboarding
    localStorage.setItem('fitfi-lead-data', JSON.stringify(formData));
    
    // Navigate to onboarding
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F6]">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center">
            <motion.div 
              className="flex-1 text-center lg:text-left mb-12 lg:mb-0 lg:pr-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 leading-tight mb-6">
                Train je eigen stijlcoach
              </h1>
              <p className="text-xl text-gray-700 max-w-2xl mx-auto lg:mx-0 mb-10">
                Swipe, leer en ontdek outfits die écht bij je passen — zonder eindeloos scrollen.
              </p>
              
              {/* Waarom FitFi Section */}
              <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Waarom FitFi?</h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-3 mt-1">•</span>
                    Teveel webshops. Teveel opties. Teveel twijfel.
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-3 mt-1">•</span>
                    Je bent op zoek naar dat ene kledingstuk — maar vindt het niet.
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-3 mt-1">•</span>
                    Je hebt geen tijd (of zin) om eindeloos te scrollen.
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 mr-3 mt-1">•</span>
                    Je wilt gewoon goed gekleed zijn, zonder gedoe.
                  </li>
                </ul>
              </div>
              
              {/* Hoe werkt het Section */}
              <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Hoe werkt het?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-4xl mb-3">🧠</div>
                    <h3 className="font-bold text-gray-900 mb-2">Swipe & train</h3>
                    <p className="text-gray-600 text-sm">Like of skip outfits. FitFi leert van jouw keuzes.</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-3">🎯</div>
                    <h3 className="font-bold text-gray-900 mb-2">Persoonlijke aanbevelingen</h3>
                    <p className="text-gray-600 text-sm">Outfits afgestemd op jouw stijl, jouw vorm, jouw leven.</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl mb-3">🛍️</div>
                    <h3 className="font-bold text-gray-900 mb-2">Shop of sla op</h3>
                    <p className="text-gray-600 text-sm">Direct te shoppen of bewaren — alles op jouw tempo.</p>
                  </div>
                </div>
              </div>
              
              {/* Quote Section */}
              <div className="bg-gradient-to-r from-orange-50 to-blue-50 rounded-2xl p-6 mb-8 border-l-4 border-orange-500">
                <p className="text-lg font-medium flex items-start">
                  <span className="text-2xl mr-3">💡</span>
                  "Sinds ik FitFi gebruik, bespaar ik zóveel tijd. En ik voel me elke dag zelfverzekerder." — Lisa, 28
                </p>
              </div>
              
              {/* CTA Section */}
              <div className="bg-orange-500 text-white rounded-2xl p-6 mb-8">
                <p className="text-lg font-medium flex items-start">
                  <span className="text-2xl mr-3">👉</span>
                  Start de stijlquiz en ontdek in 1 minuut wat bij je past.
                </p>
              </div>
              
              {/* Lead Capture Form */}
              <div className="max-w-md mx-auto lg:mx-0">
                <form onSubmit={handleFormSubmit} className="bg-white p-6 rounded-2xl shadow-lg">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="hero-name" className="block text-sm font-medium text-gray-700 mb-1">
                        Je naam
                      </label>
                      <input
                        type="text"
                        id="hero-name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#bfae9f] focus:border-[#bfae9f]"
                        placeholder="Voer je naam in"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="hero-email" className="block text-sm font-medium text-gray-700 mb-1">
                        E-mailadres
                      </label>
                      <input
                        type="email"
                        id="hero-email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#bfae9f] focus:border-[#bfae9f]"
                        placeholder="je@email.com"
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      fullWidth
                      disabled={isSubmitting || !formData.name.trim() || !formData.email.trim()}
                      icon={isSubmitting ? undefined : <ArrowRight size={20} />}
                      iconPosition="right"
                      className="mt-2 bg-[#bfae9f] hover:bg-[#a89a8c]"
                    >
                      {isSubmitting ? 'Even geduld...' : 'Start de stijlquiz'}
                    </Button>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-center text-xs text-gray-600">
                    <ShieldCheck size={14} className="mr-1 text-[#bfae9f]" />
                    Je gegevens zijn veilig en versleuteld
                  </div>
                </form>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex-1 flex justify-center lg:justify-end relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative h-[500px] w-[350px] rounded-2xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#bfae9f]/20 z-10"></div>
                
                {/* Female image */}
                <div className={`absolute inset-0 transition-opacity duration-1000 ${activeGender === 'female' ? 'opacity-100' : 'opacity-0'}`}>
                  <ImageWithFallback 
                    src="https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=2" 
                    alt="Stijlvolle vrouw met FitFi aanbevelingen" 
                    className="h-full w-full object-cover"
                    fallbackSrc="/images/fallback-user.png"
                  />
                </div>
                
                {/* Male image */}
                <div className={`absolute inset-0 transition-opacity duration-1000 ${activeGender === 'male' ? 'opacity-100' : 'opacity-0'}`}>
                  <ImageWithFallback 
                    src="https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=2" 
                    alt="Stijlvolle man met FitFi aanbevelingen" 
                    className="h-full w-full object-cover"
                    fallbackSrc="/images/fallback-user.png"
                  />
                </div>
                
                {/* Gender toggle buttons */}
                <div className="absolute bottom-4 right-4 z-20 flex space-x-2">
                  <button 
                    onClick={() => setActiveGender('female')}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      activeGender === 'female' 
                        ? 'bg-[#bfae9f] text-white' 
                        : 'bg-white/80 text-gray-700 hover:bg-white'
                    }`}
                    aria-label="Toon vrouwelijke stijl"
                  >
                    <span className="text-lg">👩</span>
                  </button>
                  <button 
                    onClick={() => setActiveGender('male')}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      activeGender === 'male' 
                        ? 'bg-[#bfae9f] text-white' 
                        : 'bg-white/80 text-gray-700 hover:bg-white'
                    }`}
                    aria-label="Toon mannelijke stijl"
                  >
                    <span className="text-lg">👨</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Hoe FitFi jou helpt
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Ontdek hoe onze AI-technologie jouw stijl transformeert
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative mb-6">
                <div className="w-24 h-24 mx-auto rounded-full bg-[#bfae9f]/10 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-[#bfae9f]/20 flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#bfae9f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 8V16" stroke="#bfae9f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 12H16" stroke="#bfae9f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Ontdek jouw stijlprofiel
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Onze AI analyseert jouw voorkeuren en creëert een uniek stijlprofiel dat perfect bij jou past.
              </p>
              
              <div className="mt-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex justify-center mb-2">
                  <div className="w-32 h-32 relative">
                    <svg viewBox="0 0 36 36" className="w-full h-full">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#E6E6E6"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#bfae9f"
                        strokeWidth="3"
                        strokeDasharray="80, 100"
                      />
                      <text x="18" y="20.5" textAnchor="middle" fontSize="8" fill="#666">80%</text>
                    </svg>
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-sm font-medium text-gray-900">Modern Minimalist</span>
                </div>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative mb-6">
                <div className="w-24 h-24 mx-auto rounded-full bg-[#bfae9f]/10 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-[#bfae9f]/20 flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 9V3H15" stroke="#bfae9f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 15V21H9" stroke="#bfae9f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 3L14 10" stroke="#bfae9f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 14L3 21" stroke="#bfae9f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Outfits op maat
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Krijg complete outfits die perfect bij jouw stijl, lichaamsbouw en voorkeuren passen.
              </p>
              
              <div className="mt-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="grid grid-cols-3 gap-2">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <ImageWithFallback 
                      src="https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2" 
                      alt="Bovenstuk" 
                      className="w-full h-full object-cover"
                      fallbackSrc="/placeholder.png"
                    />
                  </div>
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <ImageWithFallback 
                      src="https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2" 
                      alt="Broek" 
                      className="w-full h-full object-cover"
                      fallbackSrc="/placeholder.png"
                    />
                  </div>
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <ImageWithFallback 
                      src="https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2" 
                      alt="Schoenen" 
                      className="w-full h-full object-cover"
                      fallbackSrc="/placeholder.png"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="relative mb-6">
                <div className="w-24 h-24 mx-auto rounded-full bg-[#bfae9f]/10 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-[#bfae9f]/20 flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.84 4.60999C20.3292 4.09946 19.7228 3.69352 19.0554 3.41708C18.388 3.14064 17.6725 2.99918 16.95 2.99918C16.2275 2.99918 15.512 3.14064 14.8446 3.41708C14.1772 3.69352 13.5708 4.09946 13.06 4.60999L12 5.66999L10.94 4.60999C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.60999C2.1283 5.64169 1.54871 7.04096 1.54871 8.49999C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.3505 11.8792 21.7565 11.2728 22.0329 10.6054C22.3094 9.93801 22.4508 9.22249 22.4508 8.49999C22.4508 7.7775 22.3094 7.06198 22.0329 6.39461C21.7565 5.72723 21.3505 5.12081 20.84 4.60999Z" stroke="#bfae9f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Slimme kledingkeuzes
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Krijg gepersonaliseerde productaanbevelingen die perfect bij jouw stijl en budget passen.
              </p>
              
              <div className="mt-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 mr-3">
                      <ImageWithFallback 
                        src="https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2" 
                        alt="Bovenstuk" 
                        className="w-full h-full object-cover"
                        fallbackSrc="/placeholder.png"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Oversized Shirt</p>
                      <p className="text-xs text-gray-500">€49,95</p>
                    </div>
                    <div className="bg-[#bfae9f] text-white text-xs px-2 py-1 rounded-full">
                      92% match
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 mr-3">
                      <ImageWithFallback 
                        src="https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2" 
                        alt="Broek" 
                        className="w-full h-full object-cover"
                        fallbackSrc="/placeholder.png"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Slim Fit Jeans</p>
                      <p className="text-xs text-gray-500">€89,95</p>
                    </div>
                    <div className="bg-[#bfae9f] text-white text-xs px-2 py-1 rounded-full">
                      87% match
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-[#FAF8F6] overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <Walkthrough />

          {/* Style Archetype Slider */}
          <StyleArchetypeSlider />

          {/* CTA Button */}
          <div className="text-center mt-16">
            <Button 
              onClick={() => navigate('/onboarding')}
              variant="primary"
              size="lg"
              icon={<ArrowRight size={20} />}
              iconPosition="right"
              className="bg-[#bfae9f] hover:bg-[#a89a8c]"
            >
              Start je stijlreis
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Wat onze gebruikers zeggen
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Duizenden mensen hebben hun stijl al getransformeerd met FitFi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <motion.div 
              className="bg-[#FAF8F6] p-6 rounded-2xl shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-gray-700 mb-6 italic">
                "FitFi heeft mijn garderobe en zelfvertrouwen compleet getransformeerd. Ik krijg nu regelmatig complimenten over mijn outfits!"
              </p>
              <div className="flex items-center">
                <ImageWithFallback 
                  src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2" 
                  alt="Emma van der Berg"
                  className="w-10 h-10 rounded-full object-cover mr-3"
                  fallbackSrc="/images/fallback-user.png"
                />
                <div>
                  <h4 className="font-medium text-gray-900">
                    Emma van der Berg
                  </h4>
                  <p className="text-gray-500 text-sm">
                    Marketing Professional
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div 
              className="bg-[#FAF8F6] p-6 rounded-2xl shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <p className="text-gray-700 mb-6 italic">
                "Als man vond ik het altijd lastig om mijn eigen stijl te vinden. FitFi heeft me geholpen te begrijpen welke kleuren en pasvorm bij mijn lichaamsbouw passen."
              </p>
              <div className="flex items-center">
                <ImageWithFallback 
                  src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2" 
                  alt="Thomas Jansen"
                  className="w-10 h-10 rounded-full object-cover mr-3"
                  fallbackSrc="/images/fallback-user.png"
                />
                <div>
                  <h4 className="font-medium text-gray-900">
                    Thomas Jansen
                  </h4>
                  <p className="text-gray-500 text-sm">
                    Software Engineer
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Testimonial 3 */}
            <motion.div 
              className="bg-[#FAF8F6] p-6 rounded-2xl shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <p className="text-gray-700 mb-6 italic">
                "Ik kocht altijd kleding die ik uiteindelijk nauwelijks droeg. FitFi heeft me geholpen bewustere keuzes te maken en een capsule garderobe op te bouwen."
              </p>
              <div className="flex items-center">
                <ImageWithFallback 
                  src="https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2" 
                  alt="Sophie Bakker"
                  className="w-10 h-10 rounded-full object-cover mr-3"
                  fallbackSrc="/images/fallback-user.png"
                />
                <div>
                  <h4 className="font-medium text-gray-900">
                    Sophie Bakker
                  </h4>
                  <p className="text-gray-500 text-sm">
                    Ondernemer
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#bfae9f]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Klaar om je stijl te ontdekken?
            </h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
              Begin vandaag nog met FitFi en ontdek hoe eenvoudig het is om er altijd op je best uit te zien.
            </p>
            <Button 
              onClick={() => navigate('/onboarding')}
              variant="secondary"
              size="lg"
              icon={<ArrowRight size={20} />}
              iconPosition="right"
              className="bg-white text-[#bfae9f] hover:bg-gray-100"
            >
              Start je stijlreis
            </Button>
            <p className="text-sm text-white/80 mt-4">
              Geen verplichtingen • Gratis te gebruiken
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-[#FAF8F6]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Waarom FitFi?
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Ontdek de voordelen van een persoonlijke AI-stylist
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Benefit 1 */}
            <motion.div 
              className="bg-white p-6 rounded-2xl shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-12 h-12 rounded-full bg-[#bfae9f]/10 flex items-center justify-center mb-4">
                <Check className="text-[#bfae9f]" size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Tijdbesparend
              </h3>
              <p className="text-gray-700">
                Geen eindeloos zoeken meer naar de juiste kleding. FitFi doet het werk voor je.
              </p>
            </motion.div>

            {/* Benefit 2 */}
            <motion.div 
              className="bg-white p-6 rounded-2xl shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="w-12 h-12 rounded-full bg-[#bfae9f]/10 flex items-center justify-center mb-4">
                <Check className="text-[#bfae9f]" size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Persoonlijk advies
              </h3>
              <p className="text-gray-700">
                Aanbevelingen die rekening houden met jouw unieke stijl, lichaamsbouw en voorkeuren.
              </p>
            </motion.div>

            {/* Benefit 3 */}
            <motion.div 
              className="bg-white p-6 rounded-2xl shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-12 h-12 rounded-full bg-[#bfae9f]/10 flex items-center justify-center mb-4">
                <Check className="text-[#bfae9f]" size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Altijd beschikbaar
              </h3>
              <p className="text-gray-700">
                Je persoonlijke stylist is 24/7 beschikbaar, waar en wanneer je maar wilt.
              </p>
            </motion.div>

            {/* Benefit 4 */}
            <motion.div 
              className="bg-white p-6 rounded-2xl shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="w-12 h-12 rounded-full bg-[#bfae9f]/10 flex items-center justify-center mb-4">
                <Check className="text-[#bfae9f]" size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Lerende AI
              </h3>
              <p className="text-gray-700">
                Hoe meer je FitFi gebruikt, hoe beter de aanbevelingen worden. Onze AI leert van jouw feedback.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mobile Sticky CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
        <Button
          onClick={() => navigate('/onboarding')}
          variant="primary"
          fullWidth
          className="bg-[#bfae9f] hover:bg-[#a89a8c]"
        >
          Start je stijlreis
        </Button>
      </div>
    </div>
  );
};

export default HomePage;