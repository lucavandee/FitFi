import React from 'react';
import { ShoppingBag, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { useABVariant } from '@/hooks/useABVariant';
import { track } from '@/utils/analytics';

interface StickyMobileCTAProps {
  onClaimDaily: () => void;
  userId?: string;
  className?: string;
}

const StickyMobileCTA: React.FC<StickyMobileCTAProps> = ({
  onClaimDaily,
  userId,
  className = ''
}) => {
  const variant = useABVariant('mobile_sticky_cta');

  const handleOutfitsClick = () => {
    track('mobile_sticky_cta_click', {
      variant,
      label: 'outfits',
      userId,
      source: 'dashboard_mobile_sticky'
    });

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'cta_click', {
        variant,
        label: 'mobile_sticky_outfits',
        userId
      });
    }
  };

  const handleClaimClick = () => {
    track('mobile_sticky_cta_click', {
      variant,
      label: 'claim_xp',
      userId,
      source: 'dashboard_mobile_sticky'
    });

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'cta_click', {
        variant,
        label: 'mobile_sticky_claim',
        userId
      });
    }

    onClaimDaily();
  };

  return (
    <div className={`md:hidden fixed bottom-0 left-0 right-0 z-40 ${className}`}>
      <div className="bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4 shadow-lg">
        <div className="flex space-x-3 max-w-sm mx-auto">
          <Button
            as={Link}
            to="/outfits"
            onClick={handleOutfitsClick}
            variant="primary"
            size="lg"
            className="flex-1 bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A] shadow-sm"
            icon={<ShoppingBag size={18} />}
            iconPosition="left"
            data-ab-variant={variant}
          >
            Bekijk Outfits
          </Button>
          
          <Button
            onClick={handleClaimClick}
            variant="outline"
            size="lg"
            className="flex-1 border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white"
            icon={<Gift size={18} />}
            iconPosition="left"
            data-ab-variant={variant}
          >
            Claim XP
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StickyMobileCTA;