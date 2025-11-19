import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';

interface SaveOutfitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  outfitCount?: number;
}

export function SaveOutfitsModal({ isOpen, onClose, outfitCount = 12 }: SaveOutfitsModalProps) {
  const navigate = useNavigate();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);

    if (user) {
      onClose();
      return;
    }

    navigate('/register?from=results&action=save');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Sluiten"
          >
            <X className="w-5 h-5 text-[var(--color-muted)]" />
          </button>

          {/* Decorative gradient */}
          <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-br from-[var(--ff-color-primary-400)] via-[var(--ff-color-accent-400)] to-[var(--ff-color-primary-300)] opacity-10"></div>

          {/* Content */}
          <div className="relative p-8 sm:p-10">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] rounded-2xl flex items-center justify-center shadow-xl">
                <Save className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-[var(--color-text)] mb-4">
              Love deze outfits?
            </h2>

            {/* Description */}
            <p className="text-lg text-center text-[var(--color-muted)] mb-8">
              Maak een gratis account om je <strong className="text-[var(--color-text)]">{outfitCount} persoonlijke outfits</strong> op te slaan en altijd terug te vinden.
            </p>

            {/* Benefits list */}
            <div className="space-y-3 mb-8 bg-[var(--ff-color-primary-50)] rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-[var(--color-text)] font-medium">Opslaan & delen van je favoriete outfits</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-[var(--color-text)] font-medium">Krijg nieuwe outfit suggesties elke week</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-[var(--color-text)] font-medium">Chat met Nova, je AI stijlassistent</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] text-white rounded-xl font-bold text-lg shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Even geduld...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Opslaan (gratis)
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                className="w-full px-8 py-3 text-[var(--color-muted)] hover:text-[var(--color-text)] font-medium transition-colors"
              >
                Nee, bedankt
              </button>
            </div>

            {/* Privacy note */}
            <p className="text-xs text-center text-[var(--color-muted)] mt-6 flex items-center justify-center gap-2">
              <span className="text-green-600">🔒</span>
              Gratis account • Geen betaalgegevens nodig • 
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
