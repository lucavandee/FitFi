import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="max-w-md w-full mx-4 text-center">
        <div className="text-6xl font-bold text-accent mb-4">404</div>
        <h1 className="text-2xl font-heading font-semibold mb-4 text-midnight">
          Pagina niet gevonden
        </h1>
        <p className="text-gray-600 mb-8">
          De pagina die je zoekt bestaat niet of is verplaatst.
        </p>
        <div className="space-y-4">
          <Link to="/" className="btn-primary block">
            Naar homepage
          </Link>
          <Link to="/dashboard" className="btn-secondary block">
            Naar dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage