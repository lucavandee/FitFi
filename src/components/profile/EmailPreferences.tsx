import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@/context/UserContext';
import toast from 'react-hot-toast';

interface EmailPreference {
  marketing_emails: boolean;
  product_updates: boolean;
  style_tips: boolean;
  weekly_digest: boolean;
  outfit_recommendations: boolean;
  quiz_reminders: boolean;
}

const PREFERENCE_ROWS: { key: keyof EmailPreference; label: string; description: string }[] = [
  {
    key: 'marketing_emails',
    label: 'Marketing',
    description: 'Nieuws over nieuwe features en aanbiedingen',
  },
  {
    key: 'product_updates',
    label: 'Nieuwe producten',
    description: 'Producten die bij jouw stijl passen',
  },
  {
    key: 'style_tips',
    label: 'Stijltips',
    description: 'Persoonlijke adviezen van Nova',
  },
  {
    key: 'weekly_digest',
    label: 'Weekoverzicht',
    description: 'Nieuwe outfits en trends, één keer per week',
  },
  {
    key: 'outfit_recommendations',
    label: 'Outfit suggesties',
    description: 'Dagelijkse aanbevelingen op basis van jouw stijl',
  },
  {
    key: 'quiz_reminders',
    label: 'Profielherinneringen',
    description: 'Herinnering om je stijlprofiel bij te werken',
  },
];

const DEFAULTS: EmailPreference = {
  marketing_emails: false,
  product_updates: false,
  style_tips: false,
  weekly_digest: false,
  outfit_recommendations: false,
  quiz_reminders: false,
};

export function EmailPreferences() {
  const { user } = useUser();
  const [preferences, setPreferences] = useState<EmailPreference | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase()
        .from('email_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPreferences({
          marketing_emails: data.marketing_emails ?? false,
          product_updates: data.product_updates ?? false,
          style_tips: data.style_tips ?? false,
          weekly_digest: data.weekly_digest ?? false,
          outfit_recommendations: data.outfit_recommendations ?? false,
          quiz_reminders: data.quiz_reminders ?? false,
        });
      } else {
        setPreferences(DEFAULTS);
      }
    } catch {
      setPreferences(DEFAULTS);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = async (key: keyof EmailPreference, value: boolean) => {
    if (!user || !preferences) return;
    const previous = preferences[key];
    setPreferences(prev => prev ? { ...prev, [key]: value } : prev);
    setSavingKey(key);
    try {
      const { error } = await supabase()
        .from('email_preferences')
        .upsert({ user_id: user.id, [key]: value }, { onConflict: 'user_id' });
      if (error) throw error;
    } catch {
      setPreferences(prev => prev ? { ...prev, [key]: previous } : prev);
      toast.error('Kon voorkeur niet opslaan');
    } finally {
      setSavingKey(null);
    }
  };

  if (isLoading) {
    return (
      <div className="px-5 py-4 space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center justify-between py-2">
            <div className="space-y-1.5">
              <div className="h-3.5 w-28 bg-[#E5E5E5] rounded animate-pulse" />
              <div className="h-2.5 w-44 bg-[#E5E5E5] rounded animate-pulse opacity-60" />
            </div>
            <div className="h-6 w-10 bg-[#E5E5E5] rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (!preferences) return null;

  return (
    <div>
      <div className="px-5 pt-4 pb-2 border-b border-[#E5E5E5]">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8A8A8A]">
          E-mailvoorkeuren
        </p>
        <p className="text-xs text-[#8A8A8A] mt-0.5">
          Kies welke emails je wilt ontvangen
        </p>
      </div>

      <div className="divide-y divide-[#E5E5E5]">
        {PREFERENCE_ROWS.map(({ key, label, description }) => (
          <div
            key={key}
            className="flex items-center justify-between px-5 py-3 min-h-[44px] hover:bg-[#FAFAF8] transition-colors"
          >
            <div className="min-w-0 pr-4">
              <p className="text-sm font-medium text-[#1A1A1A] leading-snug">{label}</p>
              <p className="text-xs text-[#8A8A8A] mt-0.5 leading-snug">{description}</p>
            </div>
            <button
              role="switch"
              aria-checked={preferences[key]}
              aria-label={`${label} — ${PREFERENCE_ROWS.find(r => r.key === key)?.description ?? ''}`}
              disabled={savingKey === key}
              onClick={() => updatePreference(key, !preferences[key])}
              className={[
                'relative flex-shrink-0 h-6 w-10 rounded-full transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2654A] focus-visible:ring-offset-2 focus-visible:ring-offset-white',
                preferences[key] ? 'bg-[#C2654A]' : 'bg-[#E5E5E5]',
                savingKey === key ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
              ].join(' ')}
            >
              <span className={[
                'absolute top-[3px] left-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 pointer-events-none',
                preferences[key] ? 'translate-x-4' : 'translate-x-0',
              ].join(' ')} />
            </button>
          </div>
        ))}
      </div>

      <div className="px-5 py-3 border-t border-[#E5E5E5]">
        <p className="text-[11px] text-[#8A8A8A] leading-relaxed">
          Account- en transactie-emails ontvang je altijd.
        </p>
      </div>
    </div>
  );
}
