/**
 * EnhancedQuestionCard Component
 *
 * Improved quiz question display with:
 * - Realtime validation
 * - Visual success indicators
 * - Clear error messages
 * - Inline feedback
 * - Accessibility improvements
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  AlertCircle,
  Info,
  Sparkles
} from 'lucide-react';
import { validateQuizStep, getSuccessMessage, type ValidationResult } from '@/utils/quizValidation';

interface Option {
  value: string;
  label: string;
  description?: string;
}

interface QuestionCardProps {
  /** Question title */
  title: string;

  /** Optional description */
  description?: string;

  /** Field name */
  field: string;

  /** Input type */
  type: 'radio' | 'select' | 'checkbox' | 'multiselect' | 'slider' | 'number' | 'text';

  /** Options for select/radio/checkbox */
  options?: Option[];

  /** Current answer value */
  value: any;

  /** Answer change handler */
  onChange: (field: string, value: any) => void;

  /** Is this field required? */
  required?: boolean;

  /** Show validation error? */
  showError?: boolean;

  /** Slider/number min value */
  min?: number;

  /** Slider/number max value */
  max?: number;

  /** Slider/number step */
  step?: number;

  /** Custom validation options */
  validationOptions?: {
    minSelections?: number;
    maxSelections?: number;
    minLength?: number;
    maxLength?: number;
  };
}

