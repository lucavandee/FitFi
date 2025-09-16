import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Pagina niet gevonden</h2>
        <p className="text-gray-600 mb-8 max-w-md">
          Sorry, de pagina die je zoekt bestaat niet of is verplaatst. 
          Controleer de URL of ga terug naar de homepage.
        </p>
        <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
          <Link
            to="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Naar homepage
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-block border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Ga terug
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;