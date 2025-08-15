import React from 'react';
import CookieBanner from './CookieBanner';
import { getCookiePrefs } from './CookieBanner';

export default function CookieSettingsButton({ className = '' }: { className?: string }) {
  const [open, setOpen] = React.useState(false);
  const [prefs, setPrefs] = React.useState(getCookiePrefs());

  return (
    <>
      <button onClick={() => setOpen(true)} className={className}>Cookie-instellingen</button>
      {open && (
        <div className="fixed inset-0 z-[95] bg-black/30" onClick={() => setOpen(false)}>
          <div className="absolute inset-x-0 bottom-0 p-4" onClick={(e)=>e.stopPropagation()}>
            <CookieBanner />
          </div>
        </div>
      )}
    </>
  );
}