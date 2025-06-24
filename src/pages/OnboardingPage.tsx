import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  User, 
  Mail, 
  ShieldCheck,
  Lock,
  CheckCircle,
  Camera,
  Sparkles,
  Star
} from 'lucide-react';
import Button from '../components/ui/Button';
import { useUser } from '../context/UserContext';

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateProfile } = useUser();
  
  // Get URL parameters
  const searchParams = new URLSearchParams(location.search);
  const isPremium = searchParams.get('plan') === 'premium';
  const billingPeriod = searchParams.get('billing') || 'monthly';
  
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
        console.log('📊 User registration tracked - GA4 event sent');
      }
      
      // Clear lead data
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

  // Benefits data
  const benefits = [
    {
      icon: <Camera size={20} />,
      title: "Foto-analyse",
      description: "Upload een foto voor persoonlijke stijladvies op basis van jouw lichaamsbouw"
    },
    {
      icon: <Sparkles size={20} />,
      title: "AI-matching",
      description: "Onze AI matcht jouw stijlvoorkeuren met duizenden kledingitems"
    },
    {
      icon: <Star size={20} />,
      title: "Persoonlijke aanbevelingen",
      description: "Ontvang outfits die perfect passen bij jouw unieke stijl"
    }
  ];

  // Testimonials data
  const testimonials = [
    {
      name: "Emma van der Berg",
      quote: "FitFi heeft mijn garderobe compleet getransformeerd!",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2"
    },
    {
      name: "Thomas Jansen",
      quote: "Eindelijk kleding die echt bij me past.",
      avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2"
    }
  ];

  const totalSteps = 3; // personal info, account setup, confirmation

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Form Column */}
          <div className="lg:w-1/2">
            {/* Progress indicator */}
            <div className="mb-10">
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                <span>Stap {currentStep} van {totalSteps}</span>
                <span>{Math.round((currentStep / totalSteps) * 100)}% Voltooid</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 transition-all duration-300 ease-in-out"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="text-center mb-8 animate-fade-in">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {currentStep === 1 && 'Welkom bij FitFi! 👋'}
                {currentStep === 2 && 'Beveilig je account 🔒'}
                {currentStep === 3 && 'Klaar om te beginnen! 🎉'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {currentStep === 1 && 'Laten we beginnen met je persoonlijke stijlanalyse'}
                {currentStep === 2 && 'Maak een veilig wachtwoord aan voor je account'}
                {currentStep === 3 && 'Je account is aangemaakt en klaar voor gebruik'}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-colors animate-scale-in">
              <div className="p-6 sm:p-8">
                <form onSubmit={handleSubmit}>
                  {/* Step 1: Personal Information */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Naam
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User size={18} className="text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`block w-full pl-10 pr-3 py-3 border ${errors.name ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors`}
                            placeholder="Je volledige naam"
                          />
                        </div>
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          E-mailadres
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail size={18} className="text-gray-400" />
                          </div>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`block w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors`}
                            placeholder="je@email.com"
                          />
                        </div>
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-500">{errors.email}</p>
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
                        Volgende Stap
                      </Button>
                    </div>
                  )}

                  {/* Step 2: Account Setup */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Wachtwoord
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock size={18} className="text-gray-400" />
                          </div>
                          <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className={`block w-full pl-10 pr-3 py-3 border ${errors.password ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors`}
                            placeholder="Minimaal 8 tekens"
                          />
                        </div>
                        {errors.password && (
                          <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Bevestig wachtwoord
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock size={18} className="text-gray-400" />
                          </div>
                          <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className={`block w-full pl-10 pr-3 py-3 border ${errors.confirmPassword ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors`}
                            placeholder="Herhaal je wachtwoord"
                          />
                        </div>
                        {errors.confirmPassword && (
                          <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
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
                            className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="acceptTerms" className={`${errors.acceptTerms ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}`}>
                            Ik ga akkoord met de <a href="/juridisch" className="text-orange-500 hover:text-orange-600">algemene voorwaarden</a> en <a href="/juridisch" className="text-orange-500 hover:text-orange-600">privacybeleid</a>
                          </label>
                        </div>
                      </div>
                      {errors.acceptTerms && (
                        <p className="mt-1 text-sm text-red-500">{errors.acceptTerms}</p>
                      )}

                      <div className="flex space-x-3 mt-6">
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          onClick={handlePrevStep}
                          icon={<ArrowLeft size={20} />}
                          iconPosition="left"
                          className="flex-1"
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
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="text-green-500" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          Account aangemaakt!
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          Je bent nu klaar om je persoonlijke stijlreis te beginnen met FitFi.
                        </p>
                      </div>

                      {isPremium && (
                        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
                          <h4 className="font-semibold text-gray-900 dark:text-white flex items-center mb-2">
                            <Crown className="text-orange-500 mr-2" size={18} />
                            Premium Plan Geselecteerd
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Je hebt gekozen voor het {billingPeriod === 'yearly' ? 'jaarlijkse' : 'maandelijkse'} Premium abonnement.
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Je 14-dagen gratis proefperiode start nu. Je wordt pas gefactureerd na de proefperiode.
                          </p>
                        </div>
                      )}

                      <div className="flex space-x-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          onClick={handlePrevStep}
                          icon={<ArrowLeft size={20} />}
                          iconPosition="left"
                          className="flex-1"
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
                        <p className="mt-4 text-sm text-center text-red-500">{errors.submit}</p>
                      )}
                    </div>
                  )}
                </form>
              </div>

              {/* Privacy indicator */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex items-center justify-center space-x-2 transition-colors">
                <ShieldCheck size={18} className="text-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Je gegevens zijn veilig en versleuteld</span>
              </div>
            </div>

            {/* Back to home link */}
            <div className="mt-6 text-center">
              <button 
                onClick={() => navigate('/')}
                className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors"
              >
                <ArrowLeft size={16} className="mr-1" />
                Terug naar home
              </button>
            </div>
          </div>

          {/* Info Column - NEW */}
          <div className="lg:w-1/2">
            {/* Plan Details */}
            {isPremium ? (
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-700 dark:to-orange-800 rounded-xl shadow-lg overflow-hidden mb-8">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <Crown className="text-white mr-3" size={24} />
                    <h2 className="text-2xl font-bold text-white">
                      Premium Plan
                    </h2>
                  </div>
                  
                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm mb-6">
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-white/90">Prijs</span>
                      <div>
                        <span className="text-2xl font-bold text-white">€{billingPeriod === 'yearly' ? '10.39' : '12.99'}</span>
                        <span className="text-white/80 text-sm">/maand</span>
                        {billingPeriod === 'yearly' && (
                          <span className="ml-2 text-xs bg-yellow-400 text-yellow-800 px-2 py-0.5 rounded-full">
                            Bespaar 20%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-white/80 text-sm">
                      {billingPeriod === 'yearly' 
                        ? 'Jaarlijks gefactureerd (€124.68 per jaar)' 
                        : 'Maandelijks gefactureerd'}
                    </div>
                  </div>
                  
                  <div className="text-white/90 mb-6">
                    <p className="mb-4">
                      Je Premium plan omvat:
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="text-white mr-2 flex-shrink-0 mt-0.5" size={16} />
                        <span>Onbeperkte outfit aanbevelingen</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="text-white mr-2 flex-shrink-0 mt-0.5" size={16} />
                        <span>Onbeperkte foto-uploads</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="text-white mr-2 flex-shrink-0 mt-0.5" size={16} />
                        <span>Gedetailleerd styling advies</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="text-white mr-2 flex-shrink-0 mt-0.5" size={16} />
                        <span>Seizoensgebonden updates</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="text-white mr-2 flex-shrink-0 mt-0.5" size={16} />
                        <span>Prioriteit ondersteuning</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <p className="text-white text-sm">
                      <span className="font-bold">14 dagen gratis proefperiode</span> - Je kunt op elk moment opzeggen. Geen verplichtingen.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Begin gratis met FitFi
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Ontdek je perfecte stijl zonder kosten. Upgrade naar Premium wanneer je er klaar voor bent.
                  </p>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Gratis plan omvat:
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="text-green-500 mr-2 flex-shrink-0 mt-0.5" size={16} />
                        <span className="text-gray-600 dark:text-gray-400">Basis stijlvragenlijst</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="text-green-500 mr-2 flex-shrink-0 mt-0.5" size={16} />
                        <span className="text-gray-600 dark:text-gray-400">1 foto-upload per maand</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="text-green-500 mr-2 flex-shrink-0 mt-0.5" size={16} />
                        <span className="text-gray-600 dark:text-gray-400">3 outfit aanbevelingen</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center mb-2">
                      <Crown className="text-orange-500 mr-2" size={18} />
                      Upgrade naar Premium
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Krijg onbeperkte aanbevelingen, geavanceerde styling en meer voor slechts €12,99/maand.
                    </p>
                    <Button 
                      as="a"
                      href="/onboarding?plan=premium" 
                      variant="primary"
                      size="sm"
                      fullWidth
                    >
                      Probeer Premium gratis
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Benefits */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Hoe FitFi werkt
                </h2>
                
                <div className="space-y-6">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex">
                      <div className="mr-4 flex-shrink-0">
                        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-500">
                          {benefit.icon}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {benefit.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Testimonials */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Wat onze gebruikers zeggen
                </h2>
                
                <div className="space-y-4">
                  {testimonials.map((testimonial, index) => (
                    <div key={index} className="flex items-start p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.name} 
                        className="w-10 h-10 rounded-full object-cover mr-4"
                      />
                      <div>
                        <p className="text-gray-600 dark:text-gray-300 italic mb-1">
                          "{testimonial.quote}"
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {testimonial.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;