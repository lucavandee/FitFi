import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Star, TrendingUp, Heart, Share2 } from 'lucide-react';
import Button from '../components/ui/Button';
import { useUser } from '../context/UserContext';
import { useQuizAnswers } from '../hooks/useQuizAnswers';
import LoadingFallback from '../components/ui/LoadingFallback';
import toast from 'react-hot-toast';

const ResultsPage: React.FC = () => {
  const { user, isLoading: userLoading } = useUser();
  const { quizData, isLoading: quizLoading, isQuizCompleted, resetQuiz, isResetting } = useQuizAnswers();
  const location = useLocation();
  const navigate = useNavigate();
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // Redirect to quiz if not completed
  useEffect(() => {
    if (!quizLoading && !userLoading && !isQuizCompleted()) {
      navigate('/quiz', { replace: true });
    }
  }, [quizLoading, userLoading, isQuizCompleted, navigate]);

  useEffect(() => {
    // Simulate AI analysis completion
    const timer = setTimeout(() => {
      setAnalysisComplete(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleQuizRestart = async () => {
    try {
      const success = await resetQuiz();
      
      if (success) {
        // Set flag to prevent redirect back to results
        sessionStorage.setItem('quiz-restarted', 'true');
        toast.success('Quiz opnieuw gestart!');
        navigate('/quiz', { replace: true });
      }
    } catch (error) {
      console.error('Quiz restart error:', error);
      toast.error('Kan quiz niet resetten. Probeer opnieuw.');
    }
  };

  if (userLoading || quizLoading) {
    return <LoadingFallback fullScreen message="Resultaten laden..." />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF8F6] flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-md">
          <h2 className="text-2xl font-light text-gray-900 mb-4">Inloggen vereist</h2>
          <p className="text-gray-600 mb-6">Je moet ingelogd zijn om je resultaten te bekijken.</p>
          <Button as={Link} to="/inloggen" variant="primary" fullWidth>
            Inloggen
          </Button>
        </div>
      </div>
    );
  }

  // Don't show results if quiz not completed (will redirect)
  if (!isQuizCompleted()) {
    return <LoadingFallback fullScreen message="Quiz controleren..." />;
  }

  if (!analysisComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAF8F6] via-white to-[#F5F3F0] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-[#bfae9f] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-light text-gray-900 mb-4">
            AI analyseert jouw stijl...
          </h2>
          <p className="text-gray-600 mb-6">
            We creëren jouw persoonlijke stijlprofiel op basis van je antwoorden.
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-[#bfae9f] h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F6] via-white to-[#F5F3F0]">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/dashboard"
            className="inline-flex items-center text-[#bfae9f] hover:text-[#a89a8c] transition-colors mb-6"
          >
            <ArrowLeft size={20} className="mr-2" />
            Terug naar dashboard
          </Link>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-[#bfae9f] rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4" id="results-heading">
              Jouw AI-Stijlanalyse
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Gebaseerd op jouw antwoorden hebben we een uniek stijlprofiel voor je samengesteld
            </p>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Analysis Card */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm p-8">
            <div className="flex items-center justify-between mb-6" role="region" aria-labelledby="style-profile-heading">
              <h2 className="text-2xl font-medium text-gray-900">Jouw Stijlprofiel</h2>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="text-lg font-medium text-gray-900">87% Match</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-[#bfae9f]/10 to-purple-50 rounded-2xl p-6 mb-6">
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                {getStyleProfileTitle(quizData)}
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                {getStyleDescription(quizData)}
              </p>
              <div className="flex flex-wrap gap-2">
                {getStyleTags(quizData).map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Jouw voorkeuren:</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Minimalistisch</span>
                    <span>75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-[#bfae9f] h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Casual Chic</span>
                    <span>20%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-400 h-2 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Klassiek</span>
                    <span>5%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-400 h-2 rounded-full" style={{ width: '5%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h3 className="font-medium text-gray-900 mb-4">Jouw Statistieken</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Stijlmatch</span>
                  <span className="font-medium text-[#bfae9f]">87%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Uniekheid</span>
                  <span className="font-medium text-blue-600">92%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Veelzijdigheid</span>
                  <span className="font-medium text-green-600">85%</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h3 className="font-medium text-gray-900 mb-4">Acties</h3>
              <div className="space-y-3">
                <Button
                  variant="primary"
                  fullWidth
                  icon={<Heart size={16} />}
                  iconPosition="left"
                  className="bg-[#bfae9f] hover:bg-[#a89a8c] text-white"
                >
                  Bewaar Profiel
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  icon={<Share2 size={16} />}
                  iconPosition="left"
                  className="border-[#bfae9f] text-[#bfae9f] hover:bg-[#bfae9f] hover:text-white"
                >
                  Deel Resultaat
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-3xl shadow-sm p-8 text-center">
          <h2 className="text-2xl font-medium text-gray-900 mb-4">
            Wat nu?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Nu je jouw stijlprofiel kent, kunnen we gepersonaliseerde outfit aanbevelingen voor je maken.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              as={Link}
              to="/outfits" 
              variant="primary"
              size="lg"
              icon={<TrendingUp size={20} />}
              iconPosition="left"
              className="bg-[#bfae9f] hover:bg-[#a89a8c] text-white"
            >
              Bekijk Outfits
            </Button>
            <Button 
              onClick={handleQuizRestart}
              variant="outline"
              size="lg"
              className="border-[#bfae9f] text-[#bfae9f] hover:bg-[#bfae9f] hover:text-white"
              disabled={isResetting}
              aria-busy={isResetting}
            >
              {isResetting ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-[#bfae9f] border-t-transparent rounded-full animate-spin mr-2"></div>
                  Quiz resetten...
                </div>
              ) : (
                'Quiz Opnieuw Doen'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions to generate content based on quiz answers
function getStyleProfileTitle(answers: any): string {
  if (!answers?.stylePreferences) return 'Jouw Unieke Stijl';
  
  const preferences = answers.stylePreferences;
  if (preferences.includes('minimalist')) return 'Modern Minimalist';
  if (preferences.includes('classic')) return 'Tijdloos Elegant';
  if (preferences.includes('bohemian')) return 'Bohemian Spirit';
  if (preferences.includes('streetwear')) return 'Urban Trendsetter';
  if (preferences.includes('romantic')) return 'Romantisch Chic';
  if (preferences.includes('edgy')) return 'Edgy & Bold';
  
  return 'Eclectische Stijl';
}

function getStyleDescription(answers: any): string {
  if (!answers) return 'Jouw unieke stijl combineert verschillende elementen die perfect bij jouw persoonlijkheid passen.';
  
  const baseColors = answers.baseColors;
  const occasions = answers.occasions || [];
  
  let description = 'Jouw stijl ';
  
  if (baseColors === 'neutral') {
    description += 'straalt rust en verfijning uit met neutrale tinten die tijdloos en veelzijdig zijn. ';
  } else if (baseColors === 'bold') {
    description += 'is gedurfd en expressief met felle kleuren die je persoonlijkheid laten zien. ';
  }
  
  if (occasions.includes('work')) {
    description += 'Je waardeert professionaliteit en wilt er altijd verzorgd uitzien. ';
  }
  
  return description + 'Deze combinatie toont dat je bewuste keuzes maakt die bij jouw lifestyle passen.';
}

function getStyleTags(answers: any): string[] {
  if (!answers?.stylePreferences) return ['Uniek', 'Persoonlijk', 'Stijlvol'];
  
  const tagMap: Record<string, string> = {
    minimalist: 'Minimalistisch',
    classic: 'Tijdloos',
    bohemian: 'Vrij',
    streetwear: 'Urban',
    romantic: 'Romantisch',
    edgy: 'Gedurfd'
  };

  const tags = answers.stylePreferences.map((pref: string) => tagMap[pref] || pref);
  return [...tags, 'Veelzijdig', 'Authentiek'].slice(0, 4);
}

export default ResultsPage;