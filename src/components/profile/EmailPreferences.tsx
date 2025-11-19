import React, { useState, useEffect } from 'react';
import { Mail, Bell, Sparkles, TrendingUp, Gift, RefreshCw, Check } from 'lucide-react';
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

interface PreferenceOption {
  key: keyof EmailPreference;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const preferenceOptions: PreferenceOption[] = [
  {
    key: 'marketing_emails',
    label: 'Marketing emails',
    description: 'Nieuws over nieuwe features en aanbiedingen',
    icon: <Gift className="w-5 h-5" />,
  },
  {
    key: 'product_updates',
    label: 'Product updates',
    description: 'Updates over nieuwe producten in je stijl',
    icon: <TrendingUp className="w-5 h-5" />,
  },
  {
    key: 'style_tips',
    label: 'Styling tips',
    description: 'Persoonlijke stijladviezen van Nova',
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    key: 'weekly_digest',
    label: 'Wekelijkse samenvatting',
    description: 'Overzicht van nieuwe outfits en trends',
    icon: <Mail className="w-5 h-5" />,
  },
  {
    key: 'outfit_recommendations',
    label: 'Outfit aanbevelingen',
    description: 'Dagelijkse outfit suggesties op basis van weer en agenda',
    icon: <Bell className="w-5 h-5" />,
  },
  {
    key: 'quiz_reminders',
    label: 'Quiz herinneringen',
    description: 'Herinnering om je stijlprofiel bij te werken',
    icon: <RefreshCw className="w-5 h-5" />,
  },
];

export function EmailPreferences() {
  const { user } = useUser();
  const [preferences, setPreferences] = useState<EmailPreference | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
          marketing_emails: data.marketing_emails,
          product_updates: data.product_updates,
          style_tips: data.style_tips,
          weekly_digest: data.weekly_digest,
          outfit_recommendations: data.outfit_recommendations,
          quiz_reminders: data.quiz_reminders,
        });
      }
    } catch (error) {
      console.error('Error loading email preferences:', error);
      toast.error('Kon voorkeuren niet laden');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = async (key: keyof EmailPreference, value: boolean) => {
    if (!user || !preferences) return;

    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    setIsSaving(true);

    try {
      const { error } = await supabase()
        .from('email_preferences')
        .update({ [key]: value })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Voorkeur opgeslagen', {
        icon: <Check className="w-4 h-4 text-green-600" />,
        duration: 2000,
      });
    } catch (error) {
      console.error('Error updating preference:', error);
      toast.error('Kon voorkeur niet opslaan');
      setPreferences(preferences);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-16 bg-[var(--color-bg)] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-2xl p-6 text-center">
        <p className="text-[var(--color-muted)]">Kon voorkeuren niet laden</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-[var(--ff-color-primary-100)] dark:bg-[var(--ff-color-primary-900)] rounded-lg">
          <Mail className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-[var(--color-text)]">
            Email voorkeuren
          </h3>
          <p className="text-sm text-[var(--color-muted)]">
            Kies welke emails je wilt ontvangen
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {preferenceOptions.map((option) => (
          <div
            key={option.key}
            className="flex items-start gap-4 p-4 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)] transition-colors"
          >
            <div className="p-2 bg-[var(--color-surface)] rounded-lg flex-shrink-0 mt-0.5">
              {option.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[var(--color-text)] mb-1">
                {option.label}
              </div>
              <div className="text-sm text-[var(--color-muted)]">
                {option.description}
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={preferences[option.key]}
                onChange={(e) => updatePreference(option.key, e.target.checked)}
                disabled={isSaving}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--ff-color-primary-200)] dark:peer-focus:ring-[var(--ff-color-primary-800)] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[var(--ff-color-primary-600)]"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>Let op:</strong> Belangrijke account updates en transactie-emails blijf je altijd ontvangen.
        </p>
      </div>
    </div>
  );
}
