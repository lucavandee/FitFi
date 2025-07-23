import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, User, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../components/ui/Button';
import { useOnboarding } from '../../context/OnboardingContext';

const GenderNameStep: React.FC = () => {
  const navigate = useNavigate();
  const { data, updateAnswers } = useOnboarding();
  const [selectedGender, setSelectedGender] = useState<'man' | 'vrouw'>(data.gender || 'vrouw');
  const [name, setName] = useState(data.name || '');
  const [errors, setErrors] = useState<{ name?: string; gender?: string }>({});

  const totalSteps = 5;
  const currentStep = 1;

  const handleNext = () => {
    // Validate form
    const newErrors: { name?: string; gender?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Naam is verplicht';
    }
    
    if (!selectedGender) {
      newErrors.gender = 'Selecteer je gender';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Clear errors
    setErrors({});
    
    // Update context
    updateAnswers({
      gender: selectedGender,
      name: name.trim()
    });
    
    // Track progress
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'onboarding_step_complete', {
        event_category: 'onboarding',
        event_label: 'gender_name',
        step: currentStep,
        gender: selectedGender,
        has_name: !!name.trim()
      });
    }
    
    // Navigate to next step
    navigate('/onboarding/archetype');
  };

  const handleBack = () => {
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-primary-dark">
      <div className="container-slim py-16">
        <div className="max-w-md mx-auto">
          {/* Progress indicator */}
          <div className="mb-10">
            <div className="flex justify-between text-sm text-body mb-2">
              <span>Stap {currentStep} van {totalSteps}</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-primary-light rounded-full h-2">
              <div
                className="bg-secondary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-secondary mb-2">
              Laten we kennismaken
            </h1>
            <p className="text-body">
              Vertel ons hoe we je kunnen aanspreken en hoe je je identificeert
            </p>
          </motion.div>

          <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg">
            <div className="space-y-6">
              {/* Name Input */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Hoe mogen we je noemen? *
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Je voornaam"
                  className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-secondary focus:border-secondary transition-colors ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Gender Selection */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Hoe identificeer je jezelf? *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'man', label: 'Man', icon: '👨', description: 'Mannelijke stijladvies' },
                    { id: 'vrouw', label: 'Vrouw', icon: '👩', description: 'Vrouwelijke stijladvies' }
                  ].map((option) => (
                    <motion.button
                      key={option.id}
                      type="button"
                      onClick={() => setSelectedGender(option.id as 'man' | 'vrouw')}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                        selectedGender === option.id
                          ? 'border-secondary bg-secondary/10'
                          : 'border-gray-300 hover:border-secondary hover:bg-secondary/5'
                      }`}
                      whileHover={{ y: -2 }}
                      whileTap={{ y: 0 }}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{option.icon}</span>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-gray-600">{option.description}</div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
                {errors.gender && (
                  <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  icon={<ArrowLeft size={16} />}
                  iconPosition="left"
                  className="flex-1"
                >
                  Terug
                </Button>
                
                <Button
                  variant="primary"
                  onClick={handleNext}
                  icon={<ArrowRight size={16} />}
                  iconPosition="right"
                  className="flex-1"
                >
                  Volgende
                </Button>
              </div>
            </div>

            {/* Privacy indicator */}
            <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-center space-x-2">
              <ShieldCheck size={18} className="text-secondary" />
              <span className="text-sm text-gray-600">Je gegevens zijn veilig en versleuteld</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenderNameStep;