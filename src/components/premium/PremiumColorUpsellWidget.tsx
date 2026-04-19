import React from "react";
import { useNavigate } from "react-router-dom";
import { Palette, Sparkles, Crown, ArrowRight, Lock } from "lucide-react";

interface Props {
  onClose?: () => void;
  inline?: boolean;
}

export default function PremiumColorUpsellWidget({ onClose, inline = false }: Props) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate('/prijzen?feature=color-analysis');
  };

  if (inline) {
    return (
      <div className="bg-gradient-to-br from-[#FFFFFF] to-[#FAF5F2] border border-[#F4E8E3] rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#C2654A] to-[#A8513A] flex items-center justify-center">
            <Palette className="w-6 h-6 text-white" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-[#1A1A1A]">
                Ontdek jouw perfecte kleuren
              </h3>
              <Crown className="w-4 h-4 text-[#C2654A]" />
            </div>

            <p className="text-sm text-[#8A8A8A] mb-4">
              Krijg een professionele kleurenanalyse met AI. Ontdek welke kleuren het beste bij jou passen en zie direct draagbare 2025 trends.
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-[#C2654A] flex-shrink-0" />
                <span className="text-[#8A8A8A]">AI-analyse van je huidsondertoon</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-[#C2654A] flex-shrink-0" />
                <span className="text-[#8A8A8A]">Persoonlijk kleurenpalet met 20+ kleuren</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-[#C2654A] flex-shrink-0" />
                <span className="text-[#8A8A8A]">Wearable 2025 trend insights</span>
              </div>
            </div>

            <button
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-[#A8513A] to-[#C2654A] text-white px-6 py-3 rounded-2xl font-medium hover:from-[#C2654A] hover:to-[#C2654A] transition-all duration-200 shadow-sm hover:shadow-sm flex items-center justify-center gap-2"
            >
              Upgrade naar Premium
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-[#FAFAF8] rounded-2xl max-w-md w-full shadow-sm overflow-hidden animate-[slideUp_0.3s_ease-out]">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#A8513A] to-[#C2654A] p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }} />
          </div>

          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4 backdrop-blur-sm">
              <Palette className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-bold mb-2">Premium Feature</h2>
            <p className="text-white/90 text-sm">
              Kleurenanalyse is exclusief beschikbaar voor Premium members
            </p>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              aria-label="Sluiten"
            >
              <span className="text-xl leading-none">×</span>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#FAF5F2] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#A8513A]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1A1A1A] mb-1">
                  AI Kleurenanalyse
                </h3>
                <p className="text-sm text-[#8A8A8A]">
                  Upload een selfie en krijg een professionele analyse van je huidsondertoon, seizoen en perfecte kleurenpalet
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#FAF5F2] flex items-center justify-center">
                <Palette className="w-5 h-5 text-[#A8513A]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1A1A1A] mb-1">
                  2025 Wearable Trends
                </h3>
                <p className="text-sm text-[#8A8A8A]">
                  Geen theoretische kleuren meer. Krijg draagbare trends zoals Camel, Cognac, Sage en Terracotta
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#FAF5F2] flex items-center justify-center">
                <Crown className="w-5 h-5 text-[#A8513A]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1A1A1A] mb-1">
                  Personal Shopping Filter
                </h3>
                <p className="text-sm text-[#8A8A8A]">
                  Al je outfit aanbevelingen worden automatisch gefilterd op jouw perfecte kleuren
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#FAF5F2] rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-[#A8513A]" />
              <span className="text-sm font-medium text-[#5A2010]">
                Premium vereist
              </span>
            </div>
            <p className="text-xs text-[#8A3D28]">
              Kleurenanalyse gebruikt geavanceerde AI (OpenAI Vision) en is exclusief beschikbaar voor Premium members. Vanaf €9,99/maand.
            </p>
          </div>

          <div className="flex gap-3">
            {onClose && (
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-2xl border border-[#E5E5E5] text-[#1A1A1A] font-medium hover:bg-[#FFFFFF] transition-colors"
              >
                Sluiten
              </button>
            )}
            <button
              onClick={handleUpgrade}
              className="flex-1 bg-gradient-to-r from-[#A8513A] to-[#C2654A] text-white px-6 py-3 rounded-2xl font-medium hover:from-[#C2654A] hover:to-[#C2654A] transition-all duration-200 shadow-sm hover:shadow-sm flex items-center justify-center gap-2"
            >
              Upgrade nu
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
