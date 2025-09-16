import React from "react";

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacybeleid</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-8">
              Laatst bijgewerkt: {new Date().toLocaleDateString('nl-NL')}
            </p>
            
            <h2>1. Inleiding</h2>
            <p>
              FitFi ("wij", "ons", "onze") respecteert uw privacy en is toegewijd aan het beschermen 
              van uw persoonlijke gegevens. Dit privacybeleid legt uit hoe wij uw persoonlijke 
              informatie verzamelen, gebruiken en beschermen wanneer u onze diensten gebruikt.
            </p>
            
            <h2>2. Welke gegevens verzamelen wij</h2>
            <p>Wij verzamelen de volgende soorten informatie:</p>
            <ul>
              <li><strong>Profielinformatie:</strong> Naam, e-mailadres, geslacht, leeftijd</li>
              <li><strong>Stijlvoorkeuren:</strong> Antwoorden op onze stijlquiz</li>
              <li><strong>Gebruiksgegevens:</strong> Hoe u onze website en diensten gebruikt</li>
              <li><strong>Technische gegevens:</strong> IP-adres, browsertype, apparaatinformatie</li>
            </ul>
            
            <h2>3. Hoe wij uw gegevens gebruiken</h2>
            <p>Wij gebruiken uw gegevens voor:</p>
            <ul>
              <li>Het leveren van gepersonaliseerde stijlaanbevelingen</li>
              <li>Het verbeteren van onze diensten en algoritmes</li>
              <li>Communicatie over uw account en onze diensten</li>
              <li>Het naleven van wettelijke verplichtingen</li>
            </ul>
            
            <h2>4. Gegevens delen</h2>
            <p>
              Wij verkopen uw persoonlijke gegevens nooit aan derden. Wij kunnen uw gegevens 
              alleen delen met:
            </p>
            <ul>
              <li>Vertrouwde serviceproviders die ons helpen onze diensten te leveren</li>
              <li>Wetshandhavingsinstanties wanneer wettelijk vereist</li>
            </ul>
            
            <h2>5. Uw rechten</h2>
            <p>Onder de AVG heeft u het recht om:</p>
            <ul>
              <li>Toegang te vragen tot uw persoonlijke gegevens</li>
              <li>Correctie van onjuiste gegevens te vragen</li>
              <li>Verwijdering van uw gegevens te vragen</li>
              <li>Bezwaar te maken tegen verwerking</li>
              <li>Uw gegevens over te dragen</li>
            </ul>
            
            <h2>6. Beveiliging</h2>
            <p>
              Wij implementeren passende technische en organisatorische maatregelen om uw 
              persoonlijke gegevens te beschermen tegen ongeautoriseerde toegang, wijziging, 
              openbaarmaking of vernietiging.
            </p>
            
            <h2>7. Contact</h2>
            <p>
              Voor vragen over dit privacybeleid kunt u contact met ons opnemen via 
              privacy@fitfi.nl of via ons contactformulier.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;