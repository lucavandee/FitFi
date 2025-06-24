import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Upload, Info, ShieldCheck } from 'lucide-react';
import Button from '../components/ui/Button';
import { useUser } from '../context/UserContext';
import { DUTCH_ARCHETYPES } from '../config/profile-mapping.js';

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
  
  const currentQuestionIndex = parseInt(step || '1') - 1;
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

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
      description: 'Kies degene die het beste jouw gewenste esthetiek weergeeft',
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
        { 
          id: 'retro', 
          text: 'Retro - Vintage vibes', 
          image: 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
        },
        { 
          id: 'luxury', 
          text: 'Luxury - Exclusieve topkwaliteit', 
          image: 'https://images.pexels.com/photos/1049317/pexels-photo-1049317.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
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
    if (currentQuestionIndex < questions.length - 1) {
      navigate(`/quiz/${currentQuestionIndex + 2}`);
    } else {
      handleSubmit();
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
      window.trackQuizComplete(120, questions.length, 'registered_user');
    }
    
    navigate('/results', { state: { answers } });
  };

  if (!currentQuestion) {
    navigate('/quiz/1');
    return null;
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
                        loading="lazy"
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
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      PNG, JPG, GIF tot 10MB
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                      Gebruik een recente foto met goed licht voor de beste resultaten
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-start p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md text-blue-700 dark:text-blue-300 text-sm">
              <ShieldCheck size={16} className="mr-2 mt-0.5 flex-shrink-0" />
              <p>
                Je foto wordt veilig versleuteld en alleen gebruikt voor analyse. Het wordt direct verwijderd na verwerking en nooit gedeeld met derden. Je kunt je gegevens altijd verwijderen.
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
                  onClick={() => setShowTooltip(!showTooltip)}
                  className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="Waarom deze vraag?"
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

        {/* Tooltip */}
        {showTooltip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div
              role="tooltip"
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-sm mx-4 animate-scale-in transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Waarom deze vraag?
                </h3>
                <button
                  onClick={() => setShowTooltip(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="Sluit uitleg"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <div className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
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
      </div>

      {/* Mobile Sticky CTA - NEW */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 z-40">
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={prevQuestion}
            disabled={currentQuestionIndex === 0}
            icon={<ArrowLeft size={16} />}
            iconPosition="left"
            className="flex-1"
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
            {currentQuestionIndex === questions.length - 1 ? 'Voltooien' : 'Volgende'}
          </Button>
        </div>
      </div>

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

export default QuizPage;