import React, { useState, useEffect } from 'react';
import { getCookiePrefs, setCookiePrefs, withdrawConsent, type CookiePrefs } from '@/utils/consent';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const CookieSettings: React.FC = () => {
  const [prefs, setPrefs] = useState<CookiePrefs>({ necessary: true, analytics: false, marketing: false });
  const [isLoading, setIsLoading] = useState(false);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setPrefs(getCookiePrefs());
  }, []);

  const handleToggle = async (key: keyof CookiePrefs) => {
    if (key === 'necessary') return;
    setIsLoading(true);
    const newValue = !prefs[key];
    try {
      setCookiePrefs({ [key]: newValue });
      setPrefs(prev => ({ ...prev, [key]: newValue }));
      if (key === 'analytics') {
        toast.success(newValue ? 'Analytische cookies ingeschakeld' : 'Analytische cookies uitgeschakeld', { duration: 2500 });
      }
    } catch {
      toast.error('Er ging iets mis');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawAll = () => {
    setIsLoading(true);
    try {
      withdrawConsent();
      setPrefs({ necessary: true, analytics: false, marketing: false });
      toast.success('Cookies verwijderd', { duration: 3000 });
    } catch {
      toast.error('Er ging iets mis');
    } finally {
      setIsLoading(false);
      setConfirmWithdraw(false);
    }
  };

  return (
    <div className="space-y-1">

      {/* Status line */}
      <p className="text-xs text-[#8A8A8A] pb-3">
        {prefs.analytics ? 'Google Analytics actief — met IP-anonymisatie' : 'Geen tracking actief'}
      </p>

      {/* Cookie rows */}
      <div className="space-y-px">

        {/* Essential */}
        <div className="flex items-center justify-between py-3 border-b border-[#E5E5E5]">
          <div className="min-w-0 pr-4">
            <p className="text-sm font-medium text-[#1A1A1A]">Essentiële cookies</p>
            <p className="text-xs text-[#8A8A8A] mt-0.5">Inloggen en basisfunctionaliteit</p>
          </div>
          <span className="text-xs font-semibold text-[#8A8A8A] flex-shrink-0">Altijd aan</span>
        </div>

        {/* Analytics */}
        <div className="flex items-center justify-between py-3 border-b border-[#E5E5E5]">
          <div className="min-w-0 pr-4">
            <p className="text-sm font-medium text-[#1A1A1A]">Analytische cookies</p>
            <p className="text-xs text-[#8A8A8A] mt-0.5">Google Analytics, geanonimiseerd</p>
          </div>
          <button
            onClick={() => handleToggle('analytics')}
            disabled={isLoading}
            role="switch"
            aria-checked={prefs.analytics}
            aria-label="Analytische cookies"
            className={[
              'relative flex-shrink-0 h-6 w-10 rounded-full transition-colors duration-200',
              prefs.analytics ? 'bg-[#C2654A]' : 'bg-[#E5E5E5]',
              isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2654A] focus-visible:ring-offset-2 focus-visible:ring-offset-white'
            ].join(' ')}
          >
            <span className={[
              'absolute top-[3px] left-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-200',
              prefs.analytics ? 'translate-x-4' : 'translate-x-0'
            ].join(' ')} />
          </button>
        </div>

        {/* Marketing */}
        <div className="flex items-center justify-between py-3">
          <div className="min-w-0 pr-4">
            <p className="text-sm font-medium text-[#8A8A8A]">Marketing cookies</p>
            <p className="text-xs text-[#8A8A8A] mt-0.5">Niet van toepassing</p>
          </div>
          <span className="text-xs font-semibold text-[#8A8A8A] flex-shrink-0">Niet gebruikt</span>
        </div>

      </div>

      {/* Info note */}
      <p className="text-xs text-[#8A8A8A] pt-2 leading-relaxed">
        FitFi werkt volledig zonder analytische cookies. Data wordt nooit voor advertenties gebruikt.
      </p>

      {/* Actions */}
      {confirmWithdraw ? (
        <div className="pt-3 space-y-2">
          <p className="text-xs text-[#1A1A1A] font-semibold">Alle niet-essentiële cookies verwijderen?</p>
          <div className="flex gap-2">
            <button
              onClick={handleWithdrawAll}
              disabled={isLoading}
              className="flex-1 py-2.5 min-h-[44px] rounded-xl bg-[#C24A4A] text-white text-xs font-bold transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E07070]"
            >
              Verwijderen
            </button>
            <button
              onClick={() => setConfirmWithdraw(false)}
              className="flex-1 py-2.5 min-h-[44px] rounded-xl border border-[#E5E5E5] text-xs font-semibold text-[#8A8A8A] hover:bg-[#FAFAF8] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4856E]"
            >
              Annuleer
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 pt-3">
          <button
            onClick={() => setConfirmWithdraw(true)}
            disabled={isLoading || (!prefs.analytics && !prefs.marketing)}
            className="flex-1 py-3 px-6 min-h-[44px] rounded-full border border-[#E5E5E5] text-sm font-medium text-[#4A4A4A] hover:border-[#C24A4A] hover:text-[#C24A4A] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C24A4A]/20"
          >
            Alles verwijderen
          </button>
          <button
            onClick={() => navigate('/cookies')}
            className="flex-1 py-3 px-6 min-h-[44px] rounded-full border border-[#E5E5E5] text-sm font-medium text-[#4A4A4A] hover:border-[#C2654A] hover:text-[#C2654A] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2654A]/20"
          >
            Cookiebeleid
          </button>
        </div>
      )}

    </div>
  );
};
