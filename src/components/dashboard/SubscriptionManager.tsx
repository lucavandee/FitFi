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
    <li className="flex items-center gap-3 py-2.5 border-b border-[#E5E5E5] last:border-0">
      {included ? (
        <CheckCircle className="w-4 h-4 text-[#C2654A] flex-shrink-0" />
      ) : (
        <Lock className="w-4 h-4 text-[#8A8A8A] flex-shrink-0" />
      )}
      <span className={cn('text-sm', included ? 'text-[#1A1A1A]' : 'text-[#8A8A8A]')}>
        {label}
      </span>
      {!included && (
        <span className="ml-auto text-[10px] font-bold uppercase tracking-wide text-[#C2654A] bg-[#FAF5F2] px-2 py-0.5 rounded-full">
          Premium
        </span>
      )}
    </li>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    active: { label: 'Actief', cls: 'bg-[#ECFDF5] text-[#0A6E40]' },
    trialing: { label: 'Trial', cls: 'bg-[#FAF5F2] text-[#A8513A]' },
    canceled: { label: 'Geannuleerd', cls: 'bg-[#FFFFFF] text-[#8A8A8A] border border-[#E5E5E5]' },
    past_due: { label: 'Betaling achterstallig', cls: 'bg-[#FEF2F2] text-[#B91C1C]' },
    incomplete: { label: 'Incompleet', cls: 'bg-[#FEFCE8] text-[#B06020]' },
  };
  const badge = map[status] ?? { label: status, cls: 'bg-[#FFFFFF] text-[#8A8A8A]' };
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
      <section className="rounded-xl border border-[#E5E5E5] bg-[#FFFFFF] p-6 animate-pulse">
        <div className="h-6 w-48 bg-[#E5E5E5] rounded mb-4" />
        <div className="h-4 w-full bg-[#E5E5E5] rounded mb-2" />
        <div className="h-4 w-3/4 bg-[#E5E5E5] rounded" />
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-[#E5E5E5] bg-[#FFFFFF] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {isPremium ? (
            <Crown className="w-5 h-5 text-[#C2654A]" />
          ) : (
            <CreditCard className="w-5 h-5 text-[#8A8A8A]" />
          )}
          <div>
            <h2 className="text-base font-bold text-[#1A1A1A]">Abonnement & facturatie</h2>
            <p className="text-xs text-[#8A8A8A]">Beheer je abonnement. Bekijk en download je facturen.</p>
          </div>
        </div>
        {isPremium && <StatusBadge status={activeSubscription!.status} />}
      </div>

      <div className="p-6 space-y-6">

        {/* === FREE STATE: upgrade nudge + feature matrix === */}
        {!isPremium && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Current plan */}
            <div className="rounded-xl border border-[#E5E5E5] bg-[#FAFAF8] p-4 mb-5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-bold text-[#1A1A1A]">Huidig plan: Gratis</p>
                <span className="text-xs text-[#8A8A8A] bg-[#FFFFFF] border border-[#E5E5E5] px-2.5 py-1 rounded-full font-semibold">
                  Gratis voor altijd
                </span>
              </div>
              <p className="text-xs text-[#8A8A8A]">
                Je gratis rapport blijft altijd beschikbaar — ook als je niet upgradet. Je kunt altijd opzeggen.
              </p>
            </div>

            {/* Feature matrix */}
            <div className="rounded-xl border border-[#E5E5E5] overflow-hidden mb-5">
              <div className="grid grid-cols-2 divide-x divide-[#E5E5E5]">
                <div className="px-4 py-3 bg-[#FAFAF8]">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#8A8A8A]">Gratis</p>
                </div>
                <div className="px-4 py-3 bg-[#A8513A]">
                  <p className="text-xs font-bold uppercase tracking-wide text-white">Premium — €9,99 / mnd</p>
                </div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-[#E5E5E5]">
                <ul className="px-4 py-2">
                  {FREE_FEATURES.map((f) => (
                    <FeatureRow key={f.label} label={f.label} included={f.included} />
                  ))}
                </ul>
                <ul className="px-4 py-2 bg-[#FAF5F2]">
                  {PREMIUM_FEATURES.map((f) => (
                    <li key={f.label} className="flex items-center gap-2.5 py-2.5 border-b border-[#FAF5F2] last:border-0">
                      <CheckCircle className="w-4 h-4 text-[#C2654A] flex-shrink-0" />
                      <span className="text-sm text-[#1A1A1A]">{f.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Color analysis note */}
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[#FFFFFF] border border-[#E5E5E5] mb-5 text-xs text-[#8A8A8A]">
              <Camera className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                Premium geeft extra advies — maar kleuranalyse werkt alleen{' '}
                <strong className="text-[#1A1A1A]">met een foto</strong>. Je kleurtype kan niet automatisch worden bepaald zonder selfie.
              </p>
            </div>

            {/* Primary CTA */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/prijzen')}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#A8513A] text-white rounded-xl text-sm font-bold hover:bg-[#C2654A] transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Upgrade
              </button>
              <button
                onClick={() => navigate('/resultaten')}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 border border-[#E5E5E5] text-[#1A1A1A] rounded-xl text-sm font-semibold hover:border-[#D4856E] transition-colors"
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
            <div className="rounded-xl border border-[#F4E8E3] bg-[#FAF5F2] p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-[#C2654A] font-bold uppercase tracking-wide mb-1">
                    {isLifetime ? 'Founder plan' : 'Premium plan'}
                  </p>
                  <h3 className="text-xl font-bold text-[#1A1A1A]">
                    {activeSubscription.stripe_products?.name || 'Premium'}
                  </h3>
                  {activeSubscription.stripe_products?.description && (
                    <p className="text-sm text-[#8A8A8A] mt-1">
                      {activeSubscription.stripe_products.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Plan details grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-[#8A8A8A] mb-1">Prijs</p>
                  <p className="font-bold text-[#1A1A1A]">
                    €{activeSubscription.stripe_products?.price ?? '—'}
                    {!isLifetime && ` / ${activeSubscription.stripe_products?.interval === 'month' ? 'maand' : 'jaar'}`}
                    {isLifetime && ' (eenmalig)'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#8A8A8A] mb-1">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    {activeSubscription.cancel_at_period_end ? 'Verloopt op' : isLifetime ? 'Toegang' : 'Vernieuwt op'}
                  </p>
                  <p className="font-bold text-[#1A1A1A]">
                    {isLifetime ? 'Lifetime' : formatDate(activeSubscription.current_period_end)}
                  </p>
                </div>
              </div>
              {!isLifetime && !activeSubscription.cancel_at_period_end && (
                <p className="mt-3 text-xs text-[#8A8A8A]">Je kunt altijd opzeggen — Premium blijft actief tot het einde van de betaalperiode.</p>
              )}
            </div>

            {/* Cancellation warning */}
            {activeSubscription.cancel_at_period_end && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]">
                <AlertCircle className="w-4 h-4 text-[#D4913D] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-[#1A1A1A]">Opzegging gepland</p>
                  <p className="text-xs text-[#8A8A8A] mt-0.5">
                    Je abonnement is geannuleerd en blijft actief tot{' '}
                    <strong>{formatDate(activeSubscription.current_period_end)}</strong>.
                    Je gratis rapport blijft daarna beschikbaar.
                  </p>
                </div>
              </div>
            )}

            {/* Included features */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#8A8A8A] mb-3">Inbegrepen in jouw plan</p>
              <ul className="rounded-xl border border-[#E5E5E5] overflow-hidden divide-y divide-[#E5E5E5]">
                {PREMIUM_FEATURES.map((f) => (
                  <li key={f.label} className="flex items-center gap-3 px-4 py-3 bg-[#FAFAF8]">
                    <CheckCircle className="w-4 h-4 text-[#C2654A] flex-shrink-0" />
                    <span className="text-sm text-[#1A1A1A]">{f.label}</span>
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
                    className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-[#A8513A] text-white rounded-xl text-sm font-bold hover:bg-[#C2654A] transition-colors disabled:opacity-50"
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
                    className="flex-1 inline-flex items-center justify-center gap-2 py-3 border border-[#E5E5E5] text-[#1A1A1A] rounded-xl text-sm font-semibold hover:border-[#D4856E] transition-colors disabled:opacity-50"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Download factuur
                  </button>
                </div>
                <p className="text-xs text-[#8A8A8A] text-center">
                  Facturen en wijzig betaalmethode vind je in de Stripe-portal (opent nieuw venster).
                </p>
              </div>
            )}

            {/* Cancellation info (toggle) */}
            {!isLifetime && !activeSubscription.cancel_at_period_end && (
              <div>
                <button
                  onClick={() => setShowCancelInfo((v) => !v)}
                  className="text-xs text-[#8A8A8A] hover:text-[#1A1A1A] underline transition-colors flex items-center gap-1"
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
                      <div className="mt-3 p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E5] text-xs text-[#8A8A8A] space-y-2">
                        <p>Je kunt op elk moment opzeggen. Na opzegging blijft Premium actief tot het einde van de betaalperiode.</p>
                        <p>Je gratis rapport en stijlprofiel blijven daarna altijd beschikbaar.</p>
                        <p>Opzeggen doe je via de Stripe-portal (knop hierboven). Heb je vragen? <a href="/contact" className="underline text-[#C2654A]">Neem contact op.</a></p>
                        <button
                          onClick={handleManageSubscription}
                          disabled={processingPortal}
                          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E5E5] text-xs font-semibold text-[#8A8A8A] hover:text-[#C24A4A] hover:border-[#FCA5A5] transition-colors disabled:opacity-50"
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
          <div className="flex items-start gap-3 p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA]">
            <AlertCircle className="w-4 h-4 text-[#C24A4A] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#1A1A1A]">Betaling achterstallig</p>
              <p className="text-xs text-[#8A8A8A] mt-0.5">Werk je betalingsgegevens bij om toegang te behouden.</p>
              <button
                onClick={handleManageSubscription}
                disabled={processingPortal}
                className="mt-2 text-xs font-semibold text-[#C24A4A] underline"
              >
                Wijzig betaalmethode
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-[#E5E5E5] bg-[#FAFAF8]">
        <p className="text-xs text-[#8A8A8A]">
          Vragen? <a href="/contact" className="text-[#C2654A] hover:underline">Neem contact op</a> · Betalingen verlopen veilig via Stripe
        </p>
      </div>
    </section>
  );
}
