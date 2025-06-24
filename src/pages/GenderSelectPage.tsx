import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useUser } from '../context/UserContext';

const GenderSelectPage: React.FC = () => {
  const navigate = useNavigate();
  const { updateProfile } = useUser();
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | 'neutral' | null>(null);

  const handleGenderSelect = async (gender: 'male' | 'female' | 'neutral') => {
    setSelectedGender(gender);
    
    // Track gender selection
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'gender_selection', {
        event_category: 'questionnaire',
        event_label: gender,
        custom_parameter_1: 'demographic_data',
        custom_parameter_2: 'user_profiling',
        custom_parameter_3: 'questionnaire'
      });
    }
    
    // Save to user profile
    await updateProfile({ gender });
    
    // Navigate to quiz
    navigate('/quiz/1');
  };

  const imgSrc = {
    male: '/images/gender/male.png',
    female: '/images/gender/female.png',
    neutral: '/images/gender/neutral.png'
  };

  const totalSteps = 4;
  const currentStep = 2;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 transition-colors">
      <div className="max-w-md mx-auto px-4 sm:px-6">
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
            Hoe identificeer je jezelf?
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Dit helpt ons de juiste stijladvies voor je te vinden
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-colors animate-scale-in">
          <div className="p-6 sm:p-8">
            <div className="space-y-4">
              {[
                { id: 'male', label: 'Man', icon: '👨', description: 'Mannelijke stijladvies' },
                { id: 'female', label: 'Vrouw', icon: '👩', description: 'Vrouwelijke stijladvies' },
                { id: 'neutral', label: 'Gender Neutraal', icon: '🧑', description: 'Neutrale stijladvies' }
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleGenderSelect(option.id as 'male' | 'female' | 'neutral')}
                  className={`
                    w-full p-4 rounded-lg border-2 transition-all duration-200 text-left hover:scale-105
                    ${selectedGender === option.id
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 hover:bg-gray-50 dark:hover:bg-gray-700'}
                  `}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{option.icon}</div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {option.label}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {option.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Illustration */}
            {selectedGender && (
              <div className="mt-8 text-center animate-fade-in">
                <img 
                  src={imgSrc[selectedGender]} 
                  alt={`Ik ben ${selectedGender}`} 
                  className="mx-auto h-48 w-auto rounded-lg"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback if image doesn't exist
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Privacy indicator */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex items-center justify-center space-x-2 transition-colors">
            <ShieldCheck size={18} className="text-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Je gegevens zijn veilig en versleuteld</span>
          </div>
        </div>

        {/* Back to onboarding link */}
        <div className="mt-6 text-center">
          <button 
            onClick={() => navigate('/onboarding')}
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" />
            Terug
          </button>
        </div>
      </div>

      {/* Mobile Sticky CTA - NEW */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 z-50">
        <button
          onClick={() => selectedGender && handleGenderSelect(selectedGender)}
          disabled={!selectedGender}
          className={`
            w-full py-3 px-4 rounded-lg font-medium transition-colors
            ${selectedGender 
              ? 'bg-orange-500 text-white hover:bg-orange-600' 
              : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'}
          `}
        >
          {selectedGender ? 'Doorgaan' : 'Selecteer een optie'}
        </button>
      </div>
    </div>
  );
};

export default GenderSelectPage;