import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, HelpCircle } from 'lucide-react';
import SubscriptionManager from '@/components/dashboard/SubscriptionManager';
import { canonicalUrl } from '@/utils/urls';

export default function BillingPage() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Abonnement & facturatie | FitFi</title>
        <meta name="description" content="Beheer je FitFi-abonnement, bekijk je plan en download facturen." />
        <link rel="canonical" href={canonicalUrl('/account/billing')} />
      </Helmet>

      <div className="ff-container max-w-2xl py-8 sm:py-12">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Terug
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p className="text-sm text-[var(--color-muted)] mb-1">Accountinstellingen</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] tracking-tight mb-2">
            Abonnement & facturatie
          </h1>
          <p className="text-sm text-[var(--color-muted)]">
            Beheer je abonnement. Bekijk en download je facturen.
            Je kunt altijd opzeggen — zonder gedoe.
          </p>
        </motion.div>

        {/* Main subscription widget */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <SubscriptionManager />
        </motion.div>

        {/* Trust notes */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-muted)]">
            <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              Betalingen verlopen veilig via <strong className="text-[var(--color-text)]">Stripe</strong>.
              FitFi slaat geen betaalgegevens op. Facturen en betalingen vind je in de Stripe-portal.
            </p>
          </div>
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-muted)]">
            <HelpCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              Vragen over je abonnement?{' '}
              <a href="/contact" className="underline text-[var(--ff-color-primary-600)] hover:no-underline">
                Neem contact op
              </a>{' '}
              — we helpen je graag verder.
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
