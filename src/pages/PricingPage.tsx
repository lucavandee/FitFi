import React from "react";
import { Helmet } from "react-helmet-async";
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Check, Star, Zap, Crown, Sparkles, ArrowRight } from "lucide-react";
import { Link } from 'react-router-dom';

export default function PricingPage() {
  const freePlanFeatures = [
    "Basis stijlprofiel",
    "5 outfit aanbevelingen",
    "Toegang tot community",
    "E-mail ondersteuning"
  ];

  const premiumPlanFeatures = [
    "Volledig stijlprofiel",
    "Onbeperkte outfit aanbevelingen",
    "AI-stylist Nova toegang",
    "Persoonlijke stijltips",
    "Prioriteit ondersteuning",
    "Exclusieve deals & kortingen",
    "Geavanceerde filters",
    "Outfit geschiedenis"
  ];

  return (
    <main id="main" className="bg-[var(--color-bg)]">
      <Helmet>
        <title>Prijzen - FitFi AI Style Reports</title>
        <meta
          name="description"
          content="Kies het plan dat bij jou past. Altijd transparant, geen verborgen kosten. Start gratis of upgrade naar Premium voor meer functies."
        />
      </Helmet>

      <div className="min-h-screen">
        <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-bg)] via-[var(--color-surface)] to-[var(--color-bg)]">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[var(--ff-color-primary-200)] to-[var(--ff-color-primary-300)] rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-[var(--ff-color-accent-200)] to-[var(--ff-color-accent-300)] rounded-full opacity-20 blur-3xl"></div>
          </div>

          <Container>
            <div className="relative py-24 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-[var(--color-border)] mb-8">
                <Sparkles className="w-4 h-4 text-[var(--ff-color-primary-600)]" />
                <span className="text-sm font-medium text-[var(--color-text)]">Transparante prijzen</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--color-text)] mb-6 leading-tight">
                Eenvoudige prijzen,
                <br />
                <span className="text-[var(--color-text-muted)]">geen verborgen kosten</span>
              </h1>

              <p className="text-lg md:text-xl text-[var(--color-text-muted)] mb-8 max-w-2xl mx-auto leading-relaxed">
                Start gratis en upgrade wanneer je meer functionaliteit wilt. Altijd opzegbaar.
              </p>
            </div>
          </Container>
        </section>

        <section className="py-16">
          <Container>
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
              <div className="bg-[var(--color-surface)] rounded-3xl p-8 border border-[var(--color-border)] hover:border-[var(--ff-color-primary-400)] transition-colors">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-[var(--ff-color-primary-100)] rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-[var(--ff-color-primary-600)]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[var(--color-text)]">Gratis</h2>
                    <p className="text-sm text-[var(--color-text-muted)]">Voor beginners</p>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-bold text-[var(--color-text)]">€0</span>
                    <span className="text-[var(--color-text-muted)]">/maand</span>
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)]">Altijd gratis</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {freePlanFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[var(--ff-color-primary-600)] flex-shrink-0 mt-0.5" />
                      <span className="text-[var(--color-text)]">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button as={Link} to="/quiz" className="w-full bg-[var(--ff-color-primary-700)] text-white">
                  Start gratis <ArrowRight className="w-4 h-4 inline ml-2" />
                </Button>
              </div>

              <div className="bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-700)] rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                    Populair
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Premium</h2>
                    <p className="text-sm text-white/80">Voor stijlexperts</p>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-bold">€9,99</span>
                    <span className="text-white/80">/maand</span>
                  </div>
                  <p className="text-sm text-white/80">Of €99/jaar (2 maanden gratis)</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {premiumPlanFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button as={Link} to="/register" className="w-full bg-white text-[var(--ff-color-primary-700)] hover:bg-white/90">
                  Upgrade naar Premium <Zap className="w-4 h-4 inline ml-2" />
                </Button>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-16 bg-[var(--color-surface)]">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] text-center mb-12">
                Veelgestelde vragen over prijzen
              </h2>

              <div className="space-y-6">
                <div className="bg-[var(--color-bg)] rounded-2xl p-6 border border-[var(--color-border)]">
                  <h3 className="text-lg font-semibold text-[var(--color-text)] mb-3">
                    Kan ik het gratis plan voor altijd gebruiken?
                  </h3>
                  <p className="text-[var(--color-text-muted)]">
                    Ja! Ons gratis plan blijft altijd beschikbaar. Je krijgt toegang tot basis functies zonder tijdslimiet.
                  </p>
                </div>

                <div className="bg-[var(--color-bg)] rounded-2xl p-6 border border-[var(--color-border)]">
                  <h3 className="text-lg font-semibold text-[var(--color-text)] mb-3">
                    Kan ik op elk moment opzeggen?
                  </h3>
                  <p className="text-[var(--color-text-muted)]">
                    Absoluut. Je kunt je Premium abonnement op elk moment opzeggen. Geen verborgen kosten of verplichtingen.
                  </p>
                </div>

                <div className="bg-[var(--color-bg)] rounded-2xl p-6 border border-[var(--color-border)]">
                  <h3 className="text-lg font-semibold text-[var(--color-text)] mb-3">
                    Wat gebeurt er als ik downgrade naar het gratis plan?
                  </h3>
                  <p className="text-[var(--color-text-muted)]">
                    Je behoudt toegang tot je bestaande outfit aanbevelingen, maar nieuwe functies worden beperkt tot het gratis plan.
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-16">
          <Container>
            <div className="bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] rounded-3xl p-12 text-center">
              <Sparkles className="w-12 h-12 text-[var(--ff-color-primary-600)] mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-4">
                Nog vragen over prijzen?
              </h2>
              <p className="text-lg text-[var(--color-text-muted)] mb-8 max-w-2xl mx-auto">
                Ons team staat klaar om je te helpen. Neem contact op voor meer informatie.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button as={Link} to="/contact" variant="secondary">
                  Contact opnemen
                </Button>
                <Button as={Link} to="/faq" variant="secondary">
                  Bekijk alle FAQ's
                </Button>
              </div>
            </div>
          </Container>
        </section>
      </div>
    </main>
  );
}
