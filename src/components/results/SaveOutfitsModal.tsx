import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, ArrowRight, Lock, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface SaveOutfitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  outfitCount?: number;
}

const VOORDELEN = [
  'Opslaan & delen van je favoriete outfits',
  'Je stijlrapport blijft bewaard',
  'Chat met Nova, je AI stijlassistent',
];

export function SaveOutfitsModal({ isOpen, onClose, outfitCount = 12 }: SaveOutfitsModalProps) {
  const navigate = useNavigate();
  const { user } = useUser();
  const panelRef = useFocusTrap(isOpen) as React.RefObject<HTMLDivElement>;
  const titelId = React.useId();

  // Zonder outfits zou "0 persoonlijke outfits" in beeld komen.
  const outfitsTekst = outfitCount > 0 ? `je ${outfitCount} persoonlijke outfits` : 'je persoonlijke outfits';

  const handleRegister = () => {
    if (user) {
      onClose();
      return;
    }
    navigate('/registreren?from=results&action=save');
  };

  const handleLogin = () => {
    navigate('/inloggen?from=results&action=save');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40"
        />

        {/* Modal */}
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titelId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            data-modal-close
            className="absolute top-4 right-4 z-10 w-11 h-11 flex items-center justify-center hover:bg-[#F5F0EB] rounded-full transition-colors duration-200"
            aria-label="Sluiten"
          >
            <X className="w-5 h-5 text-[#6E6E6E]" />
          </button>

          {/* Decorative wash */}
          <div className="absolute top-0 left-0 right-0 h-48 bg-[#A85740]/10" aria-hidden="true"></div>

          {/* Content */}
          <div className="relative p-8 sm:p-10">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-[#A85740] rounded-2xl flex items-center justify-center">
                <Save className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Title */}
            <h2 id={titelId} className="text-2xl md:text-3xl font-bold leading-snug text-center text-[#1A1A1A] mb-4">
              Bewaar je outfits
            </h2>

            {/* Description */}
            <p className="text-base text-center text-[#4A4A4A] mb-8">
              Maak een gratis account om <strong className="text-[#1A1A1A]">{outfitsTekst}</strong> op te slaan en altijd terug te vinden.
            </p>

            {/* Benefits list */}
            <ul className="space-y-3 mb-8 bg-[#F5F0EB] rounded-2xl p-6">
              {VOORDELEN.map((voordeel) => (
                <li key={voordeel} className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-[#A85740] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" aria-hidden="true">
                    <Check className="w-3 h-3 text-white" />
                  </span>
                  <span className="text-sm text-[#1A1A1A] font-medium">{voordeel}</span>
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="space-y-3">
              <button
                onClick={handleRegister}
                className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#A85740] hover:bg-[#9A503B] text-white rounded-xl font-semibold text-base transition-colors duration-200"
              >
                <Save className="w-5 h-5" />
                Maak gratis account
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={handleLogin}
                className="w-full min-h-[48px] px-6 py-3 bg-white border border-[#E5E5E5] hover:border-[#A85740] text-[#1A1A1A] rounded-xl font-medium text-base transition-colors duration-200"
              >
                Heb je al een account? Log in
              </button>

              <button
                onClick={onClose}
                className="w-full min-h-[44px] px-8 py-2 text-[#6E6E6E] hover:text-[#1A1A1A] font-medium text-sm transition-colors duration-200"
              >
                Nee, bedankt
              </button>
            </div>

            {/* Privacy note */}
            <p className="text-xs text-center text-[#6E6E6E] mt-6 flex items-center justify-center gap-2">
              <Lock className="w-3 h-3 text-[#A85740]" aria-hidden="true" />
              Gratis account • Geen betaalgegevens nodig
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
