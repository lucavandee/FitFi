import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useUser } from '@/context/UserContext';

export function ClosingCTA() {
  const { user } = useUser();
  const href = user ? '/onboarding' : '/registreren';

  return (
    <section
      className="ff-section border-t border-[var(--color-border)]"
      style={{ background: 'var(--ff-color-primary-900)' }}
    >
      <div className="ff-container">
        <div className="max-w-2xl">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-4"
            style={{ color: 'var(--ff-color-primary-300)' }}
          >
            Gratis starten
          </p>
          <h2
            className="font-heading font-bold tracking-tight text-white mb-5"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', lineHeight: 1.08 }}
          >
            Ontdek welke stijl<br className="hidden sm:block" /> echt bij jou past
          </h2>
          <p
            className="text-base leading-relaxed mb-8"
            style={{ color: 'rgba(247,243,236,0.65)' }}
          >
            8 vragen, 2 minuten. Direct je persoonlijke stijlprofiel met kleuren en outfits.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to={href}
              data-event="cta_start_free_closing"
              className="group inline-flex items-center justify-center gap-2.5 px-7 min-h-[52px] rounded-xl text-base font-bold transition-all duration-200 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ff-color-primary-900)] active:scale-[0.98]"
              style={{
                background: 'var(--ff-color-primary-600)',
                color: '#fff',
                boxShadow: '0 4px 24px rgba(166,136,106,0.55), 0 1px 0 rgba(255,255,255,0.08) inset',
              }}
            >
              Start gratis — 2 minuten
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <Link
              to="/hoe-het-werkt"
              className="inline-flex items-center justify-center px-7 min-h-[52px] rounded-xl text-base font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ff-color-primary-900)]"
              style={{
                background: 'rgba(250,248,245,0.08)',
                border: '1px solid rgba(250,248,245,0.15)',
                backdropFilter: 'blur(8px)',
                color: 'rgba(247,243,236,0.80)',
              }}
            >
              Hoe het werkt
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
