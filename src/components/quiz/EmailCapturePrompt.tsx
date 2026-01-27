import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Save, X, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';

interface EmailCapturePromptProps {
  onDismiss: () => void;
  onEmailSaved: (email: string) => void;
}

export function EmailCapturePrompt({ onDismiss, onEmailSaved }: EmailCapturePromptProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      toast.error('Vul een geldig email adres in');
      return;
    }

    setIsSubmitting(true);

    try {
      const client = supabase();
      if (!client) {
        throw new Error('Supabase niet beschikbaar');
      }

      const { error } = await client
        .from('newsletter_subscribers')
        .insert({
          email: email.toLowerCase().trim(),
          source: 'quiz_progress_save',
          metadata: {
            captured_at_step: 3,
            quiz_in_progress: true,
            timestamp: new Date().toISOString(),
          }
        });

      if (error) {
        if (error.code === '23505') {
          toast.success('Email al opgeslagen! We sturen je resultaten zodra je klaar bent.');
        } else {
          throw error;
        }
      } else {
        toast.success('Perfect! We sturen je resultaten per email.');
      }

      localStorage.setItem('ff_email_captured', email);
      onEmailSaved(email);
    } catch (error) {
      console.error('Email save error:', error);
      toast.error('Even geduld, probeer het opnieuw');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] border-2 border-[var(--ff-color-primary-200)] rounded-2xl p-6 sm:p-8 mb-8 shadow-lg relative overflow-hidden"
    >
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--ff-color-accent-200)] rounded-full blur-3xl opacity-30"></div>

      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 p-2 hover:bg-white/50 rounded-full transition-colors"
        aria-label="Sluiten"
      >
        <X className="w-4 h-4 text-[var(--color-muted)]" />
      </button>

      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-[var(--ff-color-primary-600)] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
            <Save className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[var(--color-text)]">
              Sla je voortgang op
            </h3>
            <p className="text-sm text-[var(--color-muted)]">
              Ontvang je persoonlijke resultaten per email
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted)]" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="je@email.com"
              className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-[var(--color-border)] rounded-xl text-[var(--color-text)] placeholder:text-[var(--color-muted)] outline-none focus-visible:border-[var(--ff-focus-ring-color)] focus-visible:shadow-[var(--ff-shadow-ring)] transition-all"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] text-white rounded-xl font-bold transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Opslaan...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Opslaan & doorgaan
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="px-6 py-3.5 text-[var(--color-muted)] hover:text-[var(--color-text)] font-medium transition-colors"
            >
              Later
            </button>
          </div>
        </form>

        {/* Enhanced Privacy Guarantees */}
        <div className="mt-4 pt-4 border-t border-[var(--ff-color-primary-200)]">
          <div className="flex items-start gap-2 mb-2">
            <Lock className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-[var(--color-text)]">
              Jouw email is veilig bij ons
            </p>
          </div>
          <ul className="space-y-1 text-xs text-[var(--color-muted)]">
            <li className="flex items-start gap-1.5">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Geen spam, alleen je Style Report</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Wordt niet gedeeld met derden</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Uitschrijven met 1 klik</span>
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
