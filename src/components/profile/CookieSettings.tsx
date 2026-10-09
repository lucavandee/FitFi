import React, { useState, useEffect } from 'react';
import { getCookiePrefs, setCookiePrefs, withdrawConsent, type CookiePrefs } from '@/utils/consent';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

/** Wat er nu aan staat, in een regel. */
function statusregel(prefs: CookiePrefs): string {
  const aan = [prefs.analytics && 'Google Analytics', prefs.marketing && 'partnermeting via Awin'].filter(Boolean);
  return aan.length > 0 ? `Aan: ${aan.join(' en ')}` : 'Analytics en partnermeting staan uit';
}

/** Aan/uit-knop, dezelfde voor analytics en partnermeting. */
function Schakelaar({ aan, label, bezig, onClick }: { aan: boolean; label: string; bezig: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={bezig}
      role="switch"
      aria-checked={aan}
      aria-label={label}
      className={[
        'relative flex-shrink-0 h-6 w-10 rounded-full transition-colors duration-200',
        aan ? 'bg-[#A85740]' : 'bg-[#E5E5E5]',
        bezig ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A85740] focus-visible:ring-offset-2 focus-visible:ring-offset-white'
      ].join(' ')}
    >
      <span className={[
        'absolute top-[3px] left-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-200',
        aan ? 'translate-x-4' : 'translate-x-0'
      ].join(' ')} />
    </button>
  );
}

export const CookieSettings: React.FC = () => {
  const [prefs, setPrefs] = useState<CookiePrefs>({ necessary: true, analytics: false, marketing: false, consented: false });
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
      } else if (key === 'marketing') {
        toast.success(newValue ? 'Partnermeting ingeschakeld' : 'Partnermeting uitgeschakeld', { duration: 2500 });
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
      setPrefs({ necessary: true, analytics: false, marketing: false, consented: false });
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
      <p className="text-xs text-[#6E6E6E] pb-3">
        {statusregel(prefs)}
      </p>

      {/* Cookie rows */}
      <div className="space-y-px">

        {/* Essential */}
        <div className="flex items-center justify-between py-3 border-b border-[#E5E5E5]">
          <div className="min-w-0 pr-4">
            <p className="text-sm font-medium text-[#1A1A1A]">Essentiële cookies</p>
            <p className="text-xs text-[#6E6E6E] mt-0.5">Inloggen en basisfunctionaliteit</p>
          </div>
          <span className="text-xs font-semibold text-[#6E6E6E] flex-shrink-0">Altijd aan</span>
        </div>

        {/* Analytics */}
        <div className="flex items-center justify-between py-3 border-b border-[#E5E5E5]">
          <div className="min-w-0 pr-4">
            <p className="text-sm font-medium text-[#1A1A1A]">Analytische cookies</p>
            <p className="text-xs text-[#6E6E6E] mt-0.5">Google Analytics, geanonimiseerd</p>
          </div>
          <Schakelaar aan={prefs.analytics} label="Analytische cookies" bezig={isLoading} onClick={() => handleToggle('analytics')} />
        </div>

        {/* Partnermeting. Hier stond "Marketing cookies: Niet gebruikt",
            terwijl de banner dezelfde keuze (consent.marketing) wel aanbood en
            AwinMasterTag er het script van Awin mee laadt. Nu is het dezelfde
            keuze als in de banner, en je kunt hem hier ook weer uitzetten. */}
        <div className="flex items-center justify-between py-3">
          <div className="min-w-0 pr-4">
            <p className="text-sm font-medium text-[#1A1A1A]">Partnermeting</p>
            <p className="text-xs text-[#6E6E6E] mt-0.5">Awin, op je rapport en dashboard</p>
          </div>
          <Schakelaar aan={prefs.marketing} label="Partnermeting" bezig={isLoading} onClick={() => handleToggle('marketing')} />
        </div>

      </div>

      {/* Info note */}
      <p className="text-xs text-[#6E6E6E] pt-2 leading-relaxed">
        FitFi werkt ook als je beide uit laat. Advertentiepixels gebruiken we niet.
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
              className="flex-1 py-2.5 min-h-[44px] rounded-xl border border-[#E5E5E5] text-xs font-semibold text-[#6E6E6E] hover:bg-[#FAFAF8] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A85740]"
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
            className="flex-1 py-3 px-6 min-h-[44px] rounded-full border border-[#E5E5E5] text-sm font-medium text-[#4A4A4A] hover:border-[#A85740] hover:text-[#A85740] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A85740]/20"
          >
            Cookiebeleid
          </button>
        </div>
      )}

    </div>
  );
};
