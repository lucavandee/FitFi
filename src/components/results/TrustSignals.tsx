import React from 'react';
import { ShieldCheck, Truck, RefreshCcw, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

interface TrustSignal {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const trustSignals: TrustSignal[] = [
  {
    icon: <Truck className="w-5 h-5" aria-hidden="true" />,
    title: 'Gratis verzending',
    description: 'Op alle outfits boven €50'
  },
  {
    icon: <RefreshCcw className="w-5 h-5" aria-hidden="true" />,
    title: '30 dagen retour',
    description: 'Niet tevreden? Geld terug'
  },
  {
    icon: <ShieldCheck className="w-5 h-5" aria-hidden="true" />,
    title: 'Veilig betalen',
    description: 'iDeal, creditcard, PayPal'
  },
  {
    icon: <CreditCard className="w-5 h-5" aria-hidden="true" />,
    title: 'Achteraf betalen',
    description: 'Via Klarna of in3'
  }
];

export function TrustSignals() {
  return (
    <div className="bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] rounded-2xl border border-[var(--ff-color-primary-200)] p-6 sm:p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {trustSignals.map((signal, index) => (
          <motion.div
            key={signal.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="flex items-start gap-3"
          >
            <div
              className="flex-shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center text-[var(--ff-color-primary-600)] shadow-sm"
              aria-hidden="true"
            >
              {signal.icon}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text)] mb-0.5">
                {signal.title}
              </h3>
              <p className="text-xs text-[var(--color-muted)] leading-relaxed">
                {signal.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
