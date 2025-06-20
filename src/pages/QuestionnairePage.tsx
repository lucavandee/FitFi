import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Upload, Info, Mail, User, ShieldCheck } from 'lucide-react';
import Button from '../components/ui/Button';
import Tooltip from '../components/ui/Tooltip';
import { useUser } from '../context/UserContext';
import { useGamification } from '../context/GamificationContext';

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
  explanation: string; // Added explanation field
  options?: QuestionOption[];
  min?: number;
  max?: number;
  step?: number;
  category: string;
}

const QuestionnairePage: React.FC = () => {
  const { user, updateProfile } = useUser();
  const { completeQuiz } = useGamification();
  const navigate = useNavigate();

  // State management for multi-step flow
  const [showGenderSelection, setShowGenderSelection] = useState(true);
  const [selectedGender, setSelectedGender] = useState<'man' | 'vrouw' | 'neutraal' | null>(null);
  const [showEmailOptIn, setShowEmailOptIn] = useState(false);
  const [emailOptInData, setEmailOptInData] = useState({
    name: '',
    email: '',
    acceptMarketing: false
  });

  // Quiz tracking state
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null);
  const [hasTrackedStart, setHasTrackedStart] = useState(false);

  // Tooltip state
  const [tooltipOpenId, setTooltipOpenId] = useState<string | null>(null);

  // Sample questions with explanations
  const questions: Question[] = [
    {
      id: 'occasion',
      type: 'multiple',
      question: 'Voor welke gelegenheden kleed je je meestal?',
      description: 'Selecteer alles wat van toepassing is op jouw lifestyle',
      explanation: 'Door je gelegenheden te kennen kunnen we outfits aanbevelen die perfect passen bij jouw dagelijkse activiteiten en sociale situaties.',
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
      question: 'Welke stijl spreekt je het meest aan?',
      description: 'Kies degene die het beste jouw gewenste esthetiek weergeeft',
      explanation: 'Je stijlvoorkeur helpt ons de juiste esthetiek en designprincipes te bepalen voor al je outfit aanbevelingen.',
      options: [
        { 
          id: 'minimalist', 
          text: 'Minimalistisch', 
          image: 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
        },
        { 
          id: 'classic', 
          text: 'Klassiek', 
          image: 'https://images.pexels.com/photos/1049317/pexels-photo-1049317.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
        },
        { 
          id: 'bohemian', 
          text: 'Bohemian', 
          image: 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
        },
        { 
          id: 'streetwear', 
          text: 'Streetwear', 
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
      explanation: 'Je comfortniveau bepaalt welke materialen, pasvorm en stijlen we voorstellen. Dit zorgt ervoor dat je je altijd goed voelt in je outfits.',
      min: 1,
      max: 10,
      step: 1,
      category: 'preferences',
    },
    {
      id: 'color',
      type: 'multiple',
      question: 'Welk kleurenpallet heeft jouw voorkeur?',
      description: 'Selecteer alles wat je aanspreekt',
      explanation: 'Kleurvoorkeuren helpen ons outfits samen te stellen die bij jouw persoonlijkheid passen en je huid- en haartint flatteren.',
      options: [
        { id: 'neutral', text: 'Neutrale tinten (zwart, wit, beige)' },
        { id: 'warm', text: 'Warme tinten (rood, oranje, geel)' },
        { id: 'cool', text: 'Koele tinten (blauw, groen, paars)' },
        { id: 'pastel', text: 'Pasteltinten' },
        { id: 'vibrant', text: 'Levendige/Opvallende kleuren' },
      ],
      category: 'preferences',
    },
    {
      id: 'photo',
      type: 'upload',
      question: 'Upload een foto van jezelf voor meer accurate aanbevelingen',
      description: 'Dit helpt onze AI je lichaamsbouw en huidige stijl te begrijpen. Je foto wordt veilig versleuteld en alleen gebruikt voor analyse.',
      explanation: 'Een foto helpt onze AI je lichaamsbouw, proporties en huidige stijl te analyseren voor nog betere, gepersonaliseerde aanbevelingen.',
      category: 'photo',
    },
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const totalSteps = questions.length + (showEmailOptIn ? 1 : 0) + (showGenderSelection ? 1 : 0);
  let currentStep = 1;
  
  if (showGenderSelection) {
    currentStep = 1;
  } else if (showEmailOptIn) {
    currentStep = 2;
  } else {
    currentStep = (showEmailOptIn ? 2 : 1) + currentQuestionIndex + 1;
  }
  
  const progress = (currentStep / totalSteps) * 100;

  // Track quiz start when first question is shown
  useEffect(() => {
    if (!showEmailOptIn && !showGenderSelection && !hasTrackedStart && typeof window.trackQuizStart === 'function') {
      window.trackQuizStart('style_assessment');
      setQuizStartTime(Date.now());
      setHasTrackedStart(true);
      console.log('📊 Quiz started - GA4 event tracked');
    }
  }, [showEmailOptIn, showGenderSelection, hasTrackedStart]);

  // Track quiz progress on question change
  useEffect(() => {
    if (!showEmailOptIn && !showGenderSelection && hasTrackedStart && typeof window.trackQuizProgress === 'function') {
      window.trackQuizProgress(
        currentQuestionIndex + 1, 
        questions.length, 
        currentQuestion?.category
      );
      console.log(`📊 Quiz progress: Question ${currentQuestionIndex + 1}/${questions.length} - GA4 event tracked`);
    }
  }, [currentQuestionIndex, showEmailOptIn, showGenderSelection, hasTrackedStart, currentQuestion?.category, questions.length]);

  const toggleTooltip = (questionId: string | null) => {
    setTooltipOpenId(questionId);
  };

  const handleGenderSelect = (gender: 'man' | 'vrouw' | 'neutraal') => {
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
    
    // Save to user profile if logged in
    if (user) {
      updateProfile({ gender });
    }
    
    // Move to email opt-in
    setShowEmailOptIn(true);
    setShowGenderSelection(false);
  };

  const handleEmailOptInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailOptInData.name.trim() || !emailOptInData.email.trim()) {
      return;
    }

    // Track lead capture
    if (typeof window.trackLeadCapture === 'function') {
      window.trackLeadCapture('questionnaire_optin', 'new_lead');
      console.log('📊 Lead capture tracked - GA4 event sent');
    }

    // Store the email opt-in data
    localStorage.setItem('fitfi-email-optin', JSON.stringify(emailOptInData));
    
    // Hide the opt-in screen and start the questionnaire
    setShowEmailOptIn(false);
  };

  const handleEmailOptInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setEmailOptInData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSingleSelect = (optionId: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: optionId });
    
    // Track style preference selection
    if (currentQuestion.id === 'style' && typeof window.trackStylePreference === 'function') {
      window.trackStylePreference(optionId, 5); // Default rating for style selection
      console.log(`📊 Style preference tracked: ${optionId} - GA4 event sent`);
    }
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
    
    // Track comfort preference
    if (currentQuestion.id === 'comfort' && typeof window.trackStylePreference === 'function') {
      window.trackStylePreference('comfort_level', value);
      console.log(`📊 Comfort preference tracked: ${value}/10 - GA4 event sent`);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedPhoto(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      setAnswers({ ...answers, [currentQuestion.id]: file.name });
      
      // Track photo upload
      if (typeof window.trackPhotoUpload === 'function') {
        window.trackPhotoUpload('style_analysis');
        console.log('📊 Photo upload tracked - GA4 event sent');
      }
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      // Submit questionnaire
      handleSubmit();
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
    }
  };

  const isNextDisabled = () => {
    const answer = answers[currentQuestion.id];
    
    if (currentQuestion.type === 'single' && !answer) return true;
    if (currentQuestion.type === 'multiple' && (!answer || answer.length === 0)) return true;
    if (currentQuestion.type === 'slider' && answer === undefined) return true;
    // Photo upload is optional
    
    return false;
  };

  const handleSubmit = async () => {
    // Track quiz completion
    if (quizStartTime && typeof window.trackQuizComplete === 'function') {
      const completionTime = Math.round((Date.now() - quizStartTime) / 1000);
      const userSegment = user ? 'registered_user' : 'anonymous_user';
      
      window.trackQuizComplete(completionTime, questions.length, userSegment);
      console.log(`📊 Quiz completed in ${completionTime}s - GA4 event tracked`);
    }
    
    // Award gamification points for completing quiz
    await completeQuiz();
    
    // Set some mock style preferences based on answers
    if (user) {
      await updateProfile({
        gender: selectedGender || undefined,
        stylePreferences: {
          casual: 4,
          formal: 3,
          sporty: 2,
          vintage: 5,
          minimalist: 4
        }
      });
    }
    
    // Clear lead data from localStorage
    localStorage.removeItem('fitfi-lead-data');
    
    navigate('/recommendations', { 
      state: { 
        answers: { ...answers, gender: selectedGender }, 
        emailOptInData 
      } 
    });
  };

  // Gender Selection Screen
  if (showGenderSelection) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 transition-colors">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          {/* Progress bar for gender selection */}
          <div className="mb-10">
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
              <span>Stap 1 van {totalSteps}</span>
              <span>{Math.round((1 / totalSteps) * 100)}% Voltooid</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all duration-300 ease-in-out"
                style={{ width: `${(1 / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welkom bij FitFi! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Laten we beginnen met je persoonlijke stijlanalyse
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-colors animate-scale-in">
            <div className="p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                Hoe identificeer je jezelf?
              </h2>
              
              <div className="space-y-4">
                {[
                  { id: 'man', label: 'Man', icon: '👨', description: 'Mannelijke stijladvies' },
                  { id: 'vrouw', label: 'Vrouw', icon: '👩', description: 'Vrouwelijke stijladvies' },
                  { id: 'neutraal', label: 'Gender Neutraal', icon: '🧑', description: 'Neutrale stijladvies' }
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleGenderSelect(option.id as 'man' | 'vrouw' | 'neutraal')}
                    className={`
                      w-full p-4 rounded-lg border-2 transition-all duration-200 text-left
                      ${selectedGender === option.id
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }
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
            </div>

            {/* Privacy indicator */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex items-center justify-center space-x-2 transition-colors">
              <ShieldCheck size={18} className="text-green-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Je gegevens zijn veilig en versleuteld</span>
            </div>
          </div>

          {/* Back to home link */}
          <div className="mt-6 text-center">
            <button 
              onClick={() => navigate('/')}
              className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors"
            >
              <ArrowLeft size={16} className="mr-1" />
              Terug naar home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Email Opt-in Screen
  if (showEmailOptIn) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 transition-colors">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          {/* Progress bar for opt-in */}
          <div className="mb-10">
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
              <span>Stap 2 van {totalSteps}</span>
              <span>{Math.round((2 / totalSteps) * 100)}% Voltooid</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all duration-300 ease-in-out"
                style={{ width: `${(2 / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Start je stijlanalyse
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Vul je gegevens in om gepersonaliseerde aanbevelingen te ontvangen
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-colors animate-scale-in">
            <div className="p-6 sm:p-8">
              <form onSubmit={handleEmailOptInSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="optin-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Volledige naam
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="optin-name"
                        name="name"
                        value={emailOptInData.name}
                        onChange={handleEmailOptInChange}
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                        placeholder="Je volledige naam"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="optin-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      E-mailadres
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="optin-email"
                        name="email"
                        value={emailOptInData.email}
                        onChange={handleEmailOptInChange}
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                        placeholder="je@email.com"
                      />
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="acceptMarketing"
                        name="acceptMarketing"
                        type="checkbox"
                        checked={emailOptInData.acceptMarketing}
                        onChange={handleEmailOptInChange}
                        className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="acceptMarketing" className="text-gray-600 dark:text-gray-400">
                        Ik wil graag updates ontvangen over nieuwe features en stijltips
                      </label>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    disabled={!emailOptInData.name.trim() || !emailOptInData.email.trim()}
                    icon={<ArrowRight size={20} />}
                    iconPosition="right"
                    className="mt-6"
                  >
                    Start Stijlanalyse
                  </Button>
                </div>
              </form>
            </div>

            {/* Privacy indicator */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex items-center justify-center space-x-2 transition-colors">
              <ShieldCheck size={18} className="text-green-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Je gegevens zijn veilig en versleuteld</span>
            </div>
          </div>

          {/* Back to home link */}
          <div className="mt-6 text-center">
            <button 
              onClick={() => navigate('/')}
              className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors"
            >
              <ArrowLeft size={16} className="mr-1" />
              Terug naar home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderQuestion = () => {
    const question = currentQuestion;
    
    switch (question.type) {
      case 'single':
        return (
          <div className="space-y-4 animate-fade-in">
            {question.options?.map(option => (
              <div key={option.id} className="relative">
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
                    flex flex-col cursor-pointer rounded-lg p-4 border 
                    peer-checked:border-orange-500 peer-checked:bg-orange-50 dark:peer-checked:bg-gray-700
                    hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                    ${option.image ? 'items-center' : ''}
                  `}
                >
                  {option.image && (
                    <div className="mb-3 w-full h-40 overflow-hidden rounded-md">
                      <img 
                        src={option.image} 
                        alt={option.text} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between w-full">
                    <span className="text-gray-900 dark:text-white font-medium">{option.text}</span>
                    <div className={`
                      w-5 h-5 rounded-full flex items-center justify-center
                      ${answers[question.id] === option.id 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500'}
                    `}>
                      {answers[question.id] === option.id && <Check size={14} />}
                    </div>
                  </div>
                </label>
              </div>
            ))}
          </div>
        );
      
      case 'multiple':
        return (
          <div className="space-y-4 animate-fade-in">
            {question.options?.map(option => {
              const isSelected = answers[question.id]?.includes(option.id) || false;
              
              return (
                <div key={option.id} className="relative">
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
                      flex items-center justify-between cursor-pointer rounded-lg p-4 border 
                      ${isSelected 
                        ? 'border-orange-500 bg-orange-50 dark:bg-gray-700' 
                        : 'border-gray-200 dark:border-gray-700'}
                      hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                    `}
                  >
                    <span className="text-gray-900 dark:text-white font-medium">{option.text}</span>
                    <div className={`
                      w-5 h-5 rounded flex items-center justify-center
                      ${isSelected 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500'}
                    `}>
                      {isSelected && <Check size={14} />}
                    </div>
                  </label>
                </div>
              );
            })}
          </div>
        );
      
      case 'slider':
        const value = answers[question.id] || Math.round((question.max! + question.min!) / 2);
        
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="mb-6">
              <input
                type="range"
                id={question.id}
                min={question.min}
                max={question.max}
                step={question.step}
                value={value}
                onChange={handleSliderChange}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>Minder belangrijk</span>
                <span>Zeer belangrijk</span>
              </div>
            </div>
            <div className="text-center">
              <span className="text-3xl font-bold text-orange-500">{value}</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">/ {question.max}</span>
            </div>
          </div>
        );
      
      case 'upload':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
              {photoPreview ? (
                <div className="relative">
                  <img 
                    src={photoPreview} 
                    alt="Preview" 
                    className="max-h-64 mx-auto rounded"
                  />
                  <button
                    onClick={() => {
                      setSelectedPhoto(null);
                      setPhotoPreview(null);
                      setAnswers({ ...answers, [question.id]: undefined });
                    }}
                    className="mt-3 text-red-500 hover:text-red-600 transition-colors"
                  >
                    Foto verwijderen
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer rounded-md font-medium text-orange-500 hover:text-orange-600 transition-colors"
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
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG, GIF tot 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-start p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md text-blue-700 dark:text-blue-300 text-sm">
              <Info size={16} className="mr-2 mt-0.5 flex-shrink-0" />
              <p>
                Je foto wordt veilig versleuteld en alleen gebruikt voor analyse. Het wordt nooit gedeeld zonder jouw expliciete toestemming. Je kunt je gegevens altijd verwijderen.
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 transition-colors">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Enhanced Progress bar */}
        <div className="mb-10">
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
            <span>Vraag {currentQuestionIndex + 1} van {questions.length}</span>
            <span>{Math.round(progress)}% Voltooid</span>
          </div>
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500 ease-in-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400 dark:text-gray-500">
            <span>Start</span>
            <span>Voltooid</span>
          </div>
        </div>

        {/* Question card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-colors">
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                  {currentQuestion.category.charAt(0).toUpperCase() + currentQuestion.category.slice(1)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {currentQuestionIndex + 1}/{questions.length}
                </span>
              </div>
              
              <div className="flex items-center mb-3">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {currentQuestion.question}
                </h2>
                <button
                  onClick={() => toggleTooltip(currentQuestion.id)}
                  className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="Waarom deze vraag?"
                  aria-expanded={tooltipOpenId === currentQuestion.id}
                  aria-controls={`tooltip-${currentQuestion.id}`}
                >
                  <Info size={20} />
                </button>
              </div>
              
              {currentQuestion.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  {currentQuestion.description}
                </p>
              )}
            </div>
            
            {renderQuestion()}
          </div>
          
          {/* Enhanced Navigation buttons */}
          <div className="px-6 sm:px-8 py-4 bg-gray-50 dark:bg-gray-700 flex justify-between items-center transition-colors">
            <Button
              variant="outline"
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              icon={<ArrowLeft size={16} />}
              iconPosition="left"
              className="min-w-[100px]"
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
                      ? 'bg-orange-500' 
                      : index < currentQuestionIndex 
                        ? 'bg-green-500' 
                        : 'bg-gray-300 dark:bg-gray-600'}
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
              {currentQuestionIndex === questions.length - 1 ? 'Voltooien' : 'Volgende'}
            </Button>
          </div>
        </div>

        {/* Progress summary */}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
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

      {/* Tooltip */}
      {tooltipOpenId === currentQuestion.id && (
        <Tooltip onClose={() => toggleTooltip(null)}>
          {currentQuestion.explanation}
        </Tooltip>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #f97316;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #f97316;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default QuestionnairePage;