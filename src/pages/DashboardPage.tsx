import { Link } from 'react-router-dom'

function DashboardPage() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-heading font-bold mb-8 text-midnight">
            Dashboard
          </h1>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Jouw Stijl</h2>
              <p className="text-gray-600 mb-4">
                Bekijk en beheer jouw stijlprofiel
              </p>
              <Link to="/results" className="text-accent hover:underline">
                Bekijk profiel →
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Nova AI</h2>
              <p className="text-gray-600 mb-4">
                Chat met onze AI styling assistant
              </p>
              <Link to="/nova" className="text-accent hover:underline">
                Start chat →
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Communities</h2>
              <p className="text-gray-600 mb-4">
                Ontdek style tribes en trends
              </p>
              <Link to="/tribes" className="text-accent hover:underline">
                Verken tribes →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage