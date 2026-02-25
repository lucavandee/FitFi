import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, Sparkles, TrendingDown, Trophy, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  isPushNotificationEnabled,
  isPushNotificationSupported,
  type NotificationPreferences,
} from '@/services/pwa/pushNotificationService';

export default function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    outfit_suggestions: true,
    style_tips: true,
    price_drops: true,
    achievements: true,
    challenges: true,
  });
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSupport();
    loadPreferences();
  }, []);

  const checkSupport = async () => {
    const supported = await isPushNotificationSupported();
    setIsSupported(supported);

    if (supported) {
      const enabled = await isPushNotificationEnabled();
      setIsEnabled(enabled);
    }

    setLoading(false);
  };

  const loadPreferences = async () => {
    const prefs = await getNotificationPreferences();
    if (prefs) {
      setPreferences(prefs);
    }
  };

  const handleToggleNotifications = async () => {
    if (isEnabled) {
      const success = await unsubscribeFromPushNotifications();
      if (success) {
        setIsEnabled(false);
        toast.success('Notificaties uitgeschakeld');
      } else {
        toast.error('Kon notificaties niet uitschakelen');
      }
    } else {
      const subscription = await subscribeToPushNotifications();
      if (subscription) {
        setIsEnabled(true);
        toast.success('Notificaties ingeschakeld!');
      } else {
        toast.error('Kon notificaties niet inschakelen');
      }
    }
  };

  const handlePreferenceChange = async (key: keyof NotificationPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    const success = await updateNotificationPreferences({ [key]: value });
    if (success) {
      toast.success('Voorkeuren opgeslagen');
    } else {
      toast.error('Kon voorkeuren niet opslaan');
      setPreferences(preferences);
    }
  };

  const notificationTypes = [
    {
      key: 'outfit_suggestions' as keyof NotificationPreferences,
      label: 'Outfit suggesties',
      description: 'Nieuwe outfit aanbevelingen op basis van je stijl',
      icon: Sparkles,
    },
    {
      key: 'style_tips' as keyof NotificationPreferences,
      label: 'Stijltips',
      description: 'Wekelijkse tips om je stijl te verfijnen',
      icon: Bell,
    },
    {
      key: 'price_drops' as keyof NotificationPreferences,
      label: 'Prijsdalingen',
      description: 'Alert wanneer items in je wishlist dalen in prijs',
      icon: TrendingDown,
    },
    {
      key: 'achievements' as keyof NotificationPreferences,
      label: 'Achievements',
      description: 'Meldingen wanneer je een badge behaalt',
      icon: Trophy,
    },
    {
      key: 'challenges' as keyof NotificationPreferences,
      label: 'Challenges',
      description: 'Herinneringen voor wekelijkse outfit challenges',
      icon: Calendar,
    },
  ];

  if (loading) {
    return (
      <div className="rounded-[var(--radius-2xl)] bg-white/80 backdrop-blur-sm shadow-[var(--shadow-lifted)] border border-[var(--color-border)] p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-[var(--ff-color-primary-100)] rounded w-1/3" />
          <div className="h-4 bg-[var(--ff-color-primary-100)] rounded w-2/3" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-[var(--ff-color-primary-100)] rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className="rounded-[var(--radius-2xl)] bg-white/80 backdrop-blur-sm shadow-[var(--shadow-lifted)] border border-[var(--color-border)] p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--ff-color-primary-100)] flex items-center justify-center">
            <BellOff className="w-6 h-6 text-[var(--ff-color-primary-600)]" />
          </div>
          <div>
            <h3 className="font-heading text-lg text-[var(--color-text)] mb-1">
              Notificaties niet beschikbaar
            </h3>
            <p className="text-sm text-[var(--color-muted)]">
              Je browser ondersteunt geen push notificaties. Probeer een moderne browser zoals
              Chrome, Firefox of Edge.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[var(--radius-2xl)] bg-gradient-to-br from-[var(--ff-color-primary-50)] via-white to-[var(--ff-color-accent-50)] shadow-[var(--shadow-lifted)] border-2 border-[var(--color-border)] p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isEnabled
                  ? 'bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)]'
                  : 'bg-[var(--ff-color-primary-100)]'
              }`}
            >
              {isEnabled ? (
                <Bell className="w-6 h-6 text-white" />
              ) : (
                <BellOff className="w-6 h-6 text-[var(--ff-color-primary-600)]" />
              )}
            </div>
            <div>
              <h3 className="font-heading text-lg text-[var(--color-text)] mb-1">
                Push Notificaties
              </h3>
              <p className="text-sm text-[var(--color-muted)]">
                {isEnabled
                  ? 'Je ontvangt notificaties op basis van je voorkeuren'
                  : 'Schakel notificaties in om op de hoogte te blijven'}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleNotifications}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              isEnabled ? 'bg-[var(--ff-color-primary-600)]' : 'bg-[var(--color-border)]'
            }`}
          >
            <motion.div
              animate={{ x: isEnabled ? 24 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md"
            />
          </button>
        </div>
      </motion.div>

      {/* Preference options */}
      {isEnabled && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-[var(--radius-2xl)] bg-white/80 backdrop-blur-sm shadow-[var(--shadow-lifted)] border border-[var(--color-border)] overflow-hidden"
        >
          <div className="p-6 border-b border-[var(--color-border)]">
            <h4 className="font-heading text-[var(--color-text)]">Notificatie voorkeuren</h4>
            <p className="text-sm text-[var(--color-muted)] mt-1">
              Kies welke notificaties je wilt ontvangen
            </p>
          </div>

          <div className="divide-y divide-[var(--color-border)]">
            {notificationTypes.map((type, index) => (
              <motion.div
                key={type.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + index * 0.05 }}
                className="p-6 hover:bg-[var(--ff-color-primary-50)] transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-[var(--ff-color-primary-100)] flex items-center justify-center flex-shrink-0">
                      <type.icon className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-[var(--color-text)] mb-1">{type.label}</h5>
                      <p className="text-sm text-[var(--color-muted)]">{type.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handlePreferenceChange(type.key, !preferences[type.key])
                    }
                    className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${
                      preferences[type.key]
                        ? 'bg-[var(--ff-color-primary-600)]'
                        : 'bg-[var(--color-border)]'
                    }`}
                  >
                    <motion.div
                      animate={{ x: preferences[type.key] ? 20 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
                    />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
