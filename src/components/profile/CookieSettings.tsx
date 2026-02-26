import React, { useState, useEffect } from 'react';
import { Shield, Cookie, Trash2, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { getCookiePrefs, setCookiePrefs, withdrawConsent, type CookiePrefs } from '@/utils/consent';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

/**
 * Cookie Settings Component
 *
 * Allows users to manage their cookie preferences and withdraw consent.
 * Displays current consent status and provides controls to modify settings.
 */
export const CookieSettings: React.FC = () => {
  const [prefs, setPrefs] = useState<CookiePrefs>({ necessary: true, analytics: false, marketing: false });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const currentPrefs = getCookiePrefs();
    setPrefs(currentPrefs);
  }, []);

  const handleToggle = async (key: keyof CookiePrefs) => {
    if (key === 'necessary') return; // Can't disable necessary cookies

    setIsLoading(true);
    const newValue = !prefs[key];

    try {
      setCookiePrefs({ [key]: newValue });
      setPrefs(prev => ({ ...prev, [key]: newValue }));

      if (key === 'analytics' && !newValue) {
        toast.success('Analytische cookies uitgeschakeld en verwijderd', {
          icon: '🔒',
          duration: 3000,
        });
      } else if (key === 'analytics' && newValue) {
        toast.success('Analytische cookies ingeschakeld', {
          icon: '📊',
          duration: 3000,
        });
      }
    } catch (error) {
      toast.error('Er ging iets mis bij het opslaan van je voorkeuren');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawAll = () => {
    if (!confirm('Weet je zeker dat je alle niet-essentiële cookies wilt verwijderen? Dit kan de functionaliteit beperken.')) {
      return;
    }

    setIsLoading(true);
    try {
      withdrawConsent();
      setPrefs({ necessary: true, analytics: false, marketing: false });
      toast.success('Alle niet-essentiële cookies zijn verwijderd', {
        icon: '🗑️',
        duration: 4000,
      });
    } catch (error) {
      toast.error('Er ging iets mis bij het verwijderen van cookies');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
        <div className="flex items-start gap-3 mb-3">
          <Shield className="w-5 h-5 text-[var(--ff-color-primary-600)] flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-[var(--color-text)] mb-1">Privacy Status</h4>
            <p className="text-sm text-[var(--color-muted)]">
              Je hebt {prefs.analytics ? 'analytische cookies' : 'alleen essentiële cookies'} ingeschakeld.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
          {prefs.analytics ? (
            <>
              <CheckCircle className="w-4 h-4 text-[var(--ff-color-success-500,#22c55e)] flex-shrink-0" />
              <span>Google Analytics actief (met IP-anonymisatie)</span>
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 text-[var(--color-muted)] flex-shrink-0" />
              <span>Geen tracking actief</span>
            </>
          )}
        </div>
      </div>

      {/* Cookie Controls */}
      <div className="space-y-3">
        {/* Necessary Cookies */}
        <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] opacity-60">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Cookie className="w-4 h-4 text-[var(--color-muted)]" />
                <h5 className="font-medium text-[var(--color-text)]">Essentiële Cookies</h5>
              </div>
              <p className="text-sm text-[var(--color-muted)]">
                Nodig voor inloggen en basisfunctionaliteit
              </p>
            </div>
            <div className="text-sm font-semibold text-[var(--color-muted)] ml-4">
              Altijd aan
            </div>
          </div>
        </div>

        {/* Analytics Cookies */}
        <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Cookie className="w-4 h-4 text-[var(--ff-color-primary-600)] flex-shrink-0" />
                <h5 className="font-medium text-[var(--color-text)]">Analytische Cookies</h5>
              </div>
              <p className="text-sm text-[var(--color-muted)] mb-2">
                Google Analytics (met IP-anonymisatie)
              </p>
              <div className="text-xs text-[var(--color-muted)] space-y-1">
                <div>• Geanonimiseerde gebruiksstatistieken</div>
                <div>• Data wordt verstuurd naar VS (USA)</div>
                <div>• Geen advertenties of profiling</div>
              </div>
            </div>
            <button
              onClick={() => handleToggle('analytics')}
              disabled={isLoading}
              aria-pressed={prefs.analytics}
              aria-label="Analytische cookies in- of uitschakelen"
              className={`
                flex-shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors mt-0.5
                ${prefs.analytics
                  ? 'bg-[var(--ff-color-primary-600)]'
                  : 'bg-[var(--color-border)]'
                }
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${prefs.analytics ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
        </div>

        {/* Marketing Cookies */}
        <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] opacity-60">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="w-4 h-4 text-[var(--color-muted)]" />
                <h5 className="font-medium text-[var(--color-text)]">Marketing Cookies</h5>
              </div>
              <p className="text-sm text-[var(--color-muted)]">
                We gebruiken geen marketing cookies
              </p>
            </div>
            <div className="text-sm font-semibold text-[var(--color-muted)] ml-4">
              Niet gebruikt
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button
          onClick={handleWithdrawAll}
          disabled={isLoading || (!prefs.analytics && !prefs.marketing)}
          variant="secondary"
          fullWidth
          className="justify-center"
        >
          <Trash2 className="w-4 h-4" />
          Verwijder Alle Niet-essentiële Cookies
        </Button>

        <Link to="/cookies" className="block">
          <button className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text)] hover:border-[var(--ff-color-primary-500)] transition-colors flex items-center justify-center gap-2">
            <ExternalLink className="w-4 h-4" />
            Volledig Cookiebeleid
          </button>
        </Link>
      </div>

      {/* Info Box */}
      <div className="p-4 rounded-xl bg-[var(--ff-color-primary-50)] dark:bg-[var(--ff-color-primary-900)]/10 border border-[var(--ff-color-primary-200)] dark:border-[var(--ff-color-primary-800)]">
        <p className="text-sm text-[var(--color-text)]">
          <strong>Let op:</strong> Als je analytische cookies uitschakelt, worden alle Google Analytics cookies onmiddellijk verwijderd.
          FitFi blijft volledig functioneel zonder deze cookies.
        </p>
      </div>
    </div>
  );
};
