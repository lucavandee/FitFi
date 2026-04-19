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
        className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-12 text-center"
      >
        <RefreshCw className="w-12 h-12 mx-auto mb-4 text-[#8A8A8A]" aria-hidden="true" />
        <h3 className="font-display text-xl font-semibold text-[#1A1A1A] mb-2">
          Geen outfits gevonden
        </h3>
        <p className="text-[#8A8A8A] mb-6 max-w-md mx-auto text-sm">
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
      className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-12 text-center"
    >
      <Sparkles className="w-12 h-12 mx-auto mb-4 text-[#D4856E]" aria-hidden="true" />
      <h3 className="font-display text-xl font-semibold text-[#1A1A1A] mb-2">
        Nog geen outfits opgeslagen
      </h3>
      <p className="text-[#8A8A8A] mb-6 max-w-md mx-auto text-sm">
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
