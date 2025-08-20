import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Inline analytics fallback (use existing @/utils/analytics if available)
let track = (event: string, props: any = {}) => {
  try {
    const w: any = window;
    if (typeof w.gtag === 'function') {
      w.gtag('event', event, props);
    } else if (typeof w.plausible === 'function') {
      w.plausible(event, { props });
    } else if (import.meta.env.DEV) {
      console.info('[analytics]', event, props);
    }
  } catch {}
};

export default function StickyCTA() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById('hero-sentinel');
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky CTA when hero sentinel is NOT intersecting (hero scrolled out of view)
        setShow(!entry.isIntersecting);
      },
      {
        rootMargin: '0px',
        threshold: 0
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const handleStickyCTAClick = () => {
    track('sticky_cta_clicked', {
      location: 'sticky_cta',
      section: 'mobile_bottom',
      cta_type: 'primary'
    });
  };

  return (
    <div
      className={[
        "md:hidden fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-out",
        show ? "translate-y-0" : "translate-y-full"
      ].join(' ')}
      aria-hidden={!show}
    >
      <div className="mx-auto max-w-7xl px-4 pb-4">
        <div className="rounded-2xl bg-[#0D1B2A] shadow-[0_8px_30px_rgba(13,27,42,0.35)] p-3 backdrop-blur-sm">
          <Link
            to="/registreren"
            onClick={handleStickyCTAClick}
            className="block w-full text-center rounded-xl px-4 py-3 font-semibold text-[#0D1B2A] bg-[#89CFF0] hover:bg-[#89CFF0]/90 transition-all shadow-sm hover:shadow-md transform hover:scale-105"
            aria-label="Start de stijltest - Sticky CTA"
            data-analytics="sticky_cta"
          >
            Start de stijltest
          </Link>
          
          {/* Trust indicator */}
          <p className="text-center text-xs text-white/80 mt-2">
            Gratis • 2 minuten • Direct resultaat
          </p>
        </div>
      </div>
    </div>
  );
}