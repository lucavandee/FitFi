import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';
import ImageWithFallback from '../components/ui/ImageWithFallback';
import StylePreviewSection from '../components/StylePreviewSection';
import { getCurrentSeason } from '../engine/helpers';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSeason, setCurrentSeason] = useState<string>('');

  // Get current season on component mount
  useEffect(() => {
    setCurrentSeason(getCurrentSeason());
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
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden glow-accent">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-64 h-64 bg-[#0ea5e9]/10 rounded-full mix-blend-overlay filter blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-[#FF8600]/5 rounded-full mix-blend-overlay filter blur-3xl"></div>
        </div>
        
        <div className="container-slim relative z-10">
          <div className="flex flex-col lg:flex-row items-center">
            <motion.div 
              className="flex-1 text-center lg:text-left mb-12 lg:mb-0 lg:pr-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Ontdek je perfecte stijl
              </h1>
              <p className="text-xl text-white/90 max-w-2xl mx-auto lg:mx-0 mb-10">
                FitFi analyseert jouw voorkeuren en creëert gepersonaliseerde stijlaanbevelingen die perfect bij je passen.
              </p>
              
              {/* Lead Capture Form */}
              <div className="max-w-md mx-auto lg:mx-0">
                <form onSubmit={handleFormSubmit} className="glass-card p-6">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="hero-name" className="label text-white">
                        Je naam
                      </label>
                      <input
                        type="text"
                        id="hero-name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="input"
                        placeholder="Voer je naam in"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="hero-email" className="label text-white">
                        E-mailadres
                      </label>
                      <input
                        type="email"
                        id="hero-email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="input"
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
                      className="mt-2"
                    >
                      {isSubmitting ? 'Even geduld...' : 'Start stijlscan'}
                    </Button>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-center text-xs text-white/80">
                    <ShieldCheck size={14} className="mr-1 text-[#FF8600]" />
                    Je gegevens zijn veilig en versleuteld
                  </div>
                </form>
              </div>
              
              <div className="mt-6 text-center lg:text-left">
                <Button 
                  as="a"
                  href="/hoe-het-werkt" 
                  size="sm" 
                  variant="ghost"
                  className="hover-lift transition-transform animate-fade-in"
                >
                  Bekijk voorbeelden
                </Button>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex-1 flex justify-center lg:justify-end"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative h-[420px] w-[320px] rounded-2xl overflow-hidden glass-card">
                <ImageWithFallback 
                  src="https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                  alt="Stijlvolle persoon met gepersonaliseerde outfit" 
                  className="h-full w-full object-cover"
                  loading="lazy"
                  onError={(originalSrc) => {
                    console.warn(`Hero image failed to load: ${originalSrc}`);
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Style Preview Section */}
      <StylePreviewSection 
        archetype="casual_chic" 
        season={currentSeason}
      />

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-[#1B263B] subtle-line">
        <div className="container-slim">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Hoe het werkt
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              In drie eenvoudige stappen naar jouw perfecte stijl
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative mb-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#FF8600]/20 flex items-center justify-center">
                  <span className="text-[#FF8600] text-xl font-bold">1</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Vul de stijlscan in
              </h3>
              <p className="text-white/80 leading-relaxed">
                Beantwoord enkele vragen over je stijlvoorkeuren en persoonlijke smaak.
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
              <div className="relative mb-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#0ea5e9]/20 flex items-center justify-center">
                  <span className="text-[#0ea5e9] text-xl font-bold">2</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Ontvang je stijlprofiel
              </h3>
              <p className="text-white/80 leading-relaxed">
                Onze AI analyseert je voorkeuren en creëert een uniek stijlprofiel voor jou.
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
              <div className="relative mb-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#FF8600]/20 flex items-center justify-center">
                  <span className="text-[#FF8600] text-xl font-bold">3</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Ontdek perfecte outfits
              </h3>
              <p className="text-white/80 leading-relaxed">
                Bekijk gepersonaliseerde outfits die perfect bij jouw stijl en voorkeuren passen.
              </p>
            </motion.div>
          </div>

          {/* CTA Button */}
          <div className="text-center mt-16">
            <Button 
              as="a"
              href="/onboarding" 
              variant="primary"
              size="lg"
              icon={<ArrowRight size={20} />}
              iconPosition="right"
            >
              Start je stijlscan
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-[#0D1B2A] subtle-line">
        <div className="container-slim">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Wat onze gebruikers zeggen
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Duizenden mensen hebben hun stijl al getransformeerd met FitFi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <motion.div 
              className="glass-card p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-white/90 mb-6 italic">
                "FitFi heeft mijn garderobe en zelfvertrouwen compleet getransformeerd. Ik krijg nu regelmatig complimenten over mijn outfits!"
              </p>
              <div className="flex items-center">
                <ImageWithFallback 
                  src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2" 
                  alt="Emma van der Berg"
                  className="w-10 h-10 rounded-full object-cover mr-3"
                  onError={(originalSrc) => {
                    console.warn(`Testimonial image failed to load: ${originalSrc}`);
                  }}
                />
                <div>
                  <h4 className="font-medium text-white">
                    Emma van der Berg
                  </h4>
                  <p className="text-white/70 text-sm">
                    Marketing Professional
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div 
              className="glass-card p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <p className="text-white/90 mb-6 italic">
                "Als man vond ik het altijd lastig om mijn eigen stijl te vinden. FitFi heeft me geholpen te begrijpen welke kleuren en pasvorm bij mijn lichaamsbouw passen."
              </p>
              <div className="flex items-center">
                <ImageWithFallback 
                  src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2" 
                  alt="Thomas Jansen"
                  className="w-10 h-10 rounded-full object-cover mr-3"
                  onError={(originalSrc) => {
                    console.warn(`Testimonial image failed to load: ${originalSrc}`);
                  }}
                />
                <div>
                  <h4 className="font-medium text-white">
                    Thomas Jansen
                  </h4>
                  <p className="text-white/70 text-sm">
                    Software Engineer
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Testimonial 3 */}
            <motion.div 
              className="glass-card p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <p className="text-white/90 mb-6 italic">
                "Ik kocht altijd kleding die ik uiteindelijk nauwelijks droeg. FitFi heeft me geholpen bewustere keuzes te maken en een capsule garderobe op te bouwen."
              </p>
              <div className="flex items-center">
                <ImageWithFallback 
                  src="https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2" 
                  alt="Sophie Bakker"
                  className="w-10 h-10 rounded-full object-cover mr-3"
                  onError={(originalSrc) => {
                    console.warn(`Testimonial image failed to load: ${originalSrc}`);
                  }}
                />
                <div>
                  <h4 className="font-medium text-white">
                    Sophie Bakker
                  </h4>
                  <p className="text-white/70 text-sm">
                    Ondernemer
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#1B263B] subtle-line">
        <div className="container-slim text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Klaar om je stijl te ontdekken?
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
              Begin vandaag nog met FitFi en ontdek hoe eenvoudig het is om er altijd op je best uit te zien.
            </p>
            <Button 
              as="a"
              href="/onboarding" 
              variant="primary"
              size="lg"
              icon={<ArrowRight size={20} />}
              iconPosition="right"
            >
              Start je stijlscan
            </Button>
            <p className="text-sm text-white/60 mt-4">
              Geen verplichtingen • Gratis te gebruiken
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mobile Sticky CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0D1B2A] border-t border-white/10 p-4 z-50">
        <Button
          as="a"
          href="/onboarding"
          variant="primary"
          fullWidth
        >
          Start je stijlscan
        </Button>
      </div>
    </div>
  );
};

export default HomePage;