import React from "react";

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Algemene Voorwaarden</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-8">
              Laatst bijgewerkt: {new Date().toLocaleDateString('nl-NL')}
            </p>
            
            <h2>1. Definities</h2>
            <p>
              In deze algemene voorwaarden wordt verstaan onder:
            </p>
            <ul>
              <li><strong>FitFi:</strong> De dienstverlener</li>
              <li><strong>Gebruiker:</strong> Degene die gebruik maakt van de diensten</li>
              <li><strong>Diensten:</strong> Alle door FitFi aangeboden diensten</li>
            </ul>
            
            <h2>2. Toepasselijkheid</h2>
            <p>
              Deze algemene voorwaarden zijn van toepassing op alle aanbiedingen, 
              overeenkomsten en dienstverlening door FitFi, tenzij uitdrukkelijk 
              schriftelijk anders overeengekomen.
            </p>
            
            <h2>3. Diensten</h2>
            <p>
              FitFi biedt AI-gedreven stijladvies en outfit-aanbevelingen. Wij streven 
              ernaar om nauwkeurige en relevante aanbevelingen te geven, maar kunnen 
              niet garanderen dat deze altijd aan uw verwachtingen voldoen.
            </p>
            
            <h2>4. Gebruikersaccount</h2>
            <p>
              Voor het gebruik van bepaalde diensten is een account vereist. U bent 
              verantwoordelijk voor het geheim houden van uw inloggegevens en alle 
              activiteiten die onder uw account plaatsvinden.
            </p>
            
            <h2>5. Betaling</h2>
            <p>
              Betalingen voor premium diensten worden vooraf gefactureerd. Alle prijzen 
              zijn inclusief BTW tenzij anders vermeld. Abonnementen worden automatisch 
              verlengd tenzij opgezegd.
            </p>
            
            <h2>6. Intellectueel eigendom</h2>
            <p>
              Alle intellectuele eigendomsrechten op de website, diensten en content 
              berusten bij FitFi of haar licentiegevers. Het is niet toegestaan om 
              content te kopiëren zonder toestemming.
            </p>
            
            <h2>7. Aansprakelijkheid</h2>
            <p>
              FitFi is niet aansprakelijk voor indirecte schade of gevolgschade. 
              Onze aansprakelijkheid is beperkt tot het bedrag dat u in de 12 maanden 
              voorafgaand aan de schade heeft betaald.
            </p>
            
            <h2>8. Opzegging</h2>
            <p>
              U kunt uw account op elk moment opzeggen. Wij behouden ons het recht voor 
              om accounts op te zeggen bij misbruik van onze diensten.
            </p>
            
            <h2>9. Wijzigingen</h2>
            <p>
              Wij kunnen deze voorwaarden wijzigen. Wijzigingen worden van kracht 
              30 dagen na publicatie op onze website.
            </p>
            
            <h2>10. Toepasselijk recht</h2>
            <p>
              Op deze voorwaarden is Nederlands recht van toepassing. Geschillen 
              worden voorgelegd aan de bevoegde rechter in Nederland.
            </p>
            
            <h2>11. Contact</h2>
            <p>
              Voor vragen over deze voorwaarden kunt u contact opnemen via 
              legal@fitfi.nl.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;