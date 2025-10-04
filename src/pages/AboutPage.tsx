import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <main id="main" className="bg-[var(--color-bg)]">
      <Helmet>
        <title>Over ons - FitFi.ai</title>
        <meta name="description" content="Ontdek het verhaal achter FitFi.ai" />
      </Helmet>
      <div className="min-h-screen py-24">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Over <span className="text-[var(--ff-color-primary-600)]">FitFi.ai</span>
            </h1>
            <p className="text-xl text-[var(--color-text-muted)] mb-8">
              Wij helpen je jouw perfecte stijl te ontdekken.
            </p>
            <Button as={Link} to="/quiz" className="bg-[var(--ff-color-primary-700)] text-white">
              Start gratis <ArrowRight className="w-4 h-4 inline ml-2" />
            </Button>
          </div>
        </Container>
      </div>
    </main>
  );
}
