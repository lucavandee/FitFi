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
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-12 text-center">
        <RefreshCw className="w-16 h-16 mx-auto mb-4 text-[var(--color-text-muted)]" />
        <h3 className="font-display text-xl font-semibold text-[var(--color-text)] mb-2">
          Geen outfits gevonden
        </h3>
        <p className="text-[var(--color-text-muted)] mb-6 max-w-md mx-auto">
          We konden geen outfits vinden die aan je filters voldoen.
          Probeer je filters aan te passen voor meer resultaten.
        </p>
        {onResetFilters && (
          <Button variant="primary" onClick={onResetFilters}>
            Reset filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-12 text-center">
      <Sparkles className="w-16 h-16 mx-auto mb-4 text-[var(--color-primary)]" />
      <h3 className="font-display text-xl font-semibold text-[var(--color-text)] mb-2">
        Nog geen outfits
      </h3>
      <p className="text-[var(--color-text-muted)] mb-6 max-w-md mx-auto">
        Voltooi eerst de stijlquiz om je gepersonaliseerde outfit aanbevelingen te ontvangen.
      </p>
      <NavLink to="/onboarding">
        <Button variant="primary">
          Start stijlquiz
        </Button>
      </NavLink>
    </div>
  );
};
