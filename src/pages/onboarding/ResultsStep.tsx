import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../components/ui/Button';
import { useOnboarding } from '../../context/OnboardingContext';

const ResultsStep: React.FC = () => {
  const navigate = useNavigate();
  const { data } = useOnboarding();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    // Simulate AI processing
    const timer = setTimeout(() => {
      setIsProcessing(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleViewResults = () => {
    // Track completion
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'onboarding_complete', {
        event_category: 'onboarding',
        event_label: 'results_view',
        gender: data.gender,
        archetypes: data.archetypes?.join(','),
        season: data.season,
        occasions: data.occasions?.join(',')
      });
    }
    
    // Navigate to results with onboarding data
    navigate('/results', {
      state: {
        onboardingData: data
      }
    });
  };

  const handleRetakeQuiz = () => {
    // Track retake
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'onboarding_retake', {
        event_category: 'onboarding',
        event_label: 'results_retake'
      });
    }
    
    // Navigate back to start
    navigate('/onboarding');
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary to-primary-dark flex items-center justify-center">
        <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg text-center max-w-md">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 mx-auto mb-6"
          >
            <Sparkles className="w-full h-full text-secondary" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-secondary mb-4">
            AI aan het werk
          </h2>
          <p className="text-gray-600 mb-6">
            We analyseren je voorkeuren en stellen je perfecte stijlprofiel samen...
          </p>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div 
              className="bg-secondary h-2 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 3, ease: 'easeInOut' }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-primary-dark">
      <div className="container-slim py-16">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-secondary" />
            </div>
            
            <h1 className="text-3xl font-bold text-secondary mb-4">
              Je stijlprofiel is klaar!
            </h1>
            <p className="text-body text-lg">
              We hebben je perfecte stijl geanalyseerd en gepersonaliseerde outfits samengesteld
            </p>
          </motion.div>

          <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg mb-8">
            <h3 className="text-xl font-semibold mb-4">Jouw stijlprofiel:</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Gender:</span>
                <span className="font-medium capitalize">{data.gender}</span>
              </div>
              
              {data.name && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Naam:</span>
                  <span className="font-medium">{data.name}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Stijlen:</span>
                <span className="font-medium">{data.archetypes?.join(', ')}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Seizoen:</span>
                <span className="font-medium capitalize">{data.season}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Gelegenheden:</span>
                <span className="font-medium">{data.occasions?.join(', ')}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              variant="primary"
              size="lg"
              onClick={handleViewResults}
              icon={<ArrowRight size={20} />}
              iconPosition="right"
              className="w-full"
            >
              Bekijk mijn outfits
            </Button>
            
            <Button
              variant="ghost"
              onClick={handleRetakeQuiz}
              icon={<RefreshCw size={16} />}
              iconPosition="left"
              className="w-full"
            >
              Quiz opnieuw doen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsStep;