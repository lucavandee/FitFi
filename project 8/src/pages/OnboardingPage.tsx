import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  User, 
  Mail, 
  Lock,
  ShieldCheck
} from 'lucide-react';
import Button from '../components/ui/Button';
import { useUser } from '../context/UserContext';

const OnboardingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [activeStep, setActiveStep] = useState(0);
  const [showSignUp, setShowSignUp] = useState(searchParams.get('signup') === 'true');
  const [isPremium, setIsPremium] = useState(searchParams.get('plan') === 'premium');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  
  const { login, register, isLoading, error } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    // Update signup state if URL param changes
    setShowSignUp(searchParams.get('signup') === 'true');
    setIsPremium(searchParams.get('plan') === 'premium');
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (showSignUp) {
      // Check if passwords match
      if (formData.password !== formData.confirmPassword) {
        // You would typically set an error state here
        return;
      }
      
      await register(formData.name, formData.email, formData.password);
    } else {
      await login(formData.email, formData.password);
    }
    
    // Move to questionnaire if login/register successful
    navigate('/questionnaire');
  };

  const toggleSignUp = () => {
    setShowSignUp(!showSignUp);
  };

  const nextStep = () => {
    setActiveStep(prev => prev + 1);
  };

  const prevStep = () => {
    setActiveStep(prev => prev - 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 pb-12 transition-colors">
      <div className="max-w-md mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {showSignUp ? 'Create Your Account' : 'Welcome Back'}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {showSignUp 
              ? 'Start your style journey with FitFi' 
              : 'Log in to continue your style journey'}
          </p>
          {isPremium && (
            <div className="mt-3 inline-block bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-sm font-medium">
              Premium Plan Selected
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-colors animate-scale-in">
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit}>
              {/* Show name field only for signup */}
              {showSignUp && (
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
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
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 dark:text-white"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
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
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 dark:text-white"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Show confirm password field only for signup */}
              {showSignUp && (
                <>
                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 dark:text-white"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="acceptTerms"
                          name="acceptTerms"
                          type="checkbox"
                          checked={formData.acceptTerms}
                          onChange={handleInputChange}
                          required
                          className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="acceptTerms" className="text-gray-600 dark:text-gray-400">
                          I agree to the <a href="#" className="text-orange-500 hover:text-orange-600">Terms of Service</a> and <a href="#" className="text-orange-500 hover:text-orange-600">Privacy Policy</a>
                        </label>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {!showSignUp && (
                <div className="flex justify-end mb-6">
                  <a href="#" className="text-sm text-orange-500 hover:text-orange-600">
                    Forgot password?
                  </a>
                </div>
              )}

              {error && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isLoading}
                className="mb-4"
              >
                {isLoading 
                  ? 'Processing...' 
                  : showSignUp 
                    ? 'Create Account' 
                    : 'Log In'}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {showSignUp 
                    ? 'Already have an account?' 
                    : "Don't have an account?"}
                  <button
                    type="button"
                    onClick={toggleSignUp}
                    className="ml-1 text-orange-500 hover:text-orange-600 focus:outline-none"
                  >
                    {showSignUp ? 'Log In' : 'Sign Up'}
                  </button>
                </p>
              </div>
            </form>
          </div>

          {/* Privacy indicator */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex items-center justify-center space-x-2 transition-colors">
            <ShieldCheck size={18} className="text-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Your data is secure and encrypted</span>
          </div>
        </div>

        {/* Back to home link */}
        <div className="mt-6 text-center">
          <a href="/" className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors">
            <ArrowLeft size={16} className="mr-1" />
            Back to home
          </a>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;