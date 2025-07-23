import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, User, Mail, ShieldCheck } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useOnboarding } from '../../context/OnboardingContext';
import { motion } from 'framer-motion';

const GenderNameStep: React.FC = () => {
  const navigate = useNavigate();
  const { data, updateAnswers } = useOnboarding();
  
  const [formData, setFormData] = useState({
    gender: data.gender || '',
    name: data.name || ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Track when the component is mounted
  useEffect(() => {
    // Track step view in analytics
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'quiz_step_view', {
        event_category: 'questionnaire',
        event_label: 'gender_name',
        step_name: 'gender_name'
      });
    }
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
  
  const handleGenderSelect = (gender: 'man' | 'vrouw') => {
    setFormData(prev => ({
      ...prev,
      gender
    }));
    
    // Clear gender error
    if (errors.gender) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.gender;
        return newErrors;
      });
    }
    
    // Track gender selection
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'gender_selection', {
        event_category: 'questionnaire',
        event_label: gender
      });
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.gender) {
      newErrors.gender = 'Selecteer je gender';
    }
    
    // Name is optional, so no validation needed
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Update answers
    updateAnswers({
      gender: formData.gender as 'man' | 'vrouw',
      name: formData.name
    });
    
    // Navigate to next step
    navigate('/onboarding/archetype');
  };
  
  return (
    <div className="min-h-screen bg-light-grey">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-md mx-auto">
          {/* Progress indicator */}
          <div className="mb-10">
            <div className="flex justify-between text-sm text-text-secondary mb-2">
              <span>Stap 1 van 3</span>
              <span>33%</span>
            </div>
            <div className="h-1.5 bg-light-grey/50 rounded overflow-hidden">
              <div
                className="h-full bg-turquoise rounded transition-all duration-300"
                style={{ width: '33%' }}
              ></div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-gray-900 mb-3">
                Wie ben je?
              </h1>
              <p className="text-gray-600">
                We gebruiken deze informatie om je stijladvies te personaliseren
              </p>
            </div>

            <div className="p-6 rounded-2xl shadow-lg bg-accent space-y-4 overflow-hidden">
              <form onSubmit={handleSubmit} className="p-8">
                <div className="space-y-8">
                  {/* Gender Selection */}
                  <div>
                    <label className="block text-gray-900 font-medium mb-4">
                      Hoe identificeer je jezelf? <span className="text-red-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-6">
                      <button
                        type="button"
                        onClick={() => handleGenderSelect('man')}
                        className={`
                          p-6 rounded-2xl border transition-all
                          ${formData.gender === 'man'
                            ? 'border-secondary bg-secondary/10'
                            : 'border-gray-300 hover:border-secondary hover:bg-secondary/5'}
                        `}
                      >
                        <div className="text-center">
                          <div className="text-3xl mb-2">👨</div>
                          <div className="font-medium text-gray-900">Man</div>
                        </div>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleGenderSelect('vrouw')}
                        className={`
                          p-6 rounded-2xl border transition-all
                          ${formData.gender === 'vrouw'
                            ? 'border-secondary bg-secondary/10'
                            : 'border-gray-300 hover:border-secondary hover:bg-secondary/5'}
                        `}
                      >
                        <div className="text-center">
                          <div className="text-3xl mb-2">👩</div>
                          <div className="font-medium text-gray-900">Vrouw</div>
                        </div>
                      </button>
                    </div>
                    {errors.gender && (
                      <p className="mt-3 text-sm text-red-500">{errors.gender}</p>
                    )}
                  </div>

                  {/* Name Input */}
                  <div>
                    <label htmlFor="name" className="block text-text-primary font-medium mb-3">
                      Hoe mogen we je noemen? <span className="text-gray-500">(optioneel)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User size={18} className="text-text-secondary/60" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-4 bg-white border border-light-grey rounded text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-turquoise focus:border-transparent"
                        placeholder="Je voornaam"
                      />
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex space-x-4 mt-8">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => navigate('/onboarding')}
                      icon={<ArrowLeft size={18} />}
                      iconPosition="left"
                      className="flex-1 text-text-secondary border border-light-grey hover:bg-light-grey"
                    >
                      Terug
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      icon={<ArrowRight size={18} />}
                      iconPosition="right"
                      className="flex-1"
                    >
                      Volgende
                    </Button>
                  </div>
                </div>
              </form>

              {/* Privacy indicator */}
              <div className="px-8 py-6 bg-light-grey flex items-center justify-center space-x-2">
                <ShieldCheck size={18} className="text-turquoise" />
                <span className="text-sm text-text-secondary">Je gegevens zijn veilig en versleuteld</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GenderNameStep;