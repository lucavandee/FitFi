import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Zap, Heart } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const { pathname } = useLocation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const isOnboarding = pathname === '/onboarding' || pathname.startsWith('/onboarding');

  useEffect(() => {
    if (isOnboarding) return;
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const isDismissed = localStorage.getItem('pwa-install-dismissed');
    if (isDismissed) {
      const dismissedTime = parseInt(isDismissed, 10);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
      setShowPrompt(false);
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (isOnboarding || isInstalled || !showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50"
      >
        <div className="relative rounded-2xl bg-white/95 backdrop-blur-xl shadow-lg border-2 border-[#E5E5E5] overflow-hidden">
          {/* Gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C2654A] to-[#C2654A]" />

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-2 rounded-lg hover:bg-[#FAF5F2] transition-colors"
            aria-label="Sluiten"
          >
            <X className="w-4 h-4 text-[#8A8A8A]" />
          </button>

          <div className="p-6">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C2654A] to-[#C2654A] flex items-center justify-center mb-4 shadow-lg"
            >
              <Download className="w-6 h-6 text-white" />
            </motion.div>

            {/* Heading */}
            <h3 className="font-heading text-xl text-[#1A1A1A] mb-2">
              Installeer FitFi
            </h3>

            {/* Description */}
            <p className="text-[#8A8A8A] text-sm mb-4 leading-relaxed">
              Voeg FitFi toe aan je startscherm voor snelle toegang en een betere ervaring.
            </p>

            {/* Benefits */}
            <div className="space-y-2 mb-6">
              {[
                { icon: Zap, text: 'Bliksemsnelle toegang' },
                { icon: Smartphone, text: 'Native app-ervaring' },
                { icon: Heart, text: 'Werkt offline' },
              ].map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <benefit.icon className="w-4 h-4 text-[#C2654A]" />
                  <span className="text-sm text-[#1A1A1A]">{benefit.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleInstall}
                className="flex-1 bg-[#C2654A] hover:bg-[#A8513A] text-white font-semibold text-base py-3 px-6 rounded-xl py-3 text-center"
              >
                Installeren
              </button>
              <button
                onClick={handleDismiss}
                className="bg-white border border-[#E5E5E5] hover:border-[#C2654A] text-[#1A1A1A] font-medium text-base py-3 px-6 rounded-xl py-3 px-6"
              >
                Niet nu
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
