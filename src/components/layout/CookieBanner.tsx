import React, { useState, useEffect } from 'react';
import { X, Cookie, Shield, Settings } from 'lucide-react';
import Button from '../ui/Button';

interface CookieBannerProps {
  className?: string;
}

const CookieBanner: React.FC<CookieBannerProps> = ({ className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('fitfi-cookie-consent');
    if (!cookieConsent) {
      // Show banner after a short delay
      setTimeout(() => setIsVisible(true), 2000);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('fitfi-cookie-consent', 'all');
    setIsVisible(false);
    
    // Enable all analytics
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted'
      });
    }
  };

  const handleAcceptNecessary = () => {
    localStorage.setItem('fitfi-cookie-consent', 'necessary');
    setIsVisible(false);
    
    // Only enable necessary cookies
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied'
      });
    }
  };

  const handleCustomize = () => {
    setShowDetails(!showDetails);
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-0 inset-x-0 z-60 bg-white border-t border-gray-200 shadow-lg animate-slide-up ${className}`}>
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <Cookie className="w-5 h-5 text-[#89CFF0]" />
              <h3 className="font-medium text-gray-900">Cookie Voorkeuren</h3>
            </div>
            
            <p className="text-gray-600 text-sm leading-relaxed">
              We gebruiken cookies om je ervaring te verbeteren en onze diensten te optimaliseren. 
              Je kunt je voorkeuren aanpassen of alle cookies accepteren.
            </p>
            
            {showDetails && (
              <div className="mt-4 space-y-3 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-gray-900 text-sm">Noodzakelijk</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Essentieel voor het functioneren van de website. Kunnen niet worden uitgeschakeld.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Settings className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-gray-900 text-sm">Analytisch</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Helpen ons begrijpen hoe bezoekers onze website gebruiken om deze te verbeteren.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Cookie className="w-4 h-4 text-purple-600" />
                      <span className="font-medium text-gray-900 text-sm">Marketing</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Gebruikt om advertenties relevanter te maken voor jou en je interesses.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCustomize}
              className="text-gray-600 hover:bg-gray-100"
            >
              {showDetails ? 'Verberg details' : 'Aanpassen'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleAcceptNecessary}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Alleen noodzakelijk
            </Button>
            
            <Button
              variant="primary"
              size="sm"
              onClick={handleAcceptAll}
              className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-white"
            >
              Accepteer alle
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;