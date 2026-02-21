import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import {
  Crown, CreditCard, Calendar, AlertCircle, ExternalLink, Loader2,
  CheckCircle, ChevronRight, Lock, Sparkles, Camera, Zap, BookOpen,
  Info, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';

const FREE_FEATURES = [
  { label: 'Stijlprofiel & rapport', included: true },
  { label: '3 outfit-suggesties', included: true },
  { label: 'Basiskleuradvies', included: true },
  { label: 'Onbeperkt outfits', included: false },
  { label: 'Volledige kleuranalyse (foto vereist)', included: false },
  { label: 'Nova AI-stylist', included: false },
  { label: 'Bewaar & organiseer outfits', included: false },
  { label: 'Seizoensupdate elke maand', included: false },
];

const PREMIUM_FEATURES = [
  { label: 'Stijlprofiel & rapport', included: true },
  { label: 'Onbeperkt outfit-suggesties', included: true },
  { label: 'Volledige kleuranalyse (foto vereist)', included: true },
  { label: 'Nova AI-stylist (onbeperkt)', included: true },
  { label: 'Bewaar & organiseer outfits', included: true },
  { label: 'Seizoensupdate elke maand', included: true },
  { label: 'Gepersonaliseerde trendinsights', included: true },
  { label: 'Prioriteitsondersteuning', included: true },
];

function FeatureRow({ label, included }: { label: string; included: boolean }) {
  return (
    <li className="flex items-center gap-3 py-2.5 border-b border-[var(--color-border)] last:border-0">
      {included ? (
        <CheckCircle className="w-4 h-4 text-[var(--ff-color-primary-600)] flex-shrink-0" />
      ) : (
        <Lock className="w-4 h-4 text-[var(--color-muted)] flex-shrink-0" />
      )}
      <span className={cn('text-sm', included ? 'text-[var(--color-text)]' : 'text-[var(--color-muted)]')}>
        {label}
      </span>
      {!included && (
        <span className="ml-auto text-[10px] font-bold uppercase tracking-wide text-[var(--ff-color-primary-600)] bg-[var(--ff-color-primary-50)] px-2 py-0.5 rounded-full">
          Premium
        </span>
      )}
    </li>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    active: { label: 'Actief', cls: 'bg-[var(--ff-color-success-100)] text-[var(--ff-color-success-700)]' },
    trialing: { label: 'Trial', cls: 'bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)]' },
    canceled: { label: 'Geannuleerd', cls: 'bg-[var(--color-surface)] text-[var(--color-muted)] border border-[var(--color-border)]' },
    past_due: { label: 'Betaling achterstallig', cls: 'bg-[var(--ff-color-error-100)] text-[var(--ff-color-error-700)]' },
    incomplete: { label: 'Incompleet', cls: 'bg-[var(--ff-color-warning-100)] text-[var(--ff-color-warning-700)]' },
  };
  const badge = map[status] ?? { label: status, cls: 'bg-[var(--color-surface)] text-[var(--color-muted)]' };
  return (
    <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold', badge.cls)}>
      {status === 'active' && <CheckCircle className="w-3 h-3" />}
      {badge.label}
    </span>
  );
}

export default function SubscriptionManager() {
  const { data: subscriptions, isLoading, refetch } = useSubscription();
  const [processingPortal, setProcessingPortal] = useState(false);
  const [showCancelInfo, setShowCancelInfo] = useState(false);
  const navigate = useNavigate();

  const activeSubscription = subscriptions?.find(
    (sub) => sub.status === 'active' || sub.status === 'trialing'
  );
  const isPremium = !!activeSubscription;
  const isLifetime = activeSubscription?.stripe_products?.interval === 'one_time';

  const handleManageSubscription = async () => {
    setProcessingPortal(true);
    try {
      const client = supabase();
      if (!client) throw new Error('Verbinding niet beschikbaar');
      const { data: { session } } = await client.auth.getSession();
      if (!session) throw new Error('Je moet ingelogd zijn');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-portal-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
        }
      );
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Kon portal sessie niet aanmaken');
      }
      const data = await response.json();
      if (data.url) window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.message || 'Er ging iets mis');
      setProcessingPortal(false);
    }
  };

  const formatDate = (d: string | null) =>
    d
      ? new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
      : '—';

  if (isLoading) {
    return (
      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 animate-pulse">
        <div className="h-6 w-48 bg-[var(--color-border)] rounded mb-4" />
        <div className="h-4 w-full bg-[var(--color-border)] rounded mb-2" />
        <div className="h-4 w-3/4 bg-[var(--color-border)] rounded" />
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {isPremium ? (
            <Crown className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
          ) : (
            <CreditCard className="w-5 h-5 text-[var(--color-muted)]" />
          )}
          <div>
            <h2 className="text-base font-bold text-[var(--color-text)]">Abonnement & facturatie</h2>
            <p className="text-xs text-[var(--color-muted)]">Beheer je abonnement. Bekijk en download je facturen.</p>
          </div>
        </div>
        {isPremium && <StatusBadge status={activeSubscription!.status} />}
      </div>

      <div className="p-6 space-y-6">

        {/* === FREE STATE: upgrade nudge + feature matrix === */}
        {!isPremium && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Current plan */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 mb-5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-bold text-[var(--color-text)]">Huidig plan: Gratis</p>
                <span className="text-xs text-[var(--color-muted)] bg-[var(--color-surface)] border border-[var(--color-border)] px-2.5 py-1 rounded-full font-semibold">
                  Gratis voor altijd
                </span>
              </div>
              <p className="text-xs text-[var(--color-muted)]">
                Je gratis rapport blijft altijd beschikbaar — ook als je niet upgradet. Je kunt altijd opzeggen.
              </p>
            </div>

            {/* Feature matrix */}
            <div className="rounded-xl border border-[var(--color-border)] overflow-hidden mb-5">
              <div className="grid grid-cols-2 divide-x divide-[var(--color-border)]">
                <div className="px-4 py-3 bg-[var(--color-bg)]">
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">Gratis</p>
                </div>
                <div className="px-4 py-3 bg-[var(--ff-color-primary-700)]">
                  <p className="text-xs font-bold uppercase tracking-wide text-white">Premium — €9,99 / mnd</p>
                </div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-[var(--color-border)]">
                <ul className="px-4 py-2">
                  {FREE_FEATURES.map((f) => (
                    <FeatureRow key={f.label} label={f.label} included={f.included} />
                  ))}
                </ul>
                <ul className="px-4 py-2 bg-[var(--ff-color-primary-50)]">
                  {PREMIUM_FEATURES.map((f) => (
                    <li key={f.label} className="flex items-center gap-2.5 py-2.5 border-b border-[var(--ff-color-primary-100)] last:border-0">
                      <CheckCircle className="w-4 h-4 text-[var(--ff-color-primary-600)] flex-shrink-0" />
                      <span className="text-sm text-[var(--color-text)]">{f.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Color analysis note */}
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] mb-5 text-xs text-[var(--color-muted)]">
              <Camera className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                Premium ontgrendelt extra advies — maar kleuranalyse werkt alleen{' '}
                <strong className="text-[var(--color-text)]">met een foto</strong>. Je kleurtype kan niet automatisch worden bepaald zonder selfie.
              </p>
            </div>

            {/* Primary CTA */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/prijzen')}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[var(--ff-color-primary-700)] text-white rounded-xl text-sm font-bold hover:bg-[var(--ff-color-primary-600)] transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Upgrade
              </button>
              <button
                onClick={() => navigate('/resultaten')}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 border border-[var(--color-border)] text-[var(--color-text)] rounded-xl text-sm font-semibold hover:border-[var(--ff-color-primary-400)] transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Bekijk Premium-voorbeeld
              </button>
            </div>
          </motion.div>
        )}

        {/* === PREMIUM STATE === */}
        {isPremium && activeSubscription && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            {/* Plan card */}
            <div className="rounded-xl border border-[var(--ff-color-primary-200)] bg-[var(--ff-color-primary-50)] p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-[var(--ff-color-primary-600)] font-bold uppercase tracking-wide mb-1">
                    {isLifetime ? 'Founder plan' : 'Premium plan'}
                  </p>
                  <h3 className="text-xl font-bold text-[var(--color-text)]">
                    {activeSubscription.stripe_products?.name || 'Premium'}
                  </h3>
                  {activeSubscription.stripe_products?.description && (
                    <p className="text-sm text-[var(--color-muted)] mt-1">
                      {activeSubscription.stripe_products.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Plan details grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-[var(--color-muted)] mb-1">Prijs</p>
                  <p className="font-bold text-[var(--color-text)]">
                    €{activeSubscription.stripe_products?.price ?? '—'}
                    {!isLifetime && ` / ${activeSubscription.stripe_products?.interval === 'month' ? 'maand' : 'jaar'}`}
                    {isLifetime && ' (eenmalig)'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-muted)] mb-1">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    {activeSubscription.cancel_at_period_end ? 'Verloopt op' : isLifetime ? 'Toegang' : 'Vernieuwt op'}
                  </p>
                  <p className="font-bold text-[var(--color-text)]">
                    {isLifetime ? 'Lifetime' : formatDate(activeSubscription.current_period_end)}
                  </p>
                </div>
              </div>
              {!isLifetime && !activeSubscription.cancel_at_period_end && (
                <p className="mt-3 text-xs text-[var(--color-muted)]">Je kunt altijd opzeggen — Premium blijft actief tot het einde van de betaalperiode.</p>
              )}
            </div>

            {/* Cancellation warning */}
            {activeSubscription.cancel_at_period_end && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--ff-color-warning-50)] border border-[var(--ff-color-warning-200)]">
                <AlertCircle className="w-4 h-4 text-[var(--ff-color-warning-600)] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text)]">Opzegging gepland</p>
                  <p className="text-xs text-[var(--color-muted)] mt-0.5">
                    Je abonnement is geannuleerd en blijft actief tot{' '}
                    <strong>{formatDate(activeSubscription.current_period_end)}</strong>.
                    Je gratis rapport blijft daarna beschikbaar.
                  </p>
                </div>
              </div>
            )}

            {/* Included features */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-muted)] mb-3">Inbegrepen in jouw plan</p>
              <ul className="rounded-xl border border-[var(--color-border)] overflow-hidden divide-y divide-[var(--color-border)]">
                {PREMIUM_FEATURES.map((f) => (
                  <li key={f.label} className="flex items-center gap-3 px-4 py-3 bg-[var(--color-bg)]">
                    <CheckCircle className="w-4 h-4 text-[var(--ff-color-primary-600)] flex-shrink-0" />
                    <span className="text-sm text-[var(--color-text)]">{f.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action buttons */}
            {!isLifetime && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleManageSubscription}
                    disabled={processingPortal}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-[var(--ff-color-primary-700)] text-white rounded-xl text-sm font-bold hover:bg-[var(--ff-color-primary-600)] transition-colors disabled:opacity-50"
                  >
                    {processingPortal ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Bezig...</>
                    ) : (
                      <><CreditCard className="w-4 h-4" /> Beheer abonnement</>
                    )}
                  </button>
                  <button
                    onClick={handleManageSubscription}
                    disabled={processingPortal}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-3 border border-[var(--color-border)] text-[var(--color-text)] rounded-xl text-sm font-semibold hover:border-[var(--ff-color-primary-400)] transition-colors disabled:opacity-50"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Download factuur
                  </button>
                </div>
                <p className="text-xs text-[var(--color-muted)] text-center">
                  Facturen en wijzig betaalmethode vind je in de Stripe-portal (opent nieuw venster).
                </p>
              </div>
            )}

            {/* Cancellation info (toggle) */}
            {!isLifetime && !activeSubscription.cancel_at_period_end && (
              <div>
                <button
                  onClick={() => setShowCancelInfo((v) => !v)}
                  className="text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] underline transition-colors flex items-center gap-1"
                >
                  <Info className="w-3 h-3" />
                  Informatie over opzeggen
                  <ChevronRight className={cn('w-3 h-3 transition-transform', showCancelInfo && 'rotate-90')} />
                </button>
                <AnimatePresence>
                  {showCancelInfo && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-muted)] space-y-2">
                        <p>Je kunt op elk moment opzeggen. Na opzegging blijft Premium actief tot het einde van de betaalperiode.</p>
                        <p>Je gratis rapport en stijlprofiel blijven daarna altijd beschikbaar.</p>
                        <p>Opzeggen doe je via de Stripe-portal (knop hierboven). Heb je vragen? <a href="/contact" className="underline text-[var(--ff-color-primary-600)]">Neem contact op.</a></p>
                        <button
                          onClick={handleManageSubscription}
                          disabled={processingPortal}
                          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-xs font-semibold text-[var(--color-muted)] hover:text-[var(--ff-color-error-600)] hover:border-[var(--ff-color-error-300)] transition-colors disabled:opacity-50"
                        >
                          {processingPortal ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                          Annuleer abonnement
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

        {/* Past due warning */}
        {activeSubscription?.status === 'past_due' && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--ff-color-error-50)] border border-[var(--ff-color-error-200)]">
            <AlertCircle className="w-4 h-4 text-[var(--ff-color-error-600)] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[var(--color-text)]">Betaling achterstallig</p>
              <p className="text-xs text-[var(--color-muted)] mt-0.5">Werk je betalingsgegevens bij om toegang te behouden.</p>
              <button
                onClick={handleManageSubscription}
                disabled={processingPortal}
                className="mt-2 text-xs font-semibold text-[var(--ff-color-error-600)] underline"
              >
                Wijzig betaalmethode
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-[var(--color-border)] bg-[var(--color-bg)]">
        <p className="text-xs text-[var(--color-muted)]">
          Vragen? <a href="/contact" className="text-[var(--ff-color-primary-600)] hover:underline">Neem contact op</a> · Betalingen verlopen veilig via Stripe
        </p>
      </div>
    </section>
  );
}
