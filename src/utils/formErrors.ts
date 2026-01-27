/**
 * Form Error Message Utilities
 *
 * Provides contextual, solution-oriented error messages for all forms.
 *
 * Design Principles:
 * 1. Be specific about what's wrong
 * 2. Provide actionable solutions
 * 3. Use friendly, non-technical language
 * 4. Include examples where helpful
 * 5. Match tone to user frustration level
 */

export interface ErrorMessage {
  /** Short error title */
  title: string;
  /** Detailed explanation */
  message: string;
  /** Optional solution/example */
  solution?: string;
  /** Error severity */
  severity: 'error' | 'warning' | 'info';
  /** Icon name (from lucide-react) */
  icon?: 'AlertCircle' | 'Info' | 'AlertTriangle' | 'Mail' | 'Lock' | 'User';
}

/**
 * Email Validation Errors
 */
export const emailErrors = {
  required: (): ErrorMessage => ({
    title: 'E-mailadres verplicht',
    message: 'Vul je e-mailadres in om door te gaan.',
    solution: 'Bijvoorbeeld: naam@voorbeeld.nl',
    severity: 'error',
    icon: 'Mail',
  }),

  invalid: (value: string): ErrorMessage => {
    // Provide specific feedback based on the error
    if (!value.includes('@')) {
      return {
        title: 'E-mailadres ongeldig',
        message: 'Een e-mailadres moet een @ bevatten.',
        solution: 'Gebruik het formaat: naam@voorbeeld.nl',
        severity: 'error',
        icon: 'Mail',
      };
    }

    if (!value.includes('.') || value.endsWith('.')) {
      return {
        title: 'E-mailadres ongeldig',
        message: 'Een e-mailadres moet een domeinnaam bevatten.',
        solution: 'Gebruik het formaat: naam@voorbeeld.nl of naam@gmail.com',
        severity: 'error',
        icon: 'Mail',
      };
    }

    const parts = value.split('@');
    if (parts[0].length === 0) {
      return {
        title: 'E-mailadres ongeldig',
        message: 'Voer een gebruikersnaam in vóór de @.',
        solution: 'Bijvoorbeeld: jouwnaam@gmail.com',
        severity: 'error',
        icon: 'Mail',
      };
    }

    return {
      title: 'E-mailadres ongeldig',
      message: 'Dit e-mailadres is niet correct.',
      solution: 'Controleer of je het juiste formaat gebruikt: naam@voorbeeld.nl',
      severity: 'error',
      icon: 'Mail',
    };
  },

  alreadyExists: (): ErrorMessage => ({
    title: 'E-mailadres al in gebruik',
    message: 'Er bestaat al een account met dit e-mailadres.',
    solution: 'Probeer in te loggen of gebruik het "Wachtwoord vergeten" formulier.',
    severity: 'error',
    icon: 'AlertCircle',
  }),

  notFound: (): ErrorMessage => ({
    title: 'Account niet gevonden',
    message: 'We kennen dit e-mailadres niet.',
    solution: 'Controleer je e-mailadres of maak een nieuw account aan.',
    severity: 'error',
    icon: 'AlertCircle',
  }),

  disposable: (): ErrorMessage => ({
    title: 'Tijdelijk e-mailadres niet toegestaan',
    message: 'Gebruik een permanent e-mailadres om door te gaan.',
    solution: 'Probeer een @gmail.com, @outlook.com of werk-e-mailadres.',
    severity: 'warning',
    icon: 'AlertTriangle',
  }),
};

/**
 * Password Validation Errors
 */
