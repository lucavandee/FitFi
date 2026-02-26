import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Mail, Clock } from 'lucide-react';
import Button from '../components/ui/Button';

const ThankYouPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4">
      <div className="max-w-md w-full mx-auto py-16">
        <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-soft)] border border-[var(--color-border)] p-8 text-center">
          <div className="w-20 h-20 bg-[var(--ff-color-success-50)] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-[var(--ff-color-success-600)]" />
          </div>

          <h1 className="text-3xl font-bold text-[var(--color-text)] mb-4">
            Bedankt voor je bericht!
          </h1>

          <p className="text-[var(--color-muted)] mb-8 leading-relaxed">
            We hebben je bericht ontvangen en waarderen je contact.
            Ons team neemt binnen 24 uur contact met je op.
          </p>

          <div className="space-y-3 mb-8">
            <div className="bg-[var(--ff-color-primary-50)] rounded-xl p-4 flex items-center gap-3">
              <Clock className="w-5 h-5 text-[var(--ff-color-primary-600)] flex-shrink-0" />
              <div className="text-left">
                <p className="font-semibold text-[var(--color-text)] text-sm">Reactietijd</p>
                <p className="text-[var(--color-muted)] text-sm">Binnen 24 uur op werkdagen</p>
              </div>
            </div>

            <div className="bg-[var(--ff-color-accent-50)] rounded-xl p-4 flex items-center gap-3">
              <Mail className="w-5 h-5 text-[var(--ff-color-accent-700)] flex-shrink-0" />
              <div className="text-left">
                <p className="font-semibold text-[var(--color-text)] text-sm">Bevestiging</p>
                <p className="text-[var(--color-muted)] text-sm">Check je inbox voor een bevestiging</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              as={Link}
              to="/"
              variant="primary"
              size="lg"
              fullWidth
              icon={<ArrowRight size={20} />}
              iconPosition="right"
            >
              Terug naar home
            </Button>

            <Button
              as={Link}
              to="/blog"
              variant="outline"
              size="lg"
              fullWidth
            >
              Lees onze blog
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
            <p className="text-[var(--color-muted)] text-sm mb-4">
              Urgente vraag? Neem direct contact op:
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <a
                href="mailto:info@fitfi.nl"
                className="text-[var(--ff-color-primary-700)] hover:text-[var(--ff-color-primary-600)] transition-colors"
              >
                info@fitfi.nl
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;
