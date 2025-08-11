import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import { useUser } from '../context/UserContext';
import { supabase } from '../lib/supabase';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, status } = useUser();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  // Get redirect path from location state
  const from = (location.state as any)?.from?.pathname || '/feed';

  // Handle successful login redirect
  useEffect(() => {
    if (user && status === 'authenticated') {
      navigate(from, { replace: true });
    }
  }, [user, status, navigate, from]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.email) {
      newErrors.email = 'E-mailadres is verplicht';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Ongeldig e-mailadres';
    }

    if (!formData.password) {
      newErrors.password = 'Wachtwoord is verplicht';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Wachtwoord moet minimaal 6 karakters zijn';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });
      
      if (error) {
        setErrors({ general: 'Inloggen mislukt. Controleer je gegevens en probeer opnieuw.' });
      } else {
        // Track successful login
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'login', {
            event_category: 'authentication',
            event_label: 'email_login'
          });
        }
        // Navigation will be handled by useEffect when user state updates
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setErrors({ general: 'Er ging iets mis bij het inloggen. Probeer het opnieuw.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while auth is pending
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#FAF8F6] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#bfae9f] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Inloggen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F6] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          {/* Header */}
          <div className="text-center">
            <Link to="/" className="inline-block mb-6">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-10 h-10 rounded-full bg-[#bfae9f] flex items-center justify-center">
                  <span className="text-white font-bold text-lg">F</span>
                </div>
                <span className="text-2xl font-light text-gray-900">FitFi</span>
              </div>
            </Link>
            
            <h2 className="text-3xl font-light text-gray-900 mb-2">
              Welkom terug
            </h2>
            <p className="text-gray-600">
              Log in om je persoonlijke stijladvies te bekijken
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-3xl shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General Error */}
              {errors.general && (
                <div 
                  className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start space-x-3"
                  role="alert"
                  aria-live="assertive"
                >
                  <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-red-700 text-sm">{errors.general}</p>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  E-mailadres
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#bfae9f] focus:border-[#bfae9f] transition-colors ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="je@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Wachtwoord
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-10 py-3 border rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#bfae9f] focus:border-[#bfae9f] transition-colors ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Je wachtwoord"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Verberg wachtwoord" : "Toon wachtwoord"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600" role="alert">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link
                  to="/wachtwoord-vergeten"
                  className="text-sm text-[#bfae9f] hover:text-[#a89a8c] transition-colors"
                >
                  Wachtwoord vergeten?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={isLoading}
                icon={isLoading ? undefined : <ArrowRight size={20} />}
                iconPosition="right"
                className="cta-btn"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Inloggen...
                  </div>
                ) : (
                  'Inloggen'
                )}
              </Button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Nog geen account?{' '}
                <Link
                  to="/registreren"
                  className="text-[#bfae9f] hover:text-[#a89a8c] font-medium transition-colors"
                >
                  Maak er gratis een aan
                </Link>
              </p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center">
            <Link
              to="/"
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Terug naar home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;