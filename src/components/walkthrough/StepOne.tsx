import React from 'react';

const StepOne: React.FC = () => {
  return (
    <div className="bg-[#FAF8F6] p-8 rounded-2xl shadow-sm">
      <div className="text-center mb-6">
        <span className="inline-block bg-[#bfae9f]/20 text-[#bfae9f] font-medium px-3 py-1 rounded-full text-sm mb-2">Stap 1</span>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Kies je stijlvoorkeuren</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Selecteer de stijlen die jou het meest aanspreken om je persoonlijke stijlprofiel te creëren.
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border-2 border-[#bfae9f]">
          <div className="aspect-square rounded-lg overflow-hidden mb-3">
            <img 
              src="https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2" 
              alt="Casual Chic" 
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="font-medium text-gray-900 text-center">Casual Chic</h3>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <div className="aspect-square rounded-lg overflow-hidden mb-3">
            <img 
              src="https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2" 
              alt="Klassiek" 
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="font-medium text-gray-900 text-center">Klassiek</h3>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <div className="aspect-square rounded-lg overflow-hidden mb-3">
            <img 
              src="https://images.pexels.com/photos/2043590/pexels-photo-2043590.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2" 
              alt="Streetstyle" 
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="font-medium text-gray-900 text-center">Streetstyle</h3>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <div className="aspect-square rounded-lg overflow-hidden mb-3">
            <img 
              src="https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2" 
              alt="Minimalistisch" 
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="font-medium text-gray-900 text-center">Minimalistisch</h3>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <div className="aspect-square rounded-lg overflow-hidden mb-3">
            <img 
              src="https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2" 
              alt="Sportief" 
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="font-medium text-gray-900 text-center">Sportief</h3>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <div className="aspect-square rounded-lg overflow-hidden mb-3">
            <img 
              src="https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2" 
              alt="Bohemian" 
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="font-medium text-gray-900 text-center">Bohemian</h3>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <button className="bg-[#bfae9f] text-white px-6 py-2 rounded-full font-medium hover:bg-[#a89a8c] transition-colors">
          Volgende
        </button>
      </div>
    </div>
  );
};

export default StepOne;