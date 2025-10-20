import { useState, useEffect } from 'react';
import { outfitService } from '@/services/outfits/outfitService';

export default function BramsFruitToggle() {
  const [enabled, setEnabled] = useState(() => outfitService.getIncludeBramsFruit());
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async () => {
    setIsUpdating(true);
    const newValue = !enabled;

    try {
      outfitService.setIncludeBramsFruit(newValue);
      setEnabled(newValue);

      localStorage.setItem('ff_brams_fruit_enabled', JSON.stringify(newValue));
    } catch (error) {
      console.error('Failed to toggle Brams Fruit:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ff_brams_fruit_enabled');
      if (stored !== null) {
        const value = JSON.parse(stored);
        setEnabled(value);
        outfitService.setIncludeBramsFruit(value);
      }
    } catch (error) {
      console.error('Failed to load Brams Fruit preference:', error);
    }
  }, []);

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
            Brams Fruit Collectie
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            Voeg premium Brams Fruit menswear toe aan je outfit suggesties.
            Hoogwaardige basics en essentials voor een tijdloze garderobe.
          </p>
        </div>

        <button
          onClick={handleToggle}
          disabled={isUpdating}
          className={`
            relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent
            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2
            focus:ring-[var(--ff-color-primary-600)] focus:ring-offset-2
            ${enabled ? 'bg-[var(--ff-color-primary-600)]' : 'bg-gray-200'}
            ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          role="switch"
          aria-checked={enabled}
          aria-label="Toggle Brams Fruit collectie"
        >
          <span
            className={`
              pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg
              ring-0 transition duration-200 ease-in-out
              ${enabled ? 'translate-x-6' : 'translate-x-0'}
            `}
          />
        </button>
      </div>

      {enabled && (
        <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Brams Fruit producten worden nu getoond in je outfit suggesties</span>
          </div>
        </div>
      )}
    </div>
  );
}
