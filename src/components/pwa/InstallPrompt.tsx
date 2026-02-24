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
        <div className="relative rounded-[var(--radius-2xl)] bg-white/95 backdrop-blur-xl shadow-[var(--shadow-elevated)] border-2 border-[var(--color-border)] overflow-hidden">
          {/* Gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)]" />

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-2 rounded-lg hover:bg-[var(--ff-color-primary-50)] transition-colors"
            aria-label="Sluiten"
          >
            <X className="w-4 h-4 text-[var(--color-muted)]" />
          </button>

          <div className="p-6">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center mb-4 shadow-lg"
            >
              <Download className="w-6 h-6 text-white" />
            </motion.div>

            {/* Heading */}
            <h3 className="font-heading text-xl text-[var(--color-text)] mb-2">
              Installeer FitFi
            </h3>

            {/* Description */}
            <p className="text-[var(--color-muted)] text-sm mb-4 leading-relaxed">
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
                  <benefit.icon className="w-4 h-4 text-[var(--ff-color-primary-600)]" />
                  <span className="text-sm text-[var(--color-text)]">{benefit.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleInstall}
                className="flex-1 ff-btn ff-btn-primary py-3 text-center"
              >
                Installeren
              </button>
              <button
                onClick={handleDismiss}
                className="ff-btn ff-btn-secondary py-3 px-6"
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
