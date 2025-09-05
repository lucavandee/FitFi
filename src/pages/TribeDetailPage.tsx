import { useParams, Link } from 'react-router-dom'

function TribeDetailPage() {
  const { slug } = useParams()

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Link to="/tribes" className="text-accent hover:underline mb-8 inline-block">
            ← Terug naar tribes
          </Link>
          
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold mb-4 text-midnight">
              Tribe: {slug}
            </h1>
            <p className="text-lg text-gray-600">
              Welkom bij de {slug} community
            </p>
          </div>
          
          <div className="bg-surface p-8 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4">Community Posts</h2>
            <p className="text-gray-600">
              Hier komen de posts van tribe leden te staan.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TribeDetailPage