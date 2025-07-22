import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Upload, Info, ShieldCheck } from 'lucide-react';
import Button from '../components/ui/Button';
import { useUser } from '../context/UserContext';
import { motion } from 'framer-motion';
import ImageWithFallback from '../components/ui/ImageWithFallback';
import ProfileProcessingIndicator from '../components/ui/ProfileProcessingIndicator';
import { useNavigationService } from '../services/NavigationService';
import { saveQuizProgress, loadQuizProgress, clearQuizProgress } from '../utils/progressPersistence';
import { generateSmartDefaults } from '../utils/smartDefaults';

interface QuestionOption {
  id: string;
  text: string;
  image?: string;
}

interface Question {
  id: string;
  type: 'single' | 'multiple' | 'slider' | 'upload';
  question: string;
  description?: string;
  options?: QuestionOption[];
  min?: number;
  max?: number;
  step?: number;
  category: string;
}

const QuizPage: React.FC = () => {
  const { step } = useParams<{ step: string }>();
  const navigate = useNavigate();
  const { user, updateProfile } = useUser();
  const navigationService = useNavigationService();
  
  const currentQuestionIndex = parseInt(step || '1') - 1;
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [smartDefaults, setSmartDefaults] = useState<any>(null);
  const [showProgressRecovery, setShowProgressRecovery] = useState(false);
  
  // Initialize smart defaults
  useEffect(() => {
    const defaults = generateSmartDefaults();
    setSmartDefaults(defaults);
    
    if (env.DEBUG_MODE) {
      console.log('[🧠 QuizPage] Smart defaults generated:', defaults);
    }
  }, []);
  
  // Load saved progress on mount
  useEffect(() => {
    const savedProgress = loadQuizProgress();
    if (savedProgress && savedProgress.currentStep > 0) {
      console.log('[📱 QuizPage] Found saved progress:', savedProgress);
      
      // Show recovery option
      setShowProgressRecovery(true);
      
      // Auto-restore if recent (less than 5 minutes)
      const ageMinutes = (Date.now() - savedProgress.timestamp) / 60000;
      if (ageMinutes < 5) {
        setAnswers(savedProgress.answers);
        
        // Navigate to saved step if different
        if (savedProgress.currentStep !== currentQuestionIndex + 1) {
          navigate(`/quiz/${savedProgress.currentStep}`);
        }
        
        toast.success(`Vorige sessie hersteld (${Math.round(ageMinutes)} min geleden)`, {
          duration: 5000,
          icon: '📱'
        });
        
        // Track progress recovery
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'progress_recovered', {
            event_category: 'persistence',
            event_label: 'quiz',
            step: savedProgress.currentStep,
            age_minutes: Math.round(ageMinutes)
          });
        }
      }
    }
  }, []);
  
  // Auto-save progress when answers change
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      saveQuizProgress(currentQuestionIndex + 1, questions.length, answers);
    }
  }, [answers, currentQuestionIndex, questions.length]);

  // Updated questions with Dutch archetypes
  const questions: Question[] = [
    {
      id: 'occasion',
      type: 'multiple',
      question: 'Voor welke gelegenheden kleed je je meestal?',
      description: 'Selecteer alles wat van toepassing is op jouw lifestyle',
      options: [
        { id: 'casual', text: 'Casual dagelijks' },
        { id: 'work', text: 'Werk/Kantoor' },
        { id: 'formal', text: 'Formele evenementen' },
        { id: 'active', text: 'Actief/Sport' },
        { id: 'night', text: 'Uitgaan' },
        { id: 'travel', text: 'Reizen' },
      ],
      category: 'lifestyle',
    },
    {
      id: 'style',
      type: 'single',
      question: 'Welke Nederlandse stijl spreekt je het meest aan?',
      description: smartDefaults?.confidence > 0.8 
        ? `Gebaseerd op de tijd en datum raden we ${smartDefaults.archetype} aan, maar kies wat jij het mooist vindt`
        : 'Kies degene die het beste jouw gewenste esthetiek weergeeft',
      options: [
        { 
          id: 'klassiek', 
          text: 'Klassiek - Tijdloze elegantie', 
          image: 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
        },
        { 
          id: 'casual_chic', 
          text: 'Casual Chic - Moeiteloos elegant', 
          image: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
        },
        { 
          id: 'urban', 
          text: 'Urban - Stoere stadslook', 
          image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
        },
        { 
          id: 'streetstyle', 
          text: 'Streetstyle - Authentieke streetwear', 
          image: 'https://images.pexels.com/photos/2043590/pexels-photo-2043590.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
        },
      ],
      category: 'preferences',
    },
    {
      id: 'comfort',
      type: 'slider',
      question: 'Hoe belangrijk is comfort in je kledingkeuzes?',
      description: 'Beweeg de slider om je voorkeur aan te geven',
      min: 1,
      max: 10,
      step: 1,
      category: 'preferences',
    },
    {
      id: 'photo',
      type: 'upload',
      question: 'Upload een foto van jezelf voor meer accurate aanbevelingen',
      description: 'Dit helpt onze AI je lichaamsbouw en huidige stijl te begrijpen. Je foto wordt veilig versleuteld en alleen gebruikt voor analyse.',
      category: 'photo',
    },
  ];

  const currentQuestion = questions[currentQuestionIndex];
  const totalSteps = 4; // onboarding, gender, quiz, results
  const currentStep = 3;
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100 + (currentQuestionIndex / questions.length) * (100 / (totalSteps - 1));

  // Track quiz progress
  useEffect(() => {
    if (typeof window.trackQuizProgress === 'function') {
      window.trackQuizProgress(
        currentQuestionIndex + 1, 
        questions.length, 
        currentQuestion?.category
      );
    }
  }, [currentQuestionIndex, currentQuestion?.category, questions.length]);

  const handleSingleSelect = (optionId: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: optionId });
  };

  const handleMultiSelect = (optionId: string) => {
    const currentSelections = answers[currentQuestion.id] || [];
    let newSelections;
    
    if (currentSelections.includes(optionId)) {
      newSelections = currentSelections.filter((id: string) => id !== optionId);
    } else {
      newSelections = [...currentSelections, optionId];
    }
    
    setAnswers({ ...answers, [currentQuestion.id]: newSelections });
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setAnswers({ ...answers, [currentQuestion.id]: value });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedPhoto(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      setAnswers({ ...answers, [currentQuestion.id]: file.name });
      
      // Track photo upload
      if (typeof window.trackPhotoUpload === 'function') {
        window.trackPhotoUpload('style_analysis');
      }
    }
  };

  const nextQuestion = () => {
    console.log('[QuizPage] nextQuestion called, currentQuestionIndex:', currentQuestionIndex, 'total questions:', questions.length);
    
    if (currentQuestionIndex === questions.length - 1) {
      console.log('[QuizPage] Last question reached, setting isQuizComplete to true');
      setIsQuizComplete(true);
    } else {
      console.log('[QuizPage] Navigating to next question:', currentQuestionIndex + 2);
      navigate(`/quiz/${currentQuestionIndex + 2}`);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      navigate(`/quiz/${currentQuestionIndex}`);
    } else {
      navigate('/gender');
    }
  };

  const isNextDisabled = () => {
    const answer = answers[currentQuestion.id];
    
    if (currentQuestion.type === 'single' && !answer) return true;
    if (currentQuestion.type === 'multiple' && (!answer || answer.length === 0)) return true;
    if (currentQuestion.type === 'slider' && answer === undefined) return true;
    
    return false;
  };

  const handleSubmit = async () => {
    console.log('[QuizPage] handleSubmit called with answers:', answers);
    
    try {
      // Ensure we have season and occasion data
      const finalAnswers = {
        ...answers,
        season: answers.season || smartDefaults?.season || 'herfst',
        occasion: answers.occasion || smartDefaults?.occasions || ['Casual']
      };
      
      if (user) {
        await updateProfile({
          stylePreferences: {
            casual: 4,
            formal: 3,
            sporty: 2,
            vintage: 5,
            minimalist: 4
          }
        });
      }
      
      // Track quiz completion
      if (typeof window.trackQuizComplete === 'function') {
        const quizDuration = Date.now() - (Date.now() - 120000); // Approximate duration
        window.trackQuizComplete(quizDuration, questions.length, 'registered_user');
      }
      
      // Clear saved progress since quiz is complete
      clearQuizProgress();
      
      console.log('[QuizPage] Navigating to results with enhanced UX');
      await navigationService.navigateToResults(finalAnswers, {
        loadingMessage: 'Je stijlprofiel wordt gemaakt...',
        onStart: () => console.log('[QuizPage] Navigation started'),
        onComplete: () => console.log('[QuizPage] Navigation completed'),
        onError: (error) => {
          console.error('[QuizPage] Navigation error:', error);
          // Fallback navigation
          navigate('/results', { state: { answers: finalAnswers } });
        }
      });
    } catch (error) {
      console.error('[QuizPage] Error in handleSubmit:', error);
      // Emergency fallback
      navigate('/results', { state: { answers: finalAnswers } });
    }
  };

  // Handle quiz completion with proper redirect
  useEffect(() => {
    if (isQuizComplete) {
      console.log('[QuizPage] Quiz completed, redirecting to results in 300ms');
      setTimeout(() => {
        handleSubmit();
      }, 300);
    }
  }, [isQuizComplete, navigate]);
  
  // Handle progress recovery
  const handleRecoverProgress = () => {
    const savedProgress = loadQuizProgress();
    if (savedProgress) {
      setAnswers(savedProgress.answers);
      navigate(`/quiz/${savedProgress.currentStep}`);
      setShowProgressRecovery(false);
      
      toast.success('Vorige sessie hersteld!');
    }
  };
  
  const handleStartFresh = () => {
    clearQuizProgress();
    setShowProgressRecovery(false);
    
    toast.success('Nieuwe quiz gestart!');
  };
  
  // Setup auto-save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (Object.keys(answers).length > 0) {
        saveQuizProgress(currentQuestionIndex + 1, questions.length, answers);
        console.log('[📱 QuizPage] Auto-saved progress on page unload');
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [answers, currentQuestionIndex, questions.length]);

  if (!currentQuestion) {
    navigate('/quiz/1');
    return null;
  }

  const renderQuestion = () => {
    const question = currentQuestion;
    
    switch (question.type) {
      case 'single':
        return (
          <div className="space-y-4">
            {question.options?.map(option => (
              <motion.div 
                key={option.id} 
                className="relative"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
              >
                <input
                  type="radio"
                  id={option.id}
                  name={question.id}
                  className="sr-only peer"
                  checked={answers[question.id] === option.id}
                  onChange={() => handleSingleSelect(option.id)}
                />
                <label
                  htmlFor={option.id}
                  className={`
                    flex flex-col cursor-pointer rounded-xl p-4 border 
                    peer-checked:border-[#FF8600] peer-checked:bg-white/10
                    hover:bg-white/5 transition-colors
                    ${option.image ? 'items-center' : ''}
                  `}
                >
                  {option.image && (
                    <div className="mb-3 w-full h-40 overflow-hidden rounded-lg">
                      <ImageWithFallback 
                        src={option.image} 
                        alt={option.text} 
                        className="w-full h-full object-cover"
                        componentName="QuizPage_StyleOption"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between w-full">
                    <span className="text-white font-medium">{option.text}</span>
                    <div className={`
                      w-5 h-5 rounded-full flex items-center justify-center
                      ${answers[question.id] === option.id 
                        ? 'bg-[#FF8600] text-white' 
                        : 'bg-white/20 border border-white/30'}
                    `}>
                      {answers[question.id] === option.id && <Check size={14} />}
                    </div>
                  </div>
                </label>
              </motion.div>
            ))}
          </div>
        );
      
      case 'multiple':
        return (
          <div className="space-y-4">
            {question.options?.map(option => {
              const isSelected = answers[question.id]?.includes(option.id) || false;
              
              return (
                <motion.div 
                  key={option.id} 
                  className="relative"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  <input
                    type="checkbox"
                    id={option.id}
                    name={question.id}
                    className="sr-only peer"
                    checked={isSelected}
                    onChange={() => handleMultiSelect(option.id)}
                  />
                  <label
                    htmlFor={option.id}
                    className={`
                      flex items-center justify-between cursor-pointer rounded-xl p-4 border 
                      ${isSelected 
                        ? 'border-[#FF8600] bg-white/10' 
                        : 'border-white/30 hover:bg-white/5'}
                      transition-colors
                    `}
                  >
                    <span className="text-white font-medium">{option.text}</span>
                    <div className={`
                      w-5 h-5 rounded flex items-center justify-center
                      ${isSelected 
                        ? 'bg-[#FF8600] text-white' 
                        : 'bg-white/20 border border-white/30'}
                    `}>
                      {isSelected && <Check size={14} />}
                    </div>
                  </label>
                </motion.div>
              );
            })}
          </div>
        );
      
      case 'slider':
        const value = answers[question.id] || Math.round((question.max! + question.min!) / 2);
        
        return (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <input
                type="range"
                id={question.id}
                min={question.min}
                max={question.max}
                step={question.step}
                value={value}
                onChange={handleSliderChange}
                className="w-full h-2 bg-white/30 rounded-full appearance-none cursor-pointer"
              />
              <div className="flex justify-between mt-2 text-xs text-white/70">
                <span>Minder belangrijk</span>
                <span>Zeer belangrijk</span>
              </div>
            </div>
            <div className="text-center">
              <span className="text-3xl font-bold text-[#FF8600]">{value}</span>
              <span className="text-white/70 ml-1">/ {question.max}</span>
            </div>
          </motion.div>
        );
      
      case 'upload':
        return (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="border-2 border-dashed border-white/30 rounded-xl p-6 text-center">
              {photoPreview ? (
                <div className="relative">
                  <ImageWithFallback 
                    src={photoPreview} 
                    alt="Preview" 
                    className="max-h-64 mx-auto rounded-lg"
                    componentName="QuizPage_PhotoPreview"
                  />
                  <button
                    onClick={() => {
                      setSelectedPhoto(null);
                      setPhotoPreview(null);
                      setAnswers({ ...answers, [question.id]: undefined });
                    }}
                    className="mt-3 text-red-300 hover:text-red-200 transition-colors"
                  >
                    Foto verwijderen
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="mx-auto h-12 w-12 text-white/50" />
                  <div className="mt-2">
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer rounded-md font-medium text-[#FF8600] hover:text-orange-400 transition-colors"
                    >
                      Klik om een foto te uploaden
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handlePhotoUpload}
                      />
                    </label>
                    <p className="text-xs text-white/50 mt-1">
                      PNG, JPG, GIF tot 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-start p-4 bg-white/10 rounded-xl border border-white/20 text-white/90 text-sm">
              <ShieldCheck size={16} className="mr-2 mt-0.5 flex-shrink-0 text-[#FF8600]" />
              <p>
                Je foto wordt veilig versleuteld en alleen gebruikt voor analyse. Het wordt direct verwijderd na verwerking en nooit gedeeld met derden.
              </p>
            </div>
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#1B263B]">
      <div className="container-slim py-16">
        <div className="max-w-2xl mx-auto">
          {/* Progress bar */}
          <div className="mb-10">
            <div className="flex justify-between text-sm text-white/70 mb-2">
              <span>Vraag {currentQuestionIndex + 1} van {questions.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question card */}
          <motion.div 
            className="glass-card overflow-hidden"
            key={currentQuestionIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                    {currentQuestion.category.charAt(0).toUpperCase() + currentQuestion.category.slice(1)}
                  </span>
                  <span className="text-sm text-white/70">
                    {currentQuestionIndex + 1}/{questions.length}
                  </span>
                </div>
                
                <div className="flex items-center mb-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    {currentQuestion.question}
                  </h2>
                  <button
                    onClick={() => setShowTooltip(!showTooltip)}
                    className="ml-2 p-1 text-white/50 hover:text-white/80 transition-colors"
                    aria-label="Waarom deze vraag?"
                  >
                    <Info size={20} />
                  </button>
                </div>
                
                {currentQuestion.description && (
                  <p className="text-white/80 mb-8">
                    {currentQuestion.description}
                  </p>
                )}
              </div>
              
              {renderQuestion()}
            </div>
            
            {/* Navigation buttons */}
            <div className="px-6 py-4 bg-white/5 flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0}
                icon={<ArrowLeft size={16} />}
                iconPosition="left"
                className="min-w-[100px] text-white border border-white/30 hover:bg-white/10"
              >
                Terug
              </Button>
              
              <div className="flex items-center space-x-2">
                {questions.map((_, index) => (
                  <div
                    key={index}
                    className={`
                      w-2 h-2 rounded-full transition-colors duration-300
                      ${index === currentQuestionIndex 
                        ? 'bg-[#FF8600]' 
                        : index < currentQuestionIndex 
                          ? 'bg-white' 
                          : 'bg-white/30'}
                    `}
                  />
                ))}
              </div>
              
              <Button
                variant="primary"
                onClick={nextQuestion}
                disabled={isNextDisabled()}
                icon={<ArrowRight size={16} />}
                iconPosition="right"
                className="min-w-[100px]"
              >
                {currentQuestionIndex === questions.length - 1 ? (
                  isQuizComplete ? 'Laden...' : 'Voltooien'
                ) : 'Volgende'}
              </Button>
            </div>
          </motion.div>

          {/* Progress summary */}
          <div className="mt-6 text-center text-sm text-white/70">
            <p>
              Je bent {Math.round(progress)}% klaar met je stijlanalyse
            </p>
            {currentQuestionIndex > 0 && (
              <p className="mt-1">
                Nog {questions.length - currentQuestionIndex - 1} vragen te gaan
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div
            role="tooltip"
            className="glass-card p-4 max-w-sm mx-4 animate-fade-in"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-white">
                Waarom deze vraag?
              </h3>
              <button
                onClick={() => setShowTooltip(false)}
                className="text-white/50 hover:text-white/80 transition-colors"
                aria-label="Sluit uitleg"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="text-white/80 text-sm leading-relaxed">
              {currentQuestion.id === 'occasion' && (
                "Door te weten voor welke gelegenheden je je kleedt, kunnen we outfits aanbevelen die perfect passen bij jouw dagelijkse activiteiten en sociale situaties."
              )}
              {currentQuestion.id === 'style' && (
                "Je stijlvoorkeur helpt ons de juiste esthetiek en designprincipes te bepalen voor al je outfit aanbevelingen."
              )}
              {currentQuestion.id === 'comfort' && (
                "Je comfortniveau bepaalt welke materialen, pasvorm en stijlen we voorstellen. Dit zorgt ervoor dat je je altijd goed voelt in je outfits."
              )}
              {currentQuestion.id === 'photo' && (
                "Een foto helpt onze AI je lichaamsbouw, proporties en huidige stijl te analyseren voor nog betere, gepersonaliseerde aanbevelingen."
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0D1B2A] border-t border-white/10 p-4 z-40">
        <div className="flex space-x-3">
          <Button
            variant="ghost"
            onClick={prevQuestion}
            disabled={currentQuestionIndex === 0}
            icon={<ArrowLeft size={16} />}
            iconPosition="left"
            className="flex-1 text-white border border-white/30 hover:bg-white/10"
          >
            Terug
          </Button>
          <Button
            variant="primary"
            onClick={nextQuestion}
            disabled={isNextDisabled()}
            icon={<ArrowRight size={16} />}
            iconPosition="right"
            className="flex-1"
          >
            {currentQuestionIndex === questions.length - 1 ? (
              isQuizComplete ? 'Laden...' : 'Voltooien'
            ) : 'Volgende'}
          </Button>
        </div>
      </div>
      
      {/* Progress Recovery Modal */}
      {showProgressRecovery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              📱 Vorige sessie gevonden
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We hebben je vorige quiz-voortgang gevonden. Wil je doorgaan waar je gebleven was of opnieuw beginnen?
            </p>
            <div className="flex space-x-3">
              <Button
                variant="primary"
                onClick={handleRecoverProgress}
                className="flex-1"
              >
                Hervat sessie
              </Button>
              <Button
                variant="outline"
                onClick={handleStartFresh}
                className="flex-1"
              >
                Begin opnieuw
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading overlay when quiz is completing */}
      {isQuizComplete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <ProfileProcessingIndicator 
            isVisible={isQuizComplete}
            onComplete={() => {
              console.log('[QuizPage] Profile processing completed');
            }}
          />
        </div>
      )}
    </div>
  );
};

export default QuizPage;