import React from "react";
import { Helmet } from "react-helmet-async";
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Check } from "lucide-react";
import { Link } from 'react-router-dom';

export default function PricingPage() {
  return (
    <main id="main" className="bg-[var(--color-bg)]">
      <Helmet>
        <title>Prijzen - FitFi.ai</title>
        <meta name="description" content="Kies het plan dat bij jou past." />
      </Helmet>
      <div className="min-h-screen py-24">
        <Container>
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6">Eenvoudige Prijzen</h1>
            <p className="text-xl text-[var(--color-text-muted)]">
              Start gratis, upgrade wanneer je klaar bent.
            </p>
          </div>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            <div className="bg-[var(--color-surface)] rounded-2xl p-8 border border-[var(--color-border)]">
              <h2 className="text-2xl font-bold mb-4">Gratis</h2>
              <p className="text-[var(--color-text-muted)] mb-6">Probeer FitFi.ai gratis</p>
              <Button as={Link} to="/quiz" className="w-full bg-[var(--ff-color-primary-700)] text-white">
                Start gratis
              </Button>
            </div>
            <div className="bg-[var(--color-surface)] rounded-2xl p-8 border border-[var(--ff-color-primary-600)]">
              <h2 className="text-2xl font-bold mb-4">Premium</h2>
              <p className="text-[var(--color-text-muted)] mb-6">Alle functies ontgrendeld</p>
              <Button as={Link} to="/register" className="w-full bg-[var(--ff-color-primary-700)] text-white">
                Upgrade naar Premium
              </Button>
            </div>
          </div>
        </Container>
      </div>
    </main>
  );
}
