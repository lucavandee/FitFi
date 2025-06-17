import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Upload, Info } from 'lucide-react';
import Button from '../components/ui/Button';
import { useUser } from '../context/UserContext';

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

const QuestionnairePage: React.FC = () => {
  const { user, updateProfile } = useUser();
  const navigate = useNavigate();

  // Sample questions
  const questions: Question[] = [
    {
      id: 'occasion',
      type: 'multiple',
      question: 'What occasions do you typically dress for?',
      description: 'Select all that apply to your lifestyle',
      options: [
        { id: 'casual', text: 'Casual everyday' },
        { id: 'work', text: 'Work/Office' },
        { id: 'formal', text: 'Formal events' },
        { id: 'active', text: 'Active/Sports' },
        { id: 'night', text: 'Night out' },
        { id: 'travel', text: 'Travel' },
      ],
      category: 'lifestyle',
    },
    {
      id: 'style',
      type: 'single',
      question: 'Which style resonates with you the most?',
      description: 'Choose the one that best represents your preferred aesthetic',
      options: [
        { 
          id: 'minimalist', 
          text: 'Minimalist', 
          image: 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
        },
        { 
          id: 'classic', 
          text: 'Classic', 
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
      question: 'How important is comfort in your clothing choices?',
      description: 'Move the slider to indicate your preference',
      min: 1,
      max: 10,
      step: 1,
      category: 'preferences',
    },
    {
      id: 'color',
      type: 'multiple',
      question: 'Which color palette do you prefer?',
      description: 'Select all that appeal to you',
      options: [
        { id: 'neutral', text: 'Neutrals (black, white, beige)' },
        { id: 'warm', text: 'Warm tones (red, orange, yellow)' },
        { id: 'cool', text: 'Cool tones (blue, green, purple)' },
        { id: 'pastel', text: 'Pastels' },
        { id: 'vibrant', text: 'Vibrant/Bold colors' },
      ],
      category: 'preferences',
    },
    {
      id: 'photo',
      type: 'upload',
      question: 'Upload a full-body photo for more accurate recommendations',
      description: 'This helps our AI understand your body type and current style. Your photo is securely encrypted and only used for analysis.',
      category: 'photo',
    },
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

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
    setAnswers({ ...answers, [currentQuestion.id]: parseInt(e.target.value) });
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
    // In a real app, you would process and send the data to a backend
    // For now, we'll just navigate to the recommendations page
    
    // Set some mock style preferences based on answers
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
    
    navigate('/recommendations', { state: { answers } });
  };

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
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>Less Important</span>
                <span>Very Important</span>
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
                    Remove Photo
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
                      Click to upload a photo
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
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-start p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md text-blue-700 dark:text-blue-300 text-sm">
              <Info size={16} className="mr-2 mt-0.5 flex-shrink-0" />
              <p>
                Your photo is securely encrypted and used only for analysis. It will never be shared without your explicit permission. You can delete your data at any time.
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
        {/* Progress bar */}
        <div className="mb-10">
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all duration-300 ease-in-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-colors">
          <div className="p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {currentQuestion.question}
            </h2>
            
            {currentQuestion.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                {currentQuestion.description}
              </p>
            )}
            
            {renderQuestion()}
          </div>
          
          {/* Navigation buttons */}
          <div className="px-6 sm:px-8 py-4 bg-gray-50 dark:bg-gray-700 flex justify-between transition-colors">
            <Button
              variant="outline"
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              icon={<ArrowLeft size={16} />}
              iconPosition="left"
            >
              Previous
            </Button>
            
            <Button
              variant="primary"
              onClick={nextQuestion}
              disabled={isNextDisabled()}
              icon={<ArrowRight size={16} />}
              iconPosition="right"
            >
              {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionnairePage;