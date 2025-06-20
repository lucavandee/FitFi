import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  User, 
  Mail, 
  ShieldCheck
} from 'lucide-react';
import Button from '../components/ui/Button';
import { useUser } from '../context/UserContext';

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { updateProfile } = useUser();
  
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      return;
    }

    // Save to UserContext
    await updateProfile({
      name: formData.name,
      email: formData.email
    });

    // Navigate directly to gender selection (not questionnaire)
    navigate('/gender');
  };

  const totalSteps = 4; // onboarding, gender, quiz, results
  const currentStep = 1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 transition-colors">
      <div className="max-w-md mx-auto px-4 sm:px-6">
        {/* Progress indicator */}
        <div className="mb-10">
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
            <span>Stap {currentStep} van {totalSteps}</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}% Voltooid</span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all duration-300 ease-in-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
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
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Naam
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                      placeholder="Je volledige naam"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    E-mailadres
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                      placeholder="je@email.com"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={!formData.name.trim() || !formData.email.trim()}
                  icon={<ArrowRight size={20} />}
                  iconPosition="right"
                  className="mt-6"
                >
                  Volgende Stap
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
};

export default OnboardingPage;