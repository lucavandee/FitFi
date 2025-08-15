import React from 'react';

const NovaLoginPrompt = React.lazy(() => import('@/components/auth/NovaLoginPrompt'));

export default function NovaLoginPromptHost() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onPrompt = () => setOpen(true);
    const handler = onPrompt as unknown as EventListener;
    if (typeof window !== 'undefined') {
      window.addEventListener('nova:prompt-login', handler);
      return () => window.removeEventListener('nova:prompt-login', handler);
    }
    return;
  }, []);

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