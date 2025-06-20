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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Juridische informatie
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Transparantie staat centraal bij FitFi. Hier vind je alle juridische documenten en informatie over hoe we met je gegevens omgaan.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center mb-8 gap-2">
          <button
            onClick={() => toggleSection('privacy')}
            className={`px-4 py-2 rounded-full transition-colors ${
              activeSection === 'privacy'
                ? 'bg-orange-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Shield size={16} className="inline mr-2" />
            Privacybeleid
          </button>

          <button
            onClick={() => toggleSection('terms')}
            className={`px-4 py-2 rounded-full transition-colors ${
              activeSection === 'terms'
                ? 'bg-orange-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <FileText size={16} className="inline mr-2" />
            Algemene voorwaarden
          </button>

          <button
            onClick={() => toggleSection('cookies')}
            className={`px-4 py-2 rounded-full transition-colors ${
              activeSection === 'cookies'
                ? 'bg-orange-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Cookie size={16} className="inline mr-2" />
            Cookiebeleid
          </button>

          <button
            onClick={() => toggleSection('gdpr')}
            className={`px-4 py-2 rounded-full transition-colors ${
              activeSection === 'gdpr'
                ? 'bg-orange-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <UserCheck size={16} className="inline mr-2" />
            AVG Compliance
          </button>
        </div>

        {/* Privacy Policy Section */}
        <div className={`mb-8 ${activeSection === 'privacy' ? 'block' : 'hidden'}`}>
          {/* ...privacy policy content... */}
        </div>

        {/* Terms of Service Section */}
        <div className={`mb-8 ${activeSection === 'terms' ? 'block' : 'hidden'}`}>
          {/* ...terms content... */}
        </div>

        {/* Cookie Policy Section */}
        <div className={`mb-8 ${activeSection === 'cookies' ? 'block' : 'hidden'}`}>
          {/* ...cookie policy content... */}
        </div>

        {/* GDPR Compliance Section */}
        <div className={`mb-8 ${activeSection === 'gdpr' ? 'block' : 'hidden'}`}>
          {/* ...gdpr compliance content... */}
        </div>

        {/* Data Request CTA */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-700 dark:to-orange-800 rounded-xl shadow-md overflow-hidden transition-colors mb-16">
          <div className="p-8 md:flex items-center">
            <div className="md:w-2/3 mb-6 md:mb-0 md:pr-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                Wil je je gegevens inzien of verwijderen?
              </h2>
              <p className="text-white/90 mb-0">
                Je hebt altijd recht op inzage, correctie of verwijdering van je persoonlijke gegevens. Gebruik ons AVG-verzoekformulier of neem direct contact op met onze DPO.
              </p>
            </div>
            <div className="md:w-1/3 flex flex-col space-y-3">
              <Button
                as={Link}
                to="/privacy-request"
                variant="secondary"
                className="bg-white text-orange-600 hover:bg-gray-100"
              >
                AVG-verzoek indienen
              </Button>
              <Button
                as="a"
                href="mailto:privacy@fitfi.nl"
                variant="outline"
                className="text-white border-white/30 hover:bg-white/10"
                icon={<Mail size={16} />}
                iconPosition="left"
              >
                Contact DPO
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Juridische documenten
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/documents/privacy-policy.pdf"
              className="bg-white dark:bg-gray-800 p-4 rounded-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Download size={16} className="mr-2 text-orange-500" />
              <span className="text-gray-700 dark:text-gray-300">Privacybeleid</span>
            </a>
            <a
              href="/documents/terms-of-service.pdf"
              className="bg-white dark:bg-gray-800 p-4 rounded-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Download size={16} className="mr-2 text-orange-500" />
              <span className="text-gray-700 dark:text-gray-300">Algemene voorwaarden</span>
            </a>
            <a
              href="/documents/cookie-policy.pdf"
              className="bg-white dark:bg-gray-800 p-4 rounded-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Download size={16} className="mr-2 text-orange-500" />
              <span className="text-gray-700 dark:text-gray-300">Cookiebeleid</span>
            </a>
            <a
              href="/documents/gdpr-compliance.pdf"
              className="bg-white dark:bg-gray-800 p-4 rounded-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Download size={16} className="mr-2 text-orange-500" />
              <span className="text-gray-700 dark:text-gray-300">AVG Compliance</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
