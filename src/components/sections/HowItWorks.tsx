import React from 'react';
import { Link } from 'react-router-dom';
import { Wand2, FileText, ShoppingBag } from 'lucide-react';
import { track } from '@/utils/analytics';

interface StepProps {
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  title: string;
  description: string;
}

function Step({ icon: Icon, title, description }: StepProps) {
  return (
    <li className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#89CFF0]/20">
            <Icon className="h-6 w-6 text-[#89CFF0]" aria-hidden="true" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[#0D1B2A] mb-2">{title}</h3>
          <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>
      </div>
    </li>
  );
}

export default function HowItWorks() {
  const handlePrimaryCTA = () => {
    track('hiw_primary_cta_clicked', { 
      location: 'homepage',
      section: 'how_it_works',
      cta_type: 'primary'
    });
  };

  const handleSecondaryCTA = () => {
    track('hiw_secondary_cta_clicked', { 
      location: 'homepage',
      section: 'how_it_works',
      cta_type: 'secondary'
    });
  };

  return (
    <section aria-labelledby="how-it-works-heading" className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
      <div className="text-center mb-12">
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-[#89CFF0]/10 text-[#89CFF0] rounded-full text-sm font-medium">
            Hoe het werkt
          </span>
        </div>
        <h2 id="how-it-works-heading" className="text-3xl md:text-4xl font-light text-[#0D1B2A] mb-4">
          In 3 stappen naar outfits die kloppen
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Van stijltest tot gepersonaliseerde aanbevelingen in slechts een paar minuten
        </p>
      </div>

      <ul className="grid gap-6 md:grid-cols-3 mb-12" role="list">
        <Step
          icon={Wand2}
          title="1. Doe de stijltest"
          description="Beantwoord een paar slimme vragen — Nova leert je stijlvoorkeuren en pasvorm kennen."
        />
        <Step
          icon={FileText}
          title="2. Krijg je AI Style Report"
          description="Bekijk je persoonlijke stijlcode met uitleg waarom bepaalde items bij je passen."
        />
        <Step
          icon={ShoppingBag}
          title="3. Shop de juiste outfits"
          description="Swipe door voorgestelde outfits en klik door naar betrouwbare partner shops."
        />
      </ul>

      <div className="text-center">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/registreren"
            className="inline-flex items-center justify-center rounded-2xl px-8 py-4 text-lg font-semibold text-white bg-[#89CFF0] hover:bg-[#89CFF0]/90 transition-all shadow-[0_8px_30px_rgba(137,207,240,0.35)] hover:shadow-[0_12px_40px_rgba(137,207,240,0.45)] transform hover:scale-105"
            data-analytics="hiw_primary_cta"
            onClick={handlePrimaryCTA}
          >
            Doe de stijltest
          </Link>
          <Link
            to="/hoe-het-werkt"
            className="inline-flex items-center justify-center rounded-2xl px-8 py-4 text-lg font-semibold border-2 border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white transition-all"
            data-analytics="hiw_secondary_cta"
            onClick={handleSecondaryCTA}
          >
            Meer uitleg
          </Link>
        </div>
        
        <p className="text-sm text-gray-500 mt-6">
          Geen creditcard vereist • Privacy gegarandeerd • 2 minuten van je tijd
        </p>
      </div>
    </section>
  );
}