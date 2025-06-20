import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  FileText, 
  Cookie, 
  UserCheck, 
  ChevronDown, 
  ChevronUp, 
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

        {/* Privacy Policy */}
        <div className={`mb-8 ${activeSection === 'privacy' ? 'block' : 'hidden'}`}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-colors">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full mr-4">
                    <Shield className="text-orange-500" size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Privacybeleid
                  </h2>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Laatst bijgewerkt: 15 april 2025
                </div>
              </div>
              
              <div className="prose prose-orange dark:prose-invert max-w-none">
                <p>
                  Bij FitFi nemen we je privacy zeer serieus. Dit privacybeleid beschrijft welke gegevens we verzamelen, hoe we deze gebruiken en beschermen, en welke rechten je hebt met betrekking tot je persoonlijke gegevens.
                </p>
                
                <h3>Welke gegevens verzamelen we?</h3>
                <p>
                  We verzamelen de volgende categorieën persoonlijke gegevens:
                </p>
                <ul>
                  <li><strong>Accountgegevens:</strong> Naam, e-mailadres, wachtwoord (versleuteld) en profielinformatie.</li>
                  <li><strong>Stijlvoorkeuren:</strong> Antwoorden op onze stijlvragenlijst, kledingmaten en kleurvoorkeuren.</li>
                  <li><strong>Foto's:</strong> Optionele foto's die je uploadt voor stijlanalyse.</li>
                  <li><strong>Gebruiksgegevens:</strong> Hoe je onze diensten gebruikt, welke aanbevelingen je bekijkt en opslaat.</li>
                  <li><strong>Apparaatgegevens:</strong> IP-adres, browsertype, apparaattype en besturingssysteem.</li>
                </ul>
                
                <h3>Hoe gebruiken we je gegevens?</h3>
                <p>
                  We gebruiken je gegevens voor de volgende doeleinden:
                </p>
                <ul>
                  <li>Het leveren en personaliseren van onze diensten.</li>
                  <li>Het genereren van gepersonaliseerde stijlaanbevelingen.</li>
                  <li>Het verbeteren van onze algoritmen en diensten.</li>
                  <li>Het communiceren over updates, aanbiedingen en nieuwe functies.</li>
                  <li>Het beveiligen van je account en onze systemen.</li>
                </ul>
                
                <h3>Hoe beschermen we je gegevens?</h3>
                <p>
                  We nemen uitgebreide maatregelen om je gegevens te beschermen:
                </p>
                <ul>
                  <li>End-to-end encryptie voor alle gevoelige gegevens.</li>
                  <li>Strikte toegangscontroles voor medewerkers.</li>
                  <li>Regelmatige beveiligingsaudits en updates.</li>
                  <li>Gegevensminimalisatie en -retentiebeleid.</li>
                </ul>
                
                <h3>Delen van gegevens</h3>
                <p>
                  We delen je gegevens nooit met derden zonder je expliciete toestemming, behalve in de volgende gevallen:
                </p>
                <ul>
                  <li>Met serviceproviders die ons helpen onze diensten te leveren (onder strikte gegevensbeschermingsovereenkomsten).</li>
                  <li>Wanneer wettelijk vereist door een gerechtelijk bevel of juridische procedure.</li>
                  <li>In geanonimiseerde of geaggregeerde vorm die niet tot jou kan worden herleid.</li>
                </ul>
                
                <h3>Je rechten</h3>
                <p>
                  Onder de AVG/GDPR heb je de volgende rechten:
                </p>
                <ul>
                  <li>Recht op inzage in je persoonlijke gegevens.</li>
                  <li>Recht op rectificatie van onjuiste gegevens.</li>
                  <li>Recht op verwijdering van je gegevens ("recht om vergeten te worden").</li>
                  <li>Recht op beperking van de verwerking.</li>
                  <li>Recht op gegevensoverdraagbaarheid.</li>
                  <li>Recht om bezwaar te maken tegen verwerking.</li>
                </ul>
                
                <p>
                  Je kunt deze rechten uitoefenen via je accountinstellingen of door contact op te nemen met onze privacyfunctionaris via privacy@fitfi.nl.
                </p>
                
                <h3>Cookies en tracking</h3>
                <p>
                  We gebruiken cookies en vergelijkbare technologieën om je ervaring te verbeteren, je voorkeuren te onthouden en geaggregeerde gebruiksstatistieken te verzamelen. Meer informatie vind je in ons Cookiebeleid.
                </p>
                
                <h3>Wijzigingen in dit beleid</h3>
                <p>
                  We kunnen dit privacybeleid van tijd tot tijd bijwerken. We zullen je op de hoogte stellen van belangrijke wijzigingen via e-mail of een melding in de app.
                </p>
                
                <h3>Contact</h3>
                <p>
                  Als je vragen hebt over ons privacybeleid of hoe we met je gegevens omgaan, neem dan contact op met onze privacyfunctionaris via privacy@fitfi.nl.
                </p>
              </div>
              
              <div className="mt-8 flex justify-center">
                <Button 
                  variant="outline"
                  icon={<Download size={16} />}
                  iconPosition="left"
                >
                  Download volledig privacybeleid (PDF)
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Terms of Service */}
        <div className={`mb-8 ${activeSection === 'terms' ? 'block' : 'hidden'}`}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-colors">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full mr-4">
                    <FileText className="text-blue-500" size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Algemene voorwaarden
                  </h2>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Laatst bijgewerkt: 10 april 2025
                </div>
              </div>
              
              <div className="prose prose-blue dark:prose-invert max-w-none">
                <p>
                  Deze algemene voorwaarden ("Voorwaarden") zijn van toepassing op je gebruik van de FitFi-website, mobiele applicatie en gerelateerde diensten (gezamenlijk de "Dienst"). Door de Dienst te gebruiken, ga je akkoord met deze Voorwaarden.
                </p>
                
                <h3>1. Acceptatie van voorwaarden</h3>
                <p>
                  Door de Dienst te gebruiken, ga je akkoord met deze Voorwaarden. Als je niet akkoord gaat met deze Voorwaarden, gebruik de Dienst dan niet.
                </p>
                
                <h3>2. Beschrijving van de dienst</h3>
                <p>
                  FitFi biedt een AI-gestuurde stijladviesservice die gepersonaliseerde kledingaanbevelingen genereert op basis van je voorkeuren, foto's en andere informatie die je verstrekt.
                </p>
                
                <h3>3. Accountregistratie</h3>
                <p>
                  Om de Dienst te gebruiken, moet je een account aanmaken. Je bent verantwoordelijk voor het handhaven van de vertrouwelijkheid van je accountgegevens en voor alle activiteiten die onder je account plaatsvinden.
                </p>
                
                <h3>4. Gebruiksvoorwaarden</h3>
                <p>
                  Je stemt ermee in de Dienst niet te gebruiken voor:
                </p>
                <ul>
                  <li>Illegale activiteiten of het schenden van rechten van derden.</li>
                  <li>Het uploaden van ongepaste, beledigende of schadelijke inhoud.</li>
                  <li>Het verzamelen van gegevens van andere gebruikers zonder toestemming.</li>
                  <li>Het verstoren of beschadigen van de Dienst of servers.</li>
                </ul>
                
                <h3>5. Intellectuele eigendom</h3>
                <p>
                  Alle inhoud, functies en functionaliteit van de Dienst zijn eigendom van FitFi of haar licentiegevers en worden beschermd door internationale auteursrechten, handelsmerken, patenten, handelsgeheimen en andere intellectuele eigendomsrechten.
                </p>
                
                <h3>6. Abonnementen en betalingen</h3>
                <p>
                  FitFi biedt verschillende abonnementsplannen. Door je te abonneren, ga je akkoord met de volgende voorwaarden:
                </p>
                <ul>
                  <li>Je wordt gefactureerd aan het begin van elke factureringsperiode.</li>
                  <li>Abonnementen worden automatisch verlengd tenzij je opzegt.</li>
                  <li>Je kunt op elk moment opzeggen, maar restitutie wordt alleen verleend in overeenstemming met ons restitutiebeleid.</li>
                </ul>
                
                <h3>7. Aansprakelijkheidsbeperking</h3>
                <p>
                  FitFi is niet aansprakelijk voor indirecte, incidentele, speciale, gevolgschade of punitieve schade, inclusief winstderving, die voortvloeit uit je gebruik van de Dienst.
                </p>
                
                <h3>8. Vrijwaring</h3>
                <p>
                  Je stemt ermee in FitFi, haar dochterondernemingen, gelieerde bedrijven en licentiegevers te vrijwaren, verdedigen en schadeloos te stellen van en tegen alle claims, aansprakelijkheden, schade, verliezen en kosten die voortvloeien uit je gebruik van de Dienst.
                </p>
                
                <h3>9. Wijzigingen in de dienst en voorwaarden</h3>
                <p>
                  We behouden ons het recht voor om de Dienst en deze Voorwaarden op elk moment te wijzigen of te beëindigen. We zullen je op de hoogte stellen van belangrijke wijzigingen.
                </p>
                
                <h3>10. Toepasselijk recht</h3>
                <p>
                  Deze Voorwaarden worden beheerst door en geïnterpreteerd in overeenstemming met de Nederlandse wetgeving, zonder rekening te houden met conflicterende wettelijke bepalingen.
                </p>
                
                <h3>11. Contact</h3>
                <p>
                  Als je vragen hebt over deze Voorwaarden, neem dan contact met ons op via legal@fitfi.nl.
                </p>
              </div>
              
              <div className="mt-8 flex justify-center">
                <Button 
                  variant="outline"
                  icon={<Download size={16} />}
                  iconPosition="left"
                >
                  Download volledige voorwaarden (PDF)
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Cookie Policy */}
        <div className={`mb-8 ${activeSection === 'cookies' ? 'block' : 'hidden'}`}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-colors">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full mr-4">
                    <Cookie className="text-purple-500" size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Cookiebeleid
                  </h2>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Laatst bijgewerkt: 5 april 2025
                </div>
              </div>
              
              <div className="prose prose-purple dark:prose-invert max-w-none">
                <p>
                  Dit Cookiebeleid legt uit hoe FitFi ("wij", "ons", "onze") cookies en vergelijkbare technologieën gebruikt om je te herkennen wanneer je onze website en app gebruikt. Het legt uit wat deze technologieën zijn en waarom we ze gebruiken, evenals je rechten om ons gebruik van cookies te beheren.
                </p>
                
                <h3>Wat zijn cookies?</h3>
                <p>
                  Cookies zijn kleine tekstbestanden die op je apparaat worden geplaatst wanneer je onze website bezoekt. Ze worden veel gebruikt om websites efficiënter te laten werken en om informatie te verstrekken aan de eigenaren van de website.
                </p>
                
                <h3>Welke cookies gebruiken we?</h3>
                <p>
                  We gebruiken de volgende soorten cookies:
                </p>
                <ul>
                  <li><strong>Noodzakelijke cookies:</strong> Deze cookies zijn essentieel om je in staat te stellen door de website te navigeren en de functies te gebruiken, zoals toegang tot beveiligde gebieden.</li>
                  <li><strong>Prestatiecookies:</strong> Deze cookies verzamelen informatie over hoe bezoekers onze website gebruiken, bijvoorbeeld welke pagina's ze het vaakst bezoeken. Deze cookies verzamelen geen informatie die een bezoeker identificeert.</li>
                  <li><strong>Functionaliteitscookies:</strong> Deze cookies stellen de website in staat om verbeterde functionaliteit en personalisatie te bieden, zoals het onthouden van je voorkeuren.</li>
                  <li><strong>Targetingcookies:</strong> Deze cookies worden gebruikt om advertenties relevanter te maken voor jou en je interesses.</li>
                </ul>
                
                <h3>Specifieke cookies die we gebruiken</h3>
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left">Naam</th>
                      <th className="px-4 py-2 text-left">Doel</th>
                      <th className="px-4 py-2 text-left">Duur</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-4 py-2">session_id</td>
                      <td className="px-4 py-2">Houdt je sessie actief</td>
                      <td className="px-4 py-2">Sessie</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">preferences</td>
                      <td className="px-4 py-2">Slaat je voorkeuren op</td>
                      <td className="px-4 py-2">1 jaar</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">analytics_id</td>
                      <td className="px-4 py-2">Verzamelt anonieme gebruiksstatistieken</td>
                      <td className="px-4 py-2">2 jaar</td>
                    </tr>
                  </tbody>
                </table>
                
                <h3>Hoe beheer je cookies?</h3>
                <p>
                  Je kunt je browser instellen om cookies te weigeren of om je te waarschuwen wanneer websites cookies proberen te plaatsen of openen. Je kunt ook je cookievoorkeuren beheren via onze cookiebanner.
                </p>
                <p>
                  Als je cookies uitschakelt of weigert, kunnen sommige delen van de website mogelijk niet goed werken.
                </p>
                
                <h3>Wijzigingen in ons cookiebeleid</h3>
                <p>
                  We kunnen dit Cookiebeleid van tijd tot tijd bijwerken. We zullen je op de hoogte stellen van belangrijke wijzigingen door een melding op onze website te plaatsen.
                </p>
                
                <h3>Contact</h3>
                <p>
                  Als je vragen hebt over ons gebruik van cookies, neem dan contact met ons op via privacy@fitfi.nl.
                </p>
              </div>
              
              <div className="mt-8 flex justify-center">
                <Button 
                  variant="outline"
                  icon={<Download size={16} />}
                  iconPosition="left"
                >
                  Download volledig cookiebeleid (PDF)
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* GDPR Compliance */}
        <div className={`mb-8 ${activeSection === 'gdpr' ? 'block' : 'hidden'}`}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-colors">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full mr-4">
                    <UserCheck className="text-green-500" size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    AVG Compliance
                  </h2>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Laatst bijgewerkt: 1 april 2025
                </div>
              </div>
              
              <div className="prose prose-green dark:prose-invert max-w-none">
                <p>
                  FitFi is volledig toegewijd aan het naleven van de Algemene Verordening Gegevensbescherming (AVG) van de Europese Unie. Dit document beschrijft hoe we voldoen aan de AVG-vereisten en hoe we je rechten beschermen.
                </p>
                
                <h3>Onze AVG-toewijding</h3>
                <p>
                  Als verwerkingsverantwoordelijke van je persoonlijke gegevens, nemen we de volgende maatregelen om aan de AVG te voldoen:
                </p>
                <ul>
                  <li>We verzamelen en verwerken gegevens alleen met een geldige wettelijke basis.</li>
                  <li>We zijn transparant over welke gegevens we verzamelen en hoe we deze gebruiken.</li>
                  <li>We implementeren robuuste beveiligingsmaatregelen om je gegevens te beschermen.</li>
                  <li>We respecteren en faciliteren je rechten onder de AVG.</li>
                  <li>We werken alleen samen met partners die ook aan de AVG voldoen.</li>
                </ul>
                
                <h3>Je rechten onder de AVG</h3>
                <p>
                  Als gebruiker van FitFi heb je de volgende rechten:
                </p>
                <ul>
                  <li><strong>Recht op inzage:</strong> Je kunt een kopie opvragen van alle persoonlijke gegevens die we over je hebben.</li>
                  <li><strong>Recht op rectificatie:</strong> Je kunt verzoeken om onjuiste of onvolledige gegevens te corrigeren.</li>
                  <li><strong>Recht op verwijdering:</strong> Je kunt verzoeken om al je persoonlijke gegevens te verwijderen ("recht om vergeten te worden").</li>
                  <li><strong>Recht op beperking van verwerking:</strong> Je kunt verzoeken om de verwerking van je gegevens te beperken onder bepaalde omstandigheden.</li>
                  <li><strong>Recht op gegevensoverdraagbaarheid:</strong> Je kunt verzoeken om je gegevens in een gestructureerd, veelgebruikt en machineleesbaar formaat te ontvangen.</li>
                  <li><strong>Recht van bezwaar:</strong> Je kunt bezwaar maken tegen de verwerking van je gegevens voor bepaalde doeleinden.</li>
                  <li><strong>Recht met betrekking tot geautomatiseerde besluitvorming:</strong> Je hebt het recht niet onderworpen te worden aan besluitvorming die uitsluitend is gebaseerd op geautomatiseerde verwerking, inclusief profilering, die rechtsgevolgen heeft of je aanzienlijk treft.</li>
                </ul>
                
                <h3>Hoe je je rechten kunt uitoefenen</h3>
                <p>
                  Je kunt je AVG-rechten op de volgende manieren uitoefenen:
                </p>
                <ul>
                  <li><strong>Via je account:</strong> De meeste rechten kun je direct uitoefenen via je accountinstellingen onder 'Privacy'.</li>
                  <li><strong>Contact met onze DPO:</strong> Voor complexere verzoeken kun je contact opnemen met onze Data Protection Officer via privacy@fitfi.nl.</li>
                  <li><strong>Formeel verzoek:</strong> Je kunt een formeel verzoek indienen via ons <a href="/privacy-request" className=\"text-orange-500 hover:text-orange-600">AVG-verzoekformulier</a>.</li>
                </ul>
                
                <h3>Gegevensbeschermingseffectbeoordeling (DPIA)</h3>
                <p>
                  We voeren regelmatig Data Protection Impact Assessments uit om de risico's van onze gegevensverwerking te evalueren en te minimaliseren, vooral met betrekking tot onze AI-algoritmen en fotoverwerking.
                </p>
                
                <h3>Internationale gegevensoverdrachten</h3>
                <p>
                  Als we je gegevens buiten de EER overdragen, zorgen we ervoor dat er passende waarborgen zijn, zoals:
                </p>
                <ul>
                  <li>Overdracht naar landen met een adequaatheidsbesluit van de Europese Commissie.</li>
                  <li>Gebruik van door de EU goedgekeurde standaardcontractbepalingen.</li>
                  <li>Implementatie van bindende bedrijfsvoorschriften voor interne overdrachten.</li>
                </ul>
                
                <h3>Datalekken</h3>
                <p>
                  In het onwaarschijnlijke geval van een datalek dat een risico vormt voor je rechten en vrijheden, zullen we:
                </p>
                <ul>
                  <li>Je zonder onnodige vertraging op de hoogte stellen.</li>
                  <li>De relevante toezichthoudende autoriteit binnen 72 uur informeren.</li>
                  <li>Samenwerken met autoriteiten om de impact te minimaliseren.</li>
                </ul>
                
                <h3>Contact met onze DPO</h3>
                <p>
                  Onze Data Protection Officer is bereikbaar via:
                </p>
                <p>
                  E-mail: privacy@fitfi.nl<br />
                  Post: FitFi B.V., t.a.v. DPO, Herengracht 123, 1015 BS Amsterdam
                </p>
                
                <h3>Klachten</h3>
                <p>
                  Als je niet tevreden bent met hoe we met je gegevens omgaan, heb je het recht om een klacht in te dienen bij de Autoriteit Persoonsgegevens of een andere relevante toezichthoudende autoriteit.
                </p>
              </div>
              
              <div className="mt-8 flex justify-center">
                <Button 
                  variant="outline"
                  icon={<Download size={16} />}
                  iconPosition="left"
                >
                  Download AVG-documentatie (PDF)
                </Button>
              </div>
            </div>
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