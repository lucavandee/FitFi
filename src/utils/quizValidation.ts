/**
 * Quiz Validation Utilities
 *
 * Provides realtime validation for quiz inputs with clear error messages
 */

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
  suggestion?: string;
}

/**
 * Validate single choice answer (radio/select)
 */
export function validateSingleChoice(value: any, required: boolean = true): ValidationResult {
  if (!required) {
    return { isValid: true, error: null };
  }

  if (value === undefined || value === null || value === '') {
    return {
      isValid: false,
      error: 'Selecteer een optie om verder te gaan',
      suggestion: 'Kies de optie die het beste bij je past'
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validate multiple choice answer (checkbox/multiselect)
 */
export function validateMultipleChoice(
  value: any,
  required: boolean = true,
  minSelections: number = 1,
  maxSelections?: number
): ValidationResult {
  if (!required) {
    return { isValid: true, error: null };
  }

  if (!Array.isArray(value) || value.length === 0) {
    return {
      isValid: false,
      error: minSelections === 1
        ? 'Selecteer minimaal één optie om verder te gaan'
        : `Selecteer minimaal ${minSelections} opties om verder te gaan`,
      suggestion: minSelections === 1
        ? 'Kies de optie die het beste bij je past'
        : `Je kunt meerdere opties selecteren`
    };
  }

  if (value.length < minSelections) {
    return {
      isValid: false,
      error: `Selecteer minimaal ${minSelections} opties om verder te gaan`,
      suggestion: `Je hebt er ${value.length} gekozen, nog ${minSelections - value.length} nodig`
    };
  }

  if (maxSelections && value.length > maxSelections) {
    return {
      isValid: false,
      error: `Maximaal ${maxSelections} opties toegestaan`,
      suggestion: `Deselecteer ${value.length - maxSelections} optie(s)`
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validate number input (slider/number field)
 */
export function validateNumber(
  value: any,
  required: boolean = true,
  min?: number,
  max?: number
): ValidationResult {
  if (!required && (value === undefined || value === null || value === '')) {
    return { isValid: true, error: null };
  }

  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) {
    return {
      isValid: false,
      error: 'Voer een geldig getal in',
      suggestion: 'Gebruik alleen cijfers'
    };
  }

  if (min !== undefined && num < min) {
    return {
      isValid: false,
      error: `Minimale waarde is ${min}`,
      suggestion: `Voer een getal in tussen ${min} en ${max || '∞'}`
    };
  }

  if (max !== undefined && num > max) {
    return {
      isValid: false,
      error: `Maximale waarde is ${max}`,
      suggestion: `Voer een getal in tussen ${min || 0} en ${max}`
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validate text input
 */
export function validateText(
  value: any,
  required: boolean = true,
  minLength?: number,
  maxLength?: number
): ValidationResult {
  if (!required && (!value || value === '')) {
    return { isValid: true, error: null };
  }

  const text = String(value || '').trim();

  if (required && !text) {
    return {
      isValid: false,
      error: 'Dit veld is verplicht',
      suggestion: 'Vul dit veld in om verder te gaan'
    };
  }

  if (minLength && text.length < minLength) {
    return {
      isValid: false,
      error: `Minimaal ${minLength} tekens vereist`,
      suggestion: `Je hebt ${text.length} tekens, nog ${minLength - text.length} nodig`
    };
  }

  if (maxLength && text.length > maxLength) {
    return {
      isValid: false,
      error: `Maximaal ${maxLength} tekens toegestaan`,
      suggestion: `Je hebt ${text.length} tekens, ${text.length - maxLength} te veel`
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validate based on quiz step type
 */
export function validateQuizStep(
  stepType: string,
  value: any,
  required: boolean = true,
  options?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    minSelections?: number;
    maxSelections?: number;
  }
): ValidationResult {
  switch (stepType) {
    case 'radio':
    case 'select':
      return validateSingleChoice(value, required);

    case 'checkbox':
    case 'multiselect':
      return validateMultipleChoice(
        value,
        required,
        options?.minSelections,
        options?.maxSelections
      );

    case 'number':
    case 'slider':
      return validateNumber(value, required, options?.min, options?.max);

    case 'text':
    case 'textarea':
      return validateText(value, required, options?.minLength, options?.maxLength);

    default:
      // Generic validation for unknown types
      if (required && (value === undefined || value === null || value === '')) {
        return {
          isValid: false,
          error: 'Dit veld is verplicht',
          suggestion: 'Vul dit veld in om verder te gaan'
        };
      }
      return { isValid: true, error: null };
  }
}

/**
 * Get success message for completed step
 */
export function getSuccessMessage(stepType: string, value: any): string {
  switch (stepType) {
    case 'checkbox':
    case 'multiselect':
      const count = Array.isArray(value) ? value.length : 0;
      return count === 1
        ? '1 optie geselecteerd'
        : `${count} opties geselecteerd`;

    case 'radio':
    case 'select':
      return 'Optie geselecteerd';

    case 'number':
    case 'slider':
      return 'Waarde ingesteld';

    case 'text':
    case 'textarea':
      return 'Ingevuld';

    default:
      return 'Voltooid';
  }
}
