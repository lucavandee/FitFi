import { Link } from 'react-router-dom'

function EnhancedResultsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-heading font-bold mb-8 text-midnight">
            Jouw Stijlresultaten
          </h1>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-surface p-6 rounded-2xl">
              <h2 className="text-xl font-semibold mb-4">Jouw Stijlprofiel</h2>
              <p className="text-gray-600">
                Gebaseerd op jouw voorkeuren hebben we een uniek stijlprofiel voor je samengesteld.
              </p>
            </div>
            
            <div className="bg-surface p-6 rounded-2xl">
              <h2 className="text-xl font-semibold mb-4">Aanbevolen Outfits</h2>
              <p className="text-gray-600">
                Ontdek outfits die perfect bij jouw stijl en levensstijl passen.
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <Link to="/dashboard" className="btn-primary mr-4">
              Naar Dashboard
            </Link>
            <Link to="/nova" className="btn-secondary">
              Chat met Nova AI
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedResultsPage