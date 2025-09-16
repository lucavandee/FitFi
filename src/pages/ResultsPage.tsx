import React from "react";

const ResultsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Jouw Stijlresultaten</h1>
          <p className="text-gray-600">Gebaseerd op jouw antwoorden hebben we deze outfits voor je geselecteerd</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="aspect-w-3 aspect-h-4 bg-gray-200">
                <div className="flex items-center justify-center">
                  <span className="text-gray-400">Outfit {i}</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Casual Chic Look</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Perfect voor een relaxte dag met vrienden. Comfortabel maar stijlvol.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">€89</span>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                    Bekijk items
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;