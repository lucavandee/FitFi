import React, { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';
import { useUser } from '../context/UserContext';
import { useQuizAnswers } from '../hooks/useQuizAnswers';
import LoadingFallback from '../components/ui/LoadingFallback';

const OnboardingPage: React.FC = () => {
  const { user, isLoading: userLoading } = useUser();
  const { isQuizCompleted, isLoading: quizLoading } = useQuizAnswers();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get user ID from URL params if available
  const userIdFromUrl = searchParams.get('user');

  // Redirect to results if quiz already completed
  useEffect(() => {
    if (!quizLoading && isQuizCompleted()) {
      navigate('/results');
    }
  }, [quizLoading, isQuizCompleted, navigate]);

  if (userLoading || quizLoading) {
    return <LoadingFallback fullScreen message="Onboarding laden..." />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF8F6] flex items-center justify-center py-12 px-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-md w-full">
          <div className="w-16 h-16 bg-[#bfae9f]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-[#bfae9f]" />
          </div>
          <h2 className="text-2xl font-light text-gray-900 mb-4">Inloggen vereist</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Je moet ingelogd zijn om de onboarding te starten.
          </p>
          <Button 
            as={Link} 
            to="/inloggen" 
            variant="primary"
            size="lg"
            fullWidth
            className="bg-[#bfae9f] hover:bg-[#a89a8c] text-white"
          >
            Inloggen
          </Button>
        </div>
      </div>
    );
  }

  // Don't show onboarding if quiz completed (will redirect)
  if (isQuizCompleted()) {
    return <LoadingFallback fullScreen message="Doorsturen naar resultaten..." />;
  }

  const handleStartQuiz = () => {
    // Track quiz start
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'quiz_start', {
        event_category: 'onboarding',
        event_label: 'style_quiz',
        user_id: user.id
      });
    }
    
    // Navigate to dynamic onboarding
    navigate('/dynamic-onboarding');
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F6] via-white to-[#F5F3F0]">
      <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-[#bfae9f] rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 leading-tight">
            Welkom bij FitFi, <span className="font-medium text-[#bfae9f]">{user.name}!</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Laten we je stijlprofiel opzetten met onze slimme AI-quiz. 
            In slechts 2 minuten krijg je gepersonaliseerde outfit aanbevelingen.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm p-8 md:p-12 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Persoonlijk</h3>
              <p className="text-gray-600 text-sm">AI analyseert jouw unieke stijl</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Snel</h3>
              <p className="text-gray-600 text-sm">Slechts 2 minuten van je tijd</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Nauwkeurig</h3>
              <p className="text-gray-600 text-sm">Perfect passende aanbevelingen</p>
            </div>
          </div>
          
          <div className="text-center">
            <Button 
              onClick={handleStartQuiz}
              variant="primary"
              size="lg"
              icon={<ArrowRight size={20} />}
              iconPosition="right"
              className="cta-btn px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Start de Stijlquiz
            </Button>
            
            <p className="text-gray-500 text-sm mt-4">
              Geen verplichtingen • Je kunt altijd stoppen
            </p>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-gray-500 mb-4">Wil je eerst rondkijken?</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              as={Link} 
              to="/quiz" 
              variant="outline"
              className="border-[#bfae9f] text-[#bfae9f] hover:bg-[#bfae9f] hover:text-white"
            >
              Start Quiz
            </Button>
            <Button 
              as={Link} 
              to="/" 
              variant="ghost"
              className="text-gray-600 hover:bg-gray-50"
            >
              Terug naar Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;