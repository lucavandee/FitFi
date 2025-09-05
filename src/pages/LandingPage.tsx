import { Link } from 'react-router-dom'

function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-heading font-bold mb-4 text-midnight">
            Welkom bij FitFi
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            De toekomst van persoonlijke styling is hier. 
            Laat onze AI je helpen de perfecte outfits te vinden.
          </p>
        </div>
        
        <div className="text-center">
          <Link to="/onboarding" className="btn-primary">
            Begin nu
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LandingPage