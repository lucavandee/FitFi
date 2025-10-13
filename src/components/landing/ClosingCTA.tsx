import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Check } from 'lucide-react';
import { useUser } from '@/context/UserContext';

export function ClosingCTA() {
  const { user } = useUser();
  const navigate = useNavigate();

  const handleStartClick = () => {
    if (user) {
      navigate('/onboarding');
    } else {
      navigate('/register');
    }
  };

  return (
    <section className="py-20">
      <div className="ff-container">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] rounded-[var(--radius-2xl)] p-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ontdek wat jouw <span className="text-[var(--ff-color-primary-600)]">stijl</span> is
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            8 vragen, 2 minuten. Direct je rapport met kleuren, stijl en concrete outfits die je kunt samenstellen.
          </p>
          <button
            onClick={handleStartClick}
            className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--ff-color-primary-600)] text-white rounded-[var(--radius-xl)] font-semibold hover:bg-[var(--ff-color-primary-700)] transition-colors shadow-lg focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)] focus-visible:ring-offset-2"
            data-event="cta_start_free_closing"
          >
            <Sparkles className="w-5 h-5" />
            Start gratis Style Report
          </button>
          <div className="flex flex-wrap justify-center gap-6 text-sm mt-8">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-[var(--ff-color-success-600)]" />
              <span>100% Gratis</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-[var(--ff-color-success-600)]" />
              <span>2 min setup</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-[var(--ff-color-success-600)]" />
              <span>Direct resultaat</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}