function CookiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-heading font-bold mb-8 text-midnight">
            Cookiebeleid
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Laatst bijgewerkt: {new Date().toLocaleDateString('nl-NL')}
            </p>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Wat zijn cookies?</h2>
              <p className="text-gray-600">
                Cookies zijn kleine tekstbestanden die op jouw apparaat worden opgeslagen.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Hoe gebruiken wij cookies?</h2>
              <p className="text-gray-600">
                Wij gebruiken cookies om de functionaliteit van onze website te verbeteren.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Jouw keuzes</h2>
              <p className="text-gray-600">
                Je kunt cookies uitschakelen in je browserinstellingen.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CookiesPage