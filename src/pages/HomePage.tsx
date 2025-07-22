import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Check, Play, Zap, Target, Heart } from 'lucide-react';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';
import ImageWithFallback from '../components/ui/ImageWithFallback';
import ProgressRecoveryBanner from '../components/ui/ProgressRecoveryBanner';
import { hasSavedProgress } from '../utils/progressPersistence';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeGender, setActiveGender] = useState<'male' | 'female'>('female');
  const [showRecoveryBanner, setShowRecoveryBanner] = useState(false);
  
  // Check for saved progress
  useEffect(() => {
    const progressInfo = hasSavedProgress();
    if (progressInfo.hasQuizProgress || progressInfo.hasOnboardingProgress) {
      setShowRecoveryBanner(true);
    }
  }, []);
  
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
    <div className="min-h-screen bg-gradient-to-b from-lightgrey to-cardwhite">
      {/* Progress Recovery Banner */}
      {showRecoveryBanner && (
        <ProgressRecoveryBanner
          onRecover={(type, progress) => {
            if (type === 'quiz') {
              navigate(`/quiz/${progress.currentStep}`);
            } else if (type === 'onboarding') {
              navigate(`/onboarding/${progress.currentStep}`);
            }
          }}
          onDismiss={() => setShowRecoveryBanner(false)}
        />
      )}
      
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-br from-light-grey via-card-white to-turquoise/10">
        <div className="container mx-auto px-6 sm:px-8 lg:px-10 max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center">
            <motion.div 
              className="flex-1 text-center lg:text-left mb-12 lg:mb-0 lg:pr-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-h1 md:text-5xl lg:text-6xl font-display font-bold text-text-primary leading-tight mb-8">
                Train je eigen stijlcoach
              </h1>
              
              <p className="text-h2 md:text-2xl text-text-secondary leading-relaxed mb-10">
                Swipe. Leer. Ontdek outfits die écht bij je passen — zonder keuzestress.
              </p>
              
              {/* Lead Capture Form */}
              <div className="max-w-md mx-auto lg:mx-0 mb-10">
                <form onSubmit={handleFormSubmit} className="bg-card-white p-8 rounded shadow-lg border border-light-grey">
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="hero-name" className="block text-sm font-medium text-text-primary mb-1">
                        Je naam
                      </label>
                      <input
                        type="text"
                        id="hero-name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-6 py-4 rounded border border-light-grey focus:ring-2 focus:ring-turquoise focus:border-turquoise"
                        placeholder="Voer je naam in"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="hero-email" className="block text-sm font-medium text-text-primary mb-1">
                        E-mailadres
                      </label>
                      <input
                        type="email"
                        id="hero-email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-6 py-4 rounded border border-light-grey focus:ring-2 focus:ring-turquoise focus:border-turquoise"
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
                      className="mt-3 bg-turquoise hover:bg-turquoise-dark py-4 px-8 rounded shadow-sm"
                    >
                      {isSubmitting ? 'Even geduld...' : 'Start de stijlquiz'}
                    </Button>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-center text-xs text-text-secondary">
                    <ShieldCheck size={14} className="mr-1 text-turquoise" />
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
                    alt="Vrouw met stijlvolle outfit als visuele metafoor voor stijlcoach" 
                    className="h-full w-full object-cover"
                    fallbackSrc="/images/fallback-user.png"
                  />
                </div>
                
                {/* Male image */}
                <div className={`absolute inset-0 transition-opacity duration-1000 ${activeGender === 'male' ? 'opacity-100' : 'opacity-0'}`}>
                  <ImageWithFallback 
                    src="https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=2" 
                    alt="Man met stijlvolle outfit als visuele metafoor voor stijlcoach" 
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
                        ? 'bg-turquoise text-card-white' 
                        : 'bg-card-white/80 text-text-secondary hover:bg-card-white'
                    }`}
                    aria-label="Toon vrouwelijke stijl"
                  >
                    <span className="text-lg">👩</span>
                  </button>
                  <button 
                    onClick={() => setActiveGender('male')}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      activeGender === 'male' 
                        ? 'bg-turquoise text-card-white' 
                        : 'bg-card-white/80 text-text-secondary hover:bg-card-white'
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

      {/* Waarom FitFi Section */}
      <section className="py-20 bg-card-white">
        <div className="container mx-auto px-6 sm:px-8 lg:px-10 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-h2 md:text-4xl font-display font-bold text-text-primary mb-12">
              Waarom FitFi?
            </h2>
            
            <div className="space-y-8 text-left max-w-2xl mx-auto">
              <div className="flex items-start">
                <div className="w-6 h-6 rounded bg-turquoise flex items-center justify-center mr-6 mt-1 flex-shrink-0">
                  <span className="text-card-white text-sm">•</span>
                </div>
                <p className="text-lg text-text-secondary">
                  Het kost uren om iets te vinden dat echt bij je past
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="w-6 h-6 rounded bg-turquoise flex items-center justify-center mr-6 mt-1 flex-shrink-0">
                  <span className="text-card-white text-sm">•</span>
                </div>
                <p className="text-lg text-text-secondary">
                  Je wordt overspoeld met webshops, trends en twijfel
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="w-6 h-6 rounded bg-turquoise flex items-center justify-center mr-6 mt-1 flex-shrink-0">
                  <span className="text-card-white text-sm">•</span>
                </div>
                <p className="text-lg text-text-secondary">
                  Je wilt gewoon goed gekleed zijn — zonder eindeloos scrollen
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Hoe werkt het Section */}
      <section className="py-20 bg-light-grey">
        <div className="container mx-auto px-6 sm:px-8 lg:px-10 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-h2 md:text-4xl font-display font-bold text-text-primary mb-6">
              Hoe werkt het?
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {/* Step 1 */}
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-6xl mb-8">🧠</div>
              <h3 className="text-xl font-bold text-text-primary mb-4">
                Swipe & train
              </h3>
              <p className="text-text-secondary leading-relaxed">
                Liken of skippen? FitFi leert van jouw keuzes.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="text-6xl mb-8">🎯</div>
              <h3 className="text-xl font-bold text-text-primary mb-4">
                Jouw stijlcoach
              </h3>
              <p className="text-text-secondary leading-relaxed">
                Hoe meer je swipet, hoe persoonlijker de outfits worden.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="text-6xl mb-8">🛍️</div>
              <h3 className="text-xl font-bold text-text-primary mb-4">
                Shop of bewaar
              </h3>
              <p className="text-text-secondary leading-relaxed">
                Ontvang outfits die je direct kunt shoppen, finetunen of opslaan.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section className="py-20 bg-gradient-to-br from-turquoise/10 to-turquoise/20">
        <div className="container mx-auto px-6 sm:px-8 lg:px-10 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-h2 md:text-4xl font-display font-bold text-text-primary mb-8">
              Zo werkt het in 15 seconden
            </h2>
            
            <div className="relative max-w-4xl mx-auto">
              <div className="aspect-video bg-card-white rounded shadow-xl overflow-hidden border border-light-grey">
                {/* Placeholder for video */}
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-light-grey to-light-grey/80">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-card-white rounded flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Play className="text-turquoise ml-1" size={32} />
                    </div>
                    <p className="text-text-secondary font-medium">Demo video komt binnenkort</p>
                    <p className="text-sm text-text-secondary/80 mt-2">Je traint je stijlcoach bij elke swipe</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Wat levert het op Section */}
      <section className="py-20 bg-card-white">
        <div className="container mx-auto px-6 sm:px-8 lg:px-10 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-h2 md:text-4xl font-display font-bold text-text-primary mb-12">
              Wat levert het op?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left max-w-3xl mx-auto">
              <div className="flex items-start">
                <div className="w-8 h-8 rounded bg-green-100 flex items-center justify-center mr-6 mt-1 flex-shrink-0">
                  <Check className="text-green-600" size={16} />
                </div>
                <p className="text-lg text-text-secondary">
                  Outfits die écht bij je passen
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 rounded bg-green-100 flex items-center justify-center mr-6 mt-1 flex-shrink-0">
                  <Check className="text-green-600" size={16} />
                </div>
                <p className="text-lg text-text-secondary">
                  Minder keuzestress, meer overzicht
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 rounded bg-green-100 flex items-center justify-center mr-6 mt-1 flex-shrink-0">
                  <Check className="text-green-600" size={16} />
                </div>
                <p className="text-lg text-text-secondary">
                  Slim shoppen zonder tijdverlies
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 rounded bg-green-100 flex items-center justify-center mr-6 mt-1 flex-shrink-0">
                  <Check className="text-green-600" size={16} />
                </div>
                <p className="text-lg text-text-secondary">
                  Meer zelfvertrouwen in wat je draagt
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-gradient-to-r from-turquoise/10 to-turquoise/20">
        <div className="container mx-auto px-6 sm:px-8 lg:px-10 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="bg-card-white rounded shadow-lg p-10 md:p-16">
              <div className="text-6xl mb-6">💬</div>
              <blockquote className="text-xl md:text-2xl text-text-secondary italic leading-relaxed mb-8">
                "FitFi voelt als shoppen met iemand die me écht begrijpt. Ik hoef alleen nog maar te kiezen wat ik wil dragen."
              </blockquote>
              <div className="flex items-center justify-center">
                <ImageWithFallback 
                  src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2" 
                  alt="Sarah"
                  className="w-12 h-12 rounded-full object-cover mr-4"
                  fallbackSrc="/images/fallback-user.png"
                />
                <div className="text-left">
                  <p className="font-semibold text-text-primary">Sarah</p>
                  <p className="text-text-secondary">31 jaar</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-midnight">
        <div className="container mx-auto px-6 sm:px-8 lg:px-10 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-h2 md:text-4xl font-bold text-card-white mb-8">
              Ontdek wat bij jou past
            </h2>
            <p className="text-xl text-card-white/80 mb-10 max-w-2xl mx-auto">
              In minder dan 1 minuut weet je je stijladvies. Slimmer shoppen begint hier.
            </p>
            <Button 
              onClick={() => navigate('/onboarding')}
              variant="primary"
              size="lg"
              icon={<ArrowRight size={20} />}
              iconPosition="right"
              className="bg-turquoise hover:bg-turquoise-dark text-card-white py-4 px-8 rounded shadow-sm"
            >
              Start de stijlquiz
            </Button>
            <p className="text-sm text-card-white/60 mt-6">
              Geen verplichtingen • Gratis te gebruiken
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mobile Sticky CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card-white border-t border-light-grey p-6 z-50">
        <Button
          onClick={() => navigate('/onboarding')}
          variant="primary"
          fullWidth
          className="bg-turquoise hover:bg-turquoise-dark text-card-white py-4 px-8 rounded shadow-sm"
        >
          Start de stijlquiz
        </Button>
      </div>
    </div>
  );
};

export default HomePage;