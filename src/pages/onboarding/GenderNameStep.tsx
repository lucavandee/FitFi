import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, User, Mail, ShieldCheck } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useOnboarding } from '../../context/OnboardingContext';
import { motion } from 'framer-motion';

const GenderNameStep: React.FC = () => {
  const { data, updateData, completeStep, goToNextStep, goToPreviousStep } = useOnboarding();
  
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
    
    // Update onboarding data
    updateData({
      gender: formData.gender as 'man' | 'vrouw',
      name: formData.name
    });
    
    // Mark step as completed
    completeStep('gender-name');
    
    // Go to next step
    goToNextStep();
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#1B263B]">
      <div className="container-slim py-16">
        <div className="max-w-md mx-auto">
          {/* Progress indicator */}
          <div className="mb-10">
            <div className="flex justify-between text-sm text-white/70 mb-2">
              <span>Stap 1 van 4</span>
              <span>25%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: '25%' }}
              ></div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Wie ben je?
              </h1>
              <p className="text-white/80">
                We gebruiken deze informatie om je stijladvies te personaliseren
              </p>
            </div>

            <div className="glass-card overflow-hidden">
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-6">
                  {/* Gender Selection */}
                  <div>
                    <label className="block text-white font-medium mb-3">
                      Hoe identificeer je jezelf? <span className="text-red-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => handleGenderSelect('man')}
                        className={`
                          p-4 rounded-xl border transition-all
                          ${formData.gender === 'man'
                            ? 'border-[#FF8600] bg-white/10'
                            : 'border-white/30 hover:border-white/50 hover:bg-white/5'}
                        `}
                      >
                        <div className="text-center">
                          <div className="text-3xl mb-2">👨</div>
                          <div className="font-medium text-white">Man</div>
                        </div>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleGenderSelect('vrouw')}
                        className={`
                          p-4 rounded-xl border transition-all
                          ${formData.gender === 'vrouw'
                            ? 'border-[#FF8600] bg-white/10'
                            : 'border-white/30 hover:border-white/50 hover:bg-white/5'}
                        `}
                      >
                        <div className="text-center">
                          <div className="text-3xl mb-2">👩</div>
                          <div className="font-medium text-white">Vrouw</div>
                        </div>
                      </button>
                    </div>
                    {errors.gender && (
                      <p className="mt-2 text-sm text-red-400">{errors.gender}</p>
                    )}
                  </div>

                  {/* Name Input */}
                  <div>
                    <label htmlFor="name" className="block text-white font-medium mb-2">
                      Hoe mogen we je noemen? <span className="text-white/60">(optioneel)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User size={18} className="text-white/50" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#FF8600] focus:border-transparent"
                        placeholder="Je voornaam"
                      />
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex space-x-3 mt-6">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={goToPreviousStep}
                      icon={<ArrowLeft size={18} />}
                      iconPosition="left"
                      className="flex-1 text-white border border-white/30 hover:bg-white/10"
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
              <div className="px-6 py-4 bg-white/5 flex items-center justify-center space-x-2">
                <ShieldCheck size={18} className="text-[#FF8600]" />
                <span className="text-sm text-white/80">Je gegevens zijn veilig en versleuteld</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GenderNameStep;