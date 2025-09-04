import { Link } from "react-router-dom";
import { SEO } from "@/components/system/SEO";

export default function NotFoundPage() {
  return (
    <>
      <SEO 
        title="Pagina niet gevonden - FitFi"
        description="De pagina die je zoekt bestaat niet. Ga terug naar de homepage of ontdek onze AI-stylist Nova."
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-indigo-600 mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Pagina niet gevonden
            </h2>
            <p className="text-gray-600 mb-8">
              De pagina die je zoekt bestaat niet of is verplaatst.
            </p>
          </div>
          
          <div className="space-y-4">
            <Link
              to="/"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Terug naar home
            </Link>
            
            <div className="text-sm text-gray-500">
              <p>Of ontdek onze AI-stylist:</p>
              <Link
                to="/onboarding"
                className="text-indigo-600 hover:text-indigo-700 underline"
              >
                Start je stijltest
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}