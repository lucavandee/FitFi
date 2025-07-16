import React from 'react';

const StepThree: React.FC = () => {
  return (
    <div className="bg-[#FAF8F6] p-8 rounded-2xl shadow-sm">
      <div className="text-center mb-6">
        <span className="inline-block bg-[#bfae9f]/20 text-[#bfae9f] font-medium px-3 py-1 rounded-full text-sm mb-2">Stap 3</span>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Bekijk jouw outfits op maat</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Ontdek complete outfits die perfect bij jouw stijl, lichaamsbouw en voorkeuren passen.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="aspect-[4/5] relative">
            <img 
              src="https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2" 
              alt="Casual Chic Look" 
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-white/90 text-[#bfae9f] px-3 py-1 rounded-full text-sm font-bold">
              92% Match
            </div>
          </div>
          
          <div className="p-4">
            <h3 className="font-bold text-gray-900 mb-1">Casual Chic Look</h3>
            <p className="text-gray-600 text-sm mb-3">
              Een moeiteloze combinatie van comfort en stijl, perfect voor dagelijks gebruik.
            </p>
            
            <div className="flex space-x-2 mb-4">
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">casual</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">minimalistisch</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">veelzijdig</span>
            </div>
            
            <button className="w-full bg-[#bfae9f] text-white py-2 rounded-lg font-medium hover:bg-[#a89a8c] transition-colors">
              Bekijk outfit
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="aspect-[4/5] relative">
            <img 
              src="https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2" 
              alt="Business Casual" 
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-white/90 text-[#bfae9f] px-3 py-1 rounded-full text-sm font-bold">
              88% Match
            </div>
          </div>
          
          <div className="p-4">
            <h3 className="font-bold text-gray-900 mb-1">Business Casual</h3>
            <p className="text-gray-600 text-sm mb-3">
              Professioneel maar comfortabel, perfect voor kantoor of zakelijke afspraken.
            </p>
            
            <div className="flex space-x-2 mb-4">
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">zakelijk</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">minimalistisch</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">elegant</span>
            </div>
            
            <button className="w-full bg-[#bfae9f] text-white py-2 rounded-lg font-medium hover:bg-[#a89a8c] transition-colors">
              Bekijk outfit
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <h3 className="font-bold text-gray-900 mb-4">Individuele items voor jou</h3>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <div className="aspect-square">
              <img 
                src="https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2" 
                alt="Oversized Cotton Shirt" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-2">
              <p className="text-xs font-medium text-gray-900 truncate">Oversized Cotton Shirt</p>
              <p className="text-xs text-gray-500">€59,95</p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <div className="aspect-square">
              <img 
                src="https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2" 
                alt="High Waist Mom Jeans" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-2">
              <p className="text-xs font-medium text-gray-900 truncate">High Waist Mom Jeans</p>
              <p className="text-xs text-gray-500">€89,95</p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <div className="aspect-square">
              <img 
                src="https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2" 
                alt="White Sneakers" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-2">
              <p className="text-xs font-medium text-gray-900 truncate">White Sneakers</p>
              <p className="text-xs text-gray-500">€79,95</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <button className="bg-[#bfae9f] text-white px-6 py-2 rounded-full font-medium hover:bg-[#a89a8c] transition-colors">
          Ontdek al je aanbevelingen
        </button>
      </div>
    </div>
  );
};

export default StepThree;