import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Upload, Info } from 'lucide-react';
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
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 transition-colors">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Progress bar */}
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
              
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {currentQuestion.question}
              </h2>
              
              {currentQuestion.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  {currentQuestion.description}
                </p>
              )}
            </div>
            
            {renderQuestion()}
          </div>
          
          {/* Navigation buttons */}
          <div className="px-6 sm:px-8 py-4 bg-gray-50 dark:bg-gray-700 flex justify-between items-center transition-colors">
            <Button
              variant="outline"
              onClick={prevQuestion}
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
      </div>
    </div>
  );
};

export default QuizPage;