import React from "react";

const QuizPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Stijlquiz</h1>
            <p className="text-gray-600">Beantwoord een paar vragen om jouw perfecte stijl te ontdekken</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Vraag 1 van 10</span>
                <span>10%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Wat is jouw geslacht?
              </h2>
              <div className="space-y-3">
                <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer">
                  <input type="radio" name="gender" value="female" className="mr-3" />
                  <span className="text-gray-700">Vrouw</span>
                </label>
                <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer">
                  <input type="radio" name="gender" value="male" className="mr-3" />
                  <span className="text-gray-700">Man</span>
                </label>
                <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer">
                  <input type="radio" name="gender" value="other" className="mr-3" />
                  <span className="text-gray-700">Anders</span>
                </label>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors">
                Vorige
              </button>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Volgende
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;