export const passwordErrors = {
  required: (): ErrorMessage => ({
    title: 'Wachtwoord verplicht',
    message: 'Vul je wachtwoord in om in te loggen.',
    severity: 'error',
    icon: 'Lock',
  }),

  tooShort: (minLength: number = 8): ErrorMessage => ({
    title: 'Wachtwoord te kort',
    message: `Je wachtwoord moet minimaal ${minLength} tekens bevatten.`,
    solution: 'Gebruik een combinatie van letters, cijfers en speciale tekens.',
    severity: 'error',
    icon: 'Lock',
  }),

  tooWeak: (): ErrorMessage => ({
    title: 'Wachtwoord te zwak',
    message: 'Kies een sterker wachtwoord voor jouw veiligheid.',
    solution: 'Gebruik minimaal één hoofdletter, één cijfer en één speciaal teken.',
    severity: 'warning',
    icon: 'AlertTriangle',
  }),

  noUppercase: (): ErrorMessage => ({
    title: 'Geen hoofdletter',
    message: 'Voeg minimaal één hoofdletter toe aan je wachtwoord.',
    solution: 'Bijvoorbeeld: Wachtwoord123!',
    severity: 'warning',
    icon: 'Lock',
  }),

  noNumber: (): ErrorMessage => ({
    title: 'Geen cijfer',
    message: 'Voeg minimaal één cijfer toe aan je wachtwoord.',
    solution: 'Bijvoorbeeld: Wachtwoord123!',
    severity: 'warning',
    icon: 'Lock',
  }),

  noSpecialChar: (): ErrorMessage => ({
    title: 'Geen speciaal teken',
    message: 'Voeg minimaal één speciaal teken toe (zoals ! @ # $ %).',
    solution: 'Bijvoorbeeld: Wachtwoord123!',
    severity: 'warning',
    icon: 'Lock',
  }),

  incorrect: (): ErrorMessage => ({
    title: 'Wachtwoord onjuist',
    message: 'Dit wachtwoord komt niet overeen met ons systeem.',
    solution: 'Controleer je wachtwoord of gebruik "Wachtwoord vergeten".',
    severity: 'error',
    icon: 'AlertCircle',
  }),

  mismatch: (): ErrorMessage => ({
    title: 'Wachtwoorden komen niet overeen',
    message: 'De wachtwoorden die je hebt ingevuld zijn niet identiek.',
    solution: 'Controleer beide velden en probeer opnieuw.',
    severity: 'error',
    icon: 'AlertCircle',
  }),
};

/**
 * Name Validation Errors
 */
export const nameErrors = {
  required: (): ErrorMessage => ({
    title: 'Naam verplicht',
    message: 'Vul je naam in om door te gaan.',
    solution: 'Je voornaam is voldoende.',
    severity: 'error',
    icon: 'User',
  }),

  tooShort: (): ErrorMessage => ({
    title: 'Naam te kort',
    message: 'Voer minimaal 2 tekens in.',
    solution: 'Gebruik je voornaam of een bijnaam.',
    severity: 'error',
    icon: 'User',
  }),

  invalidCharacters: (): ErrorMessage => ({
    title: 'Ongeldige tekens',
    message: 'Gebruik alleen letters, spaties en koppeltekens.',
    solution: 'Bijvoorbeeld: Jan, Marie-Claire of Van der Berg',
    severity: 'error',
    icon: 'User',
  }),
};

/**
 * Quiz Field Errors
 */
export const quizErrors = {
  required: (fieldName: string): ErrorMessage => ({
    title: 'Selectie vereist',
    message: `Kies een antwoord voor "${fieldName}" om door te gaan.`,
    severity: 'error',
    icon: 'AlertCircle',
  }),

  minSelections: (min: number, fieldName: string): ErrorMessage => ({
    title: 'Te weinig geselecteerd',
    message: `Selecteer minimaal ${min} opties voor "${fieldName}".`,
    solution: `Kies er nog ${min} om door te gaan.`,
    severity: 'error',
    icon: 'AlertCircle',
  }),

  maxSelections: (max: number, fieldName: string): ErrorMessage => ({
    title: 'Te veel geselecteerd',
    message: `Je kunt maximaal ${max} opties selecteren voor "${fieldName}".`,
    solution: `Deselecteer er een paar om door te gaan.`,
    severity: 'warning',
    icon: 'AlertTriangle',
  }),

  invalidRange: (min: number, max: number, fieldName: string): ErrorMessage => ({
    title: 'Ongeldige waarde',
    message: `De waarde voor "${fieldName}" moet tussen ${min} en ${max} liggen.`,
    solution: `Gebruik de slider om een geldige waarde te kiezen.`,
    severity: 'error',
    icon: 'AlertCircle',
  }),
};

/**
 * Network Errors
 */
