import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  FileText,
  Cookie,
  UserCheck,
  Download,
  Mail
} from 'lucide-react';
import Button from '../components/ui/Button';

const LegalPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string | null>('privacy');

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-bg py-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-text mb-6">
            Juridische informatie
          </h1>
          <p className="text-xl text-text/80 max-w-3xl mx-auto">
            Transparantie staat centraal bij FitFi. Hier vind je alle juridische documenten en uitleg in begrijpelijke taal.
          </p>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link to="/privacy" className="ff-card p-6">
            <Shield className="w-8 h-8 text-text mb-4" />
            <h3 className="text-lg font-semibold text-text mb-2">Privacybeleid</h3>
            <p className="text-text/70">Lees hoe we met je gegevens omgaan en wat je rechten zijn.</p>
          </Link>

          <Link to="/cookies" className="ff-card p-6">
            <Cookie className="w-8 h-8 text-text mb-4" />
            <h3 className="text-lg font-semibold text-text mb-2">Cookiebeleid</h3>
            <p className="text-text/70">Welke cookies we gebruiken en hoe je je voorkeuren aanpast.</p>
          </Link>

          <Link to="/voorwaarden" className="ff-card p-6">
            <FileText className="w-8 h-8 text-text mb-4" />
            <h3 className="text-lg font-semibold text-text mb-2">Algemene voorwaarden</h3>
            <p className="text-text/70">De spelregels van onze dienst in heldere taal.</p>
          </Link>

          <Link to="/verwerkers" className="ff-card p-6">
            <UserCheck className="w-8 h-8 text-text mb-4" />
            <h3 className="text-lg font-semibold text-text mb-2">Verwerkers</h3>
            <p className="text-text/70">Overzicht van partijen die ons helpen de dienst te leveren.</p>
          </Link>
        </div>

        {/* Download & Contact */}
        <div className="bg-surface border border-border rounded-xl p-6 mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-text">Officiële documenten downloaden</h2>
              <p className="text-text/70">Alle PDF's netjes op een rij. Altijd de meest recente versies.</p>
            </div>
            <div className="flex gap-3">
              <Button className="ff-btn ff-btn-primary" aria-label="Download alle documenten">
                <Download className="w-4 h-4" />
                <span className="ml-2">Download alles</span>
              </Button>
              <Link to="/contact" className="ff-btn ff-btn-secondary">
                <Mail className="w-4 h-4" />
                <span className="ml-2">Vraag het ons</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Accordions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Privacy */}
          <section className="ff-accordion">
            <header
              className="head cursor-pointer select-none"
              onClick={() => toggleSection('privacy')}
            >
              <div>
                <h3 className="title">Privacyverklaring</h3>
                <p className="text-text/70">Wat we verzamelen, waarom, en welke keuzes jij hebt.</p>
              </div>
            </header>
            {activeSection === 'privacy' && (
              <div className="content">
                <p className="mb-4">
                  We verzamelen zo min mogelijk gegevens en gebruiken die uitsluitend om de dienst te laten werken. We verkopen nooit data door.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Rechtsgrond: uitvoering van overeenkomst & legitiem belang</li>
                  <li>Bewaartermijnen: zo kort mogelijk</li>
                  <li>Rechten: inzage, rectificatie, dataportabiliteit, verwijdering</li>
                </ul>
              </div>
            )}
          </section>

          {/* Voorwaarden */}
          <section className="ff-accordion">
            <header
              className="head cursor-pointer select-none"
              onClick={() => toggleSection('terms')}
            >
              <div>
                <h3 className="title">Algemene voorwaarden</h3>
                <p className="text-text/70">De regels die gelden wanneer je FitFi gebruikt.</p>
              </div>
            </header>
            {activeSection === 'terms' && (
              <div className="content">
                <p className="mb-4">
                  We houden het simpel: we leveren een stijladviesdienst op basis van jouw input. Jij behoudt altijd controle.
                </p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Je account is persoonlijk.</li>
                  <li>Misbruik of scraping is niet toegestaan.</li>
                  <li>We kunnen de dienst verbeteren en wijzigen.</li>
                </ol>
              </div>
            )}
          </section>

          {/* Cookies */}
          <section className="ff-accordion">
            <header
              className="head cursor-pointer select-none"
              onClick={() => toggleSection('cookies')}
            >
              <div>
                <h3 className="title">Cookiebeleid</h3>
                <p className="text-text/70">Welke cookies we plaatsen en waarom.</p>
              </div>
            </header>
            {activeSection === 'cookies' && (
              <div className="content">
                <p className="mb-4">
                  We gebruiken functionele cookies voor inloggen en instellingen, en analytische cookies om de app te verbeteren.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Functioneel: sessies, taal, voorkeuren</li>
                  <li>Analytisch: anonieme gebruikspatronen</li>
                  <li>Geen marketing-tracking van derde partijen</li>
                </ul>
              </div>
            )}
          </section>

          {/* Verwerkers */}
          <section className="ff-accordion">
            <header
              className="head cursor-pointer select-none"
              onClick={() => toggleSection('processors')}
            >
              <div>
                <h3 className="title">Verwerkers</h3>
                <p className="text-text/70">De partijen die ons helpen de dienst te leveren.</p>
              </div>
            </header>
            {activeSection === 'processors' && (
              <div className="content">
                <p className="mb-4">
                  We werken met een klein aantal betrouwbare partijen. Met ieder is een verwerkersovereenkomst gesloten.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Hosting & database</li>
                  <li>E-mail en transactieberichten</li>
                  <li>Analytics zonder tracking</li>
                </ul>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;