import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import Button from '../components/ui/Button';
import { useUser } from '../context/UserContext';
import { motion } from 'framer-motion';

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateProfile } = useUser();
  
  // Get URL parameters
  const searchParams = new URLSearchParams(location.search);
  const isPremium = searchParams.get('plan') === 'premium';
  
  // State for form and steps
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for stored lead data
  useEffect(() => {
    const leadData = localStorage.getItem('fitfi-lead-data');
    if (leadData) {
      try {
        const parsedData = JSON.parse(leadData);
        setFormData(prev => ({
          ...prev,
          name: parsedData.name || '',
          email: parsedData.email || ''
        }));
      } catch (error) {
        console.error('Error parsing lead data:', error);
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'Naam is verplicht';
      }
      
      if (!formData.email.trim()) {
        newErrors.email = 'E-mail is verplicht';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Voer een geldig e-mailadres in';
      }
    }
    
    if (currentStep === 2) {
      if (!formData.password) {
        newErrors.password = 'Wachtwoord is verplicht';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Wachtwoord moet minimaal 8 tekens bevatten';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Wachtwoorden komen niet overeen';
      }
      
      if (!formData.acceptTerms) {
        newErrors.acceptTerms = 'Je moet akkoord gaan met de voorwaarden';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Save to UserContext
      await updateProfile({
        name: formData.name,
        email: formData.email
      });
      
      // Track registration event
      if (typeof window.trackUserRegistration === 'function') {
        window.trackUserRegistration('email', isPremium ? 'premium_user' : 'free_user');
      }
      
      // Clear lead data from localStorage
      localStorage.removeItem('fitfi-lead-data');
      
      // Navigate to gender selection
      navigate('/gender');
    } catch (error) {
      console.error('Error during onboarding:', error);
      setErrors({ submit: 'Er is een fout opgetreden. Probeer het later opnieuw.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSteps = 3; // personal info, account setup, confirmation

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#1B263B]">
      <div className="container-slim py-16">
        <div className="max-w-md mx-auto">
          {/* Progress indicator */}
          <div className="mb-10">
            <div className="flex justify-between text-sm text-white/70 mb-2">
              <span>Stap {currentStep} van {totalSteps}</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                {currentStep === 1 && 'Welkom bij FitFi'}
                {currentStep === 2 && 'Beveilig je account'}
                {currentStep === 3 && 'Klaar om te beginnen'}
              </h1>
              <p className="text-white/80">
                {currentStep === 1 && 'Laten we beginnen met je persoonlijke stijlanalyse'}
                {currentStep === 2 && 'Maak een veilig wachtwoord aan voor je account'}
                {currentStep === 3 && 'Je account is aangemaakt en klaar voor gebruik'}
              </p>
            </div>

            <div className="glass-card overflow-hidden">
              <div className="p-6">
                <form onSubmit={handleSubmit}>
                  {/* Step 1: Personal Information */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name" className="label text-white">
                          Naam
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className={`input ${errors.name ? 'border-red-500' : ''}`}
                          placeholder="Je volledige naam"
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-300">{errors.name}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="email" className="label text-white">
                          E-mailadres
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`input ${errors.email ? 'border-red-500' : ''}`}
                          placeholder="je@email.com"
                        />
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-300">{errors.email}</p>
                        )}
                      </div>

                      <Button
                        type="button"
                        variant="primary"
                        size="lg"
                        fullWidth
                        onClick={handleNextStep}
                        icon={<ArrowRight size={20} />}
                        iconPosition="right"
                        className="mt-6"
                      >
                        Volgende
                      </Button>
                    </div>
                  )}

                  {/* Step 2: Account Setup */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="password" className="label text-white">
                          Wachtwoord
                        </label>
                        <input
                          type="password"
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className={`input ${errors.password ? 'border-red-500' : ''}`}
                          placeholder="Minimaal 8 tekens"
                        />
                        {errors.password && (
                          <p className="mt-1 text-sm text-red-300">{errors.password}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="label text-white">
                          Bevestig wachtwoord
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className={`input ${errors.confirmPassword ? 'border-red-500' : ''}`}
                          placeholder="Herhaal je wachtwoord"
                        />
                        {errors.confirmPassword && (
                          <p className="mt-1 text-sm text-red-300">{errors.confirmPassword}</p>
                        )}
                      </div>

                      <div className="flex items-start mt-6">
                        <div className="flex items-center h-5">
                          <input
                            id="acceptTerms"
                            name="acceptTerms"
                            type="checkbox"
                            checked={formData.acceptTerms}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-[#FF8600] focus:ring-[#FF8600] border-white/30 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="acceptTerms" className={`${errors.acceptTerms ? 'text-red-300' : 'text-white/80'}`}>
                            Ik ga akkoord met de{' '}
                            <a href="/juridisch" className="text-[#FF8600] hover:text-orange-400 underline">algemene voorwaarden</a>{' '}en{' '}
                            <a href="/juridisch" className="text-[#FF8600] hover:text-orange-400 underline">privacybeleid</a>
                          </label>
                        </div>
                      </div>
                      {errors.acceptTerms && (
                        <p className="mt-1 text-sm text-red-300">{errors.acceptTerms}</p>
                      )}

                      <div className="flex space-x-3 mt-6">
                        <Button
                          type="button"
                          variant="ghost"
                          size="lg"
                          onClick={handlePrevStep}
                          icon={<ArrowLeft size={20} />}
                          iconPosition="left"
                          className="flex-1 text-white border border-white/30 hover:bg-white/10"
                        >
                          Terug
                        </Button>
                        <Button
                          type="button"
                          variant="primary"
                          size="lg"
                          onClick={handleNextStep}
                          icon={<ArrowRight size={20} />}
                          iconPosition="right"
                          className="flex-1"
                        >
                          Volgende
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Confirmation */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-[#FF8600]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-[#FF8600]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          Account aangemaakt
                        </h3>
                        <p className="text-white/80 mb-6">
                          Je bent nu klaar om je persoonlijke stijlreis te beginnen met FitFi.
                        </p>
                      </div>

                      <div className="flex space-x-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="lg"
                          onClick={handlePrevStep}
                          icon={<ArrowLeft size={20} />}
                          iconPosition="left"
                          className="flex-1 text-white border border-white/30 hover:bg-white/10"
                        >
                          Terug
                        </Button>
                        <Button
                          type="submit"
                          variant="primary"
                          size="lg"
                          disabled={isSubmitting}
                          className="flex-1"
                        >
                          {isSubmitting ? 'Even geduld...' : 'Start je stijlreis'}
                        </Button>
                      </div>
                      
                      {errors.submit && (
                        <p className="mt-4 text-sm text-center text-red-300">{errors.submit}</p>
                      )}
                    </div>
                  )}
                </form>
              </div>

              {/* Privacy indicator */}
              <div className="px-6 py-4 bg-white/5 flex items-center justify-center space-x-2">
                <ShieldCheck size={18} className="text-[#FF8600]" />
                <span className="text-sm text-white/80">Je gegevens zijn veilig en versleuteld</span>
              </div>
            </div>

            {/* Back to home link */}
            <div className="mt-6 text-center">
              <button 
                onClick={() => navigate('/')}
                className="inline-flex items-center text-sm text-white/70 hover:text-[#FF8600] transition-colors"
              >
                <ArrowLeft size={16} className="mr-1" />
                Terug naar home
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0D1B2A] border-t border-white/10 p-4 z-50">
        {currentStep === 1 && (
          <Button
            type="button"
            variant="primary"
            fullWidth
            onClick={handleNextStep}
          >
            Volgende stap
          </Button>
        )}
        {currentStep === 2 && (
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="ghost"
              onClick={handlePrevStep}
              className="flex-1 text-white border border-white/30 hover:bg-white/10"
            >
              Terug
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleNextStep}
              className="flex-1"
            >
              Volgende
            </Button>
          </div>
        )}
        {currentStep === 3 && (
          <Button
            type="button"
            variant="primary"
            fullWidth
            onClick={handleSubmit}
          >
            Start je stijlreis
          </Button>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;