import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Shield, Download, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { ErrorBoundary } from '../components/ErrorBoundary';

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <Helmet>
        <title>Privacybeleid - Hoe we omgaan met jouw gegevens | FitFi</title>
        <meta name="description" content="Lees ons privacybeleid en ontdek hoe FitFi omgaat met jouw persoonlijke gegevens. Transparant, veilig en AVG-compliant." />
        <meta property="og:title" content="Privacybeleid - Hoe we omgaan met jouw gegevens" />
        <meta property="og:description" content="Transparant, veilig en AVG-compliant gegevensbeheer bij FitFi." />
        <link rel="canonical" href="https://fitfi.ai/privacy" />
      </Helmet>

      <div className="max-w-4xl mx-auto py-12 px-4 md:px-8 lg:px-16">
        {/* Header */}
        <ErrorBoundary>
          <div className="mb-8">
            <Link 
              to="/" 
              className="inline-flex items-center text-[#89CFF0] hover:text-[#89CFF0]/80 transition-colors mb-6"
            >
              <ArrowLeft size={20} className="mr-2" />
              Terug naar home
            </Link>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-[#89CFF0]/20 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-[#89CFF0]" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-light text-[#0D1B2A]">Privacybeleid</h1>
                    <p className="text-gray-600">Hoe we omgaan met jouw gegevens</p>
                  </div>
                </div>
              </div>
              
              <Button
                as="a"
                href="/documents/privacy-policy.pdf"
                variant="outline"
                icon={<Download size={16} />}
                iconPosition="left"
                className="border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white"
              >
                Download PDF
              </Button>
            </div>
          </div>
        </ErrorBoundary>

        {/* Content */}
        <ErrorBoundary>
          <div className="bg-white rounded-3xl shadow-sm p-8 md:p-12">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-gray-700 mb-8">
                <strong>Laatst bijgewerkt:</strong> 28 januari 2025
              </p>

              <h2>1. Inleiding</h2>
              <p>
                Bij FitFi hechten we grote waarde aan de bescherming van je persoonsgegevens. In dit privacybeleid 
                willen we heldere en transparante informatie geven over hoe wij omgaan met persoonsgegevens.
              </p>
              <p>
                Wij doen er alles aan om je privacy te waarborgen en gaan daarom zorgvuldig om met persoonsgegevens. 
                FitFi houdt zich in alle gevallen aan de toepasselijke wet- en regelgeving, waaronder de Algemene 
                Verordening Gegevensbescherming (AVG).
              </p>

              <h2>2. Welke gegevens verzamelen we?</h2>
              <h3>2.1 Persoonlijke identificatiegegevens</h3>
              <ul>
                <li>Naam en e-mailadres</li>
                <li>Geslacht en leeftijd (optioneel)</li>
                <li>Profielfoto (optioneel)</li>
              </ul>

              <h3>2.2 Stijlvoorkeuren en gedrag</h3>
              <ul>
                <li>Antwoorden op onze stijlvragenlijsten</li>
                <li>Foto's die je uploadt voor stijlanalyse</li>
                <li>Interacties met aanbevelingen (likes, saves, clicks)</li>
                <li>Gebruiksgegevens en navigatiepatronen</li>
              </ul>

              <h3>2.3 Technische gegevens</h3>
              <ul>
                <li>IP-adres en browserinformatie</li>
                <li>Apparaattype en besturingssysteem</li>
                <li>Cookies en vergelijkbare technologieën</li>
              </ul>

              <h2>3. Hoe gebruiken we je gegevens?</h2>
              <h3>3.1 Primaire doeleinden</h3>
              <ul>
                <li><strong>Stijladvies:</strong> Om je persoonlijke stijlaanbevelingen te geven</li>
                <li><strong>Servicelevering:</strong> Om onze diensten te leveren en te verbeteren</li>
                <li><strong>Accountbeheer:</strong> Om je account te beheren en ondersteuning te bieden</li>
              </ul>

              <h3>3.2 Secundaire doeleinden</h3>
              <ul>
                <li><strong>Communicatie:</strong> Om je te informeren over updates of aanbiedingen</li>
                <li><strong>Analyse:</strong> Om onze diensten te analyseren en verbeteren</li>
                <li><strong>Marketing:</strong> Om relevante content en aanbiedingen te tonen</li>
              </ul>

              <h2>4. Je rechten</h2>
              <p>
                Je hebt het recht om je persoonsgegevens in te zien, te corrigeren of te verwijderen. 
                Daarnaast heb je het recht om je eventuele toestemming voor de gegevensverwerking in te trekken 
                of bezwaar te maken tegen de verwerking van je persoonsgegevens door FitFi.
              </p>

              <h2>5. Contact</h2>
              <p>
                Voor vragen over dit privacybeleid kun je contact opnemen met:
              </p>
              <div className="bg-[#89CFF0]/10 rounded-xl p-6 not-prose">
                <p className="font-medium text-[#0D1B2A] mb-2">FitFi B.V.</p>
                <p className="text-gray-700">E-mail: info@fitfi.ai</p>
                <p className="text-gray-700">Adres: Marktstraat 15D, 7551 DR Hengelo</p>
                <p className="text-gray-700">Telefoon: +31 6 203 709 68</p>
              </div>
            </div>
          </div>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default PrivacyPage;