export function EnhancedQuestionCard({
  title,
  description,
  field,
  type,
  options,
  value,
  onChange,
  required = true,
  showError = false,
  min,
  max,
  step,
  validationOptions
}: QuestionCardProps) {
  const [touched, setTouched] = useState(false);
  const [validation, setValidation] = useState<ValidationResult>({ isValid: false, error: null });
  const firstInputRef = useRef<HTMLButtonElement>(null);

  // Validate on value change
  useEffect(() => {
    const result = validateQuizStep(type, value, required, {
      min,
      max,
      ...validationOptions
    });
    setValidation(result);
  }, [value, type, required, min, max, validationOptions]);

  // Autofocus first option
  useEffect(() => {
    if (firstInputRef.current && !touched) {
      // Small delay to allow animation to complete
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 300);
    }
  }, [field]);

  const handleMultiSelect = (optionValue: string) => {
    setTouched(true);
    const current = Array.isArray(value) ? value : [];
    const newValue = current.includes(optionValue)
      ? current.filter((v) => v !== optionValue)
      : [...current, optionValue];
    onChange(field, newValue);
  };

  const handleSingleSelect = (optionValue: string) => {
    setTouched(true);
    onChange(field, optionValue);
  };

  const shouldShowError = showError && touched && !validation.isValid;
  const shouldShowSuccess = touched && validation.isValid;

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 leading-tight">
          {title}
          {required && <span className="text-[var(--ff-color-accent-600)] ml-2">*</span>}
        </h2>

        {/* Validation Status */}
        <AnimatePresence mode="wait">
          {/* Error State */}
          {shouldShowError && validation.error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium mb-3"
              role="alert"
              aria-live="polite"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <span>{validation.error}</span>
            </motion.div>
          )}

          {/* Success State */}
          {shouldShowSuccess && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium mb-3"
              role="status"
              aria-live="polite"
            >
              <CheckCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <span>{getSuccessMessage(type, value)}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Description */}
        {description && (
          <p className="text-base sm:text-lg text-[var(--color-muted)] max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>
        )}

        {/* Suggestion (only show error suggestion when showing error) */}
        {shouldShowError && validation.suggestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 mt-3 text-sm text-[var(--color-muted)]"
          >
            <Info className="w-4 h-4" aria-hidden="true" />
            <span>{validation.suggestion}</span>
          </motion.div>
        )}
      </div>

      {/* Answer Options */}
      <div className="space-y-3">
        {/* Multiple Choice (Checkbox) */}
        {(type === 'checkbox' || type === 'multiselect') && options && (
          <>
            {/* Selection Counter */}
            {Array.isArray(value) && value.length > 0 && (
              <div className="text-center mb-3">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--ff-color-primary-50)] rounded-full text-sm font-medium text-[var(--ff-color-primary-700)]">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--ff-color-primary-600)] text-white text-xs font-bold">
                    {value.length}
                  </span>
                  {value.length === 1 ? '1 optie' : `${value.length} opties`} geselecteerd
                </span>
              </div>
            )}

            <div className="grid gap-3 sm:gap-3 md:grid-cols-2 lg:grid-cols-3">
              {options.map((option, index) => {
                const isSelected = Array.isArray(value) && value.includes(option.value);
                return (
                  <button
                    key={option.value}
                    ref={index === 0 ? firstInputRef : null}
                    onClick={() => handleMultiSelect(option.value)}
                    className={`text-left p-4 min-h-[56px] rounded-xl border-2 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ff-color-primary-400)]/30 ${
                      isSelected
                        ? 'border-[var(--ff-color-primary-600)] bg-[var(--ff-color-primary-50)] shadow-sm'
                        : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--ff-color-primary-300)] hover:shadow-sm'
                    }`}
                    aria-pressed={isSelected}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                          isSelected
                            ? 'border-[var(--ff-color-primary-600)] bg-[var(--ff-color-primary-600)]'
                            : 'border-[var(--color-border)]'
                        }`}
                      >
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          >
                            <CheckCircle className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                          </motion.div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm sm:text-base mb-0.5">
                          {option.label}
                        </div>
                        {option.description && (
                          <div className="text-xs sm:text-sm text-[var(--color-muted)]">
                            {option.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Single Choice (Radio) */}
        {(type === 'radio' || type === 'select') && options && (
          <div className="grid gap-3 sm:gap-3 md:grid-cols-2">
            {options.map((option, index) => {
              const isSelected = value === option.value;
              return (
                <button
                  key={option.value}
                  ref={index === 0 ? firstInputRef : null}
                  onClick={() => handleSingleSelect(option.value)}
                  className={`text-left p-4 min-h-[56px] rounded-xl border-2 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ff-color-primary-400)]/30 ${
                    isSelected
                      ? 'border-[var(--ff-color-primary-600)] bg-[var(--ff-color-primary-50)] shadow-sm'
                      : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--ff-color-primary-300)] hover:shadow-sm'
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                        isSelected
                          ? 'border-[var(--ff-color-primary-600)]'
                          : 'border-[var(--color-border)]'
                      }`}
                    >
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="w-2.5 h-2.5 rounded-full bg-[var(--ff-color-primary-600)]"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm sm:text-base mb-0.5">
                        {option.label}
                      </div>
                      {option.description && (
                        <div className="text-xs sm:text-sm text-[var(--color-muted)]">
                          {option.description}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Slider */}
        {type === 'slider' && (
          <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6">
            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-[var(--ff-color-primary-600)] mb-2">
                €{value || min || 50}
              </div>
              <div className="text-sm font-medium text-[var(--color-text)] mb-1">
                {(value || min || 50) < 75
                  ? 'Budget'
                  : (value || min || 50) < 150
                  ? 'Middensegment'
                  : 'Premium'}
              </div>
              <div className="text-xs text-[var(--color-muted)]">Per kledingstuk</div>
            </div>

            {/* Plus/Minus Controls */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                type="button"
                onClick={() => {
                  setTouched(true);
                  const currentVal = value || min || 50;
                  const newVal = Math.max(min || 0, currentVal - (step || 5));
                  onChange(field, newVal);
                }}
                className="w-12 h-12 rounded-full bg-[var(--color-surface)] border-2 border-[var(--ff-color-primary-300)] text-[var(--ff-color-primary-700)] font-bold text-xl flex items-center justify-center hover:bg-[var(--ff-color-primary-50)] active:scale-95 transition-all shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ff-color-primary-400)]/30"
                aria-label="Verlaag budget"
              >
                −
              </button>

              <input
                type="range"
                min={min || 0}
                max={max || 500}
                step={step || 5}
                value={value || min || 50}
                onChange={(e) => {
                  setTouched(true);
                  onChange(field, parseInt(e.target.value));
                }}
                className="flex-1 h-2 bg-[var(--color-bg)] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--ff-color-primary-600)] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[var(--ff-color-primary-600)] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ff-color-primary-400)]/30"
                aria-label="Selecteer budget"
              />

              <button
                type="button"
                onClick={() => {
                  setTouched(true);
                  const currentVal = value || min || 50;
                  const newVal = Math.min(max || 500, currentVal + (step || 5));
                  onChange(field, newVal);
                }}
                className="w-12 h-12 rounded-full bg-[var(--color-surface)] border-2 border-[var(--ff-color-primary-300)] text-[var(--ff-color-primary-700)] font-bold text-xl flex items-center justify-center hover:bg-[var(--ff-color-primary-50)] active:scale-95 transition-all shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ff-color-primary-400)]/30"
                aria-label="Verhoog budget"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EnhancedQuestionCard;
