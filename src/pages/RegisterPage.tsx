import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import { useUser } from '../context/UserContext';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useUser();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ 
    name?: string; 
    email?: string; 
    password?: string; 
    confirmPassword?: string; 
    general?: string 
  }>({});

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

    if (!formData.name.trim()) {
      newErrors.name = 'Naam is verplicht';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Naam moet minimaal 2 karakters zijn';
    }

    if (!formData.email) {
      newErrors.email = 'E-mailadres is verplicht';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Ongeldig e-mailadres';
    }

    if (!formData.password) {
      newErrors.password = 'Wachtwoord is verplicht';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Wachtwoord moet minimaal 8 karakters zijn';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Wachtwoord moet een hoofdletter, kleine letter en cijfer bevatten';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Bevestig je wachtwoord';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Wachtwoorden komen niet overeen';
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
      const result = await register(formData.name, formData.email, formData.password);
      
      if (result.success) {
        // Track successful registration
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'sign_up', {
            event_category: 'authentication',
            event_label: 'email_registration'
          });
        }
        
        // Redirect to onboarding
        navigate(result.redirectTo || '/feed', { replace: true });
      } else {
        setErrors({ general: 'Registratie mislukt. Controleer je gegevens en probeer opnieuw.' });
      }

    } catch (error: any) {
      console.error('[RegisterPage] Registration error:', error);
      
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        setErrors({ general: 'Verbindingsfout. Controleer je internetverbinding.' });
      } else {
        setErrors({ general: 'Er ging iets mis bij het aanmaken van je account. Probeer het opnieuw.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: 'Zwak', color: 'bg-red-500' };
    if (strength <= 3) return { strength, label: 'Gemiddeld', color: 'bg-yellow-500' };
    if (strength <= 4) return { strength, label: 'Sterk', color: 'bg-green-500' };
    return { strength, label: 'Zeer sterk', color: 'bg-green-600' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

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
              Maak je account aan
            </h2>
            <p className="text-gray-600">
              Begin je stijlreis met gepersonaliseerd advies
            </p>
          </div>

          {/* Registration Form */}
          <div className="bg-white rounded-3xl shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General Error */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start space-x-3">
                  <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-red-700 text-sm">{errors.general}</p>
                </div>
              )}

              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Volledige naam
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#bfae9f] focus:border-[#bfae9f] transition-colors ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Je volledige naam"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

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
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
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
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-10 py-3 border rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#bfae9f] focus:border-[#bfae9f] transition-colors ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Minimaal 8 karakters"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${passwordStrength.color}`}
                          style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">{passwordStrength.label}</span>
                    </div>
                  </div>
                )}
                
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Bevestig wachtwoord
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-10 py-3 border rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#bfae9f] focus:border-[#bfae9f] transition-colors ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Herhaal je wachtwoord"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                
                {/* Password Match Indicator */}
                {formData.confirmPassword && (
                  <div className="mt-2 flex items-center space-x-2">
                    {formData.password === formData.confirmPassword ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-green-600">Wachtwoorden komen overeen</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-xs text-red-600">Wachtwoorden komen niet overeen</span>
                      </>
                    )}
                  </div>
                )}
                
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms and Privacy */}
              <div className="text-sm text-gray-600">
                Door een account aan te maken ga je akkoord met onze{' '}
                <Link to="/juridisch" className="text-[#bfae9f] hover:text-[#a89a8c] transition-colors">
                  Algemene Voorwaarden
                </Link>{' '}
                en{' '}
                <Link to="/juridisch" className="text-[#bfae9f] hover:text-[#a89a8c] transition-colors">
                  Privacybeleid
                </Link>
                .
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
                    Account aanmaken...
                  </div>
                ) : (
                  'Account aanmaken'
                )}
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Heb je al een account?{' '}
                <Link
                  to="/inloggen"
                  className="text-[#bfae9f] hover:text-[#a89a8c] font-medium transition-colors"
                >
                  Log hier in
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

export default RegisterPage;