export const networkErrors = {
  timeout: (): ErrorMessage => ({
    title: 'Verzoek verlopen',
    message: 'De verbinding met onze server duurde te lang.',
    solution: 'Controleer je internetverbinding en probeer opnieuw.',
    severity: 'error',
    icon: 'AlertCircle',
  }),

  offline: (): ErrorMessage => ({
    title: 'Geen internetverbinding',
    message: 'Je apparaat is niet verbonden met het internet.',
    solution: 'Controleer je WiFi of mobiele data en probeer opnieuw.',
    severity: 'error',
    icon: 'AlertCircle',
  }),

  serverError: (): ErrorMessage => ({
    title: 'Serverfout',
    message: 'Er ging iets mis op onze server.',
    solution: 'Probeer het over een paar minuten opnieuw. Als dit blijft gebeuren, neem contact op.',
    severity: 'error',
    icon: 'AlertCircle',
  }),

  unknown: (): ErrorMessage => ({
    title: 'Onbekende fout',
    message: 'Er is een onverwachte fout opgetreden.',
    solution: 'Probeer de pagina te vernieuwen of neem contact op als dit blijft gebeuren.',
    severity: 'error',
    icon: 'AlertCircle',
  }),
};

/**
 * Contact Form Errors
 */
export const contactErrors = {
  nameRequired: (): ErrorMessage => ({
    title: 'Naam verplicht',
    message: 'Vul je naam in zodat we weten hoe we je kunnen aanspreken.',
    severity: 'error',
    icon: 'User',
  }),

  emailRequired: (): ErrorMessage => ({
    title: 'E-mailadres verplicht',
    message: 'We hebben je e-mailadres nodig om te kunnen reageren.',
    solution: 'Gebruik het formaat: naam@voorbeeld.nl',
    severity: 'error',
    icon: 'Mail',
  }),

  messageRequired: (): ErrorMessage => ({
    title: 'Bericht verplicht',
    message: 'Vul je bericht in om contact op te nemen.',
    solution: 'Minimaal 10 tekens.',
    severity: 'error',
    icon: 'AlertCircle',
  }),

  messageTooShort: (minLength: number): ErrorMessage => ({
    title: 'Bericht te kort',
    message: `Je bericht moet minimaal ${minLength} tekens bevatten.`,
    solution: 'Vertel ons wat meer over je vraag of opmerking.',
    severity: 'error',
    icon: 'AlertCircle',
  }),
};

/**
 * Helper: Get error message for Supabase auth errors
 */
export function getSupabaseAuthError(error: any): ErrorMessage {
  const message = error?.message?.toLowerCase() || '';

  if (message.includes('invalid login credentials') || message.includes('invalid email or password')) {
    return {
      title: 'Inloggegevens onjuist',
      message: 'Je e-mailadres of wachtwoord is niet correct.',
      solution: 'Controleer je gegevens of gebruik "Wachtwoord vergeten".',
      severity: 'error',
      icon: 'AlertCircle',
    };
  }

  if (message.includes('email not confirmed')) {
    return {
      title: 'E-mail niet bevestigd',
      message: 'Controleer je inbox en klik op de bevestigingslink.',
      solution: 'Kan je de e-mail niet vinden? Controleer je spam-folder.',
      severity: 'warning',
      icon: 'Mail',
    };
  }

  if (message.includes('user already registered')) {
    return emailErrors.alreadyExists();
  }

  if (message.includes('user not found')) {
    return emailErrors.notFound();
  }

  if (message.includes('network') || message.includes('fetch')) {
    return networkErrors.offline();
  }

  if (message.includes('timeout')) {
    return networkErrors.timeout();
  }

  // Generic fallback
  return {
    title: 'Er ging iets mis',
    message: error?.message || 'Er is een onverwachte fout opgetreden.',
    solution: 'Probeer het opnieuw of neem contact op als dit blijft gebeuren.',
    severity: 'error',
    icon: 'AlertCircle',
  };
}

/**
 * Helper: Format error for display
 */
export function formatErrorMessage(error: ErrorMessage): string {
  let text = error.message;
  if (error.solution) {
    text += ` ${error.solution}`;
  }
  return text;
}

/**
 * Helper: Get error color
 */
export function getErrorColor(severity: ErrorMessage['severity']): string {
  switch (severity) {
    case 'error':
      return 'text-red-600 border-red-500 bg-red-50';
    case 'warning':
      return 'text-amber-600 border-amber-500 bg-amber-50';
    case 'info':
      return 'text-blue-600 border-blue-500 bg-blue-50';
  }
}
