import React from 'react';

declare global {
  interface Window { __FITFI_FOOTER_MOUNTED?: boolean }
}

/** Ensures the footer mounts only once app-wide. */
export default function FooterGuard({ children }: { children: React.ReactNode }) {
  if (typeof window !== 'undefined') {
    if (window.__FITFI_FOOTER_MOUNTED) return null;
    window.__FITFI_FOOTER_MOUNTED = true;
  }
  return <>{children}</>;
}