import React from 'react';
import { useUser } from '@/context/UserContext';

const NovaLoginPrompt = React.lazy(() => import('@/components/auth/NovaLoginPrompt'));

export default function NovaLoginPromptHost() {
  const { user, status } = useUser();
  const [open, setOpen] = React.useState(false);
  
  // Determine if user is a member (has account = member for now)
  const isMember = status === 'authenticated' && !!user?.id;

  React.useEffect(() => {
    const onPrompt = () => {
      // Toon prompt ALLEEN als niet ingelogd of geen member
      if (!user || !isMember) {
        setOpen(true);
      }
    };
    const handler = onPrompt as unknown as EventListener;
    if (typeof window !== 'undefined') {
      window.addEventListener('nova:prompt-login', handler);
      return () => window.removeEventListener('nova:prompt-login', handler);
    }
    return;
  }, [user, isMember]);

  // Sluit de modal automatisch als de user (nu) member is geworden
  React.useEffect(() => {
    if (open && user && isMember) {
      setOpen(false);
    }
  }, [open, user, isMember]);

  // Esc-key support
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { 
      if (e.key === 'Escape') setOpen(false); 
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Render niks als gebruiker al member is (extra veiligheid)
  if (user && isMember) return null;

  return (
    <React.Suspense fallback={null}>
      <NovaLoginPrompt
        open={open}
        onClose={() => setOpen(false)}
        onSignup={() => {
          setOpen(false);
          window.location.assign('/onboarding');
        }}
        onLogin={() => {
          setOpen(false);
          window.location.assign('/inloggen');
        }}
      />
    </React.Suspense>
  );
}