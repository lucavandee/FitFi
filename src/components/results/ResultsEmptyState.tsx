import React from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';
import { NavLink } from 'react-router-dom';

interface ResultsEmptyStateProps {
  hasFiltersApplied?: boolean;
  onResetFilters?: () => void;
}

export const ResultsEmptyState: React.FC<ResultsEmptyStateProps> = ({
  hasFiltersApplied = false,
  onResetFilters
}) => {
  if (hasFiltersApplied) {
    return (
      <div
        role="status"
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-12 text-center"
      >
        <RefreshCw className="w-12 h-12 mx-auto mb-4 text-[var(--color-muted)]" aria-hidden="true" />
        <h3 className="font-display text-xl font-semibold text-[var(--color-text)] mb-2">
          Geen outfits gevonden
        </h3>
        <p className="text-[var(--color-muted)] mb-6 max-w-md mx-auto text-sm">
          Geen outfits gevonden met deze combinatie. Probeer minder filters te combineren, of reset alles om alle outfits te zien.
        </p>
        {onResetFilters && (
          <Button variant="primary" onClick={onResetFilters}>
            Alle filters wissen
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      role="status"
      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-12 text-center"
    >
      <Sparkles className="w-12 h-12 mx-auto mb-4 text-[var(--ff-color-primary-400)]" aria-hidden="true" />
      <h3 className="font-display text-xl font-semibold text-[var(--color-text)] mb-2">
        Nog geen outfits opgeslagen
      </h3>
      <p className="text-[var(--color-muted)] mb-6 max-w-md mx-auto text-sm">
        Ga naar je stijlrapport en klik op het hartje om outfits op te slaan — ze verschijnen hier.
      </p>
      <NavLink to="/onboarding">
        <Button variant="primary">
          Start gratis stijlquiz
        </Button>
      </NavLink>
    </div>
  );
};
