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
    <div className="min-h-screen bg-primary">
      <div className="section-wrapper space-y-12">
        <div className="max-w-md mx-auto">
          {/* Progress indicator */}
          <div>
            <div className="flex justify-between text-sm text-body mb-2">
              <span>Stap 1 van 3</span>
              <span>33%</span>
            </div>
            <div className="w-full bg-primary-light rounded-full h-2">
              <div
                className="bg-secondary h-2 rounded-full transition-all"
                style={{ width: '33%' }}
              ></div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              <h1 className="text-5xl lg:text-6xl font-extrabold text-secondary mb-6">
                Wie ben je?
              </h1>
              <p className="text-base leading-relaxed text-body">
                We gebruiken deze informatie om je stijladvies te personaliseren
              </p>
            </div>

            <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg overflow-hidden">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Gender Selection */}
                  <div>
                    <label className="block text-text-dark font-medium mb-4">
                      Hoe identificeer je jezelf? <span className="text-red-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => handleGenderSelect('man')}
                        className={`
                          p-4 rounded-2xl border transition-all focus:outline-none focus:ring-2 focus:ring-secondary
                          ${formData.gender === 'man'
                            ? 'border-secondary bg-secondary/10'
                            : 'border-primary-light hover:border-secondary hover:bg-secondary/5'}
                        `}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">👨</div>
                          <div className="font-medium text-text-dark">Man</div>
                        </div>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleGenderSelect('vrouw')}
                        className={`
                          p-4 rounded-2xl border transition-all focus:outline-none focus:ring-2 focus:ring-secondary
                          ${formData.gender === 'vrouw'
                            ? 'border-secondary bg-secondary/10'
                            : 'border-gray-300 hover:border-secondary hover:bg-secondary/5'}
                        `}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">👩</div>
                          <div className="font-medium text-text-dark">Vrouw</div>
                        </div>
                      </button>
                    </div>
                    {errors.gender && (
                      <p className="mt-2 text-sm text-red-600">{errors.gender}</p>
                    )}
                  </div>

                  {/* Name Input */}
                  <div>
                    <label htmlFor="name" className="block text-text-dark font-medium mb-2">
                      Hoe mogen we je noemen? <span className="text-gray-500">(optioneel)</span>
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
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-2xl text-text-dark placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                        placeholder="Je voornaam"
                      />
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => navigate('/onboarding')}
                      icon={<ArrowLeft size={18} />}
                      iconPosition="left"
                      className="flex-1 bg-primary text-secondary border border-secondary py-3 px-6 rounded-full font-medium hover:bg-primary-light hover:text-primary focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                    >
                      Terug
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      icon={<ArrowRight size={18} />}
                      iconPosition="right"
                      className="flex-1 bg-secondary text-primary py-4 px-8 rounded-full font-medium text-lg shadow-lg hover:bg-secondary/90 focus:outline-none focus:ring-4 focus:ring-secondary/50 transition-all"
                    >
                      Volgende
                    </Button>
                  </div>
                </div>
              </form>

              {/* Privacy indicator */}
              <div className="px-6 py-4 bg-gray-50 flex items-center justify-center space-x-2">
                <ShieldCheck size={18} className="text-secondary" />
                <span className="text-sm text-gray-600">Je gegevens zijn veilig en versleuteld</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GenderNameStep;