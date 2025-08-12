import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabaseClient';

// Get singleton client
const sb = supabase();

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('E-mailadres is verplicht');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Ongeldig e-mailadres');
      return;
    }

    setIsLoading(true);
    setError('');

    if (!sb) {
      setError('Supabase niet beschikbaar. Probeer het later opnieuw.');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/wachtwoord-reset`
      });

      if (error) {
        setError(error.message);
        return;
      }

      setIsSuccess(true);
      
      // Track password reset request
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'password_reset_request', {
          event_category: 'authentication',
          event_label: 'email_reset'
        });
      }
    } catch (error: any) {
      console.error('Password reset error:', error);
      setError('Er ging iets mis. Probeer het opnieuw.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#FAF8F6] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-light text-gray-900 mb-4">
              E-mail verzonden!
            </h2>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              We hebben een link om je wachtwoord te resetten verzonden naar{' '}
              <span className="font-medium text-gray-900">{email}</span>.
              Controleer je inbox en klik op de link om een nieuw wachtwoord in te stellen.
            </p>
            
            <div className="space-y-4">
              <Button
                as={Link}
                to="/inloggen"
                variant="primary"
                size="lg"
                fullWidth
                className="bg-[#bfae9f] hover:bg-[#a89a8c] text-white"
              >
                Terug naar inloggen
              </Button>
              
              <button
                onClick={() => {
                  setIsSuccess(false);
                  setEmail('');
                }}
                className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Andere e-mail proberen
              </button>
            </div>
          </div>
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
              Wachtwoord vergeten?
            </h2>
            <p className="text-gray-600">
              Geen probleem! Voer je e-mailadres in en we sturen je een link om je wachtwoord te resetten.
            </p>
          </div>

          {/* Reset Form */}
          <div className="bg-white rounded-3xl shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start space-x-3">
                  <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-red-700 text-sm">{error}</p>
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
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#bfae9f] focus:border-[#bfae9f] transition-colors"
                    placeholder="je@email.com"
                  />
                </div>
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
                className="bg-[#bfae9f] hover:bg-[#a89a8c] text-white"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Verzenden...
                  </div>
                ) : (
                  'Reset link verzenden'
                )}
              </Button>
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link
                to="/inloggen"
                className="text-[#bfae9f] hover:text-[#a89a8c] font-medium transition-colors"
              >
                ← Terug naar inloggen
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;