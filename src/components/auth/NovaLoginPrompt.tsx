import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Users } from 'lucide-react';
import Button from '../ui/Button';

type NovaLoginPromptProps = {
  open: boolean;
  onClose: () => void;
  onLogin?: () => void;
  onSignup?: () => void;
};

export default function NovaLoginPrompt({ open, onClose, onLogin, onSignup }: NovaLoginPromptProps) {
  if (!open) return null;

  const handleSignup = () => {
    if (onSignup) {
      onSignup();
    } else {
      window.location.assign('/registreren');
    }
  };

  const handleLogin = () => {
    if (onLogin) {
      onLogin();
    } else {
      window.location.assign('/inloggen');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="nova-login-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-[#89CFF0] to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          
          <h2 id="nova-login-title" className="text-2xl font-medium text-gray-900 mb-2">
            Ontgrendel Nova AI
          </h2>
          
          <p className="text-gray-600 leading-relaxed">
            Word gratis member om toegang te krijgen tot Nova's persoonlijke AI-stijladviezen, 
            outfit uitleg en curated shopping aanbevelingen.
          </p>
        </div>

        {/* Benefits */}
        <div className="bg-[#89CFF0]/10 rounded-2xl p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
            <Users className="w-4 h-4 mr-2 text-[#89CFF0]" />
            Als member krijg je:
          </h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-1.5 h-1.5 bg-[#89CFF0] rounded-full"></div>
              <span className="text-gray-700">2 Nova gesprekken per dag</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-1.5 h-1.5 bg-[#89CFF0] rounded-full"></div>
              <span className="text-gray-700">Persoonlijke outfit aanbevelingen</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-1.5 h-1.5 bg-[#89CFF0] rounded-full"></div>
              <span className="text-gray-700">Toegang tot Style Tribes community</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-1.5 h-1.5 bg-[#89CFF0] rounded-full"></div>
              <span className="text-gray-700">Gamification & rewards systeem</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleSignup}
            variant="primary"
            size="lg"
            fullWidth
            icon={<ArrowRight size={20} />}
            iconPosition="right"
            className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A] shadow-lg hover:shadow-xl transition-all"
          >
            Gratis member worden
          </Button>
          
          <Button
            onClick={handleLogin}
            variant="outline"
            size="lg"
            fullWidth
            className="border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white"
          >
            Ik heb al een account
          </Button>
          
          <button
            onClick={onClose}
            className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors mt-4"
          >
            Liever later
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <div className="flex justify-center space-x-4 text-xs text-gray-500">
            <span>✓ 100% Gratis</span>
            <span>✓ Geen creditcard</span>
            <span>✓ Direct toegang</span>
          </div>
        </div>
      </div>
    </div>
  );
}