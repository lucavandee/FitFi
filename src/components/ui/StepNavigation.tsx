import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Button from './Button';

interface StepNavigationProps {
  onPrevious?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  isNextDisabled?: boolean;
  isPreviousDisabled?: boolean;
  isSubmitting?: boolean;
  nextLabel?: string;
  previousLabel?: string;
  submitLabel?: string;
  className?: string;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  onPrevious,
  onNext,
  onSubmit,
  isFirstStep = false,
  isLastStep = false,
  isNextDisabled = false,
  isPreviousDisabled = false,
  isSubmitting = false,
  nextLabel = 'Volgende',
  previousLabel = 'Terug',
  submitLabel = 'Voltooien',
  className = ''
}) => {
  return (
    <div className={`flex space-x-3 ${className}`}>
      {!isFirstStep && (
        <Button
          type="button"
          variant="ghost"
          onClick={onPrevious}
          disabled={isPreviousDisabled}
          icon={<ArrowLeft size={18} />}
          iconPosition="left"
          className="flex-1 text-white border border-white/30 hover:bg-white/10"
        >
          {previousLabel}
        </Button>
      )}
      
      {isLastStep ? (
        <Button
          type="submit"
          variant="primary"
          onClick={onSubmit}
          disabled={isSubmitting}
          icon={<ArrowRight size={18} />}
          iconPosition="right"
          className="flex-1"
        >
          {isSubmitting ? 'Even geduld...' : submitLabel}
        </Button>
      ) : (
        <Button
          type={onNext ? 'button' : 'submit'}
          variant="primary"
          onClick={onNext}
          disabled={isNextDisabled}
          icon={<ArrowRight size={18} />}
          iconPosition="right"
          className="flex-1"
        >
          {nextLabel}
        </Button>
      )}
    </div>
  );
};

export default StepNavigation;