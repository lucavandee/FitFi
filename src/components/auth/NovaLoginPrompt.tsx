import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Users, CheckCircle, Lock } from 'lucide-react';
import Button from '../ui/Button';

type NovaLoginPromptProps = {
  open: boolean;
  onClose: () => void;
  onLogin?: () => void;
  onSignup?: () => void;
  reason?: 'auth' | 'quiz' | 'rate_limit';
  usage?: {
    current: number;
    limit: number;
    remaining: number;
  };
  tier?: string;
};

export default function NovaLoginPrompt({
  open,
  onClose,
  onLogin,
  onSignup,
  reason = 'auth',
  usage,
  tier = 'free'
}: NovaLoginPromptProps) {
  const navigate = useNavigate();

  if (!open) return null;

  const handleSignup = () => {
    if (onSignup) {
      onSignup();
    } else {
      navigate('/registreren', { state: { from: window.location.pathname, reason: 'nova_access' } });
    }
  };

  const handleLogin = () => {
    if (onLogin) {
      onLogin();
    } else {
      navigate('/inloggen', { state: { from: window.location.pathname, reason: 'nova_access' } });
    }
  };

  const handleQuiz = () => {
    onClose();
    navigate('/onboarding', { state: { from: window.location.pathname } });
  };

  const handleUpgrade = () => {
    onClose();
    navigate('/prijzen', { state: { from: window.location.pathname, reason: 'nova_upgrade' } });
  };

  // Dynamic content based on reason
  const getContent = () => {
    if (reason === 'quiz') {
      return {
        icon: <Sparkles className="w-8 h-8 text-white" />,
        title: 'Voltooi eerst je stijlprofiel',
        description: 'Nova heeft jouw stijlprofiel nodig om gepersonaliseerd advies te geven. Het duurt slechts 2 minuten!',
        benefits: [
          'Ontdek jouw lichaamsvorm',
          'Upload een foto voor kleuradvies',
          'Selecteer jouw stijlvoorkeuren',
          'Ontvang persoonlijk advies van Nova'
        ],
        primaryAction: handleQuiz,
        primaryLabel: 'Start stijlquiz',
        showSecondary: true,
        secondaryLabel: 'Later'
      };
    }

    if (reason === 'rate_limit') {
      return {
        icon: <Lock className="w-8 h-8 text-white" />,
        title: tier === 'free' ? 'Je hebt je 10 gratis berichten gebruikt' : 'Dagelijkse limiet bereikt',
        description: tier === 'free'
          ? 'Upgrade naar Premium voor 100 berichten per dag en volledige toegang tot Nova\'s features.'
          : 'Je hebt je dagelijkse limiet bereikt. Morgen reset de teller weer.',
        benefits: tier === 'free' ? [
          '100 berichten per dag (nu: 10)',
          'Product aanbevelingen',
          'Prioriteit support',
          'Exclusieve styling tips'
        ] : [
          'Premium tier: 100 berichten/dag',
          'Volledige toegang tot alle features',
          'Prioriteit ondersteuning',
          'Unlimited advies morgen'
        ],
        primaryAction: tier === 'free' ? handleUpgrade : onClose,
        primaryLabel: tier === 'free' ? 'Upgrade naar Premium' : 'Begrepen',
        showSecondary: true,
        secondaryLabel: 'Morgen verder'
      };
    }

    // Default: auth
    return {
      icon: <Sparkles className="w-8 h-8 text-white" />,
      title: 'Ontgrendel Nova AI',
      description: 'Word gratis member om toegang te krijgen tot Nova\'s persoonlijke AI-stijladviezen, outfit uitleg en curated shopping aanbevelingen.',
      benefits: [
        '10 Nova gesprekken per dag',
        'Persoonlijke outfit aanbevelingen',
        'Kleuradvies op basis van je profiel',
        'Toegang tot 50+ merken'
      ],
      primaryAction: handleSignup,
      primaryLabel: 'Gratis member worden',
      showSecondary: true,
      secondaryLabel: 'Ik heb al een account',
      secondaryAction: handleLogin
    };
  };

  const content = getContent();

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
            {content.icon}
          </div>
          
          <h2 id="nova-login-title" className="text-2xl font-medium text-gray-900 mb-2">
            {content.title}
          </h2>

          <p className="text-gray-600 leading-relaxed">
            {content.description}
          </p>
        </div>

        {/* Usage info for rate limit */}
        {reason === 'rate_limit' && usage && (
          <div className="mb-4 p-4 rounded-xl bg-gray-100">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Gebruik vandaag:</span>
              <span className="font-semibold text-gray-900">
                {usage.current}/{usage.limit}
              </span>
            </div>
            <div className="h-2 bg-white rounded-full overflow-hidden">
              <div
                className="h-full bg-[#89CFF0] transition-all"
                style={{ width: `${(usage.current / usage.limit) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Benefits */}
        <div className="bg-[#89CFF0]/10 rounded-2xl p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
            <Users className="w-4 h-4 mr-2 text-[#89CFF0]" />
            {reason === 'quiz' ? 'Waarom de quiz?' : reason === 'rate_limit' ? 'Upgrade voordelen:' : 'Als member krijg je:'}
          </h3>
          <div className="space-y-2">
            {content.benefits.map((benefit, i) => (
              <div key={i} className="flex items-center space-x-2 text-sm">
                <CheckCircle size={16} className="text-[#89CFF0] shrink-0" />
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={content.primaryAction}
            variant="primary"
            size="lg"
            fullWidth
            icon={<ArrowRight size={20} />}
            iconPosition="right"
            className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A] shadow-lg hover:shadow-xl transition-all"
          >
            {content.primaryLabel}
          </Button>

          {content.showSecondary && content.secondaryAction && (
            <Button
              onClick={content.secondaryAction}
              variant="outline"
              size="lg"
              fullWidth
              className="border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white"
            >
              {content.secondaryLabel}
            </Button>
          )}

          {content.showSecondary && !content.secondaryAction && (
            <button
              onClick={onClose}
              className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              {content.secondaryLabel}
            </button>
          )}
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