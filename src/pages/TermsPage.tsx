function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-heading font-bold mb-8 text-midnight">
            Algemene Voorwaarden
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Laatst bijgewerkt: {new Date().toLocaleDateString('nl-NL')}
            </p>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Gebruik van de service</h2>
              <p className="text-gray-600">
                Door FitFi te gebruiken ga je akkoord met deze voorwaarden.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Intellectueel eigendom</h2>
              <p className="text-gray-600">
                Alle content op FitFi is beschermd door auteursrecht.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Aansprakelijkheid</h2>
              <p className="text-gray-600">
                FitFi is niet aansprakelijk voor indirecte schade.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TermsPage