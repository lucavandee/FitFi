import { FOOTER_COLUMNS, FOOTER_CTA, SOCIALS, BRAND } from '@/constants/footer';
import { Mail, ShieldCheck, Sparkles, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const year = new Date().getFullYear();

function Newsletter() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle'|'ok'|'err'>('idle');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!valid) { setState('err'); return; }

    try {
      const r = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'footer' }),
      });
      if (r.ok) setState('ok'); else throw new Error('subscribe failed');
    } catch {
      // Fallback: mailto – altijd functioneel
      window.location.href = `mailto:${BRAND.email}?subject=Aanmelden%20nieuwsbrief&body=${encodeURIComponent(email)}`;
      setState('ok');
    }
  }

  return (
    <div className="rounded-3xl p-6 bg-[#F6F6F6] shadow-[0_8px_30px_rgba(13,27,42,0.06)]">
      <div className="flex items-start gap-3">
        <Sparkles className="w-5 h-5 mt-1" aria-hidden />
        <div className="flex-1">
          <h3 className="text-base font-semibold text-[#0D1B2A]">Ontvang slimme stijltips</h3>
          <p className="text-sm text-slate-600">Max 1× per week. Geen spam. Uitschrijven met 1 klik.</p>
          <form onSubmit={onSubmit} className="mt-3 flex gap-2">
            <label className="sr-only" htmlFor="newsletter-email">E-mail</label>
            <input
              id="newsletter-email"
              type="email"
              inputMode="email"
              required
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              placeholder="jouw@email.nl"
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#89CFF0]"
            />
            <button
              aria-label="Aanmelden nieuwsbrief"
              className="rounded-xl px-5 py-3 font-semibold text-slate-900 bg-[#9BD4F4] hover:bg-[#8ac8ea] transition shadow-[0_8px_30px_rgba(137,207,240,0.35)]"
            >
              Aanmelden
            </button>
          </form>
          {state==='ok' && (
            <p className="mt-2 text-sm text-green-700 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" />Ingeschreven — bedankt!</p>
          )}
          {state==='err' && (
            <p className="mt-2 text-sm text-red-700">Ongeldig e-mailadres. Probeer opnieuw.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function TrustBadges() {
  const badges = useMemo(()=>[
    { icon: Lock, text: 'Privacy-first (AVG)' },
    { icon: ShieldCheck, text: 'Beveiligd met SSL' },
    { icon: Sparkles, text: 'AI-uitleg bij elke outfit' },
  ],[]);
  return (
    <ul className="flex flex-wrap gap-3">
      {badges.map(({icon:Icon, text})=>(
        <li key={text} className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-slate-200 px-3 py-2 text-sm text-slate-700">
          <Icon className="w-4 h-4" aria-hidden />
          <span>{text}</span>
        </li>
      ))}
    </ul>
  );
}

function Socials() {
  const visible = SOCIALS.filter(s => !!s.url);
  if (visible.length === 0) return null;
  return (
    <div className="flex items-center gap-4">
      {visible.map(s => (
        <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.name}
           className="text-slate-600 hover:text-slate-900 transition">
          {s.name}
        </a>
      ))}
    </div>
  );
}

export default function PremiumFooter() {
  return (
    <footer className="mt-24 border-t border-slate-200 bg-white">
      {/* Top CTA strip */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="my-10 rounded-3xl bg-white shadow-[0_8px_30px_rgba(13,27,42,0.06)] p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <p className="text-sm font-medium text-[#0D1B2A]">Gratis AI Style Report</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#0D1B2A] leading-tight">
              Ontdek jouw beste outfits — in 2 minuten.
            </h2>
            <p className="text-slate-600 mt-1">Persoonlijk, uitleg bij elke keuze, direct shopbaar.</p>
          </div>
          <div className="flex gap-3">
            <Link to={FOOTER_CTA.href}
                  className="rounded-2xl px-6 py-4 font-semibold text-slate-900 bg-[#9BD4F4] hover:bg-[#8ac8ea] transition shadow-[0_8px_30px_rgba(137,207,240,0.35)] inline-flex items-center gap-2"
                  data-analytics="footer_cta_primary">
              {FOOTER_CTA.label} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-12">
        <div className="grid gap-10 md:grid-cols-5">
          {/* Brand + trust + newsletter */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div aria-hidden className="w-7 h-7 rounded-xl bg-[#9BD4F4]" />
              <span className="text-xl font-extrabold text-[#0D1B2A]">{BRAND.name}</span>
            </div>
            <p className="mt-3 text-slate-700">{BRAND.tagline}</p>
            <div className="mt-4"><TrustBadges /></div>
            <div className="mt-6"><Newsletter /></div>
          </div>

          {/* Link columns */}
          {FOOTER_COLUMNS.map(col=>(
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-sm font-semibold text-[#0D1B2A]">{col.title}</h3>
              <ul className="mt-3 space-y-2">
                {col.links.map(l=>(
                  <li key={l.href}>
                    <Link to={l.href} className="text-slate-600 hover:text-slate-900 transition">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-slate-200 pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="text-sm text-slate-600">
            © {year} {BRAND.name}. Alle rechten voorbehouden.
          </p>
          <div className="flex items-center gap-5">
            <a className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900" href={`mailto:${BRAND.email}`}>
              <Mail className="w-4 h-4" /> {BRAND.email}
            </a>
            <Socials />
          </div>
        </div>
      </div>
    </footer>
  );
}