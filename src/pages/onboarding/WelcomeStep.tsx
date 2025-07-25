import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import Button from '../../components/ui/Button';
import { motion } from 'framer-motion'; 
import { useOnboarding } from '../../context/OnboardingContext';

const WelcomeStep: React.FC = () => {
  const navigate = useNavigate();
  const { updateAnswers } = useOnboarding();
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (hasTrackedRef.current) return;

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'quiz_start', {
        event_category: 'questionnaire',
        event_label: 'welcome',
        referrer: document.referrer,
        timestamp: new Date().toISOString()
      });
    }

    updateAnswers({ startTime: Date.now() });
    hasTrackedRef.current = true;
  }, [updateAnswers]);

  const handleStart = () => {
    if (isButtonClicked) return;
    setIsButtonClicked(true);

    // Navigate to first step
    navigate('/onboarding/gender-name');
  };

  const handleSkip = () => {
    if (isButtonClicked) return;
    setIsButtonClicked(true);

    // Set default data and go to results
    updateAnswers({
      gender: 'vrouw',
      archetypes: ['casual_chic'],
      season: 'herfst',
      occasions: ['casual']
    });

    navigate('/results', {
      state: {
        onboardingData: {
          gender: 'vrouw',
          archetypes: ['casual_chic'],
          season: 'herfst',
          occasions: ['casual']
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#1B263B]">
      <div className="container-slim py-16">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-h1 font-bold text-white mb-6">
                Ontdek je perfecte stijl
              </h1>
              <p className="text-xl text-white/80 mb-2">
                Met hulp van AI. Slimmer shoppen, beter kleden.
              </p>
              <p className="text-base text-white/70">
                Beantwoord enkele vragen en ontvang gepersonaliseerde outfits die perfect bij jou passen.
              </p>
            </div>

            <div className="glass-card overflow-hidden">
              <div className="p-6">
                <div className="space-y-6">
                  {/* USP's */}
                  {[
                    {
                      title: 'Persoonlijke stijlanalyse',
                      subtitle: 'Ontdek welke stijlen het beste bij jou passen',
                      icon: (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20.24 12.24C21.3658 11.1142 21.9983 9.58722 21.9983 7.99504C21.9983 6.40285 21.3658 4.87588 20.24 3.75004C19.1142 2.62419 17.5872 1.9917 15.995 1.9917C14.4028 1.9917 12.8758 2.62419 11.75 3.75004L5 10.5V19H13.5L20.24 12.24Z" stroke="#FF8600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M16 8L2 22" stroke="#FF8600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M17.5 15H9" stroke="#FF8600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )
                    },
                    {
                      title: 'Gepersonaliseerde outfits',
                      subtitle: 'Complete looks die perfect bij jouw stijl passen',
                      icon: (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20.84 4.60999C20.3292 4.09946 19.7228 3.69352 19.0554 3.41708C18.388 3.14064 17.6725 2.99918 16.95 2.99918C16.2275 2.99918 15.512 3.14064 14.8446 3.41708C14.1772 3.69352 13.5708 4.09946 13.06 4.60999L12 5.66999L10.94 4.60999C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.60999C2.1283 5.64169 1.54871 7.04096 1.54871 8.49999C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.3505 11.8792 21.7565 11.2728 22.0329 10.6054C22.3094 9.93801 22.4508 9.22249 22.4508 8.49999C22.4508 7.7775 22.3094 7.06198 22.0329 6.39461C21.7565 5.72723 21.3505 5.12081 20.84 4.60999Z" stroke="#FF8600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )
                    },
                    {
                      title: 'Tijdbesparend',
                      subtitle: 'Geen eindeloos zoeken meer naar de juiste kleding',
                      icon: (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#FF8600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 6V12L16 14" stroke="#FF8600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )
                    }
                  ].map((item, i) => (
                    <div className="flex items-start" key={i}>
                      <div className="bg-[#FF8600]/20 p-2 rounded-full mr-3 mt-1">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="text-base font-medium text-white mb-1">{item.title}</h3>
                        <p className="text-sm text-white/70">{item.subtitle}</p>
                      </div>
                    </div>
                  ))}

                  <motion.div
                    initial={{ opacity: 1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                  >
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={handleStart}
                      icon={isButtonClicked ? undefined : <ArrowRight size={20} />}
                      iconPosition="right"
                      disabled={isButtonClicked}
                      className={isButtonClicked ? "opacity-80" : ""}
                    >
                      {isButtonClicked ? (
                        <span className="flex items-center justify-center">
                          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                          Even geduld...
                        </span>
                      ) : (
                        "Start de stijlquiz"
                      )}
                    </Button>
                  </motion.div>
                </div>
              </div>

              <div className="px-6 py-4 bg-white/5 flex items-center justify-center space-x-2">
                <ShieldCheck size={18} className="text-[#FF8600]" />
                <span className="text-sm text-text-secondary">Je gegevens zijn veilig en versleuteld</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button 
                onClick={handleSkip}
                className={`text-sm text-text-secondary hover:text-[#FF8600] transition-colors ${
                  isButtonClicked ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                Sla over en bekijk direct aanbevelingen
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeStep;