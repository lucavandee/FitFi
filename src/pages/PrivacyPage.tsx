function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-heading font-bold mb-8 text-midnight">
            Privacybeleid
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Laatst bijgewerkt: {new Date().toLocaleDateString('nl-NL')}
            </p>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Gegevensverzameling</h2>
              <p className="text-gray-600">
                FitFi verzamelt alleen de gegevens die nodig zijn om onze service te leveren.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Gebruik van gegevens</h2>
              <p className="text-gray-600">
                Jouw gegevens worden gebruikt om gepersonaliseerde stijladvies te geven.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Contact</h2>
              <p className="text-gray-600">
                Voor vragen over dit privacybeleid kun je contact met ons opnemen.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPage