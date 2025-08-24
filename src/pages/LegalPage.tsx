import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  FileText,
  Cookie,
  UserCheck,
  Download,
  Mail,
} from "lucide-react";
import Button from "../components/ui/Button";

const LegalPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string | null>("privacy");

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
            Transparantie staat centraal bij FitFi. Hier vind je alle juridische
            documenten en informatie over hoe we met je gegevens omgaan.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center mb-8 gap-2">
          <button
            onClick={() => toggleSection("privacy")}
            className={`px-4 py-2 rounded-full transition-colors ${
              activeSection === "privacy"
                ? "bg-orange-500 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <Shield size={16} className="inline mr-2" />
            Privacybeleid
          </button>

          <button
            onClick={() => toggleSection("terms")}
            className={`px-4 py-2 rounded-full transition-colors ${
              activeSection === "terms"
                ? "bg-orange-500 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <FileText size={16} className="inline mr-2" />
            Algemene voorwaarden
          </button>

          <button
            onClick={() => toggleSection("cookies")}
            className={`px-4 py-2 rounded-full transition-colors ${
              activeSection === "cookies"
                ? "bg-orange-500 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <Cookie size={16} className="inline mr-2" />
            Cookiebeleid
          </button>

          <button
            onClick={() => toggleSection("gdpr")}
            className={`px-4 py-2 rounded-full transition-colors ${
              activeSection === "gdpr"
                ? "bg-orange-500 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <UserCheck size={16} className="inline mr-2" />
            AVG Compliance
          </button>
        </div>

        {/* Privacy Policy Section */}
        <div
          className={`mb-8 ${activeSection === "privacy" ? "block" : "hidden"}`}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Privacybeleid
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Bij FitFi hechten we grote waarde aan de bescherming van je
              persoonsgegevens. In dit privacybeleid willen we heldere en
              transparante informatie geven over hoe wij omgaan met
              persoonsgegevens.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Wij doen er alles aan om je privacy te waarborgen en gaan daarom
              zorgvuldig om met persoonsgegevens. FitFi houdt zich in alle
              gevallen aan de toepasselijke wet- en regelgeving, waaronder de
              Algemene Verordening Gegevensbescherming (AVG).
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
              Welke gegevens verzamelen we?
            </h3>
            <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 mb-4">
              <li>Persoonlijke identificatiegegevens (naam, e-mailadres)</li>
              <li>Stijlvoorkeuren en antwoorden op onze vragenlijsten</li>
              <li>Foto's die je uploadt voor stijlanalyse</li>
              <li>Gebruiksgegevens en interacties met onze dienst</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
              Hoe gebruiken we je gegevens?
            </h3>
            <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 mb-4">
              <li>Om je persoonlijke stijladvies te geven</li>
              <li>Om onze diensten te verbeteren</li>
              <li>
                Om je te informeren over relevante updates of aanbiedingen
              </li>
              <li>Om je account te beheren</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
              Hoe beschermen we je gegevens?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We nemen de bescherming van je gegevens serieus en nemen passende
              maatregelen om misbruik, verlies, onbevoegde toegang, ongewenste
              openbaarmaking en ongeoorloofde wijziging tegen te gaan. Als je de
              indruk hebt dat je gegevens niet goed beveiligd zijn of er
              aanwijzingen zijn van misbruik, neem dan contact op via
              privacy@fitfi.nl.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
              Je rechten
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Je hebt het recht om je persoonsgegevens in te zien, te corrigeren
              of te verwijderen. Daarnaast heb je het recht om je eventuele
              toestemming voor de gegevensverwerking in te trekken of bezwaar te
              maken tegen de verwerking van je persoonsgegevens door FitFi.
            </p>
          </div>
        </div>

        {/* Terms of Service Section */}
        <div
          className={`mb-8 ${activeSection === "terms" ? "block" : "hidden"}`}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Algemene voorwaarden
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Deze algemene voorwaarden zijn van toepassing op alle
              overeenkomsten tussen FitFi en gebruikers van onze diensten. Door
              gebruik te maken van onze diensten ga je akkoord met deze
              voorwaarden.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
              Dienstverlening
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              FitFi biedt een platform voor AI-gestuurde stijladvies en
              kledingaanbevelingen. We streven ernaar om accurate en nuttige
              aanbevelingen te doen, maar kunnen niet garanderen dat alle
              aanbevelingen perfect aansluiten bij je persoonlijke smaak of
              behoeften.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
              Gebruiksvoorwaarden
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Je mag onze diensten alleen gebruiken voor legitieme doeleinden en
              in overeenstemming met deze voorwaarden. Je bent verantwoordelijk
              voor alle activiteiten die plaatsvinden onder je account.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
              Intellectueel eigendom
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Alle content op het FitFi-platform, inclusief tekst, afbeeldingen,
              logo's en software, is eigendom van FitFi of onze licentiegevers
              en wordt beschermd door intellectuele eigendomsrechten.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
              Aansprakelijkheid
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              FitFi is niet aansprakelijk voor indirecte, incidentele, speciale
              of gevolgschade die voortvloeit uit of verband houdt met het
              gebruik van onze diensten.
            </p>
          </div>
        </div>

        {/* Cookie Policy Section */}
        <div
          className={`mb-8 ${activeSection === "cookies" ? "block" : "hidden"}`}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Cookiebeleid
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              FitFi gebruikt cookies en vergelijkbare technologieën om je de
              best mogelijke ervaring te bieden en onze diensten te verbeteren.
              Dit cookiebeleid legt uit hoe en waarom we cookies gebruiken.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
              Wat zijn cookies?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Cookies zijn kleine tekstbestanden die op je apparaat worden
              opgeslagen wanneer je onze website bezoekt. Ze helpen ons om je
              voorkeuren te onthouden, je gebruik van onze website te begrijpen
              en je relevante advertenties te tonen.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
              Welke cookies gebruiken we?
            </h3>
            <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 mb-4">
              <li>
                <strong>Noodzakelijke cookies:</strong> Deze zijn essentieel
                voor het functioneren van onze website.
              </li>
              <li>
                <strong>Voorkeurscookies:</strong> Deze helpen ons om je
                voorkeuren en instellingen te onthouden.
              </li>
              <li>
                <strong>Analytische cookies:</strong> Deze helpen ons te
                begrijpen hoe bezoekers onze website gebruiken.
              </li>
              <li>
                <strong>Marketing cookies:</strong> Deze worden gebruikt om
                advertenties relevanter te maken voor jou.
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
              Je cookievoorkeuren beheren
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Je kunt je cookievoorkeuren op elk moment wijzigen door je
              browserinstellingen aan te passen. Houd er rekening mee dat het
              uitschakelen van bepaalde cookies de functionaliteit van onze
              website kan beïnvloeden.
            </p>
          </div>
        </div>

        {/* GDPR Compliance Section */}
        <div
          className={`mb-8 ${activeSection === "gdpr" ? "block" : "hidden"}`}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              AVG Compliance
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              FitFi is volledig compliant met de Algemene Verordening
              Gegevensbescherming (AVG) en respecteert alle rechten van
              betrokkenen zoals vastgelegd in deze wetgeving.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
              Je rechten onder de AVG
            </h3>
            <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 mb-4">
              <li>
                <strong>Recht op inzage:</strong> Je hebt het recht om te weten
                welke persoonsgegevens wij van je verwerken.
              </li>
              <li>
                <strong>Recht op rectificatie:</strong> Je hebt het recht om
                onjuiste persoonsgegevens te laten corrigeren.
              </li>
              <li>
                <strong>Recht op vergetelheid:</strong> Je hebt het recht om je
                persoonsgegevens te laten verwijderen.
              </li>
              <li>
                <strong>Recht op beperking van de verwerking:</strong> Je hebt
                het recht om de verwerking van je persoonsgegevens te beperken.
              </li>
              <li>
                <strong>Recht op dataportabiliteit:</strong> Je hebt het recht
                om je persoonsgegevens in een gestructureerd, gangbaar en
                machineleesbaar formaat te ontvangen.
              </li>
              <li>
                <strong>Recht van bezwaar:</strong> Je hebt het recht om bezwaar
                te maken tegen de verwerking van je persoonsgegevens.
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
              Hoe kun je je rechten uitoefenen?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Je kunt je rechten uitoefenen door contact met ons op te nemen via
              privacy@fitfi.nl. We zullen je verzoek binnen 30 dagen
              beantwoorden.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
              Gegevensbeschermingsautoriteit
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Als je niet tevreden bent met hoe wij omgaan met je
              persoonsgegevens, heb je het recht om een klacht in te dienen bij
              de Autoriteit Persoonsgegevens.
            </p>
          </div>
        </div>

        {/* Data Request CTA */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-700 dark:to-orange-800 rounded-xl shadow-md overflow-hidden transition-colors mb-16">
          <div className="p-8 md:flex items-center">
            <div className="md:w-2/3 mb-6 md:mb-0 md:pr-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                Wil je je gegevens inzien of verwijderen?
              </h2>
              <p className="text-white/90 mb-0">
                Je hebt altijd recht op inzage, correctie of verwijdering van je
                persoonlijke gegevens. Gebruik ons AVG-verzoekformulier of neem
                direct contact op met onze DPO.
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
              <span className="text-gray-700 dark:text-gray-300">
                Privacybeleid
              </span>
            </a>
            <a
              href="/documents/terms-of-service.pdf"
              className="bg-white dark:bg-gray-800 p-4 rounded-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Download size={16} className="mr-2 text-orange-500" />
              <span className="text-gray-700 dark:text-gray-300">
                Algemene voorwaarden
              </span>
            </a>
            <a
              href="/documents/cookie-policy.pdf"
              className="bg-white dark:bg-gray-800 p-4 rounded-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Download size={16} className="mr-2 text-orange-500" />
              <span className="text-gray-700 dark:text-gray-300">
                Cookiebeleid
              </span>
            </a>
            <a
              href="/documents/gdpr-compliance.pdf"
              className="bg-white dark:bg-gray-800 p-4 rounded-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Download size={16} className="mr-2 text-orange-500" />
              <span className="text-gray-700 dark:text-gray-300">
                AVG Compliance
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
