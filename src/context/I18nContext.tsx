import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'nl' | 'fr' | 'de' | 'es';

interface Translation {
  [key: string]: string | Translation;
}

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Sample translations
const translations: Record<Language, Translation> = {
  en: {
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      save: 'Save',
      cancel: 'Cancel',
      continue: 'Continue',
      back: 'Back'
    },
    nav: {
      home: 'Home',
      getStarted: 'Get Started',
      howItWorks: 'How It Works',
      pricing: 'Pricing',
      dashboard: 'Dashboard'
    },
    hero: {
      title: 'Discover Your Perfect Style With AI',
      subtitle: 'FitFi uses AI to analyze your preferences and photo to create personalized clothing and lifestyle recommendations just for you.',
      cta: 'Get Started Now',
      learnMore: 'Learn More'
    }
  },
  nl: {
    common: {
      loading: 'Laden...',
      error: 'Er is een fout opgetreden',
      save: 'Opslaan',
      cancel: 'Annuleren',
      continue: 'Doorgaan',
      back: 'Terug'
    },
    nav: {
      home: 'Home',
      getStarted: 'Aan de slag',
      howItWorks: 'Hoe het werkt',
      pricing: 'Prijzen',
      dashboard: 'Dashboard'
    },
    hero: {
      title: 'Ontdek je perfecte stijl met AI',
      subtitle: 'FitFi gebruikt AI om je voorkeuren en foto te analyseren en gepersonaliseerde kleding- en lifestyle-aanbevelingen voor je te maken.',
      cta: 'Nu beginnen',
      learnMore: 'Meer informatie'
    }
  },
  fr: {
    common: {
      loading: 'Chargement...',
      error: 'Une erreur s\'est produite',
      save: 'Enregistrer',
      cancel: 'Annuler',
      continue: 'Continuer',
      back: 'Retour'
    },
    nav: {
      home: 'Accueil',
      getStarted: 'Commencer',
      howItWorks: 'Comment ça marche',
      pricing: 'Tarifs',
      dashboard: 'Tableau de bord'
    },
    hero: {
      title: 'Découvrez votre style parfait avec l\'IA',
      subtitle: 'FitFi utilise l\'IA pour analyser vos préférences et votre photo afin de créer des recommandations vestimentaires et de style de vie personnalisées.',
      cta: 'Commencer maintenant',
      learnMore: 'En savoir plus'
    }
  },
  de: {
    common: {
      loading: 'Laden...',
      error: 'Ein Fehler ist aufgetreten',
      save: 'Speichern',
      cancel: 'Abbrechen',
      continue: 'Weiter',
      back: 'Zurück'
    },
    nav: {
      home: 'Startseite',
      getStarted: 'Loslegen',
      howItWorks: 'Wie es funktioniert',
      pricing: 'Preise',
      dashboard: 'Dashboard'
    },
    hero: {
      title: 'Entdecken Sie Ihren perfekten Stil mit KI',
      subtitle: 'FitFi nutzt KI, um Ihre Vorlieben und Ihr Foto zu analysieren und personalisierte Kleidungs- und Lifestyle-Empfehlungen für Sie zu erstellen.',
      cta: 'Jetzt starten',
      learnMore: 'Mehr erfahren'
    }
  },
  es: {
    common: {
      loading: 'Cargando...',
      error: 'Ha ocurrido un error',
      save: 'Guardar',
      cancel: 'Cancelar',
      continue: 'Continuar',
      back: 'Atrás'
    },
    nav: {
      home: 'Inicio',
      getStarted: 'Empezar',
      howItWorks: 'Cómo funciona',
      pricing: 'Precios',
      dashboard: 'Panel'
    },
    hero: {
      title: 'Descubre tu estilo perfecto con IA',
      subtitle: 'FitFi usa IA para analizar tus preferencias y foto para crear recomendaciones personalizadas de ropa y estilo de vida.',
      cta: 'Empezar ahora',
      learnMore: 'Saber más'
    }
  }
};

const RTL_LANGUAGES: Language[] = []; // Add RTL languages like 'ar', 'he' when needed

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('fitfi-language') as Language;
    const browserLang = navigator.language.split('-')[0] as Language;
    return saved || (translations[browserLang] ? browserLang : 'en');
  });

  const isRTL = RTL_LANGUAGES.includes(language);

  useEffect(() => {
    localStorage.setItem('fitfi-language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [language, isRTL]);

  const t = (key: string, params?: Record<string, string>): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (typeof value !== 'string') {
      console.warn(`Translation key "${key}" not found for language "${language}"`);
      return key;
    }
    
    // Replace parameters
    if (params) {
      return Object.entries(params).reduce(
        (str, [param, replacement]) => str.replace(`{{${param}}}`, replacement),
        value
      );
    }
    
    return value;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};