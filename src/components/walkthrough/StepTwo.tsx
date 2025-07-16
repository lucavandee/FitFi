import React from 'react';

const StepTwo: React.FC = () => {
  return (
    <div className="bg-[#FAF8F6] p-8 rounded-2xl shadow-sm">
      <div className="text-center mb-6">
        <span className="inline-block bg-[#bfae9f]/20 text-[#bfae9f] font-medium px-3 py-1 rounded-full text-sm mb-2">Stap 2</span>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ontvang je stijlprofiel</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Onze AI analyseert je voorkeuren en creëert een uniek stijlprofiel dat perfect bij jou past.
        </p>
      </div>
      
      <div className="flex flex-col items-center">
        <div className="relative w-64 h-64 mb-6">
          {/* Circular chart */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Background circle */}
            <circle cx="50" cy="50" r="45" fill="none" stroke="#E6E6E6" strokeWidth="10" />
            
            {/* Modern Minimalist segment - 80% */}
            <circle 
              cx="50" 
              cy="50" 
              r="45" 
              fill="none" 
              stroke="#bfae9f" 
              strokeWidth="10" 
              strokeDasharray="282.6, 353.25" 
              strokeDashoffset="0" 
              transform="rotate(-90 50 50)" 
            />
            
            {/* Casual Chic segment - 15% */}
            <circle 
              cx="50" 
              cy="50" 
              r="45" 
              fill="none" 
              stroke="#0ea5e9" 
              strokeWidth="10" 
              strokeDasharray="53, 353.25" 
              strokeDashoffset="-282.6" 
              transform="rotate(-90 50 50)" 
            />
            
            {/* Streetstyle segment - 5% */}
            <circle 
              cx="50" 
              cy="50" 
              r="45" 
              fill="none" 
              stroke="#FF8600" 
              strokeWidth="10" 
              strokeDasharray="17.7, 353.25" 
              strokeDashoffset="-335.6" 
              transform="rotate(-90 50 50)" 
            />
            
            {/* Center text */}
            <text x="50" y="45" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#333">
              Jouw Stijlprofiel
            </text>
            <text x="50" y="60" textAnchor="middle" fontSize="10" fill="#666">
              Modern Minimalist
            </text>
          </svg>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm w-full max-w-md">
          <h3 className="font-bold text-gray-900 mb-4">Jouw stijlmix</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">Modern Minimalist</span>
                <span className="text-gray-500">80%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[#bfae9f] h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">Casual Chic</span>
                <span className="text-gray-500">15%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[#0ea5e9] h-2 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">Streetstyle</span>
                <span className="text-gray-500">5%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[#FF8600] h-2 rounded-full" style={{ width: '5%' }}></div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-[#bfae9f]/10 rounded-lg text-sm text-gray-700">
            <p>
              <strong>Modern Minimalist:</strong> Je houdt van strakke lijnen, neutrale kleuren en tijdloze stukken die veelzijdig te combineren zijn.
            </p>
          </div>
        </div>
        
        <div className="mt-6">
          <button className="bg-[#bfae9f] text-white px-6 py-2 rounded-full font-medium hover:bg-[#a89a8c] transition-colors">
            Volgende
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepTwo;