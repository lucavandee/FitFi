import React from 'react';
import AppPortal from '@/components/layout/AppPortal';
import { Sparkles } from 'lucide-react';
import { useUser } from '@/context/UserContext';

export default function NovaLauncher() {
  const { user } = useUser();

  const onOpen = () => {
    if (!user) {
      window.dispatchEvent(new CustomEvent('nova:prompt-login'));
    } else {
      window.dispatchEvent(new CustomEvent('nova:open'));
    }
  };

  return (
    <AppPortal id="nova-launcher">
      <button
        aria-label="Open Nova chat"
        onClick={onOpen}
        className="fixed right-4 bottom-4 sm:right-6 sm:bottom-6 z-[60] rounded-full bg-[#89CFF0] text-white shadow-[0_10px_30px_rgba(137,207,240,0.35)] p-4 btn-animate focus-ring"
      >
        <Sparkles className="w-5 h-5" />
      </button>
    </AppPortal>
  );
}