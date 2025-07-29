import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import { useUser } from '../context/UserContext';
import LoadingFallback from '../components/ui/LoadingFallback';
import Quiz from '../components/Quiz';

const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useUser();
  const { step } = useParams<{ step: string }>();

  if (isLoading) {
    return <LoadingFallback fullScreen message="Quiz laden..." />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF8F6] flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-md">
          <h2 className="text-2xl font-light text-gray-900 mb-4">Inloggen vereist</h2>
          <p className="text-gray-600 mb-6">Je moet ingelogd zijn om de quiz te doen.</p>
          <Button as={Link} to="/inloggen" variant="primary" fullWidth>
            Inloggen
          </Button>
        </div>
      </div>
    );
  }

  const handleQuizComplete = async (quizData: any) => {
    try {
      // Track quiz completion
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'quiz_complete', {
          event_category: 'onboarding',
          event_label: 'style_quiz',
          user_id: user.id
        });
      }

      // TODO: Save quiz data to Supabase profile
      // const { error } = await supabase
      //   .from('users')
      //   .update({ quiz_data: quizData })
      //   .eq('id', user.id);

      // Navigate to results with quiz data
      navigate('/results', { 
        state: { quizData },
        replace: true 
      });
    } catch (error) {
      console.error('Error saving quiz data:', error);
      // Still navigate to results even if save fails
      navigate('/results', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F6] via-white to-[#F5F3F0] py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-6">
            Ontdek je perfecte stijl
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Beantwoord enkele vragen en ontvang gepersonaliseerde stijladvies
          </p>
        </div>
        
        {/* Placeholder Quiz Content */}
        <div className="bg-white rounded-3xl shadow-sm p-8 mb-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#bfae9f]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-[#bfae9f]" />
            </div>
            <h2 className="text-2xl font-medium text-gray-900 mb-4">
              Quiz Placeholder
            </h2>
            <p className="text-gray-600 mb-6">
              De volledige stijlquiz wordt binnenkort geïmplementeerd. 
              Voor nu kun je direct naar je resultaten gaan.
            </p>
            
            <div className="bg-[#bfae9f]/10 rounded-2xl p-6 mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Wat de quiz zal bevatten:</h3>
              <ul className="text-left text-gray-700 space-y-2">
                <li>• Stijlvoorkeuren en persoonlijkheid</li>
                <li>• Kleur- en materiaalvoorkeur</li>
                <li>• Lichaamsbouw en pasvorm</li>
                <li>• Gelegenheden en lifestyle</li>
                <li>• Budget en merkvoorkeuren</li>
              </ul>
            </div>
            
            <Button
              onClick={() => handleQuizComplete({ 
                style: 'minimalist', 
                preferences: { casual: 4, formal: 3 },
                completed_at: new Date().toISOString()
              })}
              variant="primary"
              size="lg"
              icon={<ArrowRight size={20} />}
              iconPosition="right"
              className="bg-[#bfae9f] hover:bg-[#a89a8c] text-white"
            >
              Ga naar Resultaten
            </Button>
          </div>
        </div>
        
        <div className="text-center">
          <Button 
            as={Link} 
            to="/onboarding" 
            variant="ghost"
            className="text-gray-600 hover:bg-gray-50"
          >
            ← Terug naar onboarding
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
            </h1>
            <p className="text-text-secondary">
              Beantwoord enkele vragen en ontvang gepersonaliseerde stijladvies
            </p>
          </div>
          
          {debugLog('Rendering Quiz component')}
          <Quiz />
        </div>
      </div>
    </div>
  );
};

export default QuizPage;