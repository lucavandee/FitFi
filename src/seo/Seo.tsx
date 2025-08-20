import { useEffect } from 'react';

type MetaArgs = {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  noindex?: boolean;
  jsonLd?: Record<string, any>[]; // inject multiple LD+JSON blocks
};

// helpers
function setMeta(name: string, content: string) {
  if (!content) return;
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
  el.setAttribute('content', content);
}

function setOG(property: string, content: string) {
  if (!content) return;
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute('property', property); document.head.appendChild(el); }
  el.setAttribute('content', content);
}

function setTwitter(name: string, content: string) {
  if (!content) return;
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
  el.setAttribute('content', content);
}

function setCanonical(href: string) {
  if (!href) return;
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) { el = document.createElement('link'); el.setAttribute('rel', 'canonical'); document.head.appendChild(el); }
  el.setAttribute('href', href);
}

function addJsonLd(obj: Record<string, any>) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(obj);
  document.head.appendChild(script);
  return () => { try { document.head.removeChild(script); } catch {} };
}

export default function Seo({ title, description, canonical, image, noindex, jsonLd }: MetaArgs) {
  useEffect(() => {
    if (title) document.title = title;
    if (description) setMeta('description', description);
    if (canonical) setCanonical(canonical);
    if (noindex) { 
      setMeta('robots', 'noindex,nofollow'); 
    } else {
      // ensure we don't accidentally keep noindex across navigations
      const robots = document.querySelector('meta[name="robots"]'); 
      if (robots) robots.remove();
    }
    
    const img = image || '/og/og-default.svg';
    setOG('og:title', title || 'FitFi — Persoonlijke stijl. Aangedreven door AI.');
    setOG('og:description', description || 'Doe de slimme stijltest en ontvang je persoonlijke AI Style Report.');
    setOG('og:url', canonical || window.location.href);
    setOG('og:image', img);
    setTwitter('twitter:title', title || 'FitFi — Persoonlijke stijl. Aangedreven door AI.');
    setTwitter('twitter:description', description || 'Doe de slimme stijltest en ontvang je persoonlijke AI Style Report.');
    setTwitter('twitter:image', img);

    // JSON-LD blocks
    const cleanups: (() => void)[] = [];
    (jsonLd ?? []).forEach(obj => cleanups.push(addJsonLd(obj)));
    return () => cleanups.forEach(fn => fn());
  }, [title, description, canonical, image, noindex, JSON.stringify(jsonLd)]);

  return null;
}