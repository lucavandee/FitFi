import { Link } from 'react-router-dom'

function TribesPage() {
  const tribes = [
    { slug: 'minimalist', name: 'Minimalist Style', description: 'Voor liefhebbers van clean, eenvoudige looks', members: 1234 },
    { slug: 'streetwear', name: 'Streetwear Culture', description: 'Urban fashion en street style', members: 2567 }
  ]

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-heading font-bold mb-8 text-midnight">
            Style Tribes
          </h1>
          
          <p className="text-lg text-gray-600 mb-12">
            Sluit je aan bij communities van gelijkgestemde fashion lovers.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {tribes.map((tribe) => (
              <div key={tribe.slug} className="bg-surface p-6 rounded-2xl">
                <h2 className="text-xl font-semibold mb-2">{tribe.name}</h2>
                <p className="text-gray-600 mb-4">{tribe.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{tribe.members} leden</span>
                  <Link 
                    to={`/tribes/${tribe.slug}`} 
                    className="btn-primary text-sm px-4 py-2"
                  >
                    Bekijk tribe
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TribesPage