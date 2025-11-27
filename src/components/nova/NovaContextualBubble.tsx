import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, MessageCircle } from 'lucide-react';

interface NovaContextualBubbleProps {
  context: 'dashboard' | 'results' | 'outfit' | 'profile';
  onInteract?: () => void;
}

export function NovaContextualBubble({ context, onInteract }: NovaContextualBubbleProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissedKey = `ff_nova_bubble_dismissed_${context}`;
    const wasDismissed = localStorage.getItem(dismissedKey);

    if (wasDismissed) {
      setIsDismissed(true);
      return;
    }

    const messages = getContextualMessage(context);
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setMessage(randomMessage);

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [context]);

  const getContextualMessage = (ctx: string): string[] => {
    const messages = {
      dashboard: [
        '👋 Hoi! Ik ben Nova. Wil je dat ik nieuwe outfits voor je maak?',
        '✨ Klaar om je stijl te ontdekken? Stel me een vraag!',
        '💡 Tip: Ik kan je helpen met kleurcombinaties en stijladvies!'
      ],
      results: [
        '🎨 Mooi! Wil je weten waarom deze outfits bij je passen?',
        '👗 Zie je iets wat je leuk vindt? Ik leg graag uit waarom het werkt!',
        '✨ Deze outfits zijn speciaal voor jou gemaakt. Vragen?'
      ],
      outfit: [
        '💡 Wil je weten hoe je dit outfit kunt stylen?',
        '🎯 Ik kan alternatieven voorstellen die ook bij je passen!',
        '✨ Nieuwsgierig naar meer outfits in deze stijl?'
      ],
      profile: [
        '👤 Je profiel ziet er goed uit! Wil je het verfijnen?',
        '🎨 Klaar om nieuwe stijlen te ontdekken?',
        '✨ Ik kan je helpen je stijl verder te ontwikkelen!'
      ]
    };

    return messages[ctx] || messages.dashboard;
  };

  const handleDismiss = () => {
    const dismissedKey = `ff_nova_bubble_dismissed_${context}`;
    localStorage.setItem(dismissedKey, 'true');
    setIsVisible(false);
    setIsDismissed(true);
  };

  const handleInteract = () => {
    setIsVisible(false);
    onInteract?.();
  };

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="fixed bottom-24 right-6 z-50 max-w-sm"
        >
          <div className="relative">
            {/* Speech bubble tail */}
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-[var(--color-surface)] transform rotate-45 border-r border-b border-[var(--color-border)]" />

            {/* Bubble content */}
            <div className="relative bg-[var(--color-surface)] rounded-2xl shadow-2xl border border-[var(--color-border)] p-4">
              <button
                onClick={handleDismiss}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-[var(--color-bg)] transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4 text-[var(--color-text-secondary)]" />
              </button>

              <div className="flex items-start gap-3 pr-6">
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                  className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center"
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </motion.div>

                <div className="flex-1 pt-1">
                  <p className="text-sm text-[var(--color-text)] leading-relaxed mb-3">
                    {message}
                  </p>

                  <button
                    onClick={handleInteract}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--ff-color-primary-600)] text-white text-sm font-medium rounded-lg hover:bg-[var(--ff-color-primary-700)] transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chat met Nova
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
