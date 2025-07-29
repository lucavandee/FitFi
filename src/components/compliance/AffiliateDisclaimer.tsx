import React from 'react';
import { Info } from 'lucide-react';

interface AffiliateDisclaimerProps {
  className?: string;
  variant?: 'banner' | 'inline' | 'footer';
}

/**
 * Affiliate Disclaimer Component
 * Required for EU compliance and affiliate network partnerships
 */
const AffiliateDisclaimer: React.FC<AffiliateDisclaimerProps> = ({ 
  className = '', 
  variant = 'banner' 
}) => {
  const baseClasses = "text-sm text-gray-600 leading-relaxed";
  
  const variantClasses = {
    banner: "bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6",
    inline: "bg-gray-50 border border-gray-200 rounded-lg p-3 my-4",
    footer: "text-xs text-gray-500"
  };

  const disclaimerText = "Dit artikel bevat affiliate-links. Als je via onze links koopt, ontvangen wij mogelijk een commissie. Dit heeft geen invloed op de prijs die je betaalt en helpt ons om FitFi gratis aan te bieden.";

  return (
    <div className={`${variantClasses[variant]} ${className}`} role="note" aria-label="Affiliate disclaimer">
      <div className="flex items-start space-x-2">
        {variant !== 'footer' && (
          <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
        )}
        <p className={baseClasses}>
          <strong className="font-medium">Affiliate Disclaimer:</strong> {disclaimerText}
        </p>
      </div>
    </div>
  );
};

export default AffiliateDisclaimer;