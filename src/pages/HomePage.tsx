import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-heading font-bold mb-6 text-gradient">
            FitFi
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Premium AI-styling platform voor Nederland en Europa. 
            Ontdek jouw perfecte stijl met kunstmatige intelligentie.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/onboarding" className="btn-primary">
              Start je stijlreis
            </Link>
            <Link to="/pricing" className="btn-secondary">
              Bekijk prijzen
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage