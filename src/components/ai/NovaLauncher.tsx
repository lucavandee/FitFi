import React from 'react';
import AppPortal from '@/components/layout/AppPortal';
import { Sparkles } from 'lucide-react';
import { useUser } from '@/context/UserContext';

export default function NovaLauncher() {
  const { user, status } = useUser();
  
  // Determine if user is a member (has account = member for now)
  const isMember = status === 'authenticated' && !!user?.id;

  const handleOpen = () => {
    // Niet ingelogd of geen member? -> prompt login
    if (!user || !isMember) {
      window.dispatchEvent(new Event('nova:prompt-login'));
      return;
    }

    // Wel member -> open chat
    window.dispatchEvent(new Event('nova:open'));
  };

  const onOpen = () => {
    // Pak user/member uit context
    const { user, status } = useUser();
    const isMember = status === 'authenticated' && !!user?.id;

    // Niet ingelogd of geen member? -> prompt login
    if (!user || !isMember) {
      window.dispatchEvent(new Event('nova:prompt-login'));
      return;
    }

    // Wel member -> open chat
    window.dispatchEvent(new Event('nova:open'));
  };

  const handleClick = () => {
    // Use the safer handleOpen function
    if (!user || !isMember) {
      window.dispatchEvent(new Event('nova:prompt-login'));
    } else {
      window.dispatchEvent(new Event('nova:open'));
    }
  };

  return (
    <AppPortal id="nova-launcher">
      <button
        aria-label="Open Nova chat"
        onClick={handleClick}
        className="fixed right-4 bottom-4 sm:right-6 sm:bottom-6 z-[60] rounded-full bg-[#89CFF0] text-white shadow-[0_10px_30px_rgba(137,207,240,0.35)] p-4 btn-animate focus-ring"
      >
        <Sparkles className="w-5 h-5" />
      </button>
    </AppPortal>
  